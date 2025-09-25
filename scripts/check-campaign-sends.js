const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkCampaignSends() {
  console.log('🔍 Checking CampaignSend records...');
  
  try {
    const campaignSends = await prisma.campaignSend.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    console.log(`📤 Found ${campaignSends.length} CampaignSend records:`);
    
    campaignSends.forEach((send, index) => {
      console.log(`\n${index + 1}. ${send.email}`);
      console.log(`   Business: ${send.businessName}`);
      console.log(`   Status: ${send.status}`);
      console.log(`   Sent at: ${send.sentAt || 'Not sent'}`);
      console.log(`   Message ID: ${send.resendMessageId || 'None'}`);
      console.log(`   Invite Token: ${send.inviteToken || 'None'}`);
      console.log(`   Invite Link: ${send.inviteLink || 'None'}`);
    });
    
    if (campaignSends.length > 0) {
      console.log('\n🎉 SUCCESS: Campaign emails are being sent!');
      console.log('📧 Check the test email addresses for incoming emails');
    } else {
      console.log('\n❌ No CampaignSend records found');
    }
    
  } catch (error) {
    console.log('❌ Error checking CampaignSend records:', error.message);
  }
}

checkCampaignSends()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
