const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function updateCampaignWithRealAudience() {
  console.log('🔍 Updating test campaign to use real LeadMine audience...');
  
  // Find the real audience group
  const realGroup = await prisma.audienceGroup.findFirst({
    where: {
      name: 'Real LeadMine Test Group'
    }
  });
  
  if (!realGroup) {
    console.log('❌ Real audience group not found');
    return;
  }
  
  console.log('✅ Found real audience group:', realGroup.id);
  
  // Find the test campaign
  const testCampaign = await prisma.campaign.findFirst({
    where: {
      meta: {
        path: ['testCampaign'],
        equals: true
      }
    }
  });
  
  if (!testCampaign) {
    console.log('❌ Test campaign not found');
    return;
  }
  
  console.log('✅ Found test campaign:', testCampaign.id);
  
  // Update all campaign schedules to use the real audience group
  const schedules = await prisma.campaignSchedule.findMany({
    where: {
      campaignId: testCampaign.id
    }
  });
  
  console.log(`📅 Found ${schedules.length} schedules to update`);
  
  for (const schedule of schedules) {
    await prisma.campaignSchedule.update({
      where: { id: schedule.id },
      data: { groupId: realGroup.id }
    });
    console.log(`✅ Updated schedule ${schedule.stepOrder} to use real audience`);
  }
  
  console.log('\n🎉 Campaign updated successfully!');
  
  // Show final stats
  const memberCount = await prisma.audienceMember.count({
    where: { groupId: realGroup.id }
  });
  
  console.log(`📊 Real audience group has ${memberCount} members`);
  console.log('📧 Members:');
  
  const members = await prisma.audienceMember.findMany({
    where: { groupId: realGroup.id },
    select: {
      businessName: true,
      primaryEmail: true,
      inviteToken: true
    }
  });
  
  members.forEach((member, index) => {
    console.log(`   ${index + 1}. ${member.businessName} (${member.primaryEmail})`);
  });
}

updateCampaignWithRealAudience()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
