const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function debugProductionEnvironment() {
  console.log('🔍 Debugging production environment issues...');
  
  // Check environment variables that might affect URL generation
  console.log('🌍 Environment Variables:');
  console.log('   CAMPAIGN_LINK_BASE:', process.env.CAMPAIGN_LINK_BASE || 'NOT SET');
  console.log('   NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET');
  console.log('   VERCEL_URL:', process.env.VERCEL_URL || 'NOT SET');
  console.log('   RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET');
  
  // Find the failed EmailJob with the most recent error
  const failedJob = await prisma.emailJob.findFirst({
    where: {
      status: 'failed',
      error: {
        not: null
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
  
  if (failedJob) {
    console.log('\n❌ Most recent failed EmailJob:');
    console.log('   ID:', failedJob.id);
    console.log('   Recipient:', failedJob.recipientEmail);
    console.log('   Error:', failedJob.error);
    console.log('   Attempts:', failedJob.attempts);
    console.log('   Updated:', failedJob.updatedAt);
  }
  
  // Check if there are any EmailJobs that are stuck in 'scheduled' status
  const scheduledJobs = await prisma.emailJob.findMany({
    where: {
      status: 'scheduled'
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });
  
  console.log(`\n📋 Found ${scheduledJobs.length} scheduled EmailJobs:`);
  scheduledJobs.forEach((job, index) => {
    console.log(`   ${index + 1}. ${job.recipientEmail} - Created: ${job.createdAt} - Send at: ${job.sendAt}`);
  });
  
  // Check for any successful sends
  const successfulJobs = await prisma.emailJob.findMany({
    where: {
      status: 'sent'
    },
    orderBy: {
      sentAt: 'desc'
    },
    take: 3
  });
  
  console.log(`\n✅ Found ${successfulJobs.length} successful EmailJobs:`);
  successfulJobs.forEach((job, index) => {
    console.log(`   ${index + 1}. ${job.recipientEmail} - Sent: ${job.sentAt}`);
  });
  
  // Check CampaignSend records
  const campaignSends = await prisma.campaignSend.count();
  console.log(`\n📤 Total CampaignSend records: ${campaignSends}`);
  
  // Test URL generation with current environment
  console.log('\n🔗 Testing URL generation:');
  const testToken = 'test-token-test-green-alderson-1758828765084';
  
  try {
    const linkBase = process.env.CAMPAIGN_LINK_BASE?.replace(/\/$/, '') || 'https://rsvp.evergreenwebsolutions.ca';
    const url = new URL(linkBase);
    url.searchParams.set('eid', `biz_${testToken}`);
    const trackingLink = url.toString();
    console.log('   ✅ Generated URL:', trackingLink);
    
    // Test if the URL is valid
    new URL(trackingLink);
    console.log('   ✅ URL is valid');
  } catch (error) {
    console.log('   ❌ URL generation failed:', error.message);
  }
}

debugProductionEnvironment()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
