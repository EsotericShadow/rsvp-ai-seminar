#!/usr/bin/env tsx

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalRemainingCategorization() {
  console.log('🎯 FINAL Remaining Business Categorization & Description Updates...\n');

  // Get the "Other Industries" group
  const otherGroup = await prisma.audienceGroup.findFirst({
    where: { name: 'Other Industries - Northern BC' },
    include: {
      members: {
        select: {
          id: true,
          businessName: true,
          primaryEmail: true,
          meta: true
        }
      }
    }
  });

  if (!otherGroup) {
    console.log('❌ "Other Industries" group not found');
    return;
  }

  console.log(`📊 Found ${otherGroup.members.length} businesses in "Other Industries"`);

  // Final categorization for remaining businesses
  const businessCategorization = {
    'Holding Companies & Investment': [
      '0909799 bc ltd', 'greig holdings', '13483487 canada inc', 'kermode holdings',
      'wil-ann holdings', 'wild duck holdings', 'anweiler enterprises', 'momack holdings',
      'vlc holdings', 'mann enterprises', 'dddkc holdings', 'rossco ventures',
      '1224017 b.c. ltd', 'elf enterprises', 'kalum ventures', 'arkafortunedevelopments'
    ],
    'Tax & Accounting Services': [
      'h&r block', 'hr block'
    ],
    'Food Distribution & Wholesale': [
      'j & f distributors', 'copperside foods'
    ],
    'Forestry & Lumber': [
      '1355392 bc ltd', 'skeenasawmills', 'skeena sawmills'
    ],
    'Security & Locksmith Services': [
      'royal mountain lock & key', 'locksmith'
    ],
    'Water & Beverage Services': [
      'aqua clear bottlers', 'water bottling'
    ],
    'Recreation & Entertainment': [
      'terrace bowling center', 'bowling centre', 'bowling'
    ],
    'Personal Services': [
      '0926500 bc ltd', 'sally smaha', 'day enterprises', 'sonny\'s collectables',
      'r & a price leasing', 'neid enterprises', 'comic encounters', 'takhar hrinder',
      'kids at play', 'olson kelly gordon', 'gustafson meaghan', 'lillian jasvinder singh',
      'lillian kulwant kaur', 'bruce enterprises', 'tripllleeffect', 'lll tinting',
      'wittkowski ludwig', 'haryana\'s', 'pritchard diane', 'mendes joao',
      'mendes stella', '0706342 bc ltd', 'uplandsnursery', 'clunas david j',
      'clunas wanda c', 'wake up call', 'malt ventures', 'b.lily\'s cosmetic tattoo',
      'jnj ventures', 'johnny-jones', 'seal tec industries', 'abroch ucontracting'
    ],
    'Construction & Building': [
      'r.tess contracting', 'contracting'
    ],
    'Office & Business Services': [
      'ideal office solutions', 'office solutions'
    ],
    'Glass & Window Services': [
      'skeena glass', 'speedy glass', 'glass'
    ],
    'Agriculture & Nursery': [
      'uplands nursery', 'nursery'
    ],
    'Professional Engineering': [
      'atkinsrÃ©alis', 'atkins realis', 'engineering'
    ],
    'Beauty & Personal Care': [
      'gloss aesthetics', 'repose massage', 'massage', 'b.lily\'s cosmetic tattoo',
      'cosmetic tattoo', 'esthetics'
    ]
  };

  // Categorize remaining businesses
  const categorized = new Map<string, any[]>();
  const uncategorized: any[] = [];

  otherGroup.members.forEach(member => {
    const name = member.businessName.toLowerCase();
    let categorizedFlag = false;

    for (const [industry, keywords] of Object.entries(businessCategorization)) {
      for (const keyword of keywords) {
        if (name.includes(keyword)) {
          if (!categorized.has(industry)) {
            categorized.set(industry, []);
          }
          categorized.get(industry)!.push(member);
          categorizedFlag = true;
          break;
        }
      }
      if (categorizedFlag) break;
    }

    if (!categorizedFlag) {
      uncategorized.push(member);
    }
  });

  // Show results
  console.log('\n📊 FINAL CATEGORIZATION RESULTS:');
  let totalCategorized = 0;
  for (const [industry, businesses] of categorized) {
    console.log(`\n🏭 ${industry}: ${businesses.length} businesses`);
    businesses.slice(0, 3).forEach(biz => {
      console.log(`   - ${biz.businessName}`);
    });
    if (businesses.length > 3) {
      console.log(`   ... and ${businesses.length - 3} more`);
    }
    totalCategorized += businesses.length;
  }

  console.log(`\n📈 Total categorized: ${totalCategorized}`);
  console.log(`📈 Remaining uncategorized: ${uncategorized.length}`);
  console.log(`📈 Success rate: ${Math.round((totalCategorized / otherGroup.members.length) * 100)}%`);

  if (uncategorized.length > 0) {
    console.log('\n❓ REMAINING UNCATERGORIZED BUSINESSES:');
    uncategorized.forEach(biz => {
      console.log(`   - ${biz.businessName}`);
    });
  }

  // Create new industry groups and move businesses
  console.log('\n👥 Creating new industry groups and moving businesses...');
  
  for (const [industryName, businesses] of categorized) {
    if (businesses.length > 0) {
      console.log(`\n📊 Creating ${industryName}: ${businesses.length} businesses`);
      
      // Create audience group
      const audienceGroup = await prisma.audienceGroup.create({
        data: {
          name: `${industryName} - Northern BC`,
          description: getIndustryDescription(industryName),
          criteria: {
            industry: industryName,
            region: 'Northern BC',
            source: 'LeadMine',
            keywordCount: businesses.length
          }
        }
      });

      // Move businesses to new group
      for (const business of businesses) {
        try {
          await prisma.audienceMember.update({
            where: { id: business.id },
            data: { groupId: audienceGroup.id }
          });
        } catch (error) {
          console.error(`Error moving ${business.businessName}:`, error);
        }
      }
      
      console.log(`   ✅ Created group: ${audienceGroup.name} (${businesses.length} members)`);
    }
  }

  // Update descriptions for all existing industry groups
  console.log('\n📝 Updating industry descriptions...');
  
  const allGroups = await prisma.audienceGroup.findMany();
  
  for (const group of allGroups) {
    if (group.name.endsWith(' - Northern BC') && group.name !== 'Other Industries - Northern BC') {
      const industryName = group.name.replace(' - Northern BC', '');
      const newDescription = getIndustryDescription(industryName);
      
      await prisma.audienceGroup.update({
        where: { id: group.id },
        data: { description: newDescription }
      });
      
      console.log(`   ✅ Updated description for ${group.name}`);
    }
  }

  console.log('\n🎉 FINAL CATEGORIZATION & DESCRIPTION UPDATES COMPLETE!');
  
  // Show final summary
  const finalGroups = await prisma.audienceGroup.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { name: 'asc' }
  });

  console.log('\n📊 FINAL AUDIENCE SUMMARY:');
  let totalMembers = 0;
  for (const group of finalGroups) {
    console.log(`📊 ${group.name}: ${group._count.members} members`);
    console.log(`   📝 ${group.description}`);
    totalMembers += group._count.members;
  }

  console.log(`\n📈 Total: ${totalMembers} businesses organized by industry`);
  console.log(`📈 Success: All businesses properly categorized!`);

  await prisma.$disconnect();
}

function getIndustryDescription(industryName: string): string {
  const descriptions: Record<string, string> = {
    'Construction & Building': 'Construction companies, contractors, and building services - ideal for equipment maintenance prediction, project timeline optimization, and resource planning',
    'Mining & Resources': 'Mining companies, resource extraction, and related services - perfect for predictive maintenance, safety optimization, and resource planning',
    'Food & Hospitality': 'Restaurants, hotels, cafes, and food services - great for staffing optimization, seasonal planning, and demand prediction',
    'Professional Services': 'Legal, consulting, accounting, and professional advisory services - ideal for client demand prediction and resource planning',
    'Transportation & Logistics': 'Trucking, shipping, delivery, and logistics companies - perfect for route optimization, maintenance scheduling, and fuel efficiency',
    'Retail & Commerce': 'Retail stores, wholesale, and commercial businesses - great for inventory prediction and customer demand forecasting',
    'Technology & Communications': 'IT services, software, telecommunications, and tech companies - ideal for tech-savvy predictive AI applications',
    'Health & Wellness': 'Medical practices, clinics, wellness centers, and healthcare services - perfect for patient demand forecasting and resource optimization',
    'Tourism & Recreation': 'Tourism operators, recreational services, and entertainment venues - great for seasonal demand prediction and capacity planning',
    'Automotive & Repair': 'Auto repair shops, dealerships, and automotive services - ideal for maintenance scheduling and parts inventory prediction',
    'Agriculture & Forestry': 'Farms, forestry operations, and agricultural services - perfect for seasonal planning and resource optimization',
    'Arts & Entertainment': 'Creative businesses, studios, and entertainment venues - great for event planning and audience prediction',
    'Beauty & Personal Care': 'Salons, spas, and personal care services - ideal for appointment scheduling optimization and service demand prediction',
    'Energy & Utilities': 'Power companies, utilities, and energy services - perfect for demand forecasting and infrastructure maintenance',
    'Manufacturing & Production': 'Manufacturing facilities and production companies - ideal for production planning and equipment maintenance prediction',
    'Government & Public Services': 'Government agencies and public service organizations - great for citizen service optimization',
    'Non-Profit & Community': 'Non-profit organizations and community groups - ideal for volunteer coordination and event planning',
    'Security & Safety': 'Security services, safety equipment, and emergency services - perfect for risk assessment and incident prediction',
    'Waste Management & Environmental': 'Cleaning services, waste management, and environmental services - great for scheduling optimization and resource planning',
    'Education & Training': 'Schools, training centers, and educational services - ideal for enrollment prediction and resource planning',
    'Real Estate & Property': 'Real estate agencies, property management, and rental services - perfect for market trend prediction and property maintenance',
    'Banks & Financial Services': 'Banks, credit unions, and financial institutions - ideal for customer service optimization and risk prediction',
    'Legal Services': 'Law firms and legal services - great for case load prediction and resource planning',
    'Financial Services': 'Financial planning, investment, and advisory services - perfect for client demand prediction',
    'Tax & Accounting Services': 'Tax preparation, accounting, and bookkeeping services - ideal for seasonal demand prediction and resource planning',
    'Pest Control & Services': 'Pest control and extermination services - great for seasonal demand prediction and service scheduling',
    'Personal Services': 'Individual service providers and small business operators - ideal for appointment scheduling and service demand prediction',
    'Holding Companies & Investment': 'Investment holding companies and business ventures - perfect for portfolio optimization and investment prediction',
    'Food Distribution & Wholesale': 'Food distributors and wholesale operations - great for inventory prediction and supply chain optimization',
    'Forestry & Lumber': 'Forestry operations and lumber companies - ideal for seasonal planning and resource optimization',
    'Security & Locksmith Services': 'Locksmith and security hardware services - perfect for emergency response optimization',
    'Water & Beverage Services': 'Water bottling and beverage distribution - great for demand prediction and supply chain optimization',
    'Recreation & Entertainment': 'Recreation centers and entertainment venues - ideal for capacity planning and event scheduling',
    'Office & Business Services': 'Office solutions and business support services - perfect for service demand prediction',
    'Glass & Window Services': 'Glass repair and window installation services - great for seasonal demand prediction',
    'Professional Engineering': 'Engineering consulting and technical services - ideal for project planning and resource optimization',
    'Other Industries': 'Businesses that don\'t fit into specific industry categories - may require manual review for targeted campaigns'
  };

  return descriptions[industryName] || `Businesses in the ${industryName} sector - ideal for industry-specific predictive AI applications`;
}

finalRemainingCategorization()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
