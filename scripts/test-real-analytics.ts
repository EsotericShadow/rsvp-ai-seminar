#!/usr/bin/env tsx

import prisma from '../src/lib/prisma';

async function testWithRealTokens() {
  console.log('🧪 Testing Analytics with Real Business Tokens...\n');

  try {
    // Get a real business token
    const realMember = await prisma.audienceMember.findFirst({
      where: { inviteToken: { not: null } },
      select: { businessId: true, inviteToken: true, primaryEmail: true }
    });

    if (!realMember) {
      console.log('❌ No real business tokens found');
      return;
    }

    console.log('📊 Using Real Business Token:');
    console.log('- Business ID:', realMember.businessId);
    console.log('- Token:', realMember.inviteToken);
    console.log('- Email:', realMember.primaryEmail);

    // Test with real token
    const testData = {
      page: '/rsvp',
      query: `?eid=biz_${realMember.inviteToken}&utm_source=email&utm_medium=newsletter&utm_campaign=real-test`,
      referrer: 'https://mail.google.com/mail/u/0/#inbox',
      screenW: 1920,
      screenH: 1080,
      viewportW: 1920,
      viewportH: 937,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      platform: 'Windows',
      scrollDepth: 85,
      timeOnPageMs: 30000,
      interactionCounts: {
        clicks: 8,
        keypresses: 5,
        copies: 0,
        pointerMoves: 89,
      },
    };

    console.log('\n📡 Sending analytics with real token...');
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
      console.log('✅ Real token analytics test successful!');
      console.log('📡 Response:', await response.text());
    } else {
      console.log('❌ Real token analytics test failed!');
      console.log('📡 Status:', response.status);
      console.log('📡 Response:', await response.text());
    }

  } catch (error) {
    console.error('❌ Error testing with real tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWithRealTokens();
