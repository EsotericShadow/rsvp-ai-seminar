import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function viewCampaignSchedule() {
  console.log('📊 Campaign Schedule Overview\n');

  try {
    // Get all campaigns with their schedules and templates
    const campaigns = await prisma.campaign.findMany({
      include: {
        schedules: {
          include: {
            template: true
          },
          orderBy: {
            stepOrder: 'asc'
          }
        },
        settings: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Found ${campaigns.length} campaigns:\n`);

    for (const campaign of campaigns) {
      console.log(`🎯 ${campaign.name}`);
      console.log(`   Description: ${campaign.description}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Schedules: ${campaign.schedules.length} emails`);
      
      if (campaign.settings) {
        const settings = campaign.settings as any;
        console.log(`   Priority: ${settings.windows?.priority || 'N/A'}`);
        console.log(`   Target Audience: ${settings.windows?.targetAudience || 'N/A'}`);
      }

      console.log('\n   📧 Email Schedule:');
      for (const schedule of campaign.schedules) {
        const sendDate = schedule.sendAt ? new Date(schedule.sendAt).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Not scheduled';
        
        console.log(`   ${schedule.stepOrder}. ${schedule.template.name}`);
        console.log(`      Subject: ${schedule.template.subject}`);
        console.log(`      Send Date: ${sendDate}`);
        console.log(`      Status: ${schedule.status}`);
        console.log('');
      }
      
      console.log('─'.repeat(80));
      console.log('');
    }

    // Summary statistics
    const totalEmails = campaigns.reduce((sum, campaign) => sum + campaign.schedules.length, 0);
    const totalTemplates = await prisma.campaignTemplate.count();
    
    console.log('📈 Summary Statistics:');
    console.log(`   • Total Campaigns: ${campaigns.length}`);
    console.log(`   • Total Email Templates: ${totalTemplates}`);
    console.log(`   • Total Scheduled Emails: ${totalEmails}`);
    console.log(`   • Average Emails per Campaign: ${(totalEmails / campaigns.length).toFixed(1)}`);
    
    // High-value campaigns
    const highValueCampaigns = campaigns.filter(c => {
      const settings = c.settings as any;
      return settings?.windows?.priority === 'high';
    });
    
    console.log(`\n🎯 High-Value Campaigns: ${highValueCampaigns.length}`);
    highValueCampaigns.forEach(campaign => {
      console.log(`   • ${campaign.name} (${campaign.schedules.length} emails)`);
    });

    // Medium-value campaigns  
    const mediumValueCampaigns = campaigns.filter(c => {
      const settings = c.settings as any;
      return settings?.windows?.priority === 'medium';
    });
    
    console.log(`\n📊 Medium-Value Campaigns: ${mediumValueCampaigns.length}`);
    mediumValueCampaigns.forEach(campaign => {
      console.log(`   • ${campaign.name} (${campaign.schedules.length} emails)`);
    });

    // Low-value campaigns
    const lowValueCampaigns = campaigns.filter(c => {
      const settings = c.settings as any;
      return settings?.windows?.priority === 'low';
    });
    
    console.log(`\n📋 Low-Value Campaigns: ${lowValueCampaigns.length}`);
    lowValueCampaigns.forEach(campaign => {
      console.log(`   • ${campaign.name} (${campaign.schedules.length} emails)`);
    });

    // Email schedule timeline
    console.log('\n📅 Email Schedule Timeline:');
    const allSchedules = campaigns.flatMap(c => c.schedules);
    const scheduleMap = new Map();
    
    allSchedules.forEach(schedule => {
      if (schedule.sendAt) {
        const date = new Date(schedule.sendAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        scheduleMap.set(date, (scheduleMap.get(date) || 0) + 1);
      }
    });
    
    const sortedDates = Array.from(scheduleMap.entries()).sort((a, b) => 
      new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );
    
    sortedDates.forEach(([date, count]) => {
      console.log(`   ${date}: ${count} emails`);
    });

  } catch (error) {
    console.error('❌ Error viewing campaign schedule:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
viewCampaignSchedule()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
