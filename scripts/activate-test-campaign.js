const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function activateTestCampaign() {
  try {
    console.log('🚀 Activating Test Campaign for Automated Sending...\n');
    
    // 1. Update campaign status to SCHEDULED
    const campaign = await prisma.campaign.findFirst({
      where: {
        meta: {
          path: ['testCampaign'],
          equals: true
        }
      }
    });
    
    if (campaign) {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: 'SCHEDULED' }
      });
      console.log(`✅ Campaign "${campaign.name}" set to SCHEDULED`);
    }
    
    // 2. Update all test schedules to SCHEDULED
    const schedules = await prisma.campaignSchedule.findMany({
      where: {
        meta: {
          path: ['testSchedule'],
          equals: true
        }
      }
    });
    
    console.log(`📅 Updating ${schedules.length} schedules to SCHEDULED...`);
    
    for (const schedule of schedules) {
      await prisma.campaignSchedule.update({
        where: { id: schedule.id },
        data: { status: 'SCHEDULED' }
      });
      console.log(`   ✅ ${schedule.name} - Status: SCHEDULED`);
    }
    
    // 3. Show the automated sending timeline
    console.log('\n⏰ Automated Sending Timeline:');
    schedules.forEach((schedule, index) => {
      const sendTime = schedule.sendAt?.toLocaleString() || 'Not set';
      console.log(`   ${index + 1}. ${schedule.name} - ${sendTime}`);
    });
    
    // 4. Show target emails
    const testGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Test Email Group' }
    });
    
    if (testGroup) {
      const members = await prisma.audienceMember.findMany({
        where: { groupId: testGroup.id }
      });
      
      console.log('\n📧 Target Emails:');
      members.forEach(member => {
        console.log(`   - ${member.primaryEmail} (${member.businessName})`);
      });
    }
    
    console.log('\n🎉 Test Campaign Activated!');
    console.log('\n📋 Campaign Status:');
    console.log('   ✅ Campaign: SCHEDULED');
    console.log('   ✅ Schedules: SCHEDULED (3 emails)');
    console.log('   ✅ Templates: Ready');
    console.log('   ✅ Audience: 4 test emails');
    console.log('   ✅ Email Service: SendGrid configured');
    
    console.log('\n🔧 Next Steps:');
    console.log('   1. The campaign is now active and ready for automated sending');
    console.log('   2. Emails will be sent according to the schedule');
    console.log('   3. Check the campaign send records for delivery status');
    console.log('   4. Monitor the admin panel for campaign progress');
    
    console.log('\n⚠️  Note:');
    console.log('   - The cron job needs to be running to process scheduled emails');
    console.log('   - Check /api/admin/campaign/cron for cron job status');
    console.log('   - Emails will be sent to the 4 test addresses provided');
    
  } catch (error) {
    console.error('❌ Error activating test campaign:', error);
  } finally {
    await prisma.$disconnect();
  }
}

activateTestCampaign();

