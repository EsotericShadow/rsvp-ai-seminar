import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import crypto from 'crypto'
import { UAParser } from 'ua-parser-js'
import prisma from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const to = url.searchParams.get('to')
  if (!to) return NextResponse.json({ error: 'Missing "to" param' }, { status: 400 })

  const c = cookies()
  const h = (k: string) => headers().get(k)
  const vid = c.get('vid')?.value ?? 'unknown'
  const sid = c.get('sid')?.value ?? 'unknown'

  // Prefer explicit eid in the link; fallback to cookie
  const eid = url.searchParams.get('eid') ?? c.get('eid')?.value ?? undefined

  const utmSource   = c.get('utm_source')?.value
  const utmMedium   = c.get('utm_medium')?.value
  const utmCampaign = c.get('utm_campaign')?.value
  const utmTerm     = c.get('utm_term')?.value
  const utmContent  = c.get('utm_content')?.value

  const ua = h('user-agent') || undefined
  const parsed = ua ? new UAParser(ua).getResult() : undefined
  const browser = parsed?.browser?.name
  const device  = parsed?.device?.type || 'desktop'
  const platform = parsed?.os?.name

  const referer = h('referer') || undefined
  const country = h('x-vercel-ip-country') || undefined
  const region  = h('x-vercel-ip-country-region') || undefined
  const city    = h('x-vercel-ip-city') || undefined
  const ip      = h('x-forwarded-for')?.split(',')[0]?.trim()
  const ipHash  = ip ? crypto.createHash('sha256').update(ip).digest('hex') : undefined

  try {
    await prisma.visit.create({
      data: {
        visitorId: vid,
        sessionId: sid,
        path: '/api/l',
        query: url.search,
        referrer: referer,
        eid, utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
        userAgent: ua, browser, device, platform,
        country, region, city, ipHash,
      },
    })
  } catch {
    // stay silent
  }

  return NextResponse.redirect(to, { status: 302 })
}