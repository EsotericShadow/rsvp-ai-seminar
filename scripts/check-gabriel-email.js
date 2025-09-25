const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkGabrielEmail() {
  console.log('🔍 Checking for gabriel.lacroix94@icloud.com...');
  
  try {
    // Check if there's a business in LeadMine for this email
    console.log('📧 Checking LeadMine businesses...');
    
    const leadMineResponse = await fetch('https://lead-mine.vercel.app/api/integration/businesses?ids=test-gabriel-lacroix', {
      headers: {
        'Authorization': `Bearer ${process.env.LEADMINE_API_KEY}`
      }
    });
    
    if (leadMineResponse.ok) {
      const leadMineData = await leadMineResponse.json();
      console.log('✅ LeadMine response:', JSON.stringify(leadMineData, null, 2));
    } else {
      console.log('❌ LeadMine request failed:', leadMineResponse.status);
    }
    
    // Check all audience groups for this email
    console.log('\n👥 Checking all audience groups for gabriel.lacroix94@icloud.com...');
    
    const allGroups = await prisma.audienceGroup.findMany({
      include: {
        members: {
          where: {
            primaryEmail: 'gabriel.lacroix94@icloud.com'
          }
        }
      }
    });
    
    console.log(`📋 Found ${allGroups.length} audience groups:`);
    
    allGroups.forEach((group, index) => {
      console.log(`\n${index + 1}. Group: ${group.name}`);
      console.log(`   Members with gabriel.lacroix94@icloud.com: ${group.members.length}`);
      
      if (group.members.length > 0) {
        group.members.forEach((member, memberIndex) => {
          console.log(`   ${memberIndex + 1}. ${member.businessName}`);
          console.log(`      Email: ${member.primaryEmail}`);
          console.log(`      Token: ${member.inviteToken || 'None'}`);
        });
      }
    });
    
    // Check if there are any EmailJobs for this email
    console.log('\n📧 Checking EmailJobs for gabriel.lacroix94@icloud.com...');
    
    const emailJobs = await prisma.emailJob.findMany({
      where: {
        recipientEmail: 'gabriel.lacroix94@icloud.com'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📋 Found ${emailJobs.length} EmailJobs for gabriel.lacroix94@icloud.com:`);
    
    emailJobs.forEach((job, index) => {
      console.log(`\n${index + 1}. EmailJob: ${job.id}`);
      console.log(`   Status: ${job.status}`);
      console.log(`   Error: ${job.error || 'None'}`);
      console.log(`   Attempts: ${job.attempts}`);
      console.log(`   Created: ${job.createdAt}`);
    });
    
    // Check CampaignSend records
    console.log('\n📤 Checking CampaignSend records for gabriel.lacroix94@icloud.com...');
    
    const campaignSends = await prisma.campaignSend.findMany({
      where: {
        email: 'gabriel.lacroix94@icloud.com'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📋 Found ${campaignSends.length} CampaignSend records:`);
    
    campaignSends.forEach((send, index) => {
      console.log(`\n${index + 1}. CampaignSend: ${send.id}`);
      console.log(`   Status: ${send.status}`);
      console.log(`   Sent at: ${send.sentAt || 'Not sent'}`);
      console.log(`   Message ID: ${send.resendMessageId || 'None'}`);
    });
    
  } catch (error) {
    console.log('❌ Error checking Gabriel email:', error.message);
  }
}

checkGabrielEmail()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
