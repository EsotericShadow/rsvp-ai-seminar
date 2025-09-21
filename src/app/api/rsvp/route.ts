import { NextResponse } from 'next/server';
import { rsvpSchema } from '@/lib/validators';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import { createEvent } from 'ics';
import { cookies, headers } from 'next/headers';
import * as crypto from 'crypto';
import { UAParser } from 'ua-parser-js';
import { postLeadMineEvent } from '@/lib/leadMine';
import { recordSendEngagement } from '@/lib/campaigns';
import { sendRSVPConfirmation } from '@/lib/sendgrid-email';
import { checkRSVPRateLimit } from '@/lib/rate-limiter';
import { validateRSVPSubmission, getTestDetectionConfig } from '@/lib/test-detection';

const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: Request) {
  try {
    // Rate limiting check
    const clientIP = headers().get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitCheck = checkRSVPRateLimit(clientIP);
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          message: 'Too many RSVP submissions. Please try again later.',
          remainingTime: rateLimitCheck.remainingTime 
        }, 
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = rsvpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Validation Error', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const values = validation.data;
    const fullName = `${values.firstName} ${values.lastName}`;
    
    // Get tracking data for test detection
    const c = cookies();
    const h = (k: string) => headers().get(k);
    
    const vid = c.get('vid')?.value;
    const sid = c.get('sid')?.value;
    const ua = h('user-agent') || undefined;
    const referer = h('referer') || undefined;
    
    // Detect test submissions
    const testValidation = validateRSVPSubmission({
      email: values.email,
      fullName,
      userAgent: ua,
      visitorId: vid,
      sessionId: sid,
      referrer: referer,
    }, getTestDetectionConfig());
    
    if (testValidation.isTest) {
      console.warn('Test submission blocked:', testValidation.message);
      return NextResponse.json({ 
        message: 'Test submissions are not allowed',
        reason: testValidation.testDetection.reasons.join(', ')
      }, { status: 400 });
    }
    
    // Map validation data to database schema
    const rsvpData = {
      fullName,
      organization: values.organization,
      email: values.email,
      phone: values.phone,
      attendanceStatus: values.attendanceStatus,
      attendeeCount: values.attendeeCount,
      dietaryPreference: values.dietaryPreference,
      dietaryOther: values.dietaryOther,
      accessibilityNeeds: values.accessibilityNeeds,
      referralSource: values.referralSource,
      referralOther: values.referralOther,
      wantsResources: values.wantsResources,
      wantsAudit: values.wantsAudit,
      learningGoal: values.learningGoal,
    };

    const utmSource = c.get('utm_source')?.value;
    const utmMedium = c.get('utm_medium')?.value;
    const utmCampaign = c.get('utm_campaign')?.value;
    const utmTerm = c.get('utm_term')?.value;
    const utmContent = c.get('utm_content')?.value;
    const eid = c.get('eid')?.value;
    const campaignToken = eid && eid.startsWith('biz_') ? eid.slice(4) : undefined;
    const country = h('x-vercel-ip-country') || undefined;
    const region = h('x-vercel-ip-country-region') || undefined;
    const city = h('x-vercel-ip-city') || undefined;
    const ip = h('x-forwarded-for')?.split(',')[0]?.trim();
    const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex') : undefined;

    const parsed = ua ? new UAParser(ua).getResult() : undefined;
    const browser = parsed?.browser?.name;
    const device = parsed?.device?.type || 'desktop';
    const os = parsed?.os?.name;

    // Extract comprehensive analytics data from request body
    const {
      // Client-side analytics data
      language,
      languages,
      tz,
      screenW,
      screenH,
      viewportW,
      viewportH,
      orientation,
      dpr,
      deviceMemory,
      hardwareConcurrency,
      maxTouchPoints,
      connection,
      storage,
      navigation,
      paint,
      performance,
      scrollDepth,
      timeOnPageMs,
      interactionCounts,
      visibility,
      // Engagement metrics
      engagementScore,
      pageViews,
      sessionDuration,
      bounceRate,
    } = body;

    const rsvp = await prisma.rSVP.create({
      data: {
        ...rsvpData,
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
        language: language || undefined,
        tz: tz || undefined,
        country,
        region,
        city,
        ipHash,
        screenW: screenW ?? null,
        screenH: screenH ?? null,
        dpr: dpr ?? null,
        platform: os,
        device,
        browser,
        meta: JSON.stringify({
          submittedAtLocal: new Date().toISOString(),
          // Comprehensive analytics data
          analytics: {
            languages: Array.isArray(languages) && languages.length ? languages : undefined,
            viewportW: typeof viewportW === 'number' ? viewportW : undefined,
            viewportH: typeof viewportH === 'number' ? viewportH : undefined,
            orientation: typeof orientation === 'string' ? orientation : undefined,
            deviceMemory: typeof deviceMemory === 'number' ? deviceMemory : undefined,
            hardwareConcurrency: typeof hardwareConcurrency === 'number' ? hardwareConcurrency : undefined,
            maxTouchPoints: typeof maxTouchPoints === 'number' ? maxTouchPoints : undefined,
            connection: connection ?? undefined,
            storage: storage ?? undefined,
            navigation: navigation ?? undefined,
            paint: paint ?? undefined,
            performance: performance ?? undefined,
            scrollDepth: typeof scrollDepth === 'number' ? scrollDepth : undefined,
            timeOnPageMs: typeof timeOnPageMs === 'number' ? Math.round(timeOnPageMs) : undefined,
            interactionCounts: interactionCounts ?? undefined,
            visibility: visibility ?? undefined,
            // Engagement metrics
            engagementScore: typeof engagementScore === 'number' ? engagementScore : undefined,
            pageViews: typeof pageViews === 'number' ? pageViews : undefined,
            sessionDuration: typeof sessionDuration === 'number' ? sessionDuration : undefined,
            bounceRate: typeof bounceRate === 'number' ? bounceRate : undefined,
          },
        }),
      },
    });

    // Handle LeadMine integration asynchronously to avoid blocking RSVP response
    if (campaignToken) {
      // Don't await these calls - let them run in background
      setImmediate(async () => {
        try {
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
            // Comprehensive analytics data for LeadMine
            analytics: {
              // Basic device info
              screenW,
              screenH,
              viewportW,
              viewportH,
              orientation,
              dpr,
              deviceMemory,
              hardwareConcurrency,
              maxTouchPoints,
              // Performance metrics
              scrollDepth,
              timeOnPageMs,
              connection,
              // Engagement metrics
              engagementScore,
              pageViews,
              sessionDuration,
              bounceRate,
              interactionCounts,
              // Marketing attribution
              utmSource,
              utmMedium,
              utmCampaign,
              utmTerm,
              utmContent,
              referrer: referer,
              // RSVP specific data
              attendanceStatus: values.attendanceStatus,
              attendeeCount: values.attendanceStatus === 'YES' ? (values.attendeeCount ?? 1) : 0,
              wantsResources: values.wantsResources,
              wantsAudit: values.wantsAudit,
              referralSource: values.referralSource,
            },
          };

          // Run LeadMine calls in parallel with timeout
          const leadMinePromise = postLeadMineEvent({ token: campaignToken, type: 'rsvp', meta });
          const engagementPromise = recordSendEngagement({ inviteToken: campaignToken, type: 'rsvp', at: new Date() });

          // Set timeout for LeadMine calls (5 seconds max)
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('LeadMine timeout')), 5000)
          );

          await Promise.race([
            Promise.allSettled([leadMinePromise, engagementPromise]),
            timeoutPromise
          ]);

        } catch (error) {
          console.error('LeadMine integration failed:', error);
          // Don't throw - this shouldn't affect RSVP success
        }
      });
    }

    // Send confirmation email asynchronously to avoid blocking response
    setImmediate(async () => {
      try {
        const emailResult = await sendRSVPConfirmation({
          to: values.email,
          name: fullName,
          rsvpId: rsvp.id
        });

        if (!emailResult.success) {
          console.error('Failed to send confirmation email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    });

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
            busyStatus: 'BUSY'
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
    console.error('RSVP API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
