import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { UAParser } from 'ua-parser-js'

const h = (k: string) => headers().get(k)

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    const c = cookies()
    let vid  = c.get('vid')?.value
    let sid  = c.get('sid')?.value

    const cookiesToSet: Array<{ name: string; value: string; maxAge: number }> = []

    if (!vid) {
      vid = crypto.randomUUID()
      cookiesToSet.push({ name: 'vid', value: vid, maxAge: 60 * 60 * 24 * 365 * 2 })
    }

    const now = Date.now()
    const sidCreatedAt = Number(c.get('sid_ts')?.value || 0)
    if (!sid || Number.isNaN(sidCreatedAt) || now - sidCreatedAt > 30 * 60 * 1000) {
      sid = crypto.randomUUID()
      cookiesToSet.push({ name: 'sid', value: sid, maxAge: 60 * 60 * 24 })
      cookiesToSet.push({ name: 'sid_ts', value: String(now), maxAge: 60 * 60 * 24 })
    } else {
      cookiesToSet.push({ name: 'sid_ts', value: String(now), maxAge: 60 * 60 * 24 })
    }

    // UTM/eid/click IDs from cookies (set in middleware)
    const utmSource   = c.get('utm_source')?.value
    const utmMedium   = c.get('utm_medium')?.value
    const utmCampaign = c.get('utm_campaign')?.value
    const utmTerm     = c.get('utm_term')?.value
    const utmContent  = c.get('utm_content')?.value
    const eid         = c.get('eid')?.value
    const gclid       = c.get('gclid')?.value
    const fbclid      = c.get('fbclid')?.value
    const msclkid     = c.get('msclkid')?.value

    // Headers
    const ua = h('user-agent') || body.userAgent
    const referer = h('referer') || body.referrer

    // Vercel Geo (best-effort)
    const country = h('x-vercel-ip-country') || undefined
    const region  = h('x-vercel-ip-country-region') || undefined
    const city    = h('x-vercel-ip-city') || undefined

    // IP → hash (do not store raw)
    const ip = h('x-forwarded-for')?.split(',')[0]?.trim()
    const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex') : undefined

    // Device hints from client body
    const { page, query, language, tz, screenW, screenH, dpr } = body

    const parsed = ua ? new UAParser(ua).getResult() : undefined
    const browser = parsed?.browser?.name
    const device  = parsed?.device?.type || 'desktop'
    const platform = parsed?.os?.name

    await prisma.visit.create({
      data: {
        visitorId: vid,
        sessionId: sid,
        path: page || '/',
        query: query || undefined,
        referrer: referer || undefined,
        eid, utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
        gclid, fbclid, msclkid,
        userAgent: ua || undefined,
        language: language || undefined,
        tz: tz || undefined,
        screenW: screenW ?? null,
        screenH: screenH ?? null,
        dpr: dpr ?? null,
        platform: platform || undefined,
        device: device || undefined,
        browser: browser || undefined,
        country, region, city, ipHash,
      },
    })

    const res = NextResponse.json({ ok: true })
    for (const { name, value, maxAge } of cookiesToSet) {
      res.cookies.set({
        name,
        value,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge,
      })
    }

    return res
  } catch (e) {
    // never throw to client; stay silent
    return NextResponse.json({ ok: true })
  }
}
