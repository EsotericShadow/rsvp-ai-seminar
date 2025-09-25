const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function updateCampaignWithSafeTestGroup() {
  console.log('🔍 Updating test campaign to use safe test group...');
  
  // Find the safe test group
  const safeGroup = await prisma.audienceGroup.findFirst({
    where: {
      name: 'Safe Test Email Group'
    }
  });
  
  if (!safeGroup) {
    console.log('❌ Safe test group not found');
    return;
  }
  
  console.log('✅ Found safe test group:', safeGroup.id);
  
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
  
  // Update all campaign schedules to use the safe test group
  const schedules = await prisma.campaignSchedule.findMany({
    where: {
      campaignId: testCampaign.id
    }
  });
  
  console.log(`📅 Found ${schedules.length} schedules to update`);
  
  for (const schedule of schedules) {
    await prisma.campaignSchedule.update({
      where: { id: schedule.id },
      data: { groupId: safeGroup.id }
    });
    console.log(`✅ Updated schedule ${schedule.stepOrder} to use safe test group`);
  }
  
  console.log('\n🎉 Campaign updated successfully!');
  console.log('⚠️  SAFE: Campaign now targets only safe test emails - no real businesses!');
  
  // Show final stats
  const memberCount = await prisma.audienceMember.count({
    where: { groupId: safeGroup.id }
  });
  
  console.log(`📊 Safe test group has ${memberCount} members`);
  console.log('📧 Safe test members:');
  
  const members = await prisma.audienceMember.findMany({
    where: { groupId: safeGroup.id },
    select: {
      businessName: true,
      primaryEmail: true
    }
  });
  
  members.forEach((member, index) => {
    console.log(`   ${index + 1}. ${member.businessName} (${member.primaryEmail})`);
  });
}

updateCampaignWithSafeTestGroup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
