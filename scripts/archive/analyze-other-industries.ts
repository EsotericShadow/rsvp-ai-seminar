#!/usr/bin/env tsx

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeOtherIndustries() {
  console.log('🔍 Analyzing "Other Industries" Group for Better Categorization...\n');

  // Get the "Other Industries" group
  const otherGroup = await prisma.audienceGroup.findFirst({
    where: { name: 'Other Industries - Northern BC' },
    include: {
      members: {
        select: {
          businessName: true,
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

  // Analyze business names to find patterns
  console.log('\n🔍 Analyzing business names for industry patterns...\n');

  const businessNames = otherGroup.members.map(m => m.businessName);
  
  // Look for common industry keywords that we missed
  const industryPatterns = {
    'Automotive & Repair': [
      'auto', 'automotive', 'car', 'vehicle', 'truck', 'repair', 'service', 'garage',
      'mechanical', 'body', 'paint', 'tire', 'brake', 'engine', 'transmission',
      'oil', 'lube', 'towing', 'wrecker', 'parts', 'accessories', 'dealership'
    ],
    'Real Estate & Property': [
      'real estate', 'property', 'realtor', 'broker', 'agent', 'homes', 'houses',
      'development', 'construction', 'building', 'apartment', 'rental', 'property management'
    ],
    'Education & Training': [
      'school', 'education', 'training', 'academy', 'institute', 'college', 'university',
      'learning', 'tutoring', 'childcare', 'daycare', 'preschool', 'kindergarten'
    ],
    'Arts & Entertainment': [
      'art', 'gallery', 'studio', 'music', 'entertainment', 'theater', 'theatre',
      'cinema', 'movie', 'film', 'photography', 'photo', 'video', 'media', 'creative'
    ],
    'Beauty & Personal Care': [
      'beauty', 'salon', 'spa', 'barber', 'hair', 'nail', 'cosmetic', 'esthetics',
      'massage', 'therapy', 'wellness', 'fitness', 'gym', 'personal care'
    ],
    'Legal & Financial Services': [
      'law', 'legal', 'attorney', 'lawyer', 'accounting', 'accountant', 'financial',
      'insurance', 'investment', 'banking', 'credit', 'loan', 'mortgage', 'tax'
    ],
    'Government & Public Services': [
      'government', 'municipal', 'city', 'town', 'village', 'district', 'regional',
      'public', 'service', 'administration', 'council', 'mayor', 'office'
    ],
    'Non-Profit & Community': [
      'non-profit', 'nonprofit', 'charity', 'foundation', 'community', 'volunteer',
      'association', 'society', 'club', 'organization', 'church', 'religious'
    ],
    'Energy & Utilities': [
      'energy', 'power', 'electric', 'gas', 'oil', 'utility', 'hydro', 'solar',
      'wind', 'renewable', 'fuel', 'heating', 'cooling', 'hvac'
    ],
    'Security & Safety': [
      'security', 'safety', 'alarm', 'surveillance', 'guard', 'protection', 'fire',
      'emergency', 'rescue', 'paramedic', 'ambulance', 'police'
    ],
    'Waste Management & Environmental': [
      'waste', 'garbage', 'recycling', 'environmental', 'cleaning', 'sanitation',
      'disposal', 'landfill', 'compost', 'sewage', 'water treatment'
    ],
    'Consulting & Professional': [
      'consulting', 'consultant', 'advisory', 'adviser', 'expert', 'specialist',
      'professional', 'services', 'solutions', 'management', 'strategy'
    ]
  };

  // Categorize businesses
  const categorized = new Map<string, string[]>();
  const uncategorized: string[] = [];

  businessNames.forEach(businessName => {
    const name = businessName.toLowerCase();
    let categorizedFlag = false;

    for (const [industry, keywords] of Object.entries(industryPatterns)) {
      for (const keyword of keywords) {
        if (name.includes(keyword)) {
          if (!categorized.has(industry)) {
            categorized.set(industry, []);
          }
          categorized.get(industry)!.push(businessName);
          categorizedFlag = true;
          break;
        }
      }
      if (categorizedFlag) break;
    }

    if (!categorizedFlag) {
      uncategorized.push(businessName);
    }
  });

  // Show results
  console.log('📊 CATEGORIZATION RESULTS:');
  console.log('=' * 50);
  
  let totalCategorized = 0;
  for (const [industry, businesses] of categorized) {
    console.log(`\n🏭 ${industry}: ${businesses.length} businesses`);
    businesses.slice(0, 5).forEach(name => {
      console.log(`   - ${name}`);
    });
    if (businesses.length > 5) {
      console.log(`   ... and ${businesses.length - 5} more`);
    }
    totalCategorized += businesses.length;
  }

  console.log(`\n📈 Total categorized: ${totalCategorized}`);
  console.log(`📈 Remaining uncategorized: ${uncategorized.length}`);
  console.log(`📈 Success rate: ${Math.round((totalCategorized / businessNames.length) * 100)}%`);

  if (uncategorized.length > 0) {
    console.log('\n❓ REMAINING UNCATERGORIZED BUSINESSES (first 20):');
    uncategorized.slice(0, 20).forEach(name => {
      console.log(`   - ${name}`);
    });
    if (uncategorized.length > 20) {
      console.log(`   ... and ${uncategorized.length - 20} more`);
    }
  }

  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('1. Create new industry groups for the categorized businesses');
  console.log('2. Further analyze uncategorized businesses for additional patterns');
  console.log('3. Consider manual review for remaining businesses');

  await prisma.$disconnect();
}

analyzeOtherIndustries()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
