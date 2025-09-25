const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function debugURLGeneration() {
  console.log('🔍 Debugging URL generation...');
  
  // Get the test members with their tokens
  const testGroup = await prisma.audienceGroup.findFirst({
    where: {
      name: 'LeadMine Test Group'
    },
    include: {
      members: true
    }
  });
  
  if (!testGroup) {
    console.log('❌ Test group not found');
    return;
  }
  
  console.log('👥 Test group members:');
  testGroup.members.forEach((member, index) => {
    console.log(`   ${index + 1}. ${member.businessName} (${member.primaryEmail})`);
    console.log(`      Token: ${member.inviteToken}`);
    
    // Test URL generation
    try {
      const linkBase = process.env.CAMPAIGN_LINK_BASE?.replace(/\/$/, '') || 'https://rsvp.evergreenwebsolutions.ca';
      const url = new URL(linkBase);
      url.searchParams.set('eid', `biz_${member.inviteToken}`);
      const trackingLink = url.toString();
      console.log(`      ✅ Generated URL: ${trackingLink}`);
    } catch (error) {
      console.log(`      ❌ URL generation failed: ${error.message}`);
    }
  });
  
  // Test the inviteLinkFromToken function logic
  console.log('\n🔧 Testing inviteLinkFromToken function:');
  
  const testTokens = [
    'test-token-test-availability-live-1758828765862',
    'test-token-test-green-alderson-1758828765084',
    'test-token-test-tangible-outlook-1758828765524'
  ];
  
  testTokens.forEach((token, index) => {
    try {
      const linkBase = process.env.CAMPAIGN_LINK_BASE?.replace(/\/$/, '') || 'https://rsvp.evergreenwebsolutions.ca';
      const url = new URL(linkBase);
      url.searchParams.set('eid', `biz_${token}`);
      const trackingLink = url.toString();
      console.log(`   ${index + 1}. Token: ${token}`);
      console.log(`      ✅ URL: ${trackingLink}`);
    } catch (error) {
      console.log(`   ${index + 1}. Token: ${token}`);
      console.log(`      ❌ Error: ${error.message}`);
    }
  });
  
  // Check environment variables
  console.log('\n📋 Environment variables:');
  console.log('CAMPAIGN_LINK_BASE:', process.env.CAMPAIGN_LINK_BASE || 'NOT SET');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET');
  console.log('CAMPAIGN_FROM_EMAIL:', process.env.CAMPAIGN_FROM_EMAIL || 'NOT SET');
}

debugURLGeneration()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
