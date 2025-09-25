const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createSafeTestCampaign() {
  console.log('🔍 Creating safe test campaign with immediate and scheduled emails...');
  
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
  
  // Find a test template
  const template = await prisma.campaignTemplate.findFirst({
    where: {
      meta: {
        path: ['testTemplate'],
        equals: true
      }
    }
  });
  
  if (!template) {
    console.log('❌ Test template not found');
    return;
  }
  
  console.log('✅ Found safe test group and template');
  
  // Create the test campaign
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Safe Test Campaign - Email Automation',
      description: 'Testing email automation with safe test emails only',
      status: 'DRAFT',
      meta: {
        testCampaign: true,
        safeForTesting: true,
        note: 'Contains only safe test emails - no real businesses'
      }
    }
  });
  
  console.log('✅ Created safe test campaign:', campaign.id);
  
  // Create schedules: 1 immediate, 1 in 5 minutes, 1 in 10 minutes
  const now = new Date();
  const schedules = [
    {
      name: 'Immediate Test Email',
      sendAt: now,
      status: 'DRAFT',
      order: 1,
      delay: 0
    },
    {
      name: 'Test Email in 5 Minutes',
      sendAt: new Date(now.getTime() + 5 * 60 * 1000),
      status: 'SCHEDULED',
      order: 2,
      delay: 5
    },
    {
      name: 'Test Email in 10 Minutes',
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
        templateId: template.id,
        groupId: safeGroup.id,
        sendAt: schedule.sendAt,
        stepOrder: schedule.order,
        status: schedule.status,
        meta: {
          testSchedule: true,
          safeForTesting: true,
          delay: schedule.delay
        }
      }
    });
    
    console.log(`✅ Created schedule ${schedule.order}: ${schedule.name} (${schedule.status})`);
  }
  
  console.log('\n🎉 Safe test campaign created successfully!');
  console.log('⚠️  SAFE: This campaign targets only safe test emails!');
  console.log('📧 Test emails will be sent to:');
  console.log('   - gabriel.lacroix94@icloud.com');
  console.log('   - greenalderson@gmail.com');
  console.log('   - tangible18@outlook.com');
  console.log('   - availability127@live.ca');
  
  return campaign.id;
}

createSafeTestCampaign()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
