import { NextResponse } from 'next/server';
import { rsvpSchema } from '@/lib/validators';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import { createEvent } from 'ics';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = rsvpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Validation Error', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const values = validation.data;
    const fullName = `${values.firstName} ${values.lastName}`;

    const c = cookies();
    const h = (k: string) => headers().get(k);

    const vid = c.get('vid')?.value;
    const sid = c.get('sid')?.value;

    const utmSource = c.get('utm_source')?.value;
    const utmMedium = c.get('utm_medium')?.value;
    const utmCampaign = c.get('utm_campaign')?.value;
    const utmTerm = c.get('utm_term')?.value;
    const utmContent = c.get('utm_content')?.value;
    const eid = c.get('eid')?.value;

    const ua = h('user-agent') || undefined;
    const referer = h('referer') || undefined;
    const country = h('x-vercel-ip-country') || undefined;
    const region = h('x-vercel-ip-country-region') || undefined;
    const city = h('x-vercel-ip-city') || undefined;
    const ip = h('x-forwarded-for')?.split(',')[0]?.trim();
    const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex') : undefined;

    const parsed = ua ? new UAParser(ua).getResult() : undefined;
    const browser = parsed?.browser?.name;
    const device = parsed?.device?.type || 'desktop';
    const os = parsed?.os?.name;

    const rsvp = await prisma.rSVP.create({
      data: {
        ...values,
        fullName,
        attendeeCount: values.attendanceStatus === 'YES' ? (values.attendeeCount ?? 1) : 0,
        visitorId: vid,
        sessionId: sid,
        referrer: referer,
        eid,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        userAgent: ua,
        language: body.language,
        tz: body.tz,
        country,
        region,
        city,
        ipHash,
        screenW: body.screenW ?? null,
        screenH: body.screenH ?? null,
        dpr: body.dpr ?? null,
        platform: os,
        device,
        browser,
        meta: JSON.stringify({
          submittedAtLocal: new Date().toISOString(),
        }),
      },
    });

    // ... (placeholders for email and ics)

    return NextResponse.json({ message: 'RSVP submitted successfully', rsvpId: rsvp.id }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
