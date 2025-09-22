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
  'costco', 'ikea', 'best buy', 'future shop', 'staples', 'indigo', 'chapters'
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

// Business indicators
const BUSINESS_INDICATORS = [
  'inc', 'ltd', 'corp', 'company', 'co', 'llc', 'group', 'associates', 'services',
  'solutions', 'systems', 'technologies', 'consulting', 'enterprises', 'holdings',
  'ventures', 'partners', 'international', 'canada', 'north', 'northern'
];

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

function hasBusinessIndicator(name: string): boolean {
  const nameLower = name.toLowerCase();
  return BUSINESS_INDICATORS.some(indicator => nameLower.includes(indicator));
}

function categorizeBusiness(business: any): string {
  const name = business.name || '';
  const email = business.contact?.primaryEmail || '';
  const industry = business.industry || '';
  
  // Filter out big corporations
  if (isBigCorporation(name, email)) {
    return 'BIG_CORPORATIONS';
  }
  
  // Filter out personal names and random entries
  if (isPersonalName(name) || !hasBusinessIndicator(name)) {
    return 'PERSONAL_NAMES';
  }
  
  // Categorize by industry
  const industryLower = industry.toLowerCase();
  
  if (industryLower.includes('construction') || industryLower.includes('building')) {
    return 'CONSTRUCTION_BUILDING';
  }
  
  if (industryLower.includes('mining') || industryLower.includes('natural resources')) {
    return 'MINING_NATURAL_RESOURCES';
  }
  
  if (industryLower.includes('transportation') || industryLower.includes('logistics')) {
    return 'TRANSPORTATION_LOGISTICS';
  }
  
  if (industryLower.includes('food') || industryLower.includes('beverage') || industryLower.includes('restaurant')) {
    return 'FOOD_BEVERAGE';
  }
  
  if (industryLower.includes('professional services') || industryLower.includes('consulting')) {
    return 'PROFESSIONAL_SERVICES';
  }
  
  if (industryLower.includes('technology') || industryLower.includes('business services')) {
    return 'TECHNOLOGY_BUSINESS_SERVICES';
  }
  
  if (industryLower.includes('healthcare') || industryLower.includes('wellness')) {
    return 'HEALTHCARE_WELLNESS';
  }
  
  if (industryLower.includes('retail') || industryLower.includes('entertainment')) {
    return 'RETAIL_ENTERTAINMENT';
  }
  
  if (industryLower.includes('hospitality') || industryLower.includes('personal care')) {
    return 'HOSPITALITY_PERSONAL_CARE';
  }
  
  if (industryLower.includes('financial') || industryLower.includes('legal')) {
    return 'FINANCIAL_LEGAL_SERVICES';
  }
  
  // Default to other industries
  return 'OTHER_INDUSTRIES';
}

async function createIntelligentAudienceSegments() {
  console.log('🧠 Creating Intelligent Audience Segments...\n');

  try {
    // 1. Fetch all businesses from LeadMine
    console.log('📧 Fetching businesses from LeadMine...');
    const { data: leadMineBusinesses } = await fetchLeadMineBusinesses({
      limit: 2000,
      createMissing: false
    });

    if (!leadMineBusinesses || leadMineBusinesses.length === 0) {
      console.log('❌ No businesses found in LeadMine');
      return;
    }

    console.log(`📊 Found ${leadMineBusinesses.length} businesses in LeadMine`);

    // 2. Filter and categorize businesses
    console.log('\n🔍 Categorizing businesses...');
    const categorizedBusinesses = new Map<string, any[]>();
    
    let bigCorpCount = 0;
    let personalNameCount = 0;
    
    for (const business of leadMineBusinesses) {
      if (!business.name || !business.contact?.primaryEmail) {
        continue;
      }
      
      const category = categorizeBusiness(business);
      
      if (category === 'BIG_CORPORATIONS') {
        bigCorpCount++;
        continue;
      }
      
      if (category === 'PERSONAL_NAMES') {
        personalNameCount++;
        continue;
      }
      
      if (!categorizedBusinesses.has(category)) {
        categorizedBusinesses.set(category, []);
      }
      
      categorizedBusinesses.get(category)!.push(business);
    }

    console.log(`\n📊 Categorization Results:`);
    console.log(`   🏢 Big Corporations (filtered out): ${bigCorpCount}`);
    console.log(`   👤 Personal Names (filtered out): ${personalNameCount}`);
    console.log(`   ✅ Valid Businesses: ${leadMineBusinesses.length - bigCorpCount - personalNameCount}`);

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
              personalNames: false
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
              originalLeadMineData: business
            }
          }
        });
      }
      
      console.log(`   ✅ Added ${businesses.length} members to ${group.name}`);
    }

    // 5. Summary
    console.log('\n🎉 Intelligent Audience Segments Created!');
    console.log('\n📊 Summary:');
    
    const totalAudienceMembers = await prisma.audienceMember.count();
    const totalAudienceGroups = await prisma.audienceGroup.count();
    
    console.log(`   📧 Total Audience Groups: ${totalAudienceGroups}`);
    console.log(`   👥 Total Audience Members: ${totalAudienceMembers}`);
    console.log(`   🏢 Big Corporations Filtered: ${bigCorpCount}`);
    console.log(`   👤 Personal Names Filtered: ${personalNameCount}`);
    
    console.log('\n📋 Audience Groups Created:');
    const groups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      }
    });
    
    groups.forEach(group => {
      console.log(`   • ${group.name}: ${group._count.members} businesses`);
    });

  } catch (error) {
    console.error('❌ Error creating audience segments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createIntelligentAudienceSegments();

