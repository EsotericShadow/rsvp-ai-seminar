import { NextRequest, NextResponse } from 'next/server'

import { CampaignStatus } from '@prisma/client'

import { requireAdminSession } from '@/lib/adminSession'
import { createSchedule, listSchedules, updateSchedule } from '@/lib/campaigns'

export async function GET() {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  const schedules = await listSchedules()
  return NextResponse.json({ schedules })
}

export async function POST(request: NextRequest) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  let body: any
  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body?.name || !body?.templateId || !body?.groupId) {
    return NextResponse.json({ error: 'name, templateId, and groupId are required' }, { status: 400 })
  }

  let sendAt: Date | null = null
  if (body.sendAt === null) {
    sendAt = null
  } else if (body.sendAt) {
    const dt = new Date(body.sendAt)
    sendAt = Number.isNaN(dt.getTime()) ? null : dt
  }

  let smartWindowStart: Date | null = null
  if (body.smartWindowStart) {
    const dt = new Date(body.smartWindowStart)
    smartWindowStart = Number.isNaN(dt.getTime()) ? null : dt
  }

  let smartWindowEnd: Date | null = null
  if (body.smartWindowEnd) {
    const dt = new Date(body.smartWindowEnd)
    smartWindowEnd = Number.isNaN(dt.getTime()) ? null : dt
  }

  const timeZone = typeof body.timeZone === 'string' && body.timeZone.trim() ? body.timeZone.trim() : undefined

  const schedule = await createSchedule({
    name: String(body.name),
    templateId: String(body.templateId),
    groupId: String(body.groupId),
    campaignId: body.campaignId ? String(body.campaignId) : null,
    sendAt,
    throttlePerMinute: body.throttlePerMinute ? Number(body.throttlePerMinute) : undefined,
    repeatIntervalMins: body.repeatIntervalMins ? Number(body.repeatIntervalMins) : undefined,
    stepOrder: body.stepOrder ? Number(body.stepOrder) : undefined,
    smartWindowStart,
    smartWindowEnd,
    timeZone,
    status: body.status ? (String(body.status) as CampaignStatus) : undefined,
  })

  return NextResponse.json({ schedule }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  let body: any
  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body?.id) {
    return NextResponse.json({ error: 'Schedule id is required' }, { status: 400 })
  }

  let sendAt: Date | null | undefined = undefined
  if (body.sendAt === null) {
    sendAt = null
  } else if (body.sendAt) {
    const dt = new Date(body.sendAt)
    if (!Number.isNaN(dt.getTime())) {
      sendAt = dt
    }
  }
  const status = body.status ? (String(body.status) as CampaignStatus) : undefined

  let smartWindowStart: Date | null | undefined = undefined
  if (body.smartWindowStart === null) {
    smartWindowStart = null
  } else if (body.smartWindowStart) {
    const dt = new Date(body.smartWindowStart)
    if (!Number.isNaN(dt.getTime())) {
      smartWindowStart = dt
    }
  }

  let smartWindowEnd: Date | null | undefined = undefined
  if (body.smartWindowEnd === null) {
    smartWindowEnd = null
  } else if (body.smartWindowEnd) {
    const dt = new Date(body.smartWindowEnd)
    if (!Number.isNaN(dt.getTime())) {
      smartWindowEnd = dt
    }
  }

  const timeZone =
    body.timeZone === null
      ? null
      : typeof body.timeZone === 'string' && body.timeZone.trim()
      ? body.timeZone.trim()
      : undefined

  const schedule = await updateSchedule(String(body.id), {
    name: body.name !== undefined ? String(body.name) : undefined,
    templateId: body.templateId !== undefined ? String(body.templateId) : undefined,
    groupId: body.groupId !== undefined ? String(body.groupId) : undefined,
    status,
    sendAt,
    throttlePerMinute: body.throttlePerMinute !== undefined ? Number(body.throttlePerMinute) : undefined,
    repeatIntervalMins: body.repeatIntervalMins !== undefined ? Number(body.repeatIntervalMins) : undefined,
    campaignId: body.campaignId !== undefined ? (body.campaignId ? String(body.campaignId) : null) : undefined,
    stepOrder: body.stepOrder !== undefined ? Number(body.stepOrder) : undefined,
    smartWindowStart,
    smartWindowEnd,
    timeZone,
  })

  return NextResponse.json({ schedule })
}
