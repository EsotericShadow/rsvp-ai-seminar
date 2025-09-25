const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkEmailStatus() {
  console.log('🔍 Checking email sending status...');
  
  // Find the test campaign
  const testCampaign = await prisma.campaign.findFirst({
    where: {
      meta: {
        path: ['finalTestCampaign'],
        equals: true
      }
    }
  });
  
  if (!testCampaign) {
    console.log('❌ Test campaign not found');
    return;
  }
  
  console.log('✅ Test campaign:', testCampaign.id);
  
  // Check EmailJob records
  const emailJobs = await prisma.emailJob.findMany({
    where: {
      campaignId: testCampaign.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  console.log(`\n📋 EmailJob records (${emailJobs.length}):`);
  emailJobs.forEach((job, index) => {
    console.log(`   ${index + 1}. ${job.recipientEmail}`);
    console.log(`      Status: ${job.status}`);
    console.log(`      Send at: ${job.sendAt}`);
    console.log(`      Attempts: ${job.attempts}`);
    console.log(`      Error: ${job.error || 'None'}`);
    console.log(`      Sent at: ${job.sentAt || 'Not sent'}`);
  });
  
  // Check CampaignSend records
  const campaignSends = await prisma.campaignSend.findMany({
    where: {
      schedule: {
        campaignId: testCampaign.id
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  console.log(`\n📤 CampaignSend records (${campaignSends.length}):`);
  campaignSends.forEach((send, index) => {
    console.log(`   ${index + 1}. ${send.recipientEmail}`);
    console.log(`      Status: ${send.status}`);
    console.log(`      Created: ${send.createdAt}`);
  });
  
  // Check the audience group
  const testGroup = await prisma.audienceGroup.findFirst({
    where: {
      name: 'LeadMine Test Group'
    },
    include: {
      members: true
    }
  });
  
  if (testGroup) {
    console.log(`\n👥 Audience Group: ${testGroup.name} (${testGroup.members.length} members)`);
    testGroup.members.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.businessName} (${member.primaryEmail})`);
    });
  }
  
  // Check campaign schedules
  const schedules = await prisma.campaignSchedule.findMany({
    where: {
      campaignId: testCampaign.id
    },
    include: {
      template: true
    },
    orderBy: {
      stepOrder: 'asc'
    }
  });
  
  console.log(`\n📅 Campaign Schedules (${schedules.length}):`);
  schedules.forEach((schedule, index) => {
    console.log(`   ${index + 1}. ${schedule.name}`);
    console.log(`      Template: ${schedule.template.name}`);
    console.log(`      Status: ${schedule.status}`);
    console.log(`      Send at: ${schedule.sendAt?.toISOString()}`);
  });
  
  console.log('\n📧 Summary:');
  console.log(`   - EmailJobs created: ${emailJobs.length}`);
  console.log(`   - CampaignSends created: ${campaignSends.length}`);
  console.log(`   - Audience members: ${testGroup?.members.length || 0}`);
  console.log(`   - Schedules: ${schedules.length}`);
  
  if (emailJobs.length === 0) {
    console.log('\n❌ No EmailJobs were created - this means runSchedule didn\'t work properly');
  } else if (emailJobs.length < (testGroup?.members.length || 0)) {
    console.log('\n⚠️  Fewer EmailJobs than audience members - only some emails were queued');
  }
}

checkEmailStatus()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
