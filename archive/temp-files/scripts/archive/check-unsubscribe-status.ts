import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUnsubscribeStatus() {
  try {
    console.log('🔍 Checking unsubscribe status...');

    // Check if greenalderson@gmail.com is unsubscribed
    const greenMember = await prisma.audienceMember.findFirst({
      where: { primaryEmail: 'greenalderson@gmail.com' },
      select: { 
        id: true, 
        primaryEmail: true, 
        unsubscribed: true,
        businessName: true,
        groupId: true
      }
    });

    if (greenMember) {
      console.log(`📧 Found member: ${greenMember.businessName || 'Unknown'}`);
      console.log(`   Email: ${greenMember.primaryEmail}`);
      console.log(`   Unsubscribed: ${greenMember.unsubscribed ? 'YES' : 'NO'}`);
      console.log(`   Group ID: ${greenMember.groupId}`);
      
      if (greenMember.unsubscribed) {
        console.log('\n✅ That explains why no emails were sent to greenalderson@gmail.com');
        console.log('   The system is correctly respecting the unsubscribe request.');
        
        // Option to re-subscribe for testing
        console.log('\n🔄 To re-subscribe for testing, run:');
        console.log('   npx tsx scripts/resubscribe-for-testing.ts');
      }
    } else {
      console.log('❌ No member found with email: greenalderson@gmail.com');
    }

    // Check gabriel's status
    const gabrielMember = await prisma.audienceMember.findFirst({
      where: { primaryEmail: 'gabriel.lacroix94@icloud.com' },
      select: { 
        id: true, 
        primaryEmail: true, 
        unsubscribed: true,
        businessName: true
      }
    });

    if (gabrielMember) {
      console.log(`\n📧 Gabriel's member status:`);
      console.log(`   Email: ${gabrielMember.primaryEmail}`);
      console.log(`   Unsubscribed: ${gabrielMember.unsubscribed ? 'YES' : 'NO'}`);
      console.log(`   Business: ${gabrielMember.businessName || 'Unknown'}`);
    }

  } catch (error) {
    console.error('❌ Error checking unsubscribe status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkUnsubscribeStatus();
