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

import { sendRSVPConfirmation } from '@/lib/email';
import { checkRSVPRateLimit } from '@/lib/rate-limiter';
import { validateRSVPSubmission, getTestDetectionConfig } from '@/lib/test-detection';
import { createSecureResponse } from '@/lib/security-headers';
import { logCSRFViolation, logRateLimitViolation, logInvalidInput, logXSSAttempt } from '@/lib/security-logger';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: Request) {
  try {
    // Get client IP first for security logging
    const clientIP = headers().get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    
    // CSRF Protection - Check origin and referer headers
    const origin = headers().get('origin');
    const referer = headers().get('referer');
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://rsvp.evergreenwebsolutions.ca'
    ];
    
    // Allow requests from allowed origins or if both origin and referer are missing (direct API calls)
    const isValidOrigin = !origin || allowedOrigins.some(allowed => origin.startsWith(allowed));
    const isValidReferer = !referer || allowedOrigins.some(allowed => referer.startsWith(allowed));
    
    if (!isValidOrigin && !isValidReferer) {
      logCSRFViolation(clientIP, '/api/rsvp');
      return createSecureResponse(
        { message: 'Invalid request origin' }, 
        403
      );
    }

    // Rate limiting check with fingerprinting
    const userAgent = headers().get('user-agent') || '';
    const acceptLanguage = headers().get('accept-language') || '';
    const acceptEncoding = headers().get('accept-encoding') || '';
    
    const rateLimitCheck = checkRSVPRateLimit(clientIP, userAgent, acceptLanguage, acceptEncoding);
    
    if (!rateLimitCheck.allowed) {
      logRateLimitViolation(clientIP, '/api/rsvp', 3);
      return createSecureResponse(
        { 
          message: 'Too many RSVP submissions. Please try again later.',
          remainingTime: rateLimitCheck.remainingTime 
        }, 
        429
      );
    }

    const body = await req.json();
    const validation = rsvpSchema.safeParse(body);

    if (!validation.success) {
      // Log invalid input for security monitoring with detailed field information
      const validationErrors = validation.error?.errors.map(e => `${e.path.join('.')}: ${e.message}`) || [];
      console.error('RSVP Validation Failed:', {
        errors: validation.error?.errors,
        body: JSON.stringify(body, null, 2)
      });
      logInvalidInput(clientIP, body, validationErrors);
      
      // Don't expose detailed validation errors to prevent information disclosure
      return createSecureResponse({ 
        message: 'Invalid form data. Please check your input and try again.',
        errors: process.env.NODE_ENV === 'development' ? validationErrors : undefined
      }, 400);
    }

    const values = validation.data;
    const fullName = `${values.firstName} ${values.lastName}`;
    
    // Get tracking data for test detection
    const c = cookies();
    const h = (k: string) => headers().get(k);
    
    const vid = c.get('vid')?.value;
    const sid = c.get('sid')?.value;
    const ua = h('user-agent') || undefined;
    const referrer = h('referer') || undefined;
    
    // Detect test submissions
    const testValidation = validateRSVPSubmission({
      email: values.email,
      fullName,
      userAgent: ua,
      visitorId: vid,
      sessionId: sid,
      referrer: referrer,
    }, getTestDetectionConfig());
    
    if (testValidation.isTest) {
      console.warn('Test submission blocked:', {
        message: testValidation.message,
        email: values.email,
        fullName,
        confidence: testValidation.testDetection.confidence,
        reasons: testValidation.testDetection.reasons
      });
      return createSecureResponse({ 
        message: 'Invalid submission. Please use the proper form to submit your RSVP.',
        debug: process.env.NODE_ENV === 'development' ? testValidation.testDetection.reasons : undefined
      }, 400);
    }
    
    // Map validation data to database schema
    const rsvpData = {
      fullName,
      organization: values.organization,
      email: values.email,
      phone: values.phone,
      attendanceStatus: values.attendanceStatus,
      attendeeCount: values.attendeeCount || 0, // Default to 0 if not provided (for NO/MAYBE responses)
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

    // Check if RSVP already exists for this email
    const existingRSVP = await prisma.rSVP.findUnique({
      where: { email: values.email }
    });

    if (existingRSVP) {
      return createSecureResponse({ 
        message: 'RSVP already exists for this email address. If you need to make changes, please contact us directly.',
        rsvpId: existingRSVP.id,
        isUpdate: true
      }, 200);
    }

    const rsvp = await prisma.rSVP.create({
      data: {
        ...rsvpData,
        attendeeCount: values.attendanceStatus === 'YES' ? (values.attendeeCount ?? 1) : 0,
        visitorId: vid,
        sessionId: sid,
        referrer: referrer,
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
              referrer: referrer,
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
        start: [2025, 10, 23, 17, 0],
        end: [2025, 10, 23, 19, 0],
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
        icsUrl = `/api/ics?title=${encodeURIComponent('AI in Northern BC: Information Session')}&start=${encodeURIComponent('2025-10-23T17:00:00-07:00')}&end=${encodeURIComponent('2025-10-23T19:00:00-07:00')}&location=${encodeURIComponent('Sunshine Inn Terrace — Jasmine Room')}&desc=${encodeURIComponent('AI Information Session')}`;
      }
    } catch (icsError) {
      console.error('ICS generation error:', icsError);
    }

    return createSecureResponse({ 
      message: 'RSVP submitted successfully', 
      rsvpId: rsvp.id,
      icsUrl: icsUrl
    }, 200);

  } catch (error) {
    console.error('RSVP API Error:', error);
    return createSecureResponse({ message: 'Internal Server Error' }, 500);
  }
}
