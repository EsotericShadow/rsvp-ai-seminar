require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearTestRSVPs() {
  try {
    console.log('🧹 Clearing all test RSVP records...');
    
    // First, let's see how many RSVPs we have
    const totalRSVPs = await prisma.rSVP.count();
    console.log(`📊 Total RSVPs in database: ${totalRSVPs}`);
    
    if (totalRSVPs === 0) {
      console.log('✅ No RSVPs found to delete.');
      return;
    }
    
    // Delete all RSVP records
    const deleteResult = await prisma.rSVP.deleteMany({});
    
    console.log(`✅ Successfully deleted ${deleteResult.count} RSVP records`);
    
    // Verify they're all gone
    const remainingRSVPs = await prisma.rSVP.count();
    console.log(`📊 Remaining RSVPs: ${remainingRSVPs}`);
    
    if (remainingRSVPs === 0) {
      console.log('🎉 All test RSVPs have been cleared successfully!');
    } else {
      console.log('⚠️  Some RSVPs still remain - there may have been an issue');
    }
    
  } catch (error) {
    console.error('❌ Error clearing RSVPs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTestRSVPs();
