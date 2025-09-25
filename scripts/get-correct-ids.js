const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function getCorrectIds() {
  console.log('🔍 Getting correct template and group IDs...');
  
  // Get the test campaign
  const testCampaign = await prisma.campaign.findFirst({
    where: {
      meta: {
        path: ['finalTestCampaign'],
        equals: true
      }
    },
    include: {
      schedules: {
        include: {
          template: true,
          group: true
        }
      }
    }
  });
  
  if (!testCampaign) {
    console.log('❌ Test campaign not found');
    return;
  }
  
  console.log('✅ Found test campaign:', testCampaign.name);
  console.log('📊 Schedules:', testCampaign.schedules.length);
  
  testCampaign.schedules.forEach((schedule, index) => {
    console.log(`\n${index + 1}. Schedule: ${schedule.name}`);
    console.log(`   Template ID: ${schedule.templateId}`);
    console.log(`   Group ID: ${schedule.groupId}`);
    console.log(`   Template: ${schedule.template.name}`);
    console.log(`   Group: ${schedule.group.name}`);
    console.log(`   Status: ${schedule.status}`);
  });
  
  // Get the first schedule for testing
  const firstSchedule = testCampaign.schedules[0];
  if (firstSchedule) {
    console.log('\n🎯 Using first schedule for testing:');
    console.log(`   Template ID: ${firstSchedule.templateId}`);
    console.log(`   Group ID: ${firstSchedule.groupId}`);
    
    // Get group members
    const members = await prisma.audienceMember.findMany({
      where: { groupId: firstSchedule.groupId }
    });
    
    console.log(`   Members: ${members.length}`);
    members.forEach(member => {
      console.log(`     - ${member.primaryEmail} (${member.businessName})`);
    });
  }
}

getCorrectIds()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
