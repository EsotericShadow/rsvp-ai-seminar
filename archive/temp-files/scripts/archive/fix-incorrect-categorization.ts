import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fix the incorrect "LABORATORY & TESTING" categorization
const CORRECT_CATEGORIZATIONS = {
  'RENTAL_SERVICES': [
    'west point rentals', 'rental', 'rentals', 'rental solutions'
  ],
  
  'CLEANING_LAUNDRY': [
    'time cleaners', 'spotless laundry', 'drycleaners', 'laundry mat', 'cleaning', 'janitorial'
  ],
  
  'GLASS_WINDOWS': [
    'all west glass', 'skeena glass', 'speedy glass', 'nh glass'
  ],
  
  'REAL_ESTATE_PROPERTY': [
    'gobind enterprises', 'kitscondos', 'lakelse development', 'munroe manor'
  ],
  
  'AUTOMOTIVE_DEALERSHIPS': [
    'straightline chevrolet', 'straightline buick', 'straightline gmc', 'straightline rv', 
    'straightline marine', 'straightline honda', 'terrace chrysler', 'terrace dodge', 
    'jeep ram', 'terrace totem ford'
  ],
  
  'ACCOMMODATION_HOSPITALITY': [
    'rainbow inn motel', 'terrace motel', 'sunshine inn estates'
  ],
  
  'REFRIGERATION_HVAC': [
    'webb refrigeration', 't & d refrigeration', 'cool net refrigeration'
  ],
  
  'METALWORKS_MANUFACTURING': [
    'western pacific metalworks', 'skeena concrete products', 'monster industries'
  ],
  
  'ELECTRICAL_SERVICES': [
    'power flow electric', 'bryant electric', 'hartman electric', 'red phoenix electric', 
    'houle electric', 'tanker electric'
  ],
  
  'FISHING_CHARTERS': [
    'skeena wilderness fishing charters', 'khutzeymateen wilderness lodge'
  ],
  
  'DRILLING_SERVICES': [
    'double d drilling'
  ],
  
  'RECYCLING_SERVICES': [
    'abc recycling', 'allen\'s scrap', 'salvage'
  ],
  
  'REAL_ESTATE_DEVELOPMENT': [
    'neid enterprises', 'rossco ventures', 'makra enterprises', 'anweiler enterprises'
  ],
  
  'GAS_STATIONS': [
    'k&p bath', 'shefield express', 'mobil'
  ],
  
  'INDUSTRIAL_MANUFACTURING': [
    'technicon industries', 'rudon hydraulics', 'western equipment', 'skeena concrete'
  ],
  
  'AUDIO_VISUAL_TECHNOLOGY': [
    'terrace rewind', 'skeena sight & sound'
  ],
  
  'GUTTERS_EXTERIOR': [
    'watertight gutters'
  ],
  
  'APPRAISALS_SERVICES': [
    'steve cullis appraisals', 'metrix appraisals'
  ],
  
  'BUILDING_SUPPLIES': [
    'first choice builders supply', 'timbermart'
  ],
  
  'CYCLING_BIKE_SHOPS': [
    'kc cycle', 'wild bike'
  ],
  
  'FARMING_AGRICULTURE': [
    'daybreak farms'
  ],
  
  'CONSTRUCTION_EXCAVATING': [
    'dj mckay enterprises', 'triple h bobcat'
  ],
  
  'JANITORIAL_CLEANING': [
    'scott\'s janitorial', 'spotless uniform'
  ],
  
  'LABORATORY_TESTING': [
    'agat laboratories', 'laboratory', 'labs', 'testing', 'medical testing'
  ],
  
  'GLASS_SERVICES': [
    'snk riverfront ventures', 'crackedglass'
  ],
  
  'PAINTING_SERVICES': [
    'sixnine enterprises', 'painting'
  ],
  
  'SECURITY_SERVICES': [
    'comtek security', 'paladin security'
  ],
  
  'VACUUM_SERVICES': [
    'priority vac'
  ],
  
  'ECOTOURS_TOURISM': [
    'silvertip ecotours', 'grizzly'
  ],
  
  'CONCRETE_CONSTRUCTION': [
    'hirsch creek concrete'
  ],
  
  'FREIGHT_TRANSPORTATION': [
    'overland west freightlines'
  ],
  
  'FLOOR_CLEANING': [
    'clean floors', '639517 b.c. ltd'
  ],
  
  'PRINTING_OFFICE_SUPPLIES': [
    'mills printing', 'stationery', 'office productivity'
  ],
  
  'MALL_SHOPPING': [
    'lazelle-mall', '645999 b.c. ltd'
  ],
  
  'FITNESS_GYM': [
    'anytime fitness', 'site2gym'
  ],
  
  'INDUSTRIAL_SERVICES': [
    'mas-rock industries'
  ],
  
  'VENTURES_DEVELOPMENT': [
    'vector ventures', 'white raven ventures', 'broome ventures', 'kalum ventures',
    'north peak projects', 'sienna networks', 'komorebi ventures', 'warrior life',
    'noble five creek'
  ],
  
  'RENTAL_EQUIPMENT': [
    'local rental solutions'
  ],
  
  'TECHNOLOGY_SERVICES': [
    'salvelinus solutions', 'meiko technologies', 'spyce'
  ],
  
  'INSPECTIONS_SERVICES': [
    'c & f choice inspections'
  ],
  
  'CANNABIS_RETAIL': [
    'high point cannabis'
  ],
  
  'LIGHTING_SERVICES': [
    'top\'s lighting'
  ],
  
  'FABRICATION_MANUFACTURING': [
    'southgate fabrication', 'opa of greece'
  ],
  
  'DISTRIBUTION_SERVICES': [
    'big river distributors'
  ],
  
  'REAL_ESTATE_DEVELOPMENT_2': [
    'arka fortune developments', '1224017 b.c. ltd'
  ],
  
  'PET_SERVICES': [
    'elf enterprises', 'blue barn pet', 'pretty paws grooming'
  ],
  
  'CONSTRUCTION_TRUSS': [
    'skeena truss'
  ],
  
  'INTERIOR_DESIGN': [
    'taiga interior design'
  ],
  
  'HELI_SKIING_TOURISM': [
    'true north heli-skiing', 'northern escape heli-skiing'
  ],
  
  'HOME_CONSTRUCTION': [
    'homeniuk homes', '1376744 b.c. ltd'
  ],
  
  'SIGNS_ADVERTISING': [
    'skeena signs'
  ],
  
  'VENTURES_DEVELOPMENT_2': [
    'komorebi ventures'
  ],
  
  'LINE_LOCATING_SERVICES': [
    '3-d line locating'
  ],
  
  'INDUSTRIAL_SERVICES_2': [
    'perceptive industries'
  ],
  
  'MICRO_HOMES_CONSTRUCTION': [
    'hummingbird micro homes'
  ],
  
  'ENGINEERING_CONSULTING': [
    'urban systems'
  ],
  
  'MECHANICAL_SERVICES': [
    'north coast mechanical', 'north arm mechanical'
  ],
  
  'BOOKKEEPING_SERVICES': [
    'kermode bookkeeping', '1399281 b.c. ltd'
  ],
  
  'CIVIL_CONTRACTING': [
    'metric civil contractors', 'west metric jv'
  ],
  
  'WASTE_DISPOSAL': [
    'rupert disposal'
  ],
  
  'INDUSTRIAL_MANUFACTURING_2': [
    'sealtec industries'
  ],
  
  'PETROLEUM_SERVICES': [
    'canco petroleum', '1505010 b.c. ltd'
  ],
  
  'SAFETY_SERVICES': [
    'timbersafe solutions'
  ],
  
  'PERSONAL_SERVICES': [
    'becky kui'
  ],
  
  'CONCRETE_CONSTRUCTION_2': [
    'copper river developments'
  ],
  
  'ELECTRICAL_CONTRACTING': [
    'electric sinphony productions'
  ],
  
  'REAL_ESTATE_DEVELOPMENT_3': [
    '1374533 b c ltd'
  ],
  
  'LANDSCAPING_SERVICES': [
    'back40 landscaping'
  ]
};

function categorizeBusinessByName(businessName: string, email: string): string {
  const name = businessName.toLowerCase();
  const emailLower = email.toLowerCase();
  
  // Check each category with corrected rules
  for (const [category, keywords] of Object.entries(CORRECT_CATEGORIZATIONS)) {
    for (const keyword of keywords) {
      if (name.includes(keyword.toLowerCase()) || emailLower.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  // If no specific category found, check if it's a numbered company or personal name
  const numberedPattern = /\d{7,8}\s+(bc\s+)?ltd|bc\s+\d{7,8}|canada\s+inc\.?\s*\d{7,8}/i;
  if (numberedPattern.test(name)) {
    return 'PERSONAL_NAMES_NUMBERED';
  }
  
  return 'OTHER_INDUSTRIES';
}

async function fixIncorrectCategorization() {
  console.log('🔧 Fixing Incorrect Categorization...\n');

  try {
    // Get all audience members
    const audienceMembers = await prisma.audienceMember.findMany({
      include: { group: true }
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

    console.log('\n📊 New Corrected Categorization:');
    for (const [category, members] of newCategorization) {
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`   • ${groupName}: ${members.length} businesses`);
    }

    // Clear existing data
    console.log('\n🧹 Clearing existing audience data...');
    await prisma.audienceMember.deleteMany({});
    await prisma.audienceGroup.deleteMany({});

    // Create new audience groups
    console.log('\n👥 Creating corrected audience groups...');
    
    for (const [category, members] of newCategorization) {
      if (members.length === 0) continue;
      
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      
      console.log(`   Creating: ${groupName} (${members.length} businesses)`);
      
      const audienceGroup = await prisma.audienceGroup.create({
        data: {
          name: groupName,
          description: `Businesses in ${groupName.toLowerCase()} industry - corrected categorization`,
          criteria: {
            industry: category,
            minMembers: members.length,
            categorizationMethod: 'corrected_categorization',
            improved: true,
            semanticAnalysis: true,
            correctedFromLaboratory: true
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
              categorizedBy: 'corrected_categorization'
            }
          }
        });
      }
      
      console.log(`   ✅ Added ${members.length} members to ${groupName}`);
    }

    // Final summary
    console.log('\n🎉 Corrected Categorization Complete!');
    console.log('\n📊 Final Summary:');
    
    const finalGroups = await prisma.audienceGroup.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' }
    });
    
    const totalMembers = finalGroups.reduce((sum, group) => sum + group._count.members, 0);
    
    console.log(`   📧 Total Audience Groups: ${finalGroups.length}`);
    console.log(`   👥 Total Audience Members: ${totalMembers}`);
    
    console.log('\n📋 Corrected Audience Groups:');
    finalGroups.forEach(group => {
      console.log(`   • ${group.name}: ${group._count.members} businesses`);
    });

  } catch (error) {
    console.error('❌ Error in corrected categorization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixIncorrectCategorization();


