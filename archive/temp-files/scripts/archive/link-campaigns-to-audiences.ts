import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Campaign to audience group mapping (exact names from database)
const campaignAudienceMapping = {
  "Construction & Building": "Construction & Building - Northern BC",
  "Mining & Natural Resources": "Mining & Resources - Northern BC", 
  "Transportation & Logistics": "Transportation & Logistics - Northern BC",
  "Food & Beverage": "Food & Hospitality - Northern BC",
  "Professional Services": "Professional Services - Northern BC",
  "Technology & Business Services": "Technology & Communications - Northern BC",
  "Healthcare & Wellness": "Health & Wellness - Northern BC",
  "Retail & Entertainment": "Retail & Commerce - Northern BC",
  "Hospitality & Personal Care": "Personal Services - Northern BC",
  "Financial & Legal Services": "Financial Services - Northern BC",
  "Other Industries": "Other Industries - Northern BC"
};

async function linkCampaignsToAudiences() {
  console.log('🔗 Linking campaigns to their industry audience groups...\n');

  try {
    // Get all campaigns
    const campaigns = await prisma.campaign.findMany({
      include: {
        schedules: true
      }
    });

    console.log(`Found ${campaigns.length} campaigns to link:\n`);

    for (const campaign of campaigns) {
      const targetAudienceName = campaignAudienceMapping[campaign.name as keyof typeof campaignAudienceMapping];
      
      if (!targetAudienceName) {
        console.log(`⚠️  No audience mapping found for campaign: ${campaign.name}`);
        continue;
      }

      // Find the target audience group
      const targetGroup = await prisma.audienceGroup.findFirst({
        where: {
          name: targetAudienceName
        }
      });

      if (!targetGroup) {
        console.log(`⚠️  Audience group not found: ${targetAudienceName}`);
        continue;
      }

      console.log(`🎯 Linking "${campaign.name}" to "${targetGroup.name}" (${targetGroup.id})`);

      // Update all schedules for this campaign
      const updatedSchedules = await prisma.campaignSchedule.updateMany({
        where: {
          campaignId: campaign.id
        },
        data: {
          groupId: targetGroup.id
        }
      });

      console.log(`   ✅ Updated ${updatedSchedules.count} schedules`);
      console.log(`   📊 Group has ${targetGroup.members?.length || 0} members\n`);
    }

    // Show final status
    console.log('📋 Campaign-Audience Link Summary:');
    const linkedCampaigns = await prisma.campaign.findMany({
      include: {
        schedules: {
          include: {
            group: true
          }
        }
      }
    });

    for (const campaign of linkedCampaigns) {
      const firstSchedule = campaign.schedules[0];
      if (firstSchedule && firstSchedule.group) {
        console.log(`   • ${campaign.name} → ${firstSchedule.group.name}`);
      } else {
        console.log(`   • ${campaign.name} → ❌ Not linked`);
      }
    }

    console.log('\n🎉 Campaign linking completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Review the campaign-audience links above');
    console.log('   2. Go to admin panel → Campaign tab');
    console.log('   3. Change campaign status from DRAFT to SCHEDULED');
    console.log('   4. Monitor email delivery and engagement');

  } catch (error) {
    console.error('❌ Error linking campaigns:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
linkCampaignsToAudiences()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
