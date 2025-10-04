const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkProductionDatabase() {
  console.log('🔍 Checking production database state...');
  
  try {
    // Check if we're connected to the same database
    console.log('1️⃣ Database connection test...');
    const templateCount = await prisma.campaignTemplate.count();
    const groupCount = await prisma.audienceGroup.count();
    const campaignCount = await prisma.campaign.count();
    console.log(`   ✅ Templates: ${templateCount}, Groups: ${groupCount}, Campaigns: ${campaignCount}`);
    
    // Check EmailJobs
    console.log('\n2️⃣ EmailJobs status...');
    const allEmailJobs = await prisma.emailJob.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });
    
    console.log(`   ✅ Total EmailJobs: ${allEmailJobs.length}`);
    
    const statusCounts = allEmailJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('   📊 Status breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`      ${status}: ${count}`);
    });
    
    // Check for due emails
    console.log('\n3️⃣ Checking for due emails...');
    const now = new Date();
    const dueJobs = await prisma.emailJob.findMany({
      where: {
        status: 'scheduled',
        sendAt: {
          lte: now
        }
      },
      orderBy: {
        sendAt: 'asc'
      },
      take: 10
    });
    
    console.log(`   ✅ Due emails: ${dueJobs.length}`);
    
    if (dueJobs.length > 0) {
      console.log('   📅 Next 5 due emails:');
      dueJobs.slice(0, 5).forEach((job, index) => {
        console.log(`      ${index + 1}. ${job.recipientEmail} - Due: ${job.sendAt} (${job.sendAt < now ? 'OVERDUE' : 'DUE'})`);
      });
    }
    
    // Check test campaign
    console.log('\n4️⃣ Checking test campaign...');
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
            group: {
              include: {
                members: true
              }
            }
          }
        }
      }
    });
    
    if (testCampaign) {
      console.log(`   ✅ Test campaign found: ${testCampaign.name}`);
      console.log(`   ✅ Schedules: ${testCampaign.schedules.length}`);
      
      const totalMembers = testCampaign.schedules.reduce((acc, schedule) => {
        return acc + schedule.group.members.length;
      }, 0);
      console.log(`   ✅ Total members: ${totalMembers}`);
      
      // Check if members have tokens
      const membersWithTokens = testCampaign.schedules.reduce((acc, schedule) => {
        return acc + schedule.group.members.filter(member => member.inviteToken).length;
      }, 0);
      console.log(`   ✅ Members with tokens: ${membersWithTokens}`);
    } else {
      console.log('   ❌ Test campaign not found');
    }
    
    // Check CampaignSend records
    console.log('\n5️⃣ Checking CampaignSend records...');
    const campaignSends = await prisma.campaignSend.count();
    console.log(`   ✅ Total CampaignSend records: ${campaignSends}`);
    
    if (campaignSends > 0) {
      const recentSends = await prisma.campaignSend.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });
      
      console.log('   📤 Recent sends:');
      recentSends.forEach((send, index) => {
        console.log(`      ${index + 1}. ${send.email} - ${send.status} - ${send.sentAt || 'Not sent'}`);
      });
    }
    
    console.log('\n🎯 Summary:');
    console.log(`   Database: ✅ Connected`);
    console.log(`   Templates: ✅ ${templateCount}`);
    console.log(`   Groups: ✅ ${groupCount}`);
    console.log(`   Campaigns: ✅ ${campaignCount}`);
    console.log(`   EmailJobs: ✅ ${allEmailJobs.length} (${statusCounts.scheduled || 0} scheduled)`);
    console.log(`   Due emails: ✅ ${dueJobs.length}`);
    console.log(`   CampaignSends: ✅ ${campaignSends}`);
    
    if (dueJobs.length === 0) {
      console.log('\n❌ No due emails found - this explains why cron processes 0 emails');
      console.log('   All scheduled emails may have already been processed or failed');
    } else {
      console.log('\n✅ Due emails found - cron should be processing them');
      console.log('   The issue may be in the email sending logic itself');
    }
    
  } catch (error) {
    console.log('❌ Error checking production database:', error.message);
  }
}

checkProductionDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

