const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkEmailScheduleTimes() {
  console.log('🔍 Checking email schedule times...');
  
  try {
    const now = new Date();
    console.log(`   Current time: ${now.toISOString()}`);
    
    // Get all scheduled EmailJobs
    const scheduledJobs = await prisma.emailJob.findMany({
      where: {
        status: 'scheduled'
      },
      orderBy: {
        sendAt: 'asc'
      }
    });
    
    console.log(`\n📅 Found ${scheduledJobs.length} scheduled EmailJobs:`);
    
    scheduledJobs.forEach((job, index) => {
      const sendTime = new Date(job.sendAt);
      const isOverdue = sendTime < now;
      const timeDiff = now.getTime() - sendTime.getTime();
      const minutesDiff = Math.round(timeDiff / (1000 * 60));
      
      console.log(`   ${index + 1}. ${job.recipientEmail}`);
      console.log(`      Send at: ${sendTime.toISOString()}`);
      console.log(`      Status: ${isOverdue ? 'OVERDUE' : 'FUTURE'} (${minutesDiff} minutes ${isOverdue ? 'ago' : 'from now'})`);
      console.log(`      Campaign: ${job.campaignId}`);
      console.log(`      Template: ${job.templateId}`);
      console.log(`      Group: ${job.groupId}`);
      console.log('');
    });
    
    // Check for overdue emails
    const overdueJobs = scheduledJobs.filter(job => new Date(job.sendAt) < now);
    console.log(`\n⏰ Overdue emails: ${overdueJobs.length}`);
    
    if (overdueJobs.length > 0) {
      console.log('   These emails should have been sent already:');
      overdueJobs.forEach((job, index) => {
        const sendTime = new Date(job.sendAt);
        const timeDiff = now.getTime() - sendTime.getTime();
        const minutesDiff = Math.round(timeDiff / (1000 * 60));
        console.log(`      ${index + 1}. ${job.recipientEmail} - Overdue by ${minutesDiff} minutes`);
      });
    }
    
    // Check for future emails
    const futureJobs = scheduledJobs.filter(job => new Date(job.sendAt) > now);
    console.log(`\n⏰ Future emails: ${futureJobs.length}`);
    
    if (futureJobs.length > 0) {
      console.log('   These emails are scheduled for the future:');
      futureJobs.forEach((job, index) => {
        const sendTime = new Date(job.sendAt);
        const timeDiff = sendTime.getTime() - now.getTime();
        const minutesDiff = Math.round(timeDiff / (1000 * 60));
        console.log(`      ${index + 1}. ${job.recipientEmail} - In ${minutesDiff} minutes`);
      });
    }
    
    // Check if there are any failed jobs that might have been retried
    const failedJobs = await prisma.emailJob.findMany({
      where: {
        status: 'failed'
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    });
    
    console.log(`\n❌ Failed jobs: ${failedJobs.length}`);
    if (failedJobs.length > 0) {
      console.log('   Recent failures:');
      failedJobs.forEach((job, index) => {
        console.log(`      ${index + 1}. ${job.recipientEmail} - ${job.error} - ${job.updatedAt}`);
      });
    }
    
    // Summary
    console.log('\n🎯 Summary:');
    console.log(`   Total scheduled: ${scheduledJobs.length}`);
    console.log(`   Overdue: ${overdueJobs.length}`);
    console.log(`   Future: ${futureJobs.length}`);
    console.log(`   Failed: ${failedJobs.length}`);
    
    if (overdueJobs.length > 0) {
      console.log('\n❌ Issue: There are overdue emails that should have been sent');
      console.log('   The cron job should be processing these emails');
      console.log('   This suggests there\'s an issue with the cron job logic');
    } else if (futureJobs.length > 0) {
      console.log('\n✅ All emails are scheduled for the future');
      console.log('   The cron job is working correctly - no emails to process yet');
    } else {
      console.log('\n❌ No emails found - this is unexpected');
    }
    
  } catch (error) {
    console.log('❌ Error checking email schedule times:', error.message);
  }
}

checkEmailScheduleTimes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
