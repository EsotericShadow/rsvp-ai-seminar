const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testSafeEmailSending() {
  console.log('🔍 Testing safe email sending...');
  
  // Find the immediate test schedule
  const immediateSchedule = await prisma.campaignSchedule.findFirst({
    where: {
      name: 'Immediate Test Email',
      meta: {
        path: ['safeForTesting'],
        equals: true
      }
    },
    include: {
      template: true,
      group: {
        include: {
          members: true
        }
      }
    }
  });
  
  if (!immediateSchedule) {
    console.log('❌ Immediate test schedule not found');
    return;
  }
  
  console.log('✅ Found immediate test schedule:', immediateSchedule.id);
  console.log('📧 Template:', immediateSchedule.template.name);
  console.log('👥 Group:', immediateSchedule.group.name);
  console.log('👤 Members:', immediateSchedule.group.members.length);
  
  // Show the members
  immediateSchedule.group.members.forEach((member, index) => {
    console.log(`   ${index + 1}. ${member.businessName} (${member.primaryEmail})`);
  });
  
  console.log('\n📤 Testing email sending via runSchedule...');
  
  // Import the runSchedule function
  const { runSchedule } = require('../src/lib/campaigns');
  
  try {
    const result = await runSchedule(immediateSchedule.id, {
      limit: 1, // Only send to 1 member for testing
      previewOnly: false
    });
    
    console.log('✅ runSchedule result:', JSON.stringify(result, null, 2));
    
    if (result.processed > 0) {
      console.log('🎉 Email job created successfully!');
      console.log('📊 Processed:', result.processed);
      console.log('📤 Sent:', result.sent);
      
      // Check if EmailJob records were created
      const emailJobs = await prisma.emailJob.findMany({
        where: {
          campaignId: immediateSchedule.campaignId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });
      
      console.log(`\n📋 EmailJob records created: ${emailJobs.length}`);
      emailJobs.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.recipientEmail} (${job.status}) - Send at: ${job.sendAt}`);
      });
      
    } else {
      console.log('❌ No emails were processed');
    }
    
  } catch (error) {
    console.log('❌ runSchedule failed:', error.message);
    console.log('Stack:', error.stack);
  }
}

testSafeEmailSending()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

