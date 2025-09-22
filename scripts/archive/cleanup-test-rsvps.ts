#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupTestRSVPs() {
  console.log('🔍 Analyzing RSVP data...\n');

  try {
    // Get all RSVPs
    const allRsvps = await prisma.rSVP.findMany({
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 Total RSVPs: ${allRsvps.length}\n`);

    // Identify test RSVPs based on patterns
    const testPatterns = [
      /test/i,
      /example\.com$/,
      /rate-test/i,
      /analytics-test/i,
      /final-test/i,
    ];

    const testRsvps = allRsvps.filter(rsvp => {
      return testPatterns.some(pattern => 
        pattern.test(rsvp.email) || 
        pattern.test(rsvp.fullName) ||
        pattern.test(rsvp.organization || '')
      );
    });

    const suspiciousRsvps = allRsvps.filter(rsvp => {
      // RSVPs with curl user agent (API tests)
      if (rsvp.userAgent?.includes('curl')) return true;
      
      // RSVPs without visitor/session IDs (likely API calls)
      if (!rsvp.visitorId && !rsvp.sessionId) return true;
      
      // RSVPs without referrer (direct API calls)
      if (!rsvp.referrer) return true;
      
      return false;
    });

    console.log('🧪 Test RSVPs (by email/name patterns):');
    testRsvps.forEach(rsvp => {
      console.log(`  - ${rsvp.fullName} (${rsvp.email}) - ${rsvp.createdAt.toISOString()}`);
      console.log(`    User Agent: ${rsvp.userAgent}`);
      console.log(`    Visitor ID: ${rsvp.visitorId || 'MISSING'}`);
      console.log(`    Session ID: ${rsvp.sessionId || 'MISSING'}`);
      console.log(`    Referrer: ${rsvp.referrer || 'MISSING'}`);
      console.log('');
    });

    console.log('\n⚠️  Suspicious RSVPs (API tests, missing tracking):');
    suspiciousRsvps.forEach(rsvp => {
      console.log(`  - ${rsvp.fullName} (${rsvp.email}) - ${rsvp.createdAt.toISOString()}`);
      console.log(`    User Agent: ${rsvp.userAgent}`);
      console.log(`    Visitor ID: ${rsvp.visitorId || 'MISSING'}`);
      console.log(`    Session ID: ${rsvp.sessionId || 'MISSING'}`);
      console.log(`    Referrer: ${rsvp.referrer || 'MISSING'}`);
      console.log('');
    });

    // Combine all test/suspicious RSVPs
    const allTestRsvps = [...new Set([...testRsvps, ...suspiciousRsvps])];

    console.log(`\n📋 Summary:`);
    console.log(`  - Total RSVPs: ${allRsvps.length}`);
    console.log(`  - Test RSVPs (patterns): ${testRsvps.length}`);
    console.log(`  - Suspicious RSVPs: ${suspiciousRsvps.length}`);
    console.log(`  - Total to clean: ${allTestRsvps.length}`);
    console.log(`  - Legitimate RSVPs: ${allRsvps.length - allTestRsvps.length}`);

    if (allTestRsvps.length === 0) {
      console.log('\n✅ No test RSVPs found!');
      return;
    }

    // Ask for confirmation
    console.log('\n🗑️  Do you want to delete these test RSVPs?');
    console.log('This action cannot be undone!');
    
    // For script execution, you can uncomment the deletion code below
    // and comment out this confirmation section
    
    /*
    if (process.argv.includes('--delete')) {
      console.log('\n🗑️  Deleting test RSVPs...');
      
      const deleteIds = allTestRsvps.map(rsvp => rsvp.id);
      const deletedCount = await prisma.rSVP.deleteMany({
        where: {
          id: { in: deleteIds }
        }
      });
      
      console.log(`✅ Deleted ${deletedCount.count} test RSVPs`);
    } else {
      console.log('\n💡 To actually delete these RSVPs, run:');
      console.log('   npm run cleanup-test-rsvps -- --delete');
    }
    */

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Additional function to analyze RSVP data quality
async function analyzeRSVPQuality() {
  console.log('📈 Analyzing RSVP data quality...\n');

  try {
    const allRsvps = await prisma.rSVP.findMany();

    const stats = {
      total: allRsvps.length,
      withVisitorId: allRsvps.filter(r => r.visitorId).length,
      withSessionId: allRsvps.filter(r => r.sessionId).length,
      withReferrer: allRsvps.filter(r => r.referrer).length,
      withUTMData: allRsvps.filter(r => r.utmSource || r.utmMedium || r.utmCampaign).length,
      withEID: allRsvps.filter(r => r.eid).length,
      curlUserAgent: allRsvps.filter(r => r.userAgent?.includes('curl')).length,
      browserUserAgent: allRsvps.filter(r => r.userAgent && !r.userAgent.includes('curl')).length,
    };

    console.log('📊 RSVP Data Quality Report:');
    console.log(`  Total RSVPs: ${stats.total}`);
    console.log(`  With Visitor ID: ${stats.withVisitorId} (${Math.round(stats.withVisitorId/stats.total*100)}%)`);
    console.log(`  With Session ID: ${stats.withSessionId} (${Math.round(stats.withSessionId/stats.total*100)}%)`);
    console.log(`  With Referrer: ${stats.withReferrer} (${Math.round(stats.withReferrer/stats.total*100)}%)`);
    console.log(`  With UTM Data: ${stats.withUTMData} (${Math.round(stats.withUTMData/stats.total*100)}%)`);
    console.log(`  With EID: ${stats.withEID} (${Math.round(stats.withEID/stats.total*100)}%)`);
    console.log(`  Curl User Agent: ${stats.curlUserAgent} (${Math.round(stats.curlUserAgent/stats.total*100)}%)`);
    console.log(`  Browser User Agent: ${stats.browserUserAgent} (${Math.round(stats.browserUserAgent/stats.total*100)}%)`);

    console.log('\n🎯 Data Quality Score:');
    const qualityScore = Math.round((
      (stats.withVisitorId + stats.withSessionId + stats.withReferrer + stats.withUTMData) / 
      (stats.total * 4) * 100
    ));
    console.log(`  Quality Score: ${qualityScore}%`);

    if (qualityScore < 50) {
      console.log('  ⚠️  Low data quality - many RSVPs missing tracking data');
    } else if (qualityScore < 80) {
      console.log('  ⚡ Medium data quality - some tracking data missing');
    } else {
      console.log('  ✅ High data quality - most RSVPs have tracking data');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the appropriate function
if (process.argv.includes('--analyze')) {
  analyzeRSVPQuality();
} else {
  cleanupTestRSVPs();
}


