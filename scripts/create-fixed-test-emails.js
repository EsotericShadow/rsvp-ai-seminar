const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createFixedTestEmails() {
  console.log('🔍 Creating fixed test emails with correct structure...');
  
  try {
    // Find the test campaign
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
            group: {
              include: {
                members: true
              }
            }
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
    
    // Create EmailJobs for the first schedule (immediate send)
    const firstSchedule = testCampaign.schedules[0];
    if (!firstSchedule) {
      console.log('❌ No schedules found');
      return;
    }
    
    console.log('📅 Using schedule:', firstSchedule.name);
    console.log('📧 Template:', firstSchedule.template.name);
    console.log('👥 Group:', firstSchedule.group.name);
    console.log('👤 Members:', firstSchedule.group.members.length);
    
    // Create EmailJobs for immediate sending
    const now = new Date();
    const emailJobs = [];
    
    for (const member of firstSchedule.group.members) {
      if (!member.inviteToken) {
        console.log(`⚠️  Skipping ${member.primaryEmail} - no invite token`);
        continue;
      }
      
      emailJobs.push({
        campaignId: testCampaign.id,
        scheduleId: firstSchedule.id,
        templateId: firstSchedule.templateId,
        groupId: firstSchedule.groupId,
        recipientEmail: member.primaryEmail,
        recipientId: member.businessId,
        sendAt: now, // Send immediately
        status: 'scheduled',
        meta: {
          testEmail: true,
          immediateSend: true
        }
      });
    }
    
    if (emailJobs.length === 0) {
      console.log('❌ No valid members found with invite tokens');
      return;
    }
    
    console.log(`\n📧 Creating ${emailJobs.length} EmailJobs for immediate sending...`);
    
    const createdJobs = await prisma.emailJob.createMany({
      data: emailJobs,
      skipDuplicates: true
    });
    
    console.log(`✅ Created ${createdJobs.count} EmailJobs`);
    
    // Verify the created EmailJobs
    const createdEmailJobs = await prisma.emailJob.findMany({
      where: {
        campaignId: testCampaign.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`\n📋 Created EmailJobs:`);
    createdEmailJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.recipientEmail}`);
      console.log(`      Template ID: ${job.templateId}`);
      console.log(`      Group ID: ${job.groupId}`);
      console.log(`      Schedule ID: ${job.scheduleId}`);
      console.log(`      Send at: ${job.sendAt}`);
      console.log(`      Status: ${job.status}`);
    });
    
    console.log('\n🎉 Fixed test emails created successfully!');
    console.log('📤 These emails are scheduled for immediate sending');
    console.log('⏰ Run the cron job to process them');
    
  } catch (error) {
    console.log('❌ Error creating fixed test emails:', error.message);
  }
}

createFixedTestEmails()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
