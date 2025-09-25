const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createFinalTestCampaign() {
  console.log('🔍 Creating final test campaign with LeadMine businesses...');
  
  // Find the LeadMine test group
  const testGroup = await prisma.audienceGroup.findFirst({
    where: {
      name: 'LeadMine Test Group'
    }
  });
  
  if (!testGroup) {
    console.log('❌ LeadMine test group not found');
    return;
  }
  
  // Find the test templates
  const templates = await prisma.campaignTemplate.findMany({
    where: {
      meta: {
        path: ['testTemplate'],
        equals: true
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
  
  if (templates.length === 0) {
    console.log('❌ Test templates not found');
    return;
  }
  
  console.log(`✅ Found test group: ${testGroup.name}`);
  console.log(`✅ Found ${templates.length} test templates`);
  
  // Clean up any existing test campaigns
  await prisma.campaignSchedule.deleteMany({
    where: {
      campaign: {
        meta: {
          path: ['finalTestCampaign'],
          equals: true
        }
      }
    }
  });
  
  await prisma.campaign.deleteMany({
    where: {
      meta: {
        path: ['finalTestCampaign'],
        equals: true
      }
    }
  });
  
  console.log('🧹 Cleaned up existing final test campaigns');
  
  // Create the test campaign
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Final Test Campaign - LeadMine Integration',
      description: 'Testing email automation with LeadMine businesses and RSVP tracking',
      status: 'DRAFT',
      meta: {
        finalTestCampaign: true,
        safeForTesting: true,
        source: 'leadmine',
        note: 'Contains only safe test businesses from LeadMine with proper invite tokens'
      }
    }
  });
  
  console.log('✅ Created final test campaign:', campaign.id);
  
  // Create schedules: 1 immediate, 1 in 5 minutes, 1 in 10 minutes
  const now = new Date();
  const schedules = [
    {
      template: templates[0], // Welcome Email
      name: 'Immediate Welcome Email',
      sendAt: now,
      status: 'DRAFT',
      order: 1,
      delay: 0
    },
    {
      template: templates[1], // Follow-up Email
      name: 'Follow-up Email in 5 Minutes',
      sendAt: new Date(now.getTime() + 5 * 60 * 1000),
      status: 'SCHEDULED',
      order: 2,
      delay: 5
    },
    {
      template: templates[2], // Final Email
      name: 'Final Email in 10 Minutes',
      sendAt: new Date(now.getTime() + 10 * 60 * 1000),
      status: 'SCHEDULED',
      order: 3,
      delay: 10
    }
  ];
  
  for (const schedule of schedules) {
    const campaignSchedule = await prisma.campaignSchedule.create({
      data: {
        name: schedule.name,
        campaignId: campaign.id,
        templateId: schedule.template.id,
        groupId: testGroup.id,
        sendAt: schedule.sendAt,
        stepOrder: schedule.order,
        status: schedule.status,
        meta: {
          finalTestSchedule: true,
          safeForTesting: true,
          delay: schedule.delay,
          templateName: schedule.template.name
        }
      }
    });
    
    console.log(`✅ Created schedule ${schedule.order}: ${schedule.name}`);
    console.log(`   Template: ${schedule.template.name}`);
    console.log(`   Status: ${schedule.status}`);
    console.log(`   Send at: ${schedule.sendAt.toISOString()}`);
  }
  
  console.log('\n🎉 Final test campaign created successfully!');
  console.log('⚠️  SAFE: This campaign targets only LeadMine test businesses!');
  
  // Show campaign details
  const memberCount = await prisma.audienceMember.count({
    where: { groupId: testGroup.id }
  });
  
  console.log(`\n📊 Campaign Details:`);
  console.log(`   Campaign ID: ${campaign.id}`);
  console.log(`   Audience: ${testGroup.name} (${memberCount} members)`);
  console.log(`   Templates: ${templates.length}`);
  console.log(`   Schedules: 3 (immediate + 5min + 10min)`);
  
  console.log(`\n📧 Test emails will be sent to:`);
  const members = await prisma.audienceMember.findMany({
    where: { groupId: testGroup.id },
    select: {
      businessName: true,
      primaryEmail: true,
      inviteToken: true
    }
  });
  
  members.forEach((member, index) => {
    console.log(`   ${index + 1}. ${member.businessName} (${member.primaryEmail})`);
    console.log(`      Token: ${member.inviteToken}`);
  });
  
  console.log(`\n🔗 All emails include RSVP tracking links using invite tokens!`);
  
  return campaign.id;
}

createFinalTestCampaign()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
