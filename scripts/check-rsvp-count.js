require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRSVPCount() {
  try {
    console.log('🔍 Checking RSVP count in database...');
    
    const rsvpCount = await prisma.rSVP.count();
    console.log(`📊 Total RSVPs in database: ${rsvpCount}`);
    
    if (rsvpCount > 0) {
      console.log('\n📋 Recent RSVPs:');
      const recentRSVPs = await prisma.rSVP.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          email: true,
          attendanceStatus: true,
          createdAt: true,
          organization: true
        }
      });
      
      recentRSVPs.forEach((rsvp, index) => {
        console.log(`${index + 1}. ${rsvp.fullName} (${rsvp.email}) - ${rsvp.attendanceStatus} - ${rsvp.createdAt.toISOString()}`);
      });
    } else {
      console.log('❌ No RSVPs found in database');
    }
    
    // Also check if there are any visits
    const visitCount = await prisma.visit.count();
    console.log(`\n📊 Total visits in database: ${visitCount}`);
    
  } catch (error) {
    console.error('❌ Error checking RSVP count:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRSVPCount();
