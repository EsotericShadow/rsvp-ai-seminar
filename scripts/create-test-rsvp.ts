#!/usr/bin/env tsx

import prisma from '../src/lib/prisma';
import crypto from 'crypto';

async function createTestRSVP() {
  console.log('📝 Creating Test RSVP...\n');

  try {
    // Create a test RSVP with comprehensive analytics data
    const testRSVP = await prisma.rSVP.create({
      data: {
        fullName: 'Test User',
        email: 'test@example.com',
        organization: 'Test Company Inc.',
        phone: '250-123-4567',
        attendanceStatus: 'YES',
        attendeeCount: 2,
        dietaryPreference: 'VEGETARIAN',
        dietaryOther: null,
        accessibilityNeeds: 'Wheelchair accessible seating required',
        referralSource: 'email',
        referralOther: null,
        wantsResources: true,
        wantsAudit: false,
        learningGoal: 'Learn about AI tools for business automation',
        // Analytics data
        visitorId: crypto.randomUUID(),
        sessionId: crypto.randomUUID(),
        referrer: 'https://google.com/search?q=ai+seminar+terrace',
        eid: 'biz_test-business-123',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'ai-seminar-2025',
        utmTerm: 'ai tools business',
        utmContent: 'seminar-ad',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        language: 'en-US',
        tz: 'America/Vancouver',
        country: 'CA',
        region: 'BC',
        city: 'Terrace',
        ipHash: crypto.createHash('sha256').update('192.168.1.100').digest('hex'),
        screenW: 1920,
        screenH: 1080,
        dpr: 1.0,
        platform: 'Windows',
        device: 'desktop',
        browser: 'Chrome',
        meta: JSON.stringify({
          formSubmissionTime: Date.now(),
          pageLoadTime: 1234,
          timeToFormComplete: 4567,
          fieldsChanged: ['fullName', 'email', 'phone', 'attendanceStatus'],
          formErrors: [],
        }),
      },
    });

    console.log('✅ Test RSVP created successfully!');
    console.log('📊 RSVP Details:');
    console.log('- ID:', testRSVP.id);
    console.log('- Name:', testRSVP.fullName);
    console.log('- Email:', testRSVP.email);
    console.log('- Organization:', testRSVP.organization);
    console.log('- Attendance:', testRSVP.attendanceStatus, `(${testRSVP.attendeeCount} attending)`);
    console.log('- Visitor ID:', testRSVP.visitorId);
    console.log('- Session ID:', testRSVP.sessionId);
    console.log('- EID (Business Tracking):', testRSVP.eid);
    console.log('- UTM Campaign:', testRSVP.utmCampaign);
    console.log('- Device:', testRSVP.device, testRSVP.browser);
    console.log('- Location:', `${testRSVP.city}, ${testRSVP.region}, ${testRSVP.country}`);
    console.log('- Referrer:', testRSVP.referrer);

    // Create a few more test RSVPs with different data
    const additionalRSVPs = await Promise.all([
      prisma.rSVP.create({
        data: {
          fullName: 'John Smith',
          email: 'john.smith@construction.com',
          organization: 'Smith Construction Ltd.',
          phone: '250-555-0123',
          attendanceStatus: 'YES',
          attendeeCount: 1,
          dietaryPreference: 'NONE',
          accessibilityNeeds: null,
          referralSource: 'email',
          wantsResources: true,
          wantsAudit: true,
          learningGoal: 'Construction project management automation',
          visitorId: crypto.randomUUID(),
          sessionId: crypto.randomUUID(),
          eid: 'biz_construction-company-456',
          utmSource: 'email',
          utmMedium: 'newsletter',
          utmCampaign: 'construction-industry',
          device: 'mobile',
          browser: 'Safari',
          platform: 'iOS',
          country: 'CA',
          region: 'BC',
          city: 'Prince Rupert',
          screenW: 375,
          screenH: 812,
        },
      }),
      prisma.rSVP.create({
        data: {
          fullName: 'Sarah Johnson',
          email: 'sarah@mining.ca',
          organization: 'Northern Mining Corp.',
          phone: '250-777-8888',
          attendanceStatus: 'YES',
          attendeeCount: 3,
          dietaryPreference: 'GLUTEN_FREE',
          accessibilityNeeds: null,
          referralSource: 'social',
          wantsResources: false,
          wantsAudit: false,
          learningGoal: 'Mining operations optimization',
          visitorId: crypto.randomUUID(),
          sessionId: crypto.randomUUID(),
          eid: 'biz_mining-corp-789',
          utmSource: 'linkedin',
          utmMedium: 'social',
          utmCampaign: 'mining-professionals',
          device: 'desktop',
          browser: 'Firefox',
          platform: 'Linux',
          country: 'CA',
          region: 'BC',
          city: 'Kitimat',
          screenW: 2560,
          screenH: 1440,
        },
      }),
    ]);

    console.log(`\n✅ Created ${additionalRSVPs.length + 1} test RSVPs total`);
    console.log('🎯 Test data includes:');
    console.log('- Different industries (Construction, Mining)');
    console.log('- Various devices (Desktop, Mobile)');
    console.log('- Multiple browsers (Chrome, Safari, Firefox)');
    console.log('- Different UTM campaigns and sources');
    console.log('- Business tracking with EIDs');
    console.log('- Geographic diversity (Terrace, Prince Rupert, Kitimat)');

  } catch (error) {
    console.error('❌ Error creating test RSVP:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestRSVP();
