import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeFullCapacity() {
  console.log('🎯 Analyzing Full Capacity with ALL 938 Members...\n');

  try {
    // Get all audience groups with member counts
    const audienceGroups = await prisma.audienceGroup.findMany({
      include: {
        members: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    const totalMembers = audienceGroups.reduce((sum, group) => sum + group.members.length, 0);
    
    console.log(`📊 REAL SITUATION:`);
    console.log(`   Total members: ${totalMembers}`);
    console.log(`   Daily limit: 100 emails`);
    console.log(`   Days available: 30 (Sept 22 - Oct 22)`);
    console.log(`   Total capacity: 3,000 emails`);
    console.log(`   Emails needed for all: ${totalMembers * 7} emails`);
    console.log(`   Capacity utilization: ${((totalMembers * 7) / 3000 * 100).toFixed(1)}%`);

    if (totalMembers * 7 > 3000) {
      console.log(`\n⚠️  CAPACITY CONSTRAINT:`);
      console.log(`   Need: ${totalMembers * 7} emails`);
      console.log(`   Have: 3,000 capacity`);
      console.log(`   Shortfall: ${(totalMembers * 7) - 3000} emails`);
      
      // Calculate optimal strategy
      const maxMembersForFullSequence = Math.floor(3000 / 7);
      console.log(`\n💡 OPTIMAL STRATEGY:`);
      console.log(`   With 7 emails per member, you can target: ${maxMembersForFullSequence} members`);
      console.log(`   That's ${((maxMembersForFullSequence / totalMembers) * 100).toFixed(1)}% of your total audience`);
      
      // Show which industries to include
      const sortedGroups = audienceGroups
        .sort((a, b) => b.members.length - a.members.length);
      
      let cumulativeMembers = 0;
      let industriesToInclude = [];
      
      for (const group of sortedGroups) {
        if (cumulativeMembers + group.members.length <= maxMembersForFullSequence) {
          cumulativeMembers += group.members.length;
          industriesToInclude.push(group);
        } else {
          break;
        }
      }
      
      console.log(`\n🏆 TOP INDUSTRIES TO INCLUDE (${industriesToInclude.length} industries):`);
      industriesToInclude.forEach((group, index) => {
        console.log(`   ${index + 1}. ${group.name}: ${group.members.length} members`);
      });
      
      console.log(`\n📈 STRATEGY BREAKDOWN:`);
      console.log(`   Industries included: ${industriesToInclude.length}`);
      console.log(`   Total members: ${cumulativeMembers}`);
      console.log(`   Total emails: ${cumulativeMembers * 7}`);
      console.log(`   Daily emails: ${Math.ceil((cumulativeMembers * 7) / 30)}`);
      console.log(`   Buffer remaining: ${3000 - (cumulativeMembers * 7)} emails`);
      
      // Alternative: Reduce emails per member
      const emailsPerMemberForAll = Math.floor(3000 / totalMembers);
      console.log(`\n🔄 ALTERNATIVE STRATEGY:`);
      console.log(`   Target ALL ${totalMembers} members with ${emailsPerMemberForAll} emails each`);
      console.log(`   Total emails: ${totalMembers * emailsPerMemberForAll}`);
      console.log(`   Daily emails: ${Math.ceil((totalMembers * emailsPerMemberForAll) / 30)}`);
      
      // Show what emails per member would allow A/B testing
      const emailsForABTesting = Math.floor(3000 / (totalMembers * 2)); // A/B = 2 variants
      console.log(`\n🧪 A/B TESTING STRATEGY:`);
      console.log(`   Target ALL ${totalMembers} members with A/B testing`);
      console.log(`   Emails per member: ${emailsForABTesting}`);
      console.log(`   Total emails: ${totalMembers * emailsForABTesting * 2}`);
      console.log(`   Daily emails: ${Math.ceil((totalMembers * emailsForABTesting * 2) / 30)}`);
      
      // Get campaigns for implementation
      const campaigns = await prisma.campaign.findMany({
        include: {
          schedules: {
            include: {
              template: true
            },
            orderBy: {
              stepOrder: 'asc'
            }
          }
        }
      });

      // Implement the recommended strategy
      console.log(`\n🚀 IMPLEMENTING RECOMMENDED STRATEGY: Include Top Industries`);
      await implementTopIndustriesStrategy(campaigns, industriesToInclude);
      
    } else {
      console.log(`\n✅ EXCELLENT! You can target ALL members with full sequences!`);
      console.log(`   Total emails needed: ${totalMembers * 7}`);
      console.log(`   Daily emails needed: ${Math.ceil((totalMembers * 7) / 30)}`);
      console.log(`   Buffer: ${3000 - (totalMembers * 7)} emails`);
      
      // Get campaigns for implementation
      const campaigns = await prisma.campaign.findMany({
        include: {
          schedules: {
            include: {
              template: true
            },
            orderBy: {
              stepOrder: 'asc'
            }
          }
        }
      });

      // Implement full strategy
      await implementFullStrategy(campaigns);
    }

  } catch (error) {
    console.error('❌ Error analyzing capacity:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function implementTopIndustriesStrategy(campaigns: any[], targetIndustries: any[]) {
  console.log('\n🔧 Implementing Top Industries Strategy...');

  // Map campaign names to audience group names
  const campaignMapping = {
    'Construction & Building': 'Construction & Building - Northern BC',
    'Mining & Natural Resources': 'Mining & Resources - Northern BC',
    'Transportation & Logistics': 'Transportation & Logistics - Northern BC',
    'Food & Beverage': 'Food & Hospitality - Northern BC',
    'Professional Services': 'Professional Services - Northern BC',
    'Technology & Business Services': 'Technology & Communications - Northern BC',
    'Healthcare & Wellness': 'Health & Wellness - Northern BC',
    'Retail & Entertainment': 'Retail & Commerce - Northern BC',
    'Hospitality & Personal Care': 'Personal Services - Northern BC',
    'Financial & Legal Services': 'Financial Services - Northern BC',
    'Other Industries': 'Other Industries - Northern BC'
  };

  const targetIndustryNames = targetIndustries.map(group => group.name);

  for (const campaign of campaigns) {
    const campaignName = campaign.name;
    const mappedName = campaignMapping[campaignName];
    
    if (targetIndustryNames.includes(mappedName)) {
      console.log(`✅ Activating: ${campaignName} (${mappedName})`);
      await activateCampaignForFullSequence(campaign, true); // A/B testing
    } else {
      console.log(`❌ Deactivating: ${campaignName}`);
      await deactivateCampaign(campaign);
    }
  }
}

async function implementFullStrategy(campaigns: any[]) {
  console.log('\n🔧 Implementing Full Strategy for All Industries...');

  for (const campaign of campaigns) {
    console.log(`✅ Activating: ${campaign.name}`);
    await activateCampaignForFullSequence(campaign, true); // A/B testing
  }
}

async function activateCampaignForFullSequence(campaign: any, useABTesting: boolean) {
  // Group schedules by email number
  const emailGroups: Record<number, any[]> = {};
  
  campaign.schedules.forEach(schedule => {
    const emailNumber = schedule.stepOrder;
    if (!emailGroups[emailNumber]) {
      emailGroups[emailNumber] = [];
    }
    emailGroups[emailNumber].push(schedule);
  });

  // Activate all 7 emails
  for (let emailNum = 1; emailNum <= 7; emailNum++) {
    const schedules = emailGroups[emailNum] || [];
    
    if (schedules.length === 0) continue;

    const variants = schedules.map(schedule => {
      const templateName = schedule.template.name;
      const variantMatch = templateName.match(/Variant ([ABC])/);
      const variant = variantMatch ? variantMatch[1] : 'Original';
      return { ...schedule, variant };
    });

    if (useABTesting) {
      // Activate A and B variants
      const activeVariants = variants.filter(v => v.variant === 'A' || v.variant === 'B' || v.variant === 'Original');
      
      for (const variant of activeVariants) {
        await prisma.campaignSchedule.update({
          where: { id: variant.id },
          data: { status: 'SCHEDULED' }
        });
      }

      // Deactivate C variants
      const inactiveVariants = variants.filter(v => v.variant === 'C');
      for (const variant of inactiveVariants) {
        await prisma.campaignSchedule.update({
          where: { id: variant.id },
          data: { status: 'DRAFT' }
        });
      }
    } else {
      // Activate only Original variant
      const originalVariant = variants.find(v => v.variant === 'Original');
      
      if (originalVariant) {
        await prisma.campaignSchedule.update({
          where: { id: originalVariant.id },
          data: { status: 'SCHEDULED' }
        });
      }

      // Deactivate all other variants
      const inactiveVariants = variants.filter(v => v.variant !== 'Original');
      for (const variant of inactiveVariants) {
        await prisma.campaignSchedule.update({
          where: { id: variant.id },
          data: { status: 'DRAFT' }
        });
      }
    }
  }
}

async function deactivateCampaign(campaign: any) {
  for (const schedule of campaign.schedules) {
    await prisma.campaignSchedule.update({
      where: { id: schedule.id },
      data: { status: 'DRAFT' }
    });
  }
}

// Run the script
analyzeFullCapacity()
  .then(() => {
    console.log('\n✅ Full capacity analysis completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  });
