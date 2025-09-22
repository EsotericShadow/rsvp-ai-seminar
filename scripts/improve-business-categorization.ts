import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Enhanced categorization rules based on the actual business names
const ENHANCED_CATEGORIZATION_RULES = {
  'CONSTRUCTION_BUILDING': [
    // Construction companies
    'welding', 'contracting', 'construction', 'building', 'masonry', 'plumbing', 'heating',
    'electrical', 'roofing', 'flooring', 'painting', 'renovation', 'excavation', 'concrete',
    'lumber', 'supply', 'materials', 'equipment', 'rentals', 'rental',
    // Specific companies from your list
    'steel works', 'steelworks', 'steel', 'excavating', 'overhead doors', 'jroverheaddoors',
    'mastersweeper', 'western industrial', 'wicltd', 'triple h bobcat', 'triplehbobcat',
    'terrace redi-mix', 'terraceredimix', 'peterbilt', 'brandt', 'sterling crane',
    'emil anderson', 'fulljames', 'amerispec', 'inspection'
  ],
  
  'TECHNOLOGY_BUSINESS_SERVICES': [
    'technology', 'tech', 'software', 'computer', 'it', 'digital', 'web', 'internet',
    'data', 'systems', 'solutions', 'services', 'consulting', 'optical', 'laboratory',
    'rewind', 'terracerewind', 'sight & sound', 'sight-and-sound', 'syberscream',
    'silvertip', 'sign service', 'artisticsignservice', 'silvertipsigns'
  ],
  
  'HEALTHCARE_WELLNESS': [
    'health', 'medical', 'dental', 'clinic', 'hospital', 'pharmacy', 'wellness',
    'therapy', 'care', 'nursing', 'physician', 'doctor', 'optical', 'vision',
    'chiropractic', 'knight chiropractic', 'nu-smile', 'orthodontics', 'denture',
    'complete denture', 'connect hearing', 'northwest counselling', 'counselling'
  ],
  
  'FOOD_BEVERAGE': [
    'food', 'restaurant', 'cafe', 'bistro', 'pub', 'bar', 'kitchen', 'catering',
    'bakery', 'butcher', 'grocery', 'market', 'inn', 'hotel', 'lodge', 'bavarian',
    'pizza', 'pizza hut', 'checkers pizza', 'mr mikes', 'steakhouse', 'berts deli',
    'delicatessen', 'dennys', 'bizza enterprises', 'boston pizza'
  ],
  
  'RETAIL_ENTERTAINMENT': [
    'retail', 'store', 'shop', 'market', 'boutique', 'gallery', 'entertainment',
    'recreation', 'sports', 'fitness', 'gym', 'studio', 'theater', 'cinema',
    'theatres', 'tillicum theatres', 'bowling', 'bowling center', 'bowling centre',
    'jewellers', 'carters jewellers', 'collectables', 'sonnys collectables',
    'comic encounters', 'misty river books', 'kids at play', 'tiny steps',
    'taekwondo', 'atlantis taekwondo', 'art in motion', 'dance', 'performing arts',
    'bingo', 'chances terrace', 'lucky dollar bingo'
  ],
  
  'TRANSPORTATION_LOGISTICS': [
    'transport', 'trucking', 'freight', 'shipping', 'logistics', 'delivery', 'hauling',
    'tire', 'auto', 'automotive', 'vehicle', 'fleet', 'supply chain', 'kalum tire',
    'rent-a-car', 'skeena rent-a-car', 'budget rent a car', 'motors', 'terrace motors',
    'helicopter', 'helicopters', 'yellowhead helicopters', 'canadian helicopters',
    'quantum helicopters', 'central mountain air', 'purolator', 'loomis express',
    'driving school', 'sunset driving school', 'philcan pro driving'
  ],
  
  'PROFESSIONAL_SERVICES': [
    'accounting', 'legal', 'law', 'consulting', 'advisory', 'financial', 'insurance',
    'real estate', 'property', 'management', 'administration', 'hr block', 'block',
    'vohora', 'mnp', 'llp', 'warner bandstra brown', 'terrace business resource',
    'resource centre', 'provincial networking', 'pngi', 'remax', 're/max'
  ],
  
  'HOSPITALITY_PERSONAL_CARE': [
    'hotel', 'motel', 'inn', 'lodge', 'accommodation', 'travel', 'tourism', 'beauty',
    'salon', 'spa', 'cleaners', 'laundry', 'dry cleaning', 'cleaning', 'time cleaners',
    'hair', 'hairbusters', 'haryanas', 'four hands body', 'body renewal',
    'kennels', 'uplandskennels', 'nursery', 'uplandskennery', 'spotted horse farm'
  ],
  
  'FINANCIAL_LEGAL_SERVICES': [
    'bank', 'credit', 'loan', 'mortgage', 'investment', 'financial', 'legal', 'law',
    'attorney', 'accounting', 'tax', 'bookkeeping', 'insurance', 'westland insurance',
    'ig wealth', 'wealth management', 'hemac investments', 'moneymart', 'money mart',
    'holdings', 'kermode holdings', 'vlc holdings', 'dddkc holdings', 'wil-ann holdings'
  ],
  
  'MINING_NATURAL_RESOURCES': [
    'mining', 'mineral', 'ore', 'quarry', 'forestry', 'logging', 'timber', 'wood',
    'lumber', 'natural resources', 'extraction', 'drilling', 'oil', 'gas', 'energy',
    'petro canada', 'northwest fuels', 'superior propane', 'skeena valley resources',
    'lafarge', 'agat laboratories', 'labs', 'lifelabs', 'air liquide', 'linde'
  ],
  
  'MANUFACTURING_INDUSTRIAL': [
    'manufacturing', 'industrial', 'factory', 'production', 'assembly', 'machining',
    'hilti', 'thermax', 'insulators', 'uap inc', 'napacanada', 'westcana electric',
    'bryant electric', 'power flow electric', 'ki power', 'pole', 'skeena glass',
    'speedy glass', 'straight up doors', 'doors and windows', 'raincatcher gutters',
    'watertight gutters', 'abc recycling', 'abcrecycling'
  ]
};

function categorizeBusinessByName(businessName: string, email: string): string {
  const name = businessName.toLowerCase();
  const emailLower = email.toLowerCase();
  
  // Check each category with enhanced rules
  for (const [category, keywords] of Object.entries(ENHANCED_CATEGORIZATION_RULES)) {
    for (const keyword of keywords) {
      if (name.includes(keyword.toLowerCase()) || emailLower.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  // Special case for specific companies that don't match patterns
  const specialCases = {
    'CONSTRUCTION_BUILDING': ['terrace steel', 'terracesteel', 'jr overhead', 'master sweeper'],
    'HEALTHCARE_WELLNESS': ['dr.', 'doctor'],
    'FOOD_BEVERAGE': ['bavarian', 'copperside', 'rest inn', 'clinton manor'],
    'RETAIL_ENTERTAINMENT': ['tillicum', 'misty river', 'carters', 'comic encounters'],
    'TRANSPORTATION_LOGISTICS': ['rent-a-car', 'helicopter', 'driving school'],
    'PROFESSIONAL_SERVICES': ['vohora', 'mnp', 'warner', 'remax', 're/max'],
    'HOSPITALITY_PERSONAL_CARE': ['kennels', 'nursery', 'farm'],
    'FINANCIAL_LEGAL_SERVICES': ['wealth', 'investment', 'holdings'],
    'MINING_NATURAL_RESOURCES': ['petro', 'propane', 'lafarge', 'labs'],
    'MANUFACTURING_INDUSTRIAL': ['hilti', 'thermax', 'uap', 'recycling']
  };
  
  for (const [category, cases] of Object.entries(specialCases)) {
    for (const specialCase of cases) {
      if (name.includes(specialCase.toLowerCase())) {
        return category;
      }
    }
  }
  
  return 'OTHER_INDUSTRIES';
}

async function improveBusinessCategorization() {
  console.log('🔧 Improving Business Categorization...\n');

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

    console.log('\n📊 New Categorization:');
    for (const [category, members] of newCategorization) {
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`   • ${groupName}: ${members.length} businesses`);
    }

    // Clear existing data
    console.log('\n🧹 Clearing existing audience data...');
    await prisma.audienceMember.deleteMany({});
    await prisma.audienceGroup.deleteMany({});

    // Create new audience groups
    console.log('\n👥 Creating improved audience groups...');
    
    for (const [category, members] of newCategorization) {
      if (members.length === 0) continue;
      
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      
      console.log(`   Creating: ${groupName} (${members.length} businesses)`);
      
      const audienceGroup = await prisma.audienceGroup.create({
        data: {
          name: groupName,
          description: `Businesses in ${groupName.toLowerCase()} industry - improved categorization`,
          criteria: {
            industry: category,
            minMembers: members.length,
            categorizationMethod: 'enhanced_name_analysis',
            improved: true
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
              categorizedBy: 'enhanced_name_analysis'
            }
          }
        });
      }
      
      console.log(`   ✅ Added ${members.length} members to ${groupName}`);
    }

    // Final summary
    console.log('\n🎉 Improved Business Categorization Complete!');
    console.log('\n📊 Final Summary:');
    
    const finalGroups = await prisma.audienceGroup.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' }
    });
    
    const totalMembers = finalGroups.reduce((sum, group) => sum + group._count.members, 0);
    
    console.log(`   📧 Total Audience Groups: ${finalGroups.length}`);
    console.log(`   👥 Total Audience Members: ${totalMembers}`);
    
    console.log('\n📋 Improved Audience Groups:');
    finalGroups.forEach(group => {
      console.log(`   • ${group.name}: ${group._count.members} businesses`);
    });

    // Show some examples from each category
    console.log('\n📋 Sample Businesses by Improved Category:');
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
    console.error('❌ Error improving categorization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

improveBusinessCategorization();

