#!/usr/bin/env tsx

import crypto from 'crypto';

async function testAnalyticsBeacon() {
  console.log('🧪 Testing Analytics Beacon...\n');

  try {
    // Simulate a visit with comprehensive data
    const testData = {
      page: '/rsvp',
      query: '?eid=biz_test-business-123&utm_source=email&utm_medium=newsletter&utm_campaign=construction-industry',
      referrer: 'https://mail.google.com/mail/u/0/#inbox',
      screenW: 1920,
      screenH: 1080,
      viewportW: 1920,
      viewportH: 937,
      orientation: 'landscape-primary',
      dpr: 1,
      language: 'en-US',
      languages: ['en-US', 'en'],
      tz: 'America/Vancouver',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      platform: 'Windows',
      deviceMemory: 8,
      hardwareConcurrency: 16,
      maxTouchPoints: 0,
      connection: {
        downlink: 10,
        effectiveType: '4g',
        rtt: 50,
        saveData: false,
      },
      storage: {
        quota: 10737418240,
        usage: 52428800,
      },
      navigation: {
        loadEventEnd: 1234,
        loadEventStart: 1200,
        domContentLoadedEventEnd: 1000,
        domContentLoadedEventStart: 950,
        responseEnd: 800,
        responseStart: 700,
        requestStart: 650,
        navigationStart: 600,
      },
      paint: [
        { name: 'first-paint', startTime: 800 },
        { name: 'first-contentful-paint', startTime: 850 },
      ],
      performance: {
        timeOrigin: 1703123456789,
        now: 1234,
      },
      scrollDepth: 75,
      timeOnPageMs: 45000,
      interactionCounts: {
        clicks: 12,
        keypresses: 8,
        copies: 1,
        pointerMoves: 156,
      },
      visibility: [
        { state: 'visible', at: 1703123456789 },
        { state: 'hidden', at: 1703123496789 },
      ],
      reason: 'test',
    };

    console.log('📊 Test Data Prepared:');
    console.log('- Page:', testData.page);
    console.log('- Query:', testData.query);
    console.log('- User Agent:', testData.userAgent);
    console.log('- Device:', `${testData.screenW}x${testData.screenH}`);
    console.log('- Browser:', 'Chrome 120');
    console.log('- Platform:', testData.platform);
    console.log('- Scroll Depth:', testData.scrollDepth + '%');
    console.log('- Time on Page:', testData.timeOnPageMs + 'ms');
    console.log('- Interactions:', testData.interactionCounts);
    console.log('- Business Tracking:', 'eid=biz_test-business-123');
    console.log('- UTM Campaign:', 'construction-industry');

    // Send the test data to the analytics endpoint
    const response = await fetch('http://localhost:3000/api/track/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': testData.userAgent,
        'Referer': testData.referrer,
        'X-Vercel-IP-Country': 'CA',
        'X-Vercel-IP-Country-Region': 'BC',
        'X-Vercel-IP-City': 'Terrace',
        'X-Forwarded-For': '192.168.1.100',
      },
      body: JSON.stringify(testData),
    });

    if (response.ok) {
      console.log('\n✅ Analytics beacon test successful!');
      console.log('📡 Response:', await response.text());
    } else {
      console.log('\n❌ Analytics beacon test failed!');
      console.log('📡 Status:', response.status);
      console.log('📡 Response:', await response.text());
    }

    // Test with a mobile device
    const mobileTestData = {
      ...testData,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      platform: 'iOS',
      screenW: 375,
      screenH: 812,
      viewportW: 375,
      viewportH: 812,
      orientation: 'portrait-primary',
      deviceMemory: 4,
      hardwareConcurrency: 6,
      maxTouchPoints: 5,
      connection: {
        downlink: 5,
        effectiveType: '3g',
        rtt: 200,
        saveData: true,
      },
      scrollDepth: 90,
      timeOnPageMs: 60000,
      query: '?eid=biz_mining-corp-456&utm_source=linkedin&utm_medium=social&utm_campaign=mining-professionals',
    };

    console.log('\n📱 Testing Mobile Analytics...');
    const mobileResponse = await fetch('http://localhost:3000/api/track/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': mobileTestData.userAgent,
        'Referer': 'https://www.linkedin.com/feed/',
        'X-Vercel-IP-Country': 'CA',
        'X-Vercel-IP-Country-Region': 'BC',
        'X-Vercel-IP-City': 'Prince Rupert',
        'X-Forwarded-For': '192.168.1.101',
      },
      body: JSON.stringify(mobileTestData),
    });

    if (mobileResponse.ok) {
      console.log('✅ Mobile analytics beacon test successful!');
    } else {
      console.log('❌ Mobile analytics beacon test failed!');
    }

  } catch (error) {
    console.error('❌ Error testing analytics beacon:', error);
  }
}

testAnalyticsBeacon();

