import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive semantic categorization rules
const SEMANTIC_CATEGORIZATION_RULES = {
  'AUDIO_VISUAL_TECHNOLOGY': [
    'sight & sound', 'sight-and-sound', 'audio', 'visual', 'sound', 'rewind', 'terracerewind',
    'syberscream', 'screaming', 'digital', 'mapping', 'magellan digital', 'technology linked',
    'computers', 'pendragon computers', 'pedagoguery software', 'peda software'
  ],
  
  'SIGNS_GRAPHICS_PROMOTIONS': [
    'sign service', 'artisticsignservice', 'silvertip signs', 'silvertipsigns', 'promotions',
    'silvertip promotions', 'graphics', 'design', 'advertising'
  ],
  
  'GLASS_WINDOWS': [
    'glass', 'all west glass', 'awgni', 'windows', 'doors and windows', 'straight up doors',
    'speedy glass', 'skeena glass', 'sis-bc'
  ],
  
  'RESTAURANTS_FOOD_SERVICE': [
    'white spot', 'coffee', 'van houtte coffee', 'kdrp', 'coca cola', 'coke canada',
    'bottling', 'aqua clear bottlers', 'restaurant', 'food', 'catering'
  ],
  
  'JANITORIAL_CLEANING': [
    'janitors', 'janitorial', 'warehouse', 'terracejanitorswarehouse', 'kermode janitorial',
    'scott\'s janitorial', 'ultra janitorial', 'dhillon janitorial', 'cleaning', 'cleaners'
  ],
  
  'TRANSPORTATION_LOGISTICS': [
    'towing', 'pronto towing', 'hertz', 'rental', 'rent-a-car', 'totem ford', 'ford sales',
    'first truck centre', 'velocity truck centres', 'vvgtruck', 'executive flight centre',
    'efcaviation', 'aviation', 'fuel services'
  ],
  
  'RETAIL_FASHION': [
    'reitmans', 'retail', 'fashion', 'clothing', 'dollar store', 'your dollar store',
    'cooks jewellers', 'jewellers', 'carters jewellers'
  ],
  
  'CONSTRUCTION_BUILDING': [
    'drywall', 'tanner drywall', 'systems', 'refrigeration', 'tri-city refrigeration',
    'tricityrefrig', 'bobcat', 'terra bobcat', 'moto860ter', 'container services',
    'dj container services', 'restoration', 'universal restoration', 'urscanada',
    'flagging', 'strictly flagging', 'training agency', 'foam', 'just foam it',
    'insulation', 'spray foam'
  ],
  
  'SECURITY_LOCKSMITH': [
    'lock & key', 'royal mountain lock', 'royallock', 'chubb fire', 'security',
    'chubbfs', 'securiguard', 'comtek security', 'security solutions', 'skrug'
  ],
  
  'PROFESSIONAL_SERVICES': [
    'trading', 'all west trading', 'tenaquip', 'industrial supplies', 'equipment',
    'appraisals', 'steve cullis appraisals', 'cullis', 'consultants', 'allnorth',
    'consultants limited', 'tr.admin', 'cims', 'cimsltd', 'wsp canada', 'engineering',
    'business solutions', 'dawnesolutions', 'respiratory services', 'independent respiratory',
    'airliquide', 'community services', 'thompson community services', 'tcsinfo'
  ],
  
  'TELECOMMUNICATIONS': [
    'cable', 'telephone', 'citywest', 'cwct', 'advanced communications', 'westcan',
    'acs', 'telecommunications'
  ],
  
  'HEALTHCARE_WELLNESS': [
    'holistic', 'viva holistic healing', 'massage therapist', 'colleen zitala',
    'northern touch', 'optometry', 'northern eyes optometry', 'neo'
  ],
  
  'MANUFACTURING_INDUSTRIAL': [
    'technicon industries', 'technicon-ind', 'industrial', 'manufacturing',
    'allteck', 'allteck limited', 'alt_facilities', 'ncsg crane', 'heavy haul',
    'ncsg', 'northern altus services', 'northernaltus'
  ],
  
  'OFFICE_BUSINESS_SERVICES': [
    'office solutions', 'ideal office solutions', 'idealos', 'spirit stones',
    'scotechsystems', 'vac', 'priority vac', 'prioritymarc'
  ],
  
  'ELECTRICAL_SERVICES': [
    'electric', 'geier electric', 'electrical', 'power', 'pole', 'ki power',
    'westcana electric', 'bryant electric'
  ],
  
  'FUEL_ENERGY': [
    'fuel', 'kermodei fuel services', 'kermodeifuels', 'energy', 'gas'
  ],
  
  'PERSONAL_CARE_BEAUTY': [
    'grooming', 'groomin\' tails', 'jan', 'jdozzi', 'beauty', 'personal care'
  ],
  
  'RECYCLING_ENVIRONMENTAL': [
    'bottle', 'return it depot', 'terracerupert', 'recycling', 'environmental'
  ],
  
  'COOPERATIVES': [
    'co-op', 'four rivers co-op', 'cooperative', 'cardlock'
  ]
};

// Personal names and numbered companies to filter out
const PERSONAL_NAMES_AND_NUMBERED = [
  'olson, kelly gordon', 'gustafson, meaghan', 'lillian, jasvinder singh', 'lillian, kulwant kaur',
  'bruce enterprises', 'mann enterprises', 'ron j.p.', 'm & a macedo', 'clunas, david j',
  'clunas, wanda c', 'spearing: justin', 'rauchene', 'wittkowski, ludwig',
  '0909799 bc ltd', '13483487 canada inc', '0926500 bc ltd', '537326 b.c. ltd',
  '518235 bc ltd', 'xausa family trust'
];

function isPersonalNameOrNumbered(businessName: string): boolean {
  const name = businessName.toLowerCase();
  return PERSONAL_NAMES_AND_NUMBERED.some(pattern => name.includes(pattern.toLowerCase()));
}

function categorizeBusinessByName(businessName: string, email: string): string {
  const name = businessName.toLowerCase();
  const emailLower = email.toLowerCase();
  
  // Skip personal names and numbered companies
  if (isPersonalNameOrNumbered(businessName)) {
    return 'PERSONAL_NAMES_NUMBERED';
  }
  
  // Check each category with semantic rules
  for (const [category, keywords] of Object.entries(SEMANTIC_CATEGORIZATION_RULES)) {
    for (const keyword of keywords) {
      if (name.includes(keyword.toLowerCase()) || emailLower.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  return 'OTHER_INDUSTRIES';
}

async function comprehensiveSemanticCategorization() {
  console.log('🧠 Comprehensive Semantic Business Categorization...\n');

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

    console.log('\n📊 New Semantic Categorization:');
    for (const [category, members] of newCategorization) {
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`   • ${groupName}: ${members.length} businesses`);
    }

    // Clear existing data
    console.log('\n🧹 Clearing existing audience data...');
    await prisma.audienceMember.deleteMany({});
    await prisma.audienceGroup.deleteMany({});

    // Create new audience groups
    console.log('\n👥 Creating semantic audience groups...');
    
    for (const [category, members] of newCategorization) {
      if (members.length === 0) continue;
      
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      
      console.log(`   Creating: ${groupName} (${members.length} businesses)`);
      
      const audienceGroup = await prisma.audienceGroup.create({
        data: {
          name: groupName,
          description: `Businesses in ${groupName.toLowerCase()} industry - comprehensive semantic categorization`,
          criteria: {
            industry: category,
            minMembers: members.length,
            categorizationMethod: 'comprehensive_semantic_analysis',
            improved: true,
            semanticAnalysis: true
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
              categorizedBy: 'comprehensive_semantic_analysis'
            }
          }
        });
      }
      
      console.log(`   ✅ Added ${members.length} members to ${groupName}`);
    }

    // Final summary
    console.log('\n🎉 Comprehensive Semantic Categorization Complete!');
    console.log('\n📊 Final Summary:');
    
    const finalGroups = await prisma.audienceGroup.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' }
    });
    
    const totalMembers = finalGroups.reduce((sum, group) => sum + group._count.members, 0);
    
    console.log(`   📧 Total Audience Groups: ${finalGroups.length}`);
    console.log(`   👥 Total Audience Members: ${totalMembers}`);
    
    console.log('\n📋 Semantic Audience Groups:');
    finalGroups.forEach(group => {
      console.log(`   • ${group.name}: ${group._count.members} businesses`);
    });

    // Show some examples from each category
    console.log('\n📋 Sample Businesses by Semantic Category:');
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
    console.error('❌ Error in semantic categorization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveSemanticCategorization();


