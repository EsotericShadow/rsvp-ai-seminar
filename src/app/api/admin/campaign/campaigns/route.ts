import { NextRequest, NextResponse } from 'next/server'

import { CampaignStatus } from '@prisma/client'

import { requireAdminSession } from '@/lib/adminSession'
import { createCampaign, listCampaigns, updateCampaign } from '@/lib/campaigns'

function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const dt = new Date(String(value))
  return Number.isNaN(dt.getTime()) ? null : dt
}

function parseSteps(rawSteps: unknown, allowPartial = false) {
  if (!Array.isArray(rawSteps)) return undefined

  return rawSteps.map((step, index) => {
    if (!step || typeof step !== 'object') {
      throw new Error('Invalid step payload')
    }

    const templateId = (step as any).templateId
    const groupId = (step as any).groupId

    if (!templateId || !groupId) {
      if (allowPartial) {
        return null
      }
      throw new Error('Each step requires templateId and groupId')
    }

    const sendAt = parseOptionalDate((step as any).sendAt)
    const smartWindowStart = parseOptionalDate((step as any).smartWindowStart)
    const smartWindowEnd = parseOptionalDate((step as any).smartWindowEnd)

    const throttle = (step as any).throttlePerMinute
    const repeat = (step as any).repeatIntervalMins
    const stepOrder = (step as any).stepOrder
    const statusRaw = (step as any).status
    const timeZone = (step as any).timeZone

    return {
      id: (step as any).id ? String((step as any).id) : undefined,
      name: (step as any).name ? String((step as any).name) : undefined,
      templateId: String(templateId),
      groupId: String(groupId),
      sendAt,
      smartWindowStart,
      smartWindowEnd,
      throttlePerMinute: throttle === undefined || throttle === null ? undefined : Number(throttle),
      repeatIntervalMins: repeat === undefined || repeat === null ? undefined : Number(repeat),
      stepOrder: stepOrder === undefined || stepOrder === null ? undefined : Number(stepOrder),
      status: statusRaw ? (String(statusRaw) as CampaignStatus) : undefined,
      timeZone: typeof timeZone === 'string' && timeZone.trim() ? String(timeZone) : undefined,
    }
  }).filter((value): value is NonNullable<typeof value> => Boolean(value))
}

export async function GET() {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  const campaigns = await listCampaigns()
  return NextResponse.json({ campaigns })
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

  if (!body?.name) {
    return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 })
  }

  let steps
  try {
    steps = parseSteps(body.steps)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Invalid steps payload' }, { status: 400 })
  }

  const campaign = await createCampaign({
    name: String(body.name),
    description: body.description ? String(body.description) : undefined,
    status: body.status ? (String(body.status) as CampaignStatus) : undefined,
    steps,
  })

  return NextResponse.json({ campaign }, { status: 201 })
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
    return NextResponse.json({ error: 'Campaign id is required' }, { status: 400 })
  }

  let steps
  if (body.steps !== undefined) {
    try {
      steps = parseSteps(body.steps, true)
    } catch (error: any) {
      return NextResponse.json({ error: error?.message || 'Invalid steps payload' }, { status: 400 })
    }
  }

  const campaign = await updateCampaign(String(body.id), {
    name: body.name !== undefined ? String(body.name) : undefined,
    description:
      body.description !== undefined ? (body.description === null ? null : String(body.description)) : undefined,
    status: body.status !== undefined ? (String(body.status) as CampaignStatus) : undefined,
    steps,
  })

  return NextResponse.json({ campaign })
}
