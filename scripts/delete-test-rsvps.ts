#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTestRSVPs() {
  console.log('🗑️  Deleting test RSVPs...\n');

  try {
    // Get all RSVPs
    const allRsvps = await prisma.rSVP.findMany();

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

    // Also include RSVPs with curl user agent (API tests)
    const curlRsvps = allRsvps.filter(rsvp => 
      rsvp.userAgent?.includes('curl')
    );

    // Combine and deduplicate
    const allTestRsvps = [...new Set([...testRsvps, ...curlRsvps])];

    console.log(`📊 Found ${allTestRsvps.length} test RSVPs to delete:`);
    allTestRsvps.forEach(rsvp => {
      console.log(`  - ${rsvp.fullName} (${rsvp.email}) - ${rsvp.createdAt.toISOString()}`);
    });

    if (allTestRsvps.length === 0) {
      console.log('\n✅ No test RSVPs found to delete!');
      return;
    }

    // Delete the test RSVPs
    const deleteIds = allTestRsvps.map(rsvp => rsvp.id);
    const result = await prisma.rSVP.deleteMany({
      where: {
        id: { in: deleteIds }
      }
    });

    console.log(`\n✅ Successfully deleted ${result.count} test RSVPs!`);
    
    // Show remaining RSVPs
    const remainingRsvps = await prisma.rSVP.findMany();
    console.log(`\n📊 Remaining RSVPs: ${remainingRsvps.length}`);
    
    if (remainingRsvps.length > 0) {
      console.log('Remaining RSVPs:');
      remainingRsvps.forEach(rsvp => {
        console.log(`  - ${rsvp.fullName} (${rsvp.email}) - ${rsvp.createdAt.toISOString()}`);
      });
    }

  } catch (error) {
    console.error('❌ Error deleting test RSVPs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestRSVPs();
