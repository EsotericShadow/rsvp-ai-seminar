import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getAdminConfig, getSessionCookieName, verifySessionToken } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function toCsvRow(values: (string | number | null | undefined)[]) {
  return values
    .map((v) => {
      if (v === null || v === undefined) return ''
      const s = String(v)
      // quote if contains comma or quote; escape quotes
      return /[\",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    })
    .join(',')
}

export async function GET(req: Request) {
  const adminConfig = getAdminConfig()
  if (!adminConfig) {
    return NextResponse.json({ error: 'Admin access not configured' }, { status: 500 })
  }

  const { sessionSecret } = adminConfig

  const token = cookies().get(getSessionCookieName())?.value
  const session = verifySessionToken(token, sessionSecret)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const type = url.searchParams.get('type')

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  if (type !== 'rsvps' && type !== 'visits') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  if (type === 'rsvps') {
    const rows = await prisma.rSVP.findMany({ orderBy: { createdAt: 'desc' }, take: 2000 })
    const header = [
      'createdAt','fullName','email','organization','phone',
      'attendanceStatus','attendeeCount','dietaryPreference','dietaryOther','accessibilityNeeds',
      'referralSource','referralOther','wantsResources','wantsAudit','learningGoal',
      'visitorId','sessionId','referrer','eid','utmSource','utmMedium','utmCampaign','utmTerm','utmContent',
      'userAgent','language','tz','country','region','city','ipHash','screenW','screenH','dpr','platform','device','browser'
    ]
    const data = [toCsvRow(header)]
    for (const r of rows) {
      data.push(
        toCsvRow([
          r.createdAt.toISOString(), r.fullName, r.email, r.organization, r.phone,
          r.attendanceStatus, r.attendeeCount, r.dietaryPreference, r.dietaryOther, r.accessibilityNeeds,
          r.referralSource, r.referralOther, String(r.wantsResources), String(r.wantsAudit), r.learningGoal,
          r.visitorId, r.sessionId, r.referrer, r.eid, r.utmSource, r.utmMedium, r.utmCampaign, r.utmTerm, r.utmContent,
          r.userAgent, r.language, r.tz, r.country, r.region, r.city, r.ipHash, r.screenW, r.screenH, r.dpr, r.platform, r.device, r.browser
        ])
      )
    }
    const csv = data.join('\n')
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="rsvps.csv"',
        'Cache-Control': 'no-store',
      },
    })
  } else {
    const rows = await prisma.visit.findMany({ orderBy: { createdAt: 'desc' }, take: 5000 })
    const header = [
      'createdAt','visitorId','sessionId','path','query','referrer',
      'eid','utmSource','utmMedium','utmCampaign','utmTerm','utmContent',
      'gclid','fbclid','msclkid',
      'userAgent','language','tz','screenW','screenH','dpr','platform','device','browser',
      'country','region','city','ipHash'
    ]
    const data = [toCsvRow(header)]
    for (const v of rows) {
      data.push(
        toCsvRow([
          v.createdAt.toISOString(), v.visitorId, v.sessionId, v.path, v.query, v.referrer,
          v.eid, v.utmSource, v.utmMedium, v.utmCampaign, v.utmTerm, v.utmContent,
          v.gclid, v.fbclid, v.msclkid,
          v.userAgent, v.language, v.tz, v.screenW, v.screenH, v.dpr, v.platform, v.device, v.browser,
          v.country, v.region, v.city, v.ipHash
        ])
      )
    }
    const csv = data.join('\n')
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="visits.csv"',
        'Cache-Control': 'no-store',
      },
    })
  }
}
