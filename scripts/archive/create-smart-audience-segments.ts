import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { fetchLeadMineBusinesses } from '@/lib/leadMine';

const prisma = new PrismaClient();

// Big corporations to filter out
const BIG_CORPORATIONS = [
  'mcdonald', 'walmart', 'bmo', 'scotia', 'td bank', 'rbc', 'bell', 'rogers', 'telus',
  'amazon', 'google', 'microsoft', 'apple', 'facebook', 'meta', 'netflix', 'spotify',
  'canada post', 'ups', 'fedex', 'dhl', 'tim hortons', 'starbucks', 'subway',
  'home depot', 'canadian tire', 'loblaws', 'sobeys', 'metro', 'rexall', 'shoppers drug mart',
  'costco', 'ikea', 'best buy', 'future shop', 'staples', 'indigo', 'chapters',
  'bank of nova scotia', 'finning', 'orica', 'kal tire', 'h & r block'
];

// Patterns that indicate personal names or random entries
const PERSONAL_NAME_PATTERNS = [
  /^[A-Z][a-z]+ [A-Z][a-z]+$/, // John Smith
  /^[A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+$/, // John A. Smith
  /^[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+$/, // John A Smith
  /^\d+$/, // Random digits
  /^[A-Z]+-\d+$/, // ABC-123
  /^[A-Z]+\d+$/, // ABC123
  /^\d+[A-Z]+$/, // 123ABC
];

// Industry keywords for smart categorization
const INDUSTRY_KEYWORDS = {
  'CONSTRUCTION_BUILDING': [
    'welding', 'contracting', 'construction', 'building', 'masonry', 'plumbing', 'heating',
    'electrical', 'roofing', 'flooring', 'painting', 'renovation', 'excavation', 'concrete',
    'lumber', 'supply', 'materials', 'equipment', 'rentals', 'rental'
  ],
  'MINING_NATURAL_RESOURCES': [
    'mining', 'mineral', 'ore', 'quarry', 'forestry', 'logging', 'timber', 'wood',
    'lumber', 'natural resources', 'extraction', 'drilling', 'oil', 'gas', 'energy'
  ],
  'TRANSPORTATION_LOGISTICS': [
    'transport', 'trucking', 'freight', 'shipping', 'logistics', 'delivery', 'hauling',
    'tire', 'auto', 'automotive', 'vehicle', 'fleet', 'supply chain'
  ],
  'FOOD_BEVERAGE': [
    'food', 'restaurant', 'cafe', 'bistro', 'pub', 'bar', 'kitchen', 'catering',
    'bakery', 'butcher', 'grocery', 'market', 'inn', 'hotel', 'lodge', 'bavarian'
  ],
  'PROFESSIONAL_SERVICES': [
    'accounting', 'legal', 'law', 'consulting', 'advisory', 'financial', 'insurance',
    'real estate', 'property', 'management', 'administration', 'hr block', 'block'
  ],
  'TECHNOLOGY_BUSINESS_SERVICES': [
    'technology', 'tech', 'software', 'computer', 'it', 'digital', 'web', 'internet',
    'data', 'systems', 'solutions', 'services', 'consulting', 'optical', 'laboratory'
  ],
  'HEALTHCARE_WELLNESS': [
    'health', 'medical', 'dental', 'clinic', 'hospital', 'pharmacy', 'wellness',
    'therapy', 'care', 'nursing', 'physician', 'doctor', 'optical', 'vision'
  ],
  'RETAIL_ENTERTAINMENT': [
    'retail', 'store', 'shop', 'market', 'boutique', 'gallery', 'entertainment',
    'recreation', 'sports', 'fitness', 'gym', 'studio', 'theater', 'cinema'
  ],
  'HOSPITALITY_PERSONAL_CARE': [
    'hotel', 'motel', 'inn', 'lodge', 'accommodation', 'travel', 'tourism', 'beauty',
    'salon', 'spa', 'cleaners', 'laundry', 'dry cleaning', 'cleaning'
  ],
  'FINANCIAL_LEGAL_SERVICES': [
    'bank', 'credit', 'loan', 'mortgage', 'investment', 'financial', 'legal', 'law',
    'attorney', 'accounting', 'tax', 'bookkeeping', 'insurance'
  ]
};

function isBigCorporation(name: string, email: string): boolean {
  const nameLower = name.toLowerCase();
  const emailLower = email.toLowerCase();
  
  return BIG_CORPORATIONS.some(corp => 
    nameLower.includes(corp) || emailLower.includes(corp)
  );
}

function isPersonalName(name: string): boolean {
  return PERSONAL_NAME_PATTERNS.some(pattern => pattern.test(name));
}

function categorizeBusinessByName(business: any): string {
  const name = (business.name || '').toLowerCase();
  const email = (business.contact?.primaryEmail || '').toLowerCase();
  
  // Check each industry category
  for (const [category, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.some(keyword => name.includes(keyword) || email.includes(keyword))) {
      return category;
    }
  }
  
  return 'OTHER_INDUSTRIES';
}

async function createSmartAudienceSegments() {
  console.log('🧠 Creating Smart Audience Segments...\n');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing audience data...');
    await prisma.audienceMember.deleteMany({});
    await prisma.audienceGroup.deleteMany({});

    // 1. Fetch all businesses from LeadMine
    console.log('📧 Fetching businesses from LeadMine...');
    const { data: leadMineBusinesses } = await fetchLeadMineBusinesses({
      limit: 500,
      createMissing: false
    });

    if (!leadMineBusinesses || leadMineBusinesses.length === 0) {
      console.log('❌ No businesses found in LeadMine');
      return;
    }

    console.log(`📊 Found ${leadMineBusinesses.length} businesses in LeadMine`);

    // 2. Filter and categorize businesses
    console.log('\n🔍 Categorizing businesses by name analysis...');
    const categorizedBusinesses = new Map<string, any[]>();
    
    let bigCorpCount = 0;
    let personalNameCount = 0;
    let noEmailCount = 0;
    
    for (const business of leadMineBusinesses) {
      if (!business.name) continue;
      
      if (!business.contact?.primaryEmail) {
        noEmailCount++;
        continue;
      }
      
      if (isBigCorporation(business.name, business.contact.primaryEmail)) {
        bigCorpCount++;
        continue;
      }
      
      if (isPersonalName(business.name)) {
        personalNameCount++;
        continue;
      }
      
      const category = categorizeBusinessByName(business);
      
      if (!categorizedBusinesses.has(category)) {
        categorizedBusinesses.set(category, []);
      }
      
      categorizedBusinesses.get(category)!.push(business);
    }

    console.log(`\n📊 Categorization Results:`);
    console.log(`   🏢 Big Corporations (filtered out): ${bigCorpCount}`);
    console.log(`   👤 Personal Names (filtered out): ${personalNameCount}`);
    console.log(`   📧 No Email (filtered out): ${noEmailCount}`);
    console.log(`   ✅ Valid Businesses: ${leadMineBusinesses.length - bigCorpCount - personalNameCount - noEmailCount}`);

    // 3. Create audience groups
    console.log('\n👥 Creating audience groups...');
    
    const audienceGroupMap = new Map<string, any>();
    
    for (const [category, businesses] of categorizedBusinesses) {
      if (businesses.length === 0) continue;
      
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      
      console.log(`   Creating: ${groupName} (${businesses.length} businesses)`);
      
      const audienceGroup = await prisma.audienceGroup.create({
        data: {
          name: groupName,
          description: `Businesses in ${groupName.toLowerCase()} industry`,
          criteria: {
            industry: category,
            minMembers: businesses.length,
            filtered: {
              bigCorporations: false,
              personalNames: false,
              noEmail: false
            }
          }
        }
      });
      
      audienceGroupMap.set(category, { group: audienceGroup, businesses });
    }

    // 4. Create audience members
    console.log('\n📝 Creating audience members...');
    
    for (const [category, { group, businesses }] of audienceGroupMap) {
      console.log(`   Adding ${businesses.length} members to ${group.name}...`);
      
      for (const business of businesses) {
        await prisma.audienceMember.create({
          data: {
            groupId: group.id,
            businessId: business.id,
            businessName: business.name,
            primaryEmail: business.contact.primaryEmail,
            secondaryEmail: business.contact.secondaryEmail || null,
            tagsSnapshot: business.tags || [],
            inviteToken: business.inviteToken || null,
            meta: {
              industry: business.industry,
              website: business.website,
              phone: business.phone,
              location: business.location,
              originalLeadMineData: business,
              categorizedBy: 'name_analysis'
            }
          }
        });
      }
      
      console.log(`   ✅ Added ${businesses.length} members to ${group.name}`);
    }

    // 5. Summary
    console.log('\n🎉 Smart Audience Segments Created!');
    console.log('\n📊 Summary:');
    
    const totalAudienceMembers = await prisma.audienceMember.count();
    const totalAudienceGroups = await prisma.audienceGroup.count();
    
    console.log(`   📧 Total Audience Groups: ${totalAudienceGroups}`);
    console.log(`   👥 Total Audience Members: ${totalAudienceMembers}`);
    console.log(`   🏢 Big Corporations Filtered: ${bigCorpCount}`);
    console.log(`   👤 Personal Names Filtered: ${personalNameCount}`);
    console.log(`   📧 No Email Filtered: ${noEmailCount}`);
    
    console.log('\n📋 Audience Groups Created:');
    const groups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    groups.forEach(group => {
      console.log(`   • ${group.name}: ${group._count.members} businesses`);
    });

    // Show some examples from each category
    console.log('\n📋 Sample Businesses by Category:');
    for (const [category, { group }] of audienceGroupMap) {
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
    console.error('❌ Error creating audience segments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSmartAudienceSegments();


