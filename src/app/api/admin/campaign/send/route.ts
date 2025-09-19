import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { CampaignStatus } from '@prisma/client'

import { createSchedule, runSchedule, updateSchedule } from '@/lib/campaigns'
import { getAdminConfig, getSessionCookieName, verifySessionToken } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const cronSecret = process.env.CAMPAIGN_CRON_SECRET?.trim()

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function hasValidAdminSession() {
  const adminConfig = getAdminConfig()
  if (!adminConfig) return false

  const token = cookies().get(getSessionCookieName())?.value
  if (!token) return false

  const session = verifySessionToken(token, adminConfig.sessionSecret)
  return Boolean(session)
}

function authorizeRequest(req: NextRequest) {
  if (hasValidAdminSession()) {
    return null
  }

  if (!cronSecret) {
    console.warn('CAMPAIGN_CRON_SECRET not configured')
    return NextResponse.json({ error: 'Campaign cron secret not configured' }, { status: 500 })
  }

  const header = req.headers.get('authorization') || req.headers.get('x-cron-secret')
  if (!header) return unauthorized()
  const provided = header.startsWith('Bearer ') ? header.slice(7) : header
  if (provided.trim() !== cronSecret) return unauthorized()
  return null
}

export async function POST(req: NextRequest) {
  const authCheck = authorizeRequest(req)
  if (authCheck) return authCheck

  let body: any = {}
  if (req.headers.get('content-type')?.includes('application/json')) {
    body = await req.json().catch(() => ({}))
  }

  const previewOnly = Boolean(body?.previewOnly)
  const limit = body?.limit ? Number(body.limit) : undefined
  const scheduleId = body?.scheduleId ? String(body.scheduleId) : undefined

  if (scheduleId) {
    const result = await runSchedule(scheduleId, { previewOnly, limit })
    return NextResponse.json({ result })
  }

  if (!body?.templateId || !body?.groupId) {
    return NextResponse.json({ error: 'Provide scheduleId or templateId/groupId' }, { status: 400 })
  }

  const tempSchedule = await createSchedule({
    name: body.name ? String(body.name) : `Ad-hoc ${new Date().toISOString()}`,
    templateId: String(body.templateId),
    groupId: String(body.groupId),
    sendAt: null,
    throttlePerMinute: body.throttlePerMinute ? Number(body.throttlePerMinute) : undefined,
    repeatIntervalMins: null,
  })

  // mark as sending to avoid reuse
  await updateSchedule(tempSchedule.id, { status: CampaignStatus.SENDING })

  try {
    const result = await runSchedule(tempSchedule.id, { previewOnly, limit })
    return NextResponse.json({ result })
  } finally {
    await updateSchedule(tempSchedule.id, { status: CampaignStatus.COMPLETED })
  }
}
