import 'server-only'

import { Resend } from 'resend'
import { CampaignSendStatus, CampaignStatus, Prisma } from '@prisma/client'

import prisma from '@/lib/prisma'
import { fetchLeadMineBusinesses, postLeadMineEvent } from '@/lib/leadMine'

const normalizeJsonInput = (value: Prisma.JsonValue | undefined) => {
  if (value === undefined) return undefined
  if (value === null) return Prisma.JsonNull
  return value
}

const resendKey = process.env.RESEND_API_KEY?.trim()
const linkBase = process.env.CAMPAIGN_LINK_BASE?.replace(/\/$/, '') || 'https://rsvp.evergreenwebsolutions.ca'
const fromEmail = process.env.CAMPAIGN_FROM_EMAIL || 'Evergreen AI <gabriel.lacroix94@icloud.com>'

function assertResendConfigured() {
  if (!resendKey) {
    throw new Error('RESEND_API_KEY not configured')
  }
}

function inviteLinkFromToken(token: string) {
  const url = new URL(linkBase)
  url.searchParams.set('eid', `biz_${token}`)
  return url.toString()
}

function renderTemplate(template: { htmlBody: string; textBody: string | null }, context: Record<string, string>) {
  const replaceTokens = (input: string) =>
    Object.entries(context).reduce((acc, [key, value]) => acc.replace(new RegExp(`{{\s*${key}\s*}}`, 'g'), value), input)

  return {
    html: replaceTokens(template.htmlBody),
    text: template.textBody ? replaceTokens(template.textBody) : undefined,
  }
}

const emptyCounts = (): Record<CampaignSendStatus, number> => ({
  [CampaignSendStatus.PENDING]: 0,
  [CampaignSendStatus.SENDING]: 0,
  [CampaignSendStatus.SENT]: 0,
  [CampaignSendStatus.FAILED]: 0,
  [CampaignSendStatus.SKIPPED]: 0,
})

export async function listCampaignData() {
  const [templates, groups, schedules, campaigns] = await Promise.all([
    prisma.campaignTemplate.findMany({ orderBy: { updatedAt: 'desc' } }),
    prisma.audienceGroup.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { members: true },
    }),
    prisma.campaignSchedule.findMany({
      orderBy: [{ campaignId: 'asc' }, { stepOrder: 'asc' }, { updatedAt: 'desc' }],
      include: {
        template: true,
        group: { select: { id: true, name: true } },
        campaign: { select: { id: true, name: true, status: true } },
        _count: { select: { sends: true } },
      },
    }),
    prisma.campaign.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        schedules: {
          orderBy: { stepOrder: 'asc' },
          include: {
            template: true,
            group: { select: { id: true, name: true } },
            campaign: { select: { id: true, name: true, status: true } },
            _count: { select: { sends: true } },
          },
        },
      },
    }),
  ])

  const scheduleSummaries = await prisma.campaignSend.groupBy({
    by: ['scheduleId', 'status'],
    _count: { _all: true },
  })

  const countsBySchedule = new Map<string, Record<CampaignSendStatus, number>>()
  for (const summary of scheduleSummaries) {
    const existing = countsBySchedule.get(summary.scheduleId) ?? emptyCounts()
    existing[summary.status] = summary._count._all
    countsBySchedule.set(summary.scheduleId, existing)
  }

  const schedulesWithCounts = schedules.map((schedule) => ({
    ...schedule,
    counts: countsBySchedule.get(schedule.id) ?? emptyCounts(),
  }))

  const campaignsWithCounts = campaigns.map((campaign) => {
    const steps = campaign.schedules.map((schedule) => ({
      ...schedule,
      counts: countsBySchedule.get(schedule.id) ?? emptyCounts(),
    }))

    const aggregates = emptyCounts()
    steps.forEach((step) => {
      Object.entries(step.counts).forEach(([status, value]) => {
        aggregates[status as CampaignSendStatus] += value as number
      })
    })

    return {
      ...campaign,
      schedules: steps,
      counts: aggregates,
    }
  })

  return {
    templates,
    groups,
    schedules: schedulesWithCounts,
    campaigns: campaignsWithCounts,
  }
}

export function listTemplates() {
  return prisma.campaignTemplate.findMany({ orderBy: { updatedAt: 'desc' } })
}

export function listGroups() {
  return prisma.audienceGroup.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { members: true },
  })
}

export function listSchedules() {
  return prisma.campaignSchedule.findMany({
    orderBy: [{ campaignId: 'asc' }, { stepOrder: 'asc' }, { updatedAt: 'desc' }],
    include: {
      template: true,
      group: { select: { id: true, name: true } },
      campaign: { select: { id: true, name: true, status: true } },
      _count: { select: { sends: true } },
    },
  })
}

export function getSchedule(id: string) {
  return prisma.campaignSchedule.findUnique({
    where: { id },
    include: {
      template: true,
      group: { include: { members: true } },
      campaign: true,
      sends: true,
    },
  })
}

export function listCampaigns() {
  return prisma.campaign.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      schedules: {
        orderBy: { stepOrder: 'asc' },
        include: {
          template: true,
          group: { select: { id: true, name: true } },
          _count: { select: { sends: true } },
        },
      },
    },
  })
}

export function getCampaign(id: string) {
  return prisma.campaign.findUnique({
    where: { id },
    include: {
      schedules: {
        orderBy: { stepOrder: 'asc' },
        include: {
          template: true,
          group: { select: { id: true, name: true } },
          sends: true,
        },
      },
    },
  })
}

export async function createCampaign(input: {
  name: string
  description?: string | null
  status?: CampaignStatus
  steps?: Array<{
    name?: string
    templateId: string
    groupId: string
    sendAt?: Date | null
    throttlePerMinute?: number | null
    repeatIntervalMins?: number | null
    stepOrder?: number | null
    smartWindowStart?: Date | null
    smartWindowEnd?: Date | null
    timeZone?: string | null
    status?: CampaignStatus
  }>
}) {
  return prisma.$transaction(async (tx) => {
    const campaign = await tx.campaign.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        status: input.status ?? CampaignStatus.DRAFT,
      },
    })

    if (input.steps?.length) {
      for (const [index, step] of input.steps.entries()) {
        await tx.campaignSchedule.create({
          data: {
            name: step.name ?? `${input.name} · Step ${index + 1}`,
            templateId: step.templateId,
            groupId: step.groupId,
            campaignId: campaign.id,
            status: step.status ?? (step.sendAt ? CampaignStatus.SCHEDULED : CampaignStatus.DRAFT),
            sendAt: step.sendAt ?? null,
            throttlePerMinute: step.throttlePerMinute ?? 60,
            repeatIntervalMins: step.repeatIntervalMins ?? null,
            nextRunAt: step.sendAt ?? step.smartWindowStart ?? null,
            stepOrder: step.stepOrder ?? index + 1,
            smartWindowStart: step.smartWindowStart ?? null,
            smartWindowEnd: step.smartWindowEnd ?? null,
            timeZone: step.timeZone ?? 'America/Vancouver',
          },
        })
      }
    }

    return tx.campaign.findUnique({
      where: { id: campaign.id },
      include: {
        schedules: {
          orderBy: { stepOrder: 'asc' },
          include: {
            template: true,
            group: { select: { id: true, name: true } },
            _count: { select: { sends: true } },
          },
        },
      },
    })
  })
}

export async function updateCampaign(id: string, input: {
  name?: string
  description?: string | null
  status?: CampaignStatus
  steps?: Array<{
    id?: string
    name?: string
    templateId: string
    groupId: string
    sendAt?: Date | null
    throttlePerMinute?: number | null
    repeatIntervalMins?: number | null
    stepOrder?: number | null
    smartWindowStart?: Date | null
    smartWindowEnd?: Date | null
    timeZone?: string | null
    status?: CampaignStatus
  }>
}) {
  return prisma.$transaction(async (tx) => {
    if (input.name !== undefined || input.description !== undefined || input.status !== undefined) {
      await tx.campaign.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
        },
      })
    }

    if (input.steps) {
      const existing = await tx.campaignSchedule.findMany({ where: { campaignId: id } })
      const existingIds = new Set(existing.map((item) => item.id))
      const seenIds = new Set<string>()

      for (const [index, step] of input.steps.entries()) {
        const stepOrder = step.stepOrder ?? index + 1
        const payload = {
          name: step.name ?? `${step.templateId} · Step ${stepOrder}`,
          templateId: step.templateId,
          groupId: step.groupId,
          campaignId: id,
          status: step.status ?? (step.sendAt ? CampaignStatus.SCHEDULED : CampaignStatus.DRAFT),
          sendAt: step.sendAt ?? null,
          throttlePerMinute: step.throttlePerMinute ?? 60,
          repeatIntervalMins: step.repeatIntervalMins ?? null,
          nextRunAt: step.sendAt ?? step.smartWindowStart ?? null,
          stepOrder,
          smartWindowStart: step.smartWindowStart ?? null,
          smartWindowEnd: step.smartWindowEnd ?? null,
          timeZone: step.timeZone ?? 'America/Vancouver',
        }

        if (step.id) {
          seenIds.add(step.id)
          await tx.campaignSchedule.update({ where: { id: step.id }, data: payload })
        } else {
          await tx.campaignSchedule.create({ data: payload })
        }
      }

      const toDelete = [...existingIds].filter((itemId) => !seenIds.has(itemId))
      if (toDelete.length) {
        await tx.campaignSchedule.deleteMany({ where: { id: { in: toDelete } } })
      }
    }

    return tx.campaign.findUnique({
      where: { id },
      include: {
        schedules: {
          orderBy: { stepOrder: 'asc' },
          include: {
            template: true,
            group: { select: { id: true, name: true } },
            _count: { select: { sends: true } },
          },
        },
      },
    })
  })
}

export async function deleteCampaign(id: string, options: { deleteSchedules?: boolean } = {}) {
  return prisma.$transaction(async (tx) => {
    if (options.deleteSchedules ?? true) {
      await tx.campaignSchedule.deleteMany({ where: { campaignId: id } })
    } else {
      await tx.campaignSchedule.updateMany({ where: { campaignId: id }, data: { campaignId: null } })
    }

    await tx.campaign.delete({ where: { id } })
  })
}

export async function createTemplate(input: { name: string; subject: string; htmlBody: string; textBody?: string | null }) {
  return prisma.campaignTemplate.create({
    data: {
      name: input.name,
      subject: input.subject,
      htmlBody: input.htmlBody,
      textBody: input.textBody ?? null,
    },
  })
}

export async function updateTemplate(id: string, input: { name?: string; subject?: string; htmlBody?: string; textBody?: string | null }) {
  return prisma.campaignTemplate.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.subject !== undefined ? { subject: input.subject } : {}),
      ...(input.htmlBody !== undefined ? { htmlBody: input.htmlBody } : {}),
      ...(input.textBody !== undefined ? { textBody: input.textBody } : {}),
    },
  })
}

export async function deleteTemplate(id: string) {
  await prisma.campaignTemplate.delete({ where: { id } })
}

export async function createAudienceGroup(input: {
  name: string
  description?: string
  criteria?: Prisma.JsonValue
  members: Array<{
    businessId: string
    businessName?: string
    primaryEmail: string
    secondaryEmail?: string
    inviteToken?: string | null
    tags?: string[]
    meta?: Prisma.JsonValue
  }>
}) {
  return prisma.$transaction(async (tx) => {
    const group = await tx.audienceGroup.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        criteria: normalizeJsonInput(input.criteria),
      },
    })

    await Promise.all(
      input.members.map((member) =>
        tx.audienceMember.create({
          data: {
            groupId: group.id,
            businessId: member.businessId,
            businessName: member.businessName ?? null,
            primaryEmail: member.primaryEmail,
            secondaryEmail: member.secondaryEmail ?? null,
            inviteToken: member.inviteToken ?? null,
            tagsSnapshot: member.tags ?? [],
            meta: member.meta ?? undefined,
          },
        }),
      ),
    )

    return tx.audienceGroup.findUnique({ where: { id: group.id }, include: { members: true } })
  })
}

export async function updateAudienceGroup(id: string, input: {
  name?: string
  description?: string | null
  criteria?: Prisma.JsonValue
  members: Array<{
    businessId: string
    businessName?: string
    primaryEmail: string
    secondaryEmail?: string
    inviteToken?: string | null
    tags?: string[]
    meta?: Prisma.JsonValue
  }>
}) {
  return prisma.$transaction(async (tx) => {
    const updateData: Prisma.AudienceGroupUpdateInput = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.criteria !== undefined) updateData.criteria = normalizeJsonInput(input.criteria)

    await tx.audienceGroup.update({
      where: { id },
      data: updateData,
    })

    await tx.audienceMember.deleteMany({ where: { groupId: id } })
    await Promise.all(
      input.members.map((member) =>
        tx.audienceMember.create({
          data: {
            groupId: id,
            businessId: member.businessId,
            businessName: member.businessName ?? null,
            primaryEmail: member.primaryEmail,
            secondaryEmail: member.secondaryEmail ?? null,
            inviteToken: member.inviteToken ?? null,
            tagsSnapshot: member.tags ?? [],
            meta: member.meta ?? undefined,
          },
        }),
      ),
    )

    return tx.audienceGroup.findUnique({ where: { id }, include: { members: true } })
  })
}

export async function deleteAudienceGroup(id: string) {
  await prisma.audienceGroup.delete({ where: { id } })
}

export async function createSchedule(input: {
  name: string
  templateId: string
  groupId: string
  campaignId?: string | null
  sendAt?: Date | null
  throttlePerMinute?: number | null
  repeatIntervalMins?: number | null
  stepOrder?: number | null
  smartWindowStart?: Date | null
  smartWindowEnd?: Date | null
  timeZone?: string | null
  status?: CampaignStatus
}) {
  return prisma.campaignSchedule.create({
    data: {
      name: input.name,
      templateId: input.templateId,
      groupId: input.groupId,
      campaignId: input.campaignId ?? null,
      status: input.status ?? (input.sendAt ? CampaignStatus.SCHEDULED : CampaignStatus.DRAFT),
      sendAt: input.sendAt ?? null,
      throttlePerMinute: input.throttlePerMinute ?? 60,
      repeatIntervalMins: input.repeatIntervalMins ?? null,
      nextRunAt: input.sendAt ?? input.smartWindowStart ?? null,
      stepOrder: input.stepOrder ?? 1,
      smartWindowStart: input.smartWindowStart ?? null,
      smartWindowEnd: input.smartWindowEnd ?? null,
      timeZone: input.timeZone ?? 'America/Vancouver',
    },
    include: {
      template: true,
      group: { select: { id: true, name: true } },
      campaign: { select: { id: true, name: true, status: true } },
    },
  })
}

export async function updateSchedule(id: string, input: {
  name?: string
  templateId?: string
  groupId?: string
  status?: CampaignStatus
  sendAt?: Date | null
  throttlePerMinute?: number | null
  repeatIntervalMins?: number | null
  campaignId?: string | null
  stepOrder?: number | null
  smartWindowStart?: Date | null
  smartWindowEnd?: Date | null
  timeZone?: string | null
}) {
  const data: Prisma.CampaignScheduleUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.templateId !== undefined) data.template = { connect: { id: input.templateId } };
  if (input.groupId !== undefined) data.group = { connect: { id: input.groupId } };
  if (input.status !== undefined) data.status = input.status;
  if (input.sendAt !== undefined) {
    data.sendAt = input.sendAt;
    data.nextRunAt = input.sendAt ?? input.smartWindowStart ?? null;
  }
  if (input.throttlePerMinute !== undefined) data.throttlePerMinute = input.throttlePerMinute;
  if (input.repeatIntervalMins !== undefined) data.repeatIntervalMins = input.repeatIntervalMins;
  if (input.campaignId !== undefined) data.campaign = input.campaignId ? { connect: { id: input.campaignId } } : { disconnect: true };
  if (input.stepOrder !== undefined && input.stepOrder !== null) data.stepOrder = input.stepOrder;
  if (input.smartWindowStart !== undefined) data.smartWindowStart = input.smartWindowStart;
  if (input.smartWindowEnd !== undefined) data.smartWindowEnd = input.smartWindowEnd;
  if (input.timeZone !== undefined) data.timeZone = input.timeZone ?? 'America/Vancouver';
  if (input.smartWindowStart !== undefined && input.sendAt === undefined && input.smartWindowStart) {
    data.nextRunAt = input.smartWindowStart;
  }

  return prisma.campaignSchedule.update({
    where: { id },
    data,
    include: {
      template: true,
      group: { select: { id: true, name: true } },
      campaign: { select: { id: true, name: true, status: true } },
    },
  })
}

export async function deleteSchedule(id: string) {
  await prisma.campaignSchedule.delete({ where: { id } })
}

export type SendOptions = {
  previewOnly?: boolean
  limit?: number
}

export async function runSchedule(scheduleId: string, options: SendOptions = {}) {
  const schedule = await prisma.campaignSchedule.findUnique({
    where: { id: scheduleId },
    include: {
      template: true,
      group: {
        include: {
          members: true,
        },
      },
    },
  })
  if (!schedule) {
    throw new Error('Schedule not found')
  }

  const now = new Date()
  if (!options.previewOnly) {
    if (schedule.sendAt && now < schedule.sendAt) {
      await prisma.campaignSchedule.update({
        where: { id: scheduleId },
        data: {
          status: CampaignStatus.SCHEDULED,
          nextRunAt: schedule.sendAt,
        },
      })
      return {
        scheduleId,
        processed: 0,
        sent: 0,
        previewOnly: false,
        results: [],
        deferredUntil: schedule.sendAt.toISOString(),
      }
    }

    if (schedule.smartWindowStart && now < schedule.smartWindowStart) {
      await prisma.campaignSchedule.update({
        where: { id: scheduleId },
        data: {
          status: CampaignStatus.SCHEDULED,
          nextRunAt: schedule.smartWindowStart,
        },
      })
      return {
        scheduleId,
        processed: 0,
        sent: 0,
        previewOnly: false,
        results: [],
        deferredUntil: schedule.smartWindowStart.toISOString(),
      }
    }

    if (schedule.smartWindowEnd && now > schedule.smartWindowEnd) {
      await prisma.campaignSchedule.update({
        where: { id: scheduleId },
        data: {
          status: CampaignStatus.COMPLETED,
          nextRunAt: null,
        },
      })
      return {
        scheduleId,
        processed: 0,
        sent: 0,
        previewOnly: false,
        results: [],
        windowClosed: schedule.smartWindowEnd.toISOString(),
      }
    }
  }

  const members = schedule.group.members.filter((member) => member.primaryEmail)
  if (!members.length) {
    return { scheduleId, processed: 0, sent: 0, previewOnly: options.previewOnly ?? false, results: [] }
  }

  const existingSends = await prisma.campaignSend.findMany({
    where: { scheduleId, businessId: { in: members.map((m) => m.businessId) } },
  })

  const existingMap = new Map(existingSends.map((send) => [`${send.businessId}`, send]))

  const sendsToProcess: Array<{ member: typeof members[number]; send: Prisma.CampaignSendGetPayload<{ include: {} }> | null }> = members.map((member) => ({ member, send: existingMap.get(member.businessId) ?? null }))

  const resend = options.previewOnly
    ? null
    : (() => {
        assertResendConfigured()
        return new Resend(resendKey)
      })()
  if (!options.previewOnly) {
    await prisma.campaignSchedule.update({ where: { id: scheduleId }, data: { status: CampaignStatus.SENDING, lastRunAt: new Date() } })
  }

  const limit = options.limit ?? members.length
  const resultLog: Array<{ businessId: string; email: string; status: CampaignSendStatus; error?: string }> = []

  let processed = 0
  let sent = 0

  for (const entry of sendsToProcess) {
    if (processed >= limit) break
    processed += 1

    const { member } = entry
    const inviteToken = await ensureMemberInviteToken({
      groupId: member.groupId,
      businessId: member.businessId,
      inviteToken: member.inviteToken,
    })

    if (!inviteToken) {
      const message = `Invite token missing for business ${member.businessId}`
      await prisma.campaignSend.upsert({
        where: { scheduleId_businessId: { scheduleId, businessId: member.businessId } },
        create: {
          scheduleId,
          groupId: schedule.groupId,
          templateId: schedule.templateId,
          businessId: member.businessId,
          businessName: member.businessName ?? null,
          email: member.primaryEmail,
          inviteToken: null,
          inviteLink: null,
          status: CampaignSendStatus.SKIPPED,
          error: message,
          meta: {},
        },
        update: {
          inviteToken: null,
          inviteLink: null,
          status: CampaignSendStatus.SKIPPED,
          error: message,
          updatedAt: new Date(),
        },
      })
      resultLog.push({ businessId: member.businessId, email: member.primaryEmail, status: CampaignSendStatus.SKIPPED, error: message })
      continue
    }
    const inviteLink = inviteLinkFromToken(inviteToken)
    const context = {
      business_name: member.businessName ?? 'Business team',
      invite_link: inviteLink,
      unsubscribe_link: '#',
    }
    const rendered = renderTemplate(schedule.template, context)

    if (options.previewOnly) {
      resultLog.push({ businessId: member.businessId, email: member.primaryEmail, status: CampaignSendStatus.SKIPPED })
      continue
    }

    try {
      const response = await resend!.emails.send({
        from: fromEmail,
        to: member.primaryEmail,
        subject: renderTemplateSubject(schedule.template.subject, context),
        html: rendered.html,
        text: rendered.text,
        headers: {
          'X-Entity-Ref-ID': inviteToken,
        },
      })

      await prisma.campaignSend.upsert({
        where: { scheduleId_businessId: { scheduleId, businessId: member.businessId } },
        create: {
          scheduleId,
          groupId: schedule.groupId,
          templateId: schedule.templateId,
          businessId: member.businessId,
          businessName: member.businessName ?? null,
          email: member.primaryEmail,
          inviteToken,
          inviteLink,
          resendMessageId: response.data?.id ?? null,
          status: CampaignSendStatus.SENT,
          sentAt: new Date(),
          meta: { rendered },
        },
        update: {
          inviteToken,
          inviteLink,
          resendMessageId: response.data?.id ?? null,
          status: CampaignSendStatus.SENT,
          sentAt: new Date(),
          error: null,
          meta: { rendered },
        },
      })

      await postLeadMineEvent({ token: inviteToken, type: 'email_sent', meta: { scheduleId, templateId: schedule.templateId, businessId: member.businessId } })
      resultLog.push({ businessId: member.businessId, email: member.primaryEmail, status: CampaignSendStatus.SENT })
      sent += 1
    } catch (error: any) {
      const message = error?.message || 'Unknown send error'
      await prisma.campaignSend.upsert({
        where: { scheduleId_businessId: { scheduleId, businessId: member.businessId } },
        create: {
          scheduleId,
          groupId: schedule.groupId,
          templateId: schedule.templateId,
          businessId: member.businessId,
          businessName: member.businessName ?? null,
          email: member.primaryEmail,
          inviteToken,
          inviteLink,
          status: CampaignSendStatus.FAILED,
          error: message,
          meta: { rendered },
        },
        update: {
          inviteToken,
          inviteLink,
          status: CampaignSendStatus.FAILED,
          error: message,
          updatedAt: new Date(),
        },
      })
      resultLog.push({ businessId: member.businessId, email: member.primaryEmail, status: CampaignSendStatus.FAILED, error: message })
    }
  }

  if (!options.previewOnly) {
    const nextRun = schedule.repeatIntervalMins
      ? new Date(Date.now() + schedule.repeatIntervalMins * 60 * 1000)
      : null

    await prisma.campaignSchedule.update({
      where: { id: scheduleId },
      data: {
        status: nextRun ? CampaignStatus.SCHEDULED : CampaignStatus.COMPLETED,
        nextRunAt: nextRun,
        lastRunAt: new Date(),
      },
    })
  }

  return {
    scheduleId,
    processed,
    sent,
    previewOnly: options.previewOnly ?? false,
    results: resultLog,
  }
}

async function ensureMemberInviteToken(member: { groupId: string; businessId: string; inviteToken?: string | null }) {
  if (member.inviteToken) return member.inviteToken

  const resp = await fetchLeadMineBusinesses({ ids: [member.businessId], createMissing: true })
  const business = resp.data[0]
  if (!business?.invite?.token) {
    console.warn(`Invite token missing for business ${member.businessId}`)
    return null
  }
  const inviteToken = business.invite.token
  await prisma.audienceMember.update({ where: { groupId_businessId: { groupId: member.groupId, businessId: member.businessId } }, data: { inviteToken } }).catch(() => null)
  return inviteToken
}

function renderTemplateSubject(subject: string, context: Record<string, string>) {
  return Object.entries(context).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`{{\s*${key}\s*}}`, 'g'), value),
    subject,
  )
}

export async function recordSendEngagement(params: { inviteToken: string; type: 'visit' | 'rsvp'; at?: Date }) {
  const send = await prisma.campaignSend.findFirst({
    where: { inviteToken: params.inviteToken },
    orderBy: { sentAt: 'desc' },
  })
  if (!send) return

  if (params.type === 'visit') {
    await prisma.campaignSend.update({ where: { id: send.id }, data: { visitedAt: params.at ?? new Date() } })
  } else {
    await prisma.campaignSend.update({ where: { id: send.id }, data: { rsvpAt: params.at ?? new Date() } })
  }
}
