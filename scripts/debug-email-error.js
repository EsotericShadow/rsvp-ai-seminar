const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function debugEmailError() {
  console.log('🔍 Debugging email error by examining the actual error...');
  
  // Find a failed EmailJob to see the exact error
  const failedJob = await prisma.emailJob.findFirst({
    where: {
      status: 'scheduled',
      error: {
        contains: 'Invalid URL'
      }
    }
  });
  
  if (!failedJob) {
    console.log('❌ No failed jobs found');
    return;
  }
  
  console.log('✅ Found failed EmailJob:', failedJob.id);
  console.log('📧 Recipient:', failedJob.recipientEmail);
  console.log('❌ Error:', failedJob.error);
  console.log('📊 Attempts:', failedJob.attempts);
  console.log('⏰ Created:', failedJob.createdAt);
  console.log('🔄 Updated:', failedJob.updatedAt);
  
  // Get the campaign and schedule details
  const schedule = await prisma.campaignSchedule.findFirst({
    where: {
      campaignId: failedJob.campaignId
    },
    include: {
      template: true,
      group: {
        include: {
          members: {
            where: {
              primaryEmail: failedJob.recipientEmail
            }
          }
        }
      }
    }
  });
  
  if (schedule) {
    console.log('\n📋 Schedule Details:');
    console.log('   Schedule ID:', schedule.id);
    console.log('   Template:', schedule.template.name);
    console.log('   Member found:', schedule.group.members.length > 0);
    
    if (schedule.group.members.length > 0) {
      const member = schedule.group.members[0];
      console.log('   Member details:');
      console.log('     Business Name:', member.businessName);
      console.log('     Business ID:', member.businessId);
      console.log('     Invite Token:', member.inviteToken);
      
      // Test URL generation
      try {
        const linkBase = process.env.CAMPAIGN_LINK_BASE?.replace(/\/$/, '') || 'https://rsvp.evergreenwebsolutions.ca';
        const url = new URL(linkBase);
        url.searchParams.set('eid', `biz_${member.inviteToken}`);
        const trackingLink = url.toString();
        console.log('     ✅ Generated tracking link:', trackingLink);
      } catch (error) {
        console.log('     ❌ URL generation failed:', error.message);
      }
    }
  }
  
  // Check if there are any successful EmailJobs for comparison
  const successfulJob = await prisma.emailJob.findFirst({
    where: {
      status: 'sent'
    }
  });
  
  if (successfulJob) {
    console.log('\n✅ Found successful EmailJob for comparison:', successfulJob.id);
    console.log('   Recipient:', successfulJob.recipientEmail);
    console.log('   Sent at:', successfulJob.sentAt);
  } else {
    console.log('\n❌ No successful EmailJobs found');
  }
  
  // Check CampaignSend records
  const campaignSends = await prisma.campaignSend.count({
    where: {
      email: failedJob.recipientEmail
    }
  });
  
  console.log(`\n📤 CampaignSend records for ${failedJob.recipientEmail}: ${campaignSends}`);
}

debugEmailError()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
