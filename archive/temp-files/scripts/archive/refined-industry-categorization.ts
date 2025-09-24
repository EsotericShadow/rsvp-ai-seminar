import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Refined categorization rules that prioritize industry keywords over company structure
const REFINED_CATEGORIZATION_RULES = {
  'MARTIAL_ARTS_FITNESS': [
    'taekwondo', 'martial arts', 'karate', 'judo', 'fitness', 'gym', 'training'
  ],
  
  'PROPANE_FUEL_SERVICES': [
    'propane', 'superior propane', 'fuel', 'gas', 'energy'
  ],
  
  'MINING_RESOURCES': [
    'resources', 'skeena valley resources', 'mining', 'natural resources'
  ],
  
  'INSULATION_SERVICES': [
    'insulators', 'thermax insulators', 'insulation', 'thermal'
  ],
  
  'LEGAL_SERVICES': [
    'warner bandstra brown', 'vohora', 'mnp', 'llp', 'law', 'legal', 'attorney'
  ],
  
  'BUSINESS_SERVICES': [
    'business resource centre', 'terrace business resource centre', 'consulting', 'fins consulting'
  ],
  
  'NURSERY_LANDSCAPING': [
    'nursery', 'uplands nursery', 'landscaping', 'plants', 'garden'
  ],
  
  'PROPERTY_MAINTENANCE': [
    'property maintenance', 'more property maintenance', 'maintenance'
  ],
  
  'CONSULTING_SERVICES': [
    'consulting', 'cedarwood consulting', 'fins consulting', 'business consulting'
  ],
  
  'NEWSPAPER_MEDIA': [
    'standard', 'terrace standard', 'newspaper', 'publishing', 'media', 'blackpress'
  ],
  
  'RESTAURANTS_FOOD': [
    'kitchen', 'redneck kitchen', 'restaurant', 'food', 'deli', 'berts deli',
    'steakhouse', 'mrmikes', 'casual', 'inn', 'rest inn', 'days inn', 'terrace inn',
    'bear country inn', 'best western', 'motel', 'kalum motel', 'copperside',
    'lucky garden restaurant', 'garden restaurant'
  ],
  
  'STORAGE_SERVICES': [
    'storage', 'mini storage', 'lazelle mini storage', 's n t mini storage'
  ],
  
  'HOSPITALITY_ACCOMMODATION': [
    'inn', 'motel', 'hotel', 'accommodation', 'lodging', 'rest inn', 'days inn',
    'terrace inn', 'bear country inn', 'best western', 'kalum motel'
  ],
  
  'NOTARY_SERVICES': [
    'notary', 'sherry anderson notary', 'notary public', 'legal services'
  ],
  
  'FORESTRY_RESOURCES': [
    'coast tsimshian resources', 'forestry', 'resources', 'northpac forestry'
  ],
  
  'RV_PARK_SERVICES': [
    'rv park', 'reel inn and rv park', 'camping', 'recreation'
  ],
  
  'PUBLISHING_MEDIA': [
    'publishing', 'ccb publishing', 'media', 'publications'
  ],
  
  'LIQUOR_RETAIL': [
    'liquor store', 'terrace inn liquor store', 'alcohol', 'beverage'
  ],
  
  'RENTAL_SERVICES': [
    'rent tents', 'easy rent tents', 'rental', 'tents', 'marquees'
  ],
  
  'TRAILER_COURT': [
    'trailer court', 'park avenue trailer court', 'mobile home', 'trailer park'
  ],
  
  'DRIVING_SCHOOL': [
    'driving school', 'sunset driving school', 'driver education', 'training'
  ],
  
  'TIRE_SERVICES': [
    'tire', 'fountain tire', 'automotive', 'tire service'
  ],
  
  'SAWMILLS_WOOD': [
    'sawmills', 'skeenasawmills', 'wood', 'lumber', 'mill'
  ],
  
  'MACHINE_SHOP': [
    'machine shop', 'bow valley machine shop', 'machining', 'fabrication'
  ],
  
  'FURNITURE_APPLIANCES': [
    'furniture', 'appliances', 'city furniture', 'appliances', 'home goods'
  ],
  
  'CHILDCARE_SERVICES': [
    'kids at play', 'childcare', 'daycare', 'little timbers family childcare',
    'tiny steps', 'little sprouts family daycare', 'sunflower child care centre',
    'caterpillars childcare center', 'child care'
  ],
  
  'BOOKS_RETAIL': [
    'books', 'misty river books', 'bookstore', 'retail'
  ],
  
  'THEATRE_ENTERTAINMENT': [
    'theatres', 'tillicum theatres', 'theater', 'entertainment', 'cinema'
  ],
  
  'BOWLING_RECREATION': [
    'bowling center', 'terrace bowling center', 'recreation', 'sports'
  ],
  
  'LIQUOR_RETAIL_2': [
    'liquor store', 'skeena liquor store', 'alcohol retail'
  ],
  
  'SINGING_STUDIO': [
    'singing studio', 'celestial singing studio', 'music', 'vocal training'
  ],
  
  'VETERINARY_SERVICES': [
    'animal hospital', 'terrace animal hospital', 'veterinary', 'pet care',
    'kermodei veterinary hospital'
  ],
  
  'LABORATORY_SERVICES': [
    'als canada', 'laboratory', 'testing', 'medical testing'
  ],
  
  'DENTAL_SERVICES': [
    'dental', 'cedar coast dental', 'horizon dental', 'dentist', 'oral care'
  ],
  
  'HEARING_SERVICES': [
    'hearing', 'connect hearing', 'audiology', 'hearing aids'
  ],
  
  'DENTURE_SERVICES': [
    'denture centre', 'complete denture centre', 'prosthetics'
  ],
  
  'MASSAGE_THERAPY': [
    'massage therapy', 'health and motion massage therapy', 'therapeutic massage',
    'colleen zitala registered massage therapist'
  ],
  
  'WELLNESS_CLINIC': [
    'wellness clinic', 'nourishing life wellness clinic', 'holistic health',
    'acupuncture', 'viva holistic healing'
  ],
  
  'FOOT_CARE_SERVICES': [
    'foot care', 'northwest foot care', 'podiatry', 'foot health'
  ],
  
  'CREDIT_UNION': [
    'credit union', 'northern savings credit union', 'banking', 'financial services'
  ],
  
  'MONEY_SERVICES': [
    'money mart', 'financial services', 'loans', 'check cashing'
  ],
  
  'BANKING_SERVICES': [
    'toronto dominion bank', 'td bank', 'banking', 'financial institution'
  ],
  
  'INVESTMENT_SERVICES': [
    'edward jones', 'investment', 'financial planning', 'wealth management'
  ],
  
  'KENNELS_PET_SERVICES': [
    'kennels', 'uplands kennels', 'pet boarding', 'animal care'
  ],
  
  'BODY_WELLNESS': [
    'body renewal', 'four hands body renewal', 'wellness', 'spa services'
  ],
  
  'PLUMBING_SERVICES': [
    'plumbing', 'haworth plumbing', 'plumber', 'pipe services'
  ],
  
  'CONSTRUCTION_SERVICES': [
    'construction', 'norlakes construction', 'building', 'contracting',
    'tidal wave construction', 'boc ventures', 'chad buhr contracting'
  ],
  
  'MASONRY_SERVICES': [
    'masonry', 'sinjur masonry', 'stone work', 'brick work'
  ],
  
  'BUILDING_SUPPLIES': [
    'builders centre', 'terrace builders centre rona', 'building supplies',
    'construction materials'
  ],
  
  'CONTRACTING_SERVICES': [
    'contracting', 'silver pine contracting', 'general contracting'
  ],
  
  'ROOFING_SERVICES': [
    'roofing', 'skeena roofing', 'roof services', 'roof repair'
  ],
  
  'FUEL_ENERGY': [
    'petro canada', 'pacific northern gas', 'suncor energy', 'fuel', 'energy'
  ],
  
  'TRADING_SERVICES': [
    'trading', 'all west trading limited', 'commercial trading'
  ],
  
  'INDUSTRIAL_SUPPLIES': [
    'tenaquip limited', 'industrial supplies', 'equipment', 'tools'
  ],
  
  'CONSULTING_ENGINEERING': [
    'consultants', 'allnorth consultants limited', 'engineering consulting'
  ],
  
  'LIMITED_PARTNERSHIP': [
    'cims limited partnership', 'partnership', 'business partnership'
  ],
  
  'EQUIPMENT_SERVICES': [
    'emil anderson equipment', 'equipment', 'machinery', 'north coast equipment'
  ],
  
  'ELECTRICAL_SERVICES': [
    'electric', 'geier electric', 'electrical services', 'electrical contractor'
  ],
  
  'DOORS_WINDOWS': [
    'doors and windows', 'straight up doors and windows', 'window services'
  ],
  
  'GALLERY_ART': [
    'gallery', 'red raven gallery', 'art', 'creative', 'collectables'
  ],
  
  'RECYCLING_SERVICES': [
    'recycling', 'do your part recycling co', 'environmental services'
  ],
  
  'ACCOUNTING_SERVICES': [
    'accounting', 'watson accounting', 'bookkeeping', 'financial services'
  ],
  
  'CONSULTING_BUSINESS': [
    'blix consulting', 'business consulting', 'management consulting'
  ],
  
  'TELECOMMUNICATIONS': [
    'advanced communications', 'westcan advanced communications solutions', 'telecom'
  ],
  
  'OPTOMETRY_SERVICES': [
    'optometry', 'northern eyes optometry', 'eye care', 'vision'
  ],
  
  'SPORTS_COLLECTABLES': [
    'sportscards', 'galaxy sportscards', 'creative collectables', 'collectibles'
  ],
  
  'SIGNS_PROMOTIONS': [
    'signs', 'silvertip signs', 'promotions', 'silvertip promotions', 'advertising'
  ],
  
  'RESTAURANTS_CHAIN': [
    'white spot terrace', 'chain restaurant', 'franchise'
  ],
  
  'BEVERAGE_BOTTLING': [
    'coca cola canada bottling limited', 'bottling', 'beverage production',
    'aqua clear bottlers'
  ],
  
  'FOOD_SERVICES': [
    'copperside', 'food services', 'catering', 'food production'
  ],
  
  'JANITORIAL_CLEANING': [
    'janitorial', 'kermode janitorial', 'ultra janitorial', 'cleaning services',
    'hydra mist carpet cleaning'
  ],
  
  'AUTOMOTIVE_RENTAL': [
    'hertz system licencee', 'car rental', 'automotive rental'
  ],
  
  'AVIATION_SERVICES': [
    'jazz aviation lp', 'aviation', 'airline', 'air services'
  ],
  
  'JEWELRY_RETAIL': [
    'jewellers', 'cooks jewellers', 'carters jewellers', 'jewelry'
  ],
  
  'FASHION_RETAIL': [
    'fashions', 'sidewalkers unique fashions limited', 'clothing', 'apparel'
  ],
  
  'DRYWALL_SERVICES': [
    'drywall', 'tanner drywall systems', 'wall services'
  ],
  
  'FLAGGING_TRAINING': [
    'flagging', 'strictly flagging training agency', 'safety training'
  ],
  
  'INSULATION_FOAM': [
    'foam', 'just foam it', 'spray foam', 'insulation'
  ],
  
  'INDUSTRIAL_SERVICES': [
    'allteck limited partnership', 'industrial services', 'facilities'
  ]
};

function isTrulyPersonalNameOrNumbered(businessName: string): boolean {
  const name = businessName.toLowerCase();
  
  // Check for numbered companies that don't have clear business descriptors
  const numberedPattern = /\d{7,8}\s+(bc\s+)?ltd|bc\s+\d{7,8}|canada\s+inc\.?\s*\d{7,8}/i;
  
  // If it's numbered, check if it has business descriptors
  if (numberedPattern.test(name)) {
    const businessWords = [
      'construction', 'building', 'contracting', 'plumbing', 'electrical', 'roofing',
      'automotive', 'tire', 'furniture', 'appliances', 'equipment', 'machinery',
      'services', 'trading', 'consulting', 'maintenance', 'repair', 'cleaning',
      'janitorial', 'security', 'insurance', 'real estate', 'property', 'investment',
      'financial', 'legal', 'medical', 'dental', 'veterinary', 'hospital',
      'restaurant', 'food', 'catering', 'hotel', 'motel', 'inn', 'accommodation',
      'retail', 'store', 'shop', 'boutique', 'gallery', 'theatre', 'entertainment',
      'transportation', 'logistics', 'delivery', 'courier', 'towing', 'rental',
      'manufacturing', 'industrial', 'mining', 'resources', 'forestry', 'logging',
      'agriculture', 'farming', 'nursery', 'landscaping', 'pest', 'control',
      'waste', 'recycling', 'environmental', 'energy', 'fuel', 'propane', 'gas',
      'telecommunications', 'communications', 'technology', 'computer', 'software',
      'publishing', 'media', 'newspaper', 'advertising', 'marketing', 'promotions',
      'education', 'training', 'school', 'childcare', 'daycare', 'healthcare',
      'wellness', 'fitness', 'sports', 'recreation', 'entertainment', 'art',
      'music', 'dance', 'theatre', 'cinema', 'bowling', 'gaming', 'bingo'
    ];
    
    const hasBusinessWord = businessWords.some(word => name.includes(word));
    return !hasBusinessWord;
  }
  
  // Check for personal names (individuals without clear business descriptors)
  const personalNamePatterns = [
    /^[a-z\s]+,\s*[a-z\s]+$/i, // "Last, First" format
  ];
  
  const businessWords = ['ltd', 'inc', 'corp', 'llc', 'company', 'enterprises', 'services', 'group', 'holdings'];
  const hasBusinessWord = businessWords.some(word => name.includes(word));
  
  if (!hasBusinessWord && personalNamePatterns.some(pattern => pattern.test(name))) {
    return true;
  }
  
  return false;
}

function categorizeBusinessByName(businessName: string, email: string): string {
  const name = businessName.toLowerCase();
  const emailLower = email.toLowerCase();
  
  // First, check if it's truly a personal name or numbered company without business descriptors
  if (isTrulyPersonalNameOrNumbered(businessName)) {
    return 'PERSONAL_NAMES_NUMBERED';
  }
  
  // Check each category with refined rules (prioritize industry keywords)
  for (const [category, keywords] of Object.entries(REFINED_CATEGORIZATION_RULES)) {
    for (const keyword of keywords) {
      if (name.includes(keyword.toLowerCase()) || emailLower.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  return 'OTHER_INDUSTRIES';
}

async function refinedIndustryCategorization() {
  console.log('🧠 Refined Industry Categorization...\n');

  try {
    // Get all current audience members
    const audienceMembers = await prisma.audienceMember.findMany({
      include: {
        group: true
      }
    });

    console.log(`📊 Found ${audienceMembers.length} audience members to recategorize`);

    // Create new categorization map
    const newCategorization = new Map<string, any[]>();
    
    for (const member of audienceMembers) {
      const newCategory = categorizeBusinessByName(member.businessName, member.primaryEmail);
      
      if (!newCategorization.has(newCategory)) {
        newCategorization.set(newCategory, []);
      }
      
      newCategorization.get(newCategory)!.push(member);
    }

    // Show current vs new categorization
    console.log('\n📊 Current Categorization:');
    const currentGroups = await prisma.audienceGroup.findMany({
      include: { _count: { select: { members: true } } }
    });
    
    currentGroups.forEach(group => {
      console.log(`   • ${group.name}: ${group._count.members} businesses`);
    });

    console.log('\n📊 New Refined Categorization:');
    for (const [category, members] of newCategorization) {
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`   • ${groupName}: ${members.length} businesses`);
    }

    // Clear existing data
    console.log('\n🧹 Clearing existing audience data...');
    await prisma.audienceMember.deleteMany({});
    await prisma.audienceGroup.deleteMany({});

    // Create new audience groups
    console.log('\n👥 Creating refined audience groups...');
    
    for (const [category, members] of newCategorization) {
      if (members.length === 0) continue;
      
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      
      console.log(`   Creating: ${groupName} (${members.length} businesses)`);
      
      const audienceGroup = await prisma.audienceGroup.create({
        data: {
          name: groupName,
          description: `Businesses in ${groupName.toLowerCase()} industry - refined categorization with industry keyword priority`,
          criteria: {
            industry: category,
            minMembers: members.length,
            categorizationMethod: 'refined_industry_analysis',
            improved: true,
            semanticAnalysis: true,
            industryKeywordPriority: true
          }
        }
      });

      // Create audience members for this group
      for (const member of members) {
        await prisma.audienceMember.create({
          data: {
            groupId: audienceGroup.id,
            businessId: member.businessId,
            businessName: member.businessName,
            primaryEmail: member.primaryEmail,
            secondaryEmail: member.secondaryEmail,
            tagsSnapshot: member.tagsSnapshot,
            inviteToken: member.inviteToken,
            meta: {
              ...member.meta,
              recategorized: true,
              originalCategory: member.group.name,
              newCategory: category,
              categorizedBy: 'refined_industry_analysis'
            }
          }
        });
      }
      
      console.log(`   ✅ Added ${members.length} members to ${groupName}`);
    }

    // Final summary
    console.log('\n🎉 Refined Industry Categorization Complete!');
    console.log('\n📊 Final Summary:');
    
    const finalGroups = await prisma.audienceGroup.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' }
    });
    
    const totalMembers = finalGroups.reduce((sum, group) => sum + group._count.members, 0);
    
    console.log(`   📧 Total Audience Groups: ${finalGroups.length}`);
    console.log(`   👥 Total Audience Members: ${totalMembers}`);
    
    console.log('\n📋 Refined Audience Groups:');
    finalGroups.forEach(group => {
      console.log(`   • ${group.name}: ${group._count.members} businesses`);
    });

    // Show some examples from each category
    console.log('\n📋 Sample Businesses by Refined Category:');
    for (const group of finalGroups) {
      const sampleMembers = await prisma.audienceMember.findMany({
        where: { groupId: group.id },
        take: 3,
        select: { businessName: true, primaryEmail: true }
      });
      
      console.log(`\n   ${group.name}:`);
      sampleMembers.forEach(member => {
        console.log(`     • ${member.businessName} (${member.primaryEmail})`);
      });
    }

  } catch (error) {
    console.error('❌ Error in refined categorization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

refinedIndustryCategorization();


