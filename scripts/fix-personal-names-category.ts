import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Specific businesses that should be moved out of Personal Names & Numbered
const BUSINESSES_TO_RECATEGORIZE = {
  'MARTIAL_ARTS_FITNESS': [
    'atlantis taekwondo'
  ],
  
  'PROPANE_FUEL_SERVICES': [
    'superior propane'
  ],
  
  'MINING_RESOURCES': [
    'skeena valley resources'
  ],
  
  'INSULATION_SERVICES': [
    'thermax insulators'
  ],
  
  'LEGAL_SERVICES': [
    'warner bandstra brown', 'vohora llp', 'mnp llp'
  ],
  
  'BUSINESS_SERVICES': [
    'terrace business resource centre'
  ],
  
  'NURSERY_LANDSCAPING': [
    'uplands nursery'
  ],
  
  'PROPERTY_MAINTENANCE': [
    '0883502 bc ltd (more property maintenance)', 'more property maintenance'
  ],
  
  'CONSULTING_SERVICES': [
    'fins consulting', 'cedarwood consulting'
  ],
  
  'NEWSPAPER_MEDIA': [
    'terrace standard'
  ],
  
  'RESTAURANTS_FOOD': [
    'redneck kitchen', 'mr mikes steakhouse casual', 'berts deli', 'rest inn',
    'days inn terrace', 'bear country inn', 'best western terrace inn', 'terrace inn',
    'kalum motel', 'copperside ii', 'copperside vi', 'lucky garden restaurant'
  ],
  
  'STORAGE_SERVICES': [
    'lazelle mini storage', 's n t mini storage'
  ],
  
  'HOSPITALITY_ACCOMMODATION': [
    'rest inn', 'days inn terrace', 'bear country inn', 'best western terrace inn',
    'terrace inn', 'kalum motel'
  ],
  
  'NOTARY_SERVICES': [
    'sherry anderson notary public'
  ],
  
  'FORESTRY_RESOURCES': [
    'coast tsimshian resources lp'
  ],
  
  'RV_PARK_SERVICES': [
    'reel inn and rv park'
  ],
  
  'PUBLISHING_MEDIA': [
    'ccb publishing'
  ],
  
  'LIQUOR_RETAIL': [
    'terrace inn liquor store', 'skeena liquor store'
  ],
  
  'RENTAL_SERVICES': [
    'easy rent tents'
  ],
  
  'TRAILER_COURT': [
    'park avenue trailer court'
  ],
  
  'DRIVING_SCHOOL': [
    'sunset driving school'
  ],
  
  'TIRE_SERVICES': [
    'fountain tire'
  ],
  
  'SAWMILLS_WOOD': [
    '1355392 bc ltd.', 'skeenasawmills'
  ],
  
  'MACHINE_SHOP': [
    'bow valley machine shop limited'
  ],
  
  'FURNITURE_APPLIANCES': [
    '1530868 bc ltd dba city furniture & appliances', 'city furniture & appliances'
  ],
  
  'CHILDCARE_SERVICES': [
    'kids at play', 'tiny steps', 'little timbers family childcare',
    'little sprouts family daycare', 'terrace sunflower child care centre',
    'caterpillars childcare center'
  ],
  
  'BOOKS_RETAIL': [
    'misty river books'
  ],
  
  'THEATRE_ENTERTAINMENT': [
    'tillicum theatres'
  ],
  
  'BOWLING_RECREATION': [
    'terrace bowling center'
  ],
  
  'SINGING_STUDIO': [
    'celestial singing studio'
  ],
  
  'VETERINARY_SERVICES': [
    'terrace animal hospital', 'kermodei veterinary hospital'
  ],
  
  'LABORATORY_SERVICES': [
    'als canada'
  ],
  
  'DENTAL_SERVICES': [
    'cedar coast dental', 'horizon dental'
  ],
  
  'HEARING_SERVICES': [
    'connect hearing'
  ],
  
  'DENTURE_SERVICES': [
    'complete denture centre'
  ],
  
  'MASSAGE_THERAPY': [
    'health and motion massage therapy', 'colleen zitala registered massage therapist'
  ],
  
  'WELLNESS_CLINIC': [
    'nourishing life wellness clinic', 'viva holistic healing'
  ],
  
  'FOOT_CARE_SERVICES': [
    'northwest foot care'
  ],
  
  'CREDIT_UNION': [
    'northern savings credit union'
  ],
  
  'MONEY_SERVICES': [
    'money mart'
  ],
  
  'BANKING_SERVICES': [
    'toronto dominion bank'
  ],
  
  'INVESTMENT_SERVICES': [
    'edward jones'
  ],
  
  'KENNELS_PET_SERVICES': [
    'uplands kennels'
  ],
  
  'BODY_WELLNESS': [
    'four hands body renewal'
  ],
  
  'PLUMBING_SERVICES': [
    'haworth plumbing'
  ],
  
  'CONSTRUCTION_SERVICES': [
    'norlakes construction', 'tidal wave construction', 'boc ventures',
    'chad buhr contracting'
  ],
  
  'MASONRY_SERVICES': [
    'sinjur masonry'
  ],
  
  'BUILDING_SUPPLIES': [
    'terrace builders centre rona'
  ],
  
  'CONTRACTING_SERVICES': [
    'silver pine contracting'
  ],
  
  'ROOFING_SERVICES': [
    'skeena roofing'
  ],
  
  'FUEL_ENERGY': [
    'petro canada', 'pacific northern gas', 'suncor energy products partnership'
  ],
  
  'TRADING_SERVICES': [
    'all west trading limited'
  ],
  
  'INDUSTRIAL_SUPPLIES': [
    'tenaquip limited'
  ],
  
  'CONSULTING_ENGINEERING': [
    'allnorth consultants limited'
  ],
  
  'LIMITED_PARTNERSHIP': [
    'cims limited partnership'
  ],
  
  'EQUIPMENT_SERVICES': [
    '1243469 bc ltd. dba emil anderson equipment inc.', 'emil anderson equipment',
    'north coast equipment'
  ],
  
  'ELECTRICAL_SERVICES': [
    'geier electric'
  ],
  
  'DOORS_WINDOWS': [
    'straight up doors and windows'
  ],
  
  'GALLERY_ART': [
    'red raven gallery'
  ],
  
  'RECYCLING_SERVICES': [
    'do your part recycling co'
  ],
  
  'ACCOUNTING_SERVICES': [
    'watson accounting'
  ],
  
  'CONSULTING_BUSINESS': [
    'blix consulting'
  ],
  
  'TELECOMMUNICATIONS': [
    'westcan advanced communications solutions'
  ],
  
  'OPTOMETRY_SERVICES': [
    'northern eyes optometry'
  ],
  
  'SPORTS_COLLECTABLES': [
    'galaxy sportscards and creative collectables'
  ],
  
  'SIGNS_PROMOTIONS': [
    '1145862 bc ltd dba silvertip promotions', 'silvertip promotions',
    'silvertip signs'
  ],
  
  'RESTAURANTS_CHAIN': [
    'white spot terrace'
  ],
  
  'BEVERAGE_BOTTLING': [
    'coca cola canada bottling limited', 'aqua clear bottlers'
  ],
  
  'FOOD_SERVICES': [
    'copperside ii', 'copperside vi'
  ],
  
  'JANITORIAL_CLEANING': [
    'kermode janitorial', 'ultra janitorial', 'hydra mist carpet cleaning'
  ],
  
  'AUTOMOTIVE_RENTAL': [
    'hertz system licencee'
  ],
  
  'AVIATION_SERVICES': [
    'jazz aviation lp'
  ],
  
  'JEWELRY_RETAIL': [
    'cooks jewellers', 'carters jewellers'
  ],
  
  'FASHION_RETAIL': [
    'sidewalkers unique fashions limited'
  ],
  
  'DRYWALL_SERVICES': [
    'tanner drywall systems'
  ],
  
  'FLAGGING_TRAINING': [
    'strictly flagging training agency'
  ],
  
  'INSULATION_FOAM': [
    'just foam it'
  ],
  
  'INDUSTRIAL_SERVICES': [
    'allteck limited partnership'
  ]
};

function shouldRecategorize(businessName: string): string | null {
  const name = businessName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(BUSINESSES_TO_RECATEGORIZE)) {
    for (const keyword of keywords) {
      if (name.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  return null;
}

async function fixPersonalNamesCategory() {
  console.log('🔧 Fixing Personal Names & Numbered Category...\n');

  try {
    // Get the Personal Names & Numbered group
    const personalNamesGroup = await prisma.audienceGroup.findFirst({
      where: { name: { contains: 'PERSONAL' } },
      include: { members: true }
    });

    if (!personalNamesGroup) {
      console.log('❌ Personal Names & Numbered group not found');
      return;
    }

    console.log(`📊 Found Personal Names & Numbered group with ${personalNamesGroup.members.length} members`);

    // Find businesses that should be recategorized
    const businessesToMove = [];
    const businessesToKeep = [];

    for (const member of personalNamesGroup.members) {
      const newCategory = shouldRecategorize(member.businessName);
      if (newCategory) {
        businessesToMove.push({ ...member, newCategory });
      } else {
        businessesToKeep.push(member);
      }
    }

    console.log(`\n📋 Found ${businessesToMove.length} businesses to recategorize:`);
    console.log(`📋 Keeping ${businessesToKeep.length} businesses in Personal Names & Numbered`);

    // Show what will be moved
    const moveSummary = new Map<string, number>();
    businessesToMove.forEach(business => {
      const count = moveSummary.get(business.newCategory) || 0;
      moveSummary.set(business.newCategory, count + 1);
    });

    console.log('\n📊 Businesses to move by category:');
    for (const [category, count] of moveSummary) {
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`   • ${groupName}: ${count} businesses`);
    }

    // Remove all members from Personal Names & Numbered group
    await prisma.audienceMember.deleteMany({
      where: { groupId: personalNamesGroup.id }
    });

    // Re-add businesses that should stay in Personal Names & Numbered
    for (const member of businessesToKeep) {
      await prisma.audienceMember.create({
        data: {
          groupId: personalNamesGroup.id,
          businessId: member.businessId,
          businessName: member.businessName,
          primaryEmail: member.primaryEmail,
          secondaryEmail: member.secondaryEmail,
          tagsSnapshot: member.tagsSnapshot,
          inviteToken: member.inviteToken,
          meta: member.meta
        }
      });
    }

    console.log(`✅ Kept ${businessesToKeep.length} businesses in Personal Names & Numbered`);

    // Move businesses to appropriate categories
    for (const [category, businesses] of Object.entries(
      businessesToMove.reduce((acc, business) => {
        if (!acc[business.newCategory]) acc[business.newCategory] = [];
        acc[business.newCategory].push(business);
        return acc;
      }, {} as Record<string, any[]>)
    )) {
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Find or create the target group
      let targetGroup = await prisma.audienceGroup.findFirst({
        where: { name: { contains: groupName } }
      });

      if (!targetGroup) {
        console.log(`   Creating new group: ${groupName}`);
        targetGroup = await prisma.audienceGroup.create({
          data: {
            name: groupName,
            description: `Businesses in ${groupName.toLowerCase()} industry - moved from Personal Names & Numbered`,
            criteria: {
              industry: category,
              minMembers: businesses.length,
              categorizationMethod: 'corrected_from_personal_names',
              improved: true,
              movedFromPersonalNames: true
            }
          }
        });
      }

      // Add businesses to the target group
      for (const business of businesses) {
        await prisma.audienceMember.create({
          data: {
            groupId: targetGroup.id,
            businessId: business.businessId,
            businessName: business.businessName,
            primaryEmail: business.primaryEmail,
            secondaryEmail: business.secondaryEmail,
            tagsSnapshot: business.tagsSnapshot,
            inviteToken: business.inviteToken,
            meta: {
              ...business.meta,
              recategorized: true,
              originalCategory: 'PERSONAL_NAMES_NUMBERED',
              newCategory: category,
              categorizedBy: 'corrected_from_personal_names'
            }
          }
        });
      }

      console.log(`✅ Moved ${businesses.length} businesses to ${groupName}`);
    }

    // Final summary
    console.log('\n🎉 Personal Names & Numbered Category Fix Complete!');
    
    const finalGroups = await prisma.audienceGroup.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📊 Final Summary:');
    finalGroups.forEach(group => {
      console.log(`   • ${group.name}: ${group._count.members} businesses`);
    });

    // Show Personal Names & Numbered group specifically
    const updatedPersonalGroup = await prisma.audienceGroup.findFirst({
      where: { name: { contains: 'PERSONAL' } },
      include: { members: true }
    });

    if (updatedPersonalGroup) {
      console.log(`\n📋 Personal Names & Numbered now contains ${updatedPersonalGroup.members.length} businesses`);
      console.log('Sample businesses that remain:');
      updatedPersonalGroup.members.slice(0, 5).forEach(member => {
        console.log(`   • ${member.businessName}`);
      });
    }

  } catch (error) {
    console.error('❌ Error fixing Personal Names category:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPersonalNamesCategory();


