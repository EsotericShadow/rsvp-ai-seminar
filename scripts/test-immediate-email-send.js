const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testImmediateEmailSend() {
  console.log('🔍 Testing immediate email sending with LeadMine businesses...');
  
  // Find the immediate test schedule
  const immediateSchedule = await prisma.campaignSchedule.findFirst({
    where: {
      name: 'Immediate Welcome Email',
      meta: {
        path: ['finalTestSchedule'],
        equals: true
      }
    },
    include: {
      template: true,
      group: {
        include: {
          members: true
        }
      },
      campaign: true
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
  console.log('🎯 Campaign:', immediateSchedule.campaign.name);
  
  // Show the members with their invite tokens
  console.log('\n📋 Members with invite tokens:');
  immediateSchedule.group.members.forEach((member, index) => {
    console.log(`   ${index + 1}. ${member.businessName} (${member.primaryEmail})`);
    console.log(`      Token: ${member.inviteToken || 'NO TOKEN'}`);
  });
  
  console.log('\n📤 Testing email sending via API...');
  
  // Call the campaign send API
  const response = await fetch('https://rsvp.evergreenwebsolutions.ca/api/admin/campaign/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-cron-secret': '89f485b73b6353044377b77cb132291735e3610d4c12982784d6d7666ca38aaf'
    },
    body: JSON.stringify({
      scheduleId: immediateSchedule.id,
      limit: 1, // Only send to 1 member for testing
      previewOnly: false
    })
  });
  
  console.log('📡 API Response status:', response.status);
  
  if (response.ok) {
    const result = await response.json();
    console.log('✅ API Response:', JSON.stringify(result, null, 2));
    
    if (result.result && result.result.processed > 0) {
      console.log('🎉 Email job created successfully!');
      console.log('📊 Processed:', result.result.processed);
      console.log('📤 Sent:', result.result.sent);
      
      // Show results
      if (result.result.results && result.result.results.length > 0) {
        console.log('\n📋 Email Results:');
        result.result.results.forEach((emailResult, index) => {
          console.log(`   ${index + 1}. ${emailResult.email}: ${emailResult.status}`);
          if (emailResult.error) {
            console.log(`      Error: ${emailResult.error}`);
          }
        });
      }
      
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
      if (result.result && result.result.results) {
        console.log('📋 Results:', result.result.results);
      }
    }
    
  } else {
    const errorText = await response.text();
    console.log('❌ API Error:', response.status, errorText);
  }
}

testImmediateEmailSend()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
