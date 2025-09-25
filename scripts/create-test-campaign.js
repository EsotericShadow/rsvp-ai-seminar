const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestCampaign() {
  try {
    console.log('🚀 Creating test campaign...');
    
    // Get the test group
    const testGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Test Email Group' }
    });
    
    if (!testGroup) {
      throw new Error('Test Email Group not found. Please run add-test-emails.js first.');
    }
    
    // Get the test templates
    const templates = await prisma.campaignTemplate.findMany({
      where: {
        meta: {
          path: ['testTemplate'],
          equals: true
        }
      }
    });
    
    if (templates.length === 0) {
      throw new Error('Test templates not found. Please run create-test-templates.js first.');
    }
    
    console.log(`📧 Found ${templates.length} test templates`);
    console.log(`👥 Using test group: ${testGroup.name} (${testGroup.id})`);
    
    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: 'Test Campaign - Email Automation',
        description: 'Testing email automation with 3 emails over 15 minutes',
        status: 'DRAFT',
        meta: {
          testCampaign: true,
          createdFor: 'automation-testing'
        }
      }
    });
    
    console.log(`✅ Created campaign: ${campaign.name} (${campaign.id})`);
    
    // Create campaign schedules for the 3 emails
    const schedules = [
      {
        templateId: templates[0].id, // Welcome email
        groupId: testGroup.id,
        sendAt: new Date(Date.now() + 1 * 60 * 1000), // 1 minute from now
        delay: 0,
        order: 1,
        status: 'DRAFT'
      },
      {
        templateId: templates[1].id, // Follow-up email
        groupId: testGroup.id,
        sendAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        delay: 4 * 60, // 4 minutes delay
        order: 2,
        status: 'DRAFT'
      },
      {
        templateId: templates[2].id, // Final email
        groupId: testGroup.id,
        sendAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
        delay: 14 * 60, // 14 minutes delay
        order: 3,
        status: 'DRAFT'
      }
    ];
    
    for (const schedule of schedules) {
      const campaignSchedule = await prisma.campaignSchedule.create({
        data: {
          name: `Test Schedule ${schedule.order}`,
          campaignId: campaign.id,
          templateId: schedule.templateId,
          groupId: schedule.groupId,
          sendAt: schedule.sendAt,
          stepOrder: schedule.order,
          status: schedule.status,
          meta: {
            testSchedule: true,
            delay: schedule.delay
          }
        }
      });
      
      console.log(`✅ Created schedule ${schedule.order}: ${schedule.sendAt.toISOString()}`);
    }
    
    console.log('🎉 Test campaign created successfully!');
    console.log(`📊 Campaign ID: ${campaign.id}`);
    console.log(`📅 Schedules: 3 emails over 15 minutes`);
    console.log(`👥 Target: ${testGroup.name} (4 test emails)`);
    
    // Show the test emails that will receive the campaign
    const testMembers = await prisma.audienceMember.findMany({
      where: { groupId: testGroup.id },
      select: { primaryEmail: true, businessName: true }
    });
    
    console.log('\n📧 Test emails that will receive the campaign:');
    testMembers.forEach(member => {
      console.log(`  - ${member.primaryEmail} (${member.businessName})`);
    });
    
  } catch (error) {
    console.error('❌ Error creating test campaign:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestCampaign();
