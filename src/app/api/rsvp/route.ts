import { NextResponse } from 'next/server';
import { rsvpSchema } from '@/lib/validators';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import { createEvent } from 'ics';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';
import { postLeadMineEvent } from '@/lib/leadMine';
import { recordSendEngagement } from '@/lib/campaigns';
import { sendRSVPConfirmation } from '@/lib/sendgrid-email';

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
    const campaignToken = eid && eid.startsWith('biz_') ? eid.slice(4) : undefined;

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

    if (campaignToken) {
      const meta = {
        rsvpId: rsvp.id,
        visitorId: vid,
        sessionId: sid,
        device,
        platform: os,
        browser,
        country,
        region,
        city,
        capturedAt: new Date().toISOString(),
      };
      postLeadMineEvent({ token: campaignToken, type: 'rsvp', meta }).catch((err) => {
        console.error('LeadMine RSVP event failed', err);
      });
      recordSendEngagement({ inviteToken: campaignToken, type: 'rsvp', at: new Date() }).catch((err) => {
        console.error('Campaign send RSVP tracking failed', err);
      });
    }

    // Send confirmation email
    try {
      const emailResult = await sendRSVPConfirmation({
        to: values.email,
        name: fullName,
        rsvpId: rsvp.id
      });

      if (!emailResult.success) {
        console.error('Failed to send confirmation email:', emailResult.error);
        // Don't fail the RSVP if email fails, but log it
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    // Generate ICS calendar file
    let icsUrl = null;
    try {
      const { error, value } = createEvent({
        start: [2025, 10, 23, 18, 0],
        end: [2025, 10, 23, 20, 30],
        title: 'AI in Northern BC: Information Session',
        description: 'A comprehensive information session on AI, machine learning, and AI automation for Northern BC businesses.',
        location: 'Sunshine Inn Terrace — Jasmine Room, 4812 Hwy 16, Terrace, BC, Canada',
        url: 'https://rsvp.evergreenwebsolutions.ca',
        organizer: { name: 'Gabriel Lacroix', email: 'gabriel@evergreenwebsolutions.ca' },
        attendees: [{ name: fullName, email: values.email, rsvp: true }],
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        transparency: 'OPAQUE'
      });

      if (!error && value) {
        // Store ICS file or generate URL
        icsUrl = `/api/ics?title=${encodeURIComponent('AI in Northern BC: Information Session')}&start=${encodeURIComponent('2025-10-23T18:00:00-07:00')}&end=${encodeURIComponent('2025-10-23T20:30:00-07:00')}&location=${encodeURIComponent('Sunshine Inn Terrace — Jasmine Room')}&desc=${encodeURIComponent('AI Information Session')}`;
      }
    } catch (icsError) {
      console.error('ICS generation error:', icsError);
    }

    return NextResponse.json({ 
      message: 'RSVP submitted successfully', 
      rsvpId: rsvp.id,
      icsUrl: icsUrl
    }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
