require('dotenv').config({ path: '.env.local' });

async function testRSVPSubmission() {
  try {
    console.log('🧪 Testing RSVP submission...');
    
    const testRSVPData = {
      firstName: 'Test',
      lastName: 'User',
      organization: 'Test Company',
      email: 'test@example.com',
      phone: '555-123-4567',
      attendanceStatus: 'YES',
      attendeeCount: 1,
      dietaryPreference: 'NONE',
      accessibilityNeeds: '',
      referralSource: 'WORD_OF_MOUTH',
      wantsResources: false,
      wantsAudit: false,
      learningGoal: '',
      // Analytics data
      language: 'en',
      languages: ['en'],
      tz: 'America/Vancouver',
      screenW: 1920,
      screenH: 1080,
      viewportW: 1920,
      viewportH: 937,
      orientation: 'landscape',
      dpr: 1,
      deviceMemory: 8,
      hardwareConcurrency: 8,
      maxTouchPoints: 0,
      connection: { effectiveType: '4g' },
      storage: { quota: 1000000000 },
      navigation: { type: 'navigate' },
      paint: { fcp: 1000 },
      performance: { now: Date.now() },
      scrollDepth: 75,
      timeOnPageMs: 30000,
      interactionCounts: { clicks: 5, scrolls: 10 },
      visibility: [{ visible: true, timestamp: Date.now() }],
      engagementScore: 85,
      pageViews: 1,
      sessionDuration: 30000,
      bounceRate: 0
    };
    
    const response = await fetch('https://rsvp.evergreenwebsolutions.ca/api/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRSVPData)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📡 Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ RSVP submission successful!');
    } else {
      console.log('❌ RSVP submission failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing RSVP submission:', error);
  }
}

testRSVPSubmission();
