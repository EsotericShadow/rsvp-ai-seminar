import 'server-only'

import { Resend } from 'resend'
import { CampaignSendStatus, CampaignStatus, Prisma } from '@prisma/client'

import prisma from '@/lib/prisma'
import { fetchLeadMineBusinesses, LeadMineBusiness } from '@/lib/leadMine'

const normalizeJsonInput = (value: Prisma.JsonValue | undefined) => {
  if (value === undefined) return undefined
  if (value === null) return Prisma.JsonNull
  return value
}

const resendKey = process.env.RESEND_API_KEY?.trim()
const linkBase =
  process.env.CAMPAIGN_LINK_BASE?.replace(/\/$/, '') || 'https://rsvp.evergreenwebsolutions.ca'
const fromEmail = process.env.CAMPAIGN_FROM_EMAIL || 'Evergreen AI <gabriel.lacroix94@icloud.com>'

function assertResendConfigured() {
  if (!resendKey) {
    throw new Error('RESEND_API_KEY not configured')
  }
}

export function inviteLinkFromToken(token: string) {
  const url = new URL(linkBase)
  url.searchParams.set('eid', `biz_${token}`)
  return url.toString()
}

export function renderTemplate(
  template: { htmlBody: string; textBody: string | null; button_text?: string | null },
  context: Record<string, string>,
) {
  const replaceTokens = (input: string) =>
    Object.entries(context).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value),
      input,
    )

  // Generate the tracking link from the invite token
  const trackingLink = context.inviteToken ? inviteLinkFromToken(context.inviteToken) : '#'
  
  // Replace any remaining invite_link variables with the actual tracking link
  const contextWithTrackingLink = {
    ...context,
    invite_link: trackingLink,
  }

  // Add tracking pixel to HTML if it doesn't exist
  let html = replaceTokens(template.htmlBody)
  if (context.inviteToken && !html.includes('/api/__pixel')) {
    const trackingPixel = `<img src="/api/__pixel?token=${context.inviteToken}&eid=biz_${context.inviteToken}" width="1" height="1" style="display:none;" />`
    html = html.replace('</body>', `${trackingPixel}</body>`)
    if (!html.includes('</body>')) {
      html += trackingPixel
    }
  }

  // Replace any button links with the tracking link
  html = html.replace(/\{\{\s*invite_link\s*\}\}/g, trackingLink)

  return {
    html,
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
  try {
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

    // Ensure all data is properly structured
    const safeTemplates = Array.isArray(templates) ? templates : []
    const safeGroups = Array.isArray(groups) ? groups : []
    const safeSchedules = Array.isArray(schedules) ? schedules : []
    const safeCampaigns = Array.isArray(campaigns) ? campaigns : []

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

    const schedulesWithCounts = safeSchedules.map((schedule) => ({
      ...schedule,
      counts: countsBySchedule.get(schedule.id) ?? emptyCounts(),
    }))

    const campaignsWithCounts = safeCampaigns.map((campaign) => {
      // Ensure schedules is always an array
      const campaignSchedules = Array.isArray(campaign.schedules) ? campaign.schedules : []
      
      const steps = campaignSchedules.map((schedule) => ({
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
      templates: safeTemplates,
      groups: safeGroups,
      schedules: schedulesWithCounts,
      campaigns: campaignsWithCounts,
    }
  } catch (error) {
    console.error('Error in listCampaignData:', error)
    // Return empty data structure to prevent crashes
    return {
      templates: [],
      groups: [],
      schedules: [],
      campaigns: [],
    }
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
        meta: {},
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
            meta: {},
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

export async function updateCampaign(
  id: string,
  input: {
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
  },
) {
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
          meta: {},
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

export async function createTemplate(input: {
  name: string
  subject: string
  htmlBody: string
  textBody?: string | null
}) {
  return prisma.campaignTemplate.create({
    data: {
      name: input.name,
      subject: input.subject,
      htmlBody: input.htmlBody,
      textBody: input.textBody ?? null,
      meta: {},
    },
  })
}

export async function updateTemplate(
  id: string,
  input: { name?: string; subject?: string; htmlBody?: string; textBody?: string | null },
) {
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
  }>
}) {
  return prisma.$transaction(async (tx) => {
    const group = await tx.audienceGroup.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        criteria: normalizeJsonInput(input.criteria),
        meta: {},
      },
    })

    const createdMembers = await Promise.all(
      input.members.map((member) =>
        tx.audienceMember.create({
          data: {
            groupId: group.id,
            businessId: member.businessId,
            businessName: member.businessName ?? null,
            primaryEmail: member.primaryEmail,
            secondaryEmail: member.secondaryEmail ?? null,
            meta: (member as any).meta || null,
          },
        }),
      ),
    )

    // Backfill tokens via LeadMine (createMissing=1), then persist
    await backfillInviteTokensForMembers(createdMembers)

    return tx.audienceGroup.findUnique({ where: { id: group.id }, include: { members: true } })
  })
}

export async function updateAudienceGroup(
  id: string,
  input: {
    name?: string
    description?: string | null
    criteria?: Prisma.JsonValue
    members: Array<{
      businessId: string
      businessName?: string
      primaryEmail: string
      secondaryEmail?: string
    }>
  },
) {
  return prisma.$transaction(async (tx) => {
    const updateData: Prisma.AudienceGroupUpdateInput = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.criteria !== undefined) updateData.criteria = normalizeJsonInput(input.criteria)

    await tx.audienceGroup.update({
      where: { id },
      data: updateData,
    })

    // Replace members
    await tx.audienceMember.deleteMany({ where: { groupId: id } })

    await tx.audienceMember.createMany({
      data: (input.members ?? []).map((m) => ({
        groupId: id,
        businessId: m.businessId,
        businessName: m.businessName ?? null,
        primaryEmail: m.primaryEmail,
        secondaryEmail: m.secondaryEmail ?? null,
        meta: (m as any).meta || null,
      })),
    })

    // Re-read created members (createMany doesn’t return rows)
    const createdMembers = await tx.audienceMember.findMany({ where: { groupId: id } })
    await backfillInviteTokensForMembers(createdMembers)

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
      meta: {},
    },
    include: {
      template: true,
      group: { select: { id: true, name: true } },
      campaign: { select: { id: true, name: true, status: true } },
    },
  })
}

export async function updateSchedule(
  id: string,
  input: {
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
  },
) {
  const data: Prisma.CampaignScheduleUpdateInput = {}
  if (input.name !== undefined) data.name = input.name
  if (input.templateId !== undefined) data.template = { connect: { id: input.templateId } }
  if (input.groupId !== undefined) data.group = { connect: { id: input.groupId } }
  if (input.status !== undefined) data.status = input.status
  if (input.sendAt !== undefined) {
    data.sendAt = input.sendAt
    data.nextRunAt = input.sendAt ?? input.smartWindowStart ?? null
  }
  if (input.throttlePerMinute !== undefined) data.throttlePerMinute = input.throttlePerMinute
  if (input.repeatIntervalMins !== undefined) data.repeatIntervalMins = input.repeatIntervalMins
  if (input.campaignId !== undefined)
    data.campaign = input.campaignId ? { connect: { id: input.campaignId } } : { disconnect: true }
  if (input.stepOrder !== undefined && input.stepOrder !== null) data.stepOrder = input.stepOrder
  if (input.smartWindowStart !== undefined) data.smartWindowStart = input.smartWindowStart
  if (input.smartWindowEnd !== undefined) data.smartWindowEnd = input.smartWindowEnd
  if (input.timeZone !== undefined) data.timeZone = input.timeZone ?? 'America/Vancouver'
  if (input.smartWindowStart !== undefined && input.sendAt === undefined && input.smartWindowStart) {
    data.nextRunAt = input.smartWindowStart
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
          members: {
            where: {
              unsubscribed: false,
            },
          },
        },
      },
      campaign: true,
    },
  })
  if (!schedule || !schedule.campaignId) {
    throw new Error('Schedule not found or not linked to a campaign')
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

  if (!options.previewOnly) {
    await prisma.campaignSchedule.update({
      where: { id: scheduleId },
      data: { status: CampaignStatus.SENDING, lastRunAt: new Date() },
    })
  }

  const limit = options.limit ?? members.length
  const resultLog: Array<{ businessId: string; email: string; status: string; error?: string }> = []
  const emailJobsToCreate: Array<{
    campaignId: string
    scheduleId: string | null
    templateId: string
    groupId: string
    recipientEmail: string
    recipientId: string
    sendAt: Date
    status: 'scheduled'
    meta: any
  }> = []

  let processed = 0

  for (const member of members) {
    if (processed >= limit) break
    processed += 1

    const inviteToken = await ensureMemberInviteToken({
      id: member.id,
      groupId: member.groupId,
      businessId: member.businessId,
      primaryEmail: member.primaryEmail,
      businessName: member.businessName,
      secondaryEmail: member.secondaryEmail,
      inviteToken: member.inviteToken,
    })

    if (!inviteToken) {
      resultLog.push({
        businessId: member.businessId,
        email: member.primaryEmail,
        status: 'SKIPPED',
        error: 'Missing invite token',
      })
      continue
    }

    emailJobsToCreate.push({
      campaignId: schedule.campaignId,
      scheduleId: schedule.id,
      templateId: schedule.templateId,
      groupId: schedule.groupId,
      recipientEmail: member.primaryEmail,
      recipientId: member.businessId,
      sendAt: schedule.sendAt || schedule.nextRunAt || new Date(),
      status: 'scheduled',
      meta: {},
    })

    resultLog.push({ businessId: member.businessId, email: member.primaryEmail, status: 'QUEUED' })
  }

  if (emailJobsToCreate.length > 0) {
    await prisma.emailJob.createMany({
      data: emailJobsToCreate,
      skipDuplicates: true,
    })
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
    sent: 0, // queueing only
    previewOnly: options.previewOnly ?? false,
    results: resultLog,
  }
}

/**
 * Ensure a single member has an invite token by calling LeadMine with
 * ids + createMissing=1, then persisting to AudienceMember.
 */
async function ensureMemberInviteToken(member: {
  id: string
  groupId: string
  businessId: string
  primaryEmail: string
  businessName?: string | null
  inviteToken?: string | null
  secondaryEmail?: string | null
}): Promise<string | null> {
  if (member.inviteToken) return member.inviteToken

  try {
    const { data } = await fetchLeadMineBusinesses({
      ids: [member.businessId],
      createMissing: true,
      limit: 1,
    })

    const lm: LeadMineBusiness | undefined = data?.[0]
    const token = lm?.invite?.token ?? null

    if (token) {
      await prisma.audienceMember.update({
        where: { id: member.id },
        data: { inviteToken: token },
      })
    } else {
      console.warn(`Invite token missing for business ${member.businessId}`)
    }

    return token
  } catch (err) {
    console.warn(`LeadMine lookup failed for ${member.businessId}: ${(err as Error)?.message || err}`)
    return null
  }
}

/**
 * Bulk backfill tokens for a set of members: calls LeadMine once with all ids,
 * persists tokens for those returned, and leaves others untouched.
 * For manual entries, generates tokens directly.
 */
async function backfillInviteTokensForMembers(members: Array<{
  id: string
  groupId: string
  businessId: string
  primaryEmail: string | null
  inviteToken: string | null
  meta?: any
}>) {
  const needing = members.filter((m) => !m.inviteToken && m.primaryEmail && m.businessId)
  if (!needing.length) return

  // Separate manual entries from LeadMine entries
  const manualEntries = needing.filter((m) => m.meta?.manual)
  const leadMineEntries = needing.filter((m) => !m.meta?.manual)

  const updates: Array<Promise<any>> = []

  // Handle manual entries - generate tokens directly
  for (const m of manualEntries) {
    const token = `manual_${m.businessId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    updates.push(
      prisma.audienceMember.update({
        where: { id: m.id },
        data: { inviteToken: token },
      }),
    )
  }

  // Handle LeadMine entries
  if (leadMineEntries.length > 0) {
    const ids = Array.from(new Set(leadMineEntries.map((m) => m.businessId)))
    try {
      const { data } = await fetchLeadMineBusinesses({
        ids,
        createMissing: true,
        limit: ids.length,
      })

      const foundById = new Map<string, LeadMineBusiness>()
      for (const b of data || []) foundById.set(b.id, b)

      for (const m of leadMineEntries) {
        const lm = foundById.get(m.businessId)
        const token = lm?.invite?.token
        if (token) {
          updates.push(
            prisma.audienceMember.update({
              where: { id: m.id },
              data: { inviteToken: token },
            }),
          )
        }
      }
    } catch (err) {
      console.warn(`LeadMine bulk backfill failed: ${(err as Error)?.message || err}`)
    }
  }

  if (updates.length) await Promise.allSettled(updates)
}

function renderTemplateSubject(subject: string, context: Record<string, string>) {
  return Object.entries(context).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value),
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
