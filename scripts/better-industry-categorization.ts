#!/usr/bin/env tsx

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { fetchLeadMineBusinesses } from '@/lib/leadMine';

const prisma = new PrismaClient();

async function betterIndustryCategorization() {
  console.log('🔍 Better Industry Categorization - Analyzing All Businesses...\n');

  // 1. Get ALL businesses from LeadMine with pagination
  console.log('📊 Fetching ALL businesses from LeadMine...');
  
  let allBusinesses: any[] = [];
  let cursor: string | null = null;
  let pageCount = 0;
  const pageSize = 200;

  // Fetch all pages
  do {
    pageCount++;
    console.log(`📄 Fetching page ${pageCount} (limit: ${pageSize}${cursor ? `, cursor: ${cursor.substring(0, 20)}...` : ''})`);
    
    const response = await fetchLeadMineBusinesses({
      limit: pageSize,
      cursor: cursor || undefined,
      hasEmail: true,
      createMissing: false
    });

    const businesses = response.data || [];
    allBusinesses = allBusinesses.concat(businesses);
    
    console.log(`   📊 Page ${pageCount}: ${businesses.length} businesses`);
    console.log(`   📊 Total so far: ${allBusinesses.length} businesses`);
    
    cursor = response.pagination?.nextCursor || null;
    
  } while (cursor);

  console.log(`\n📊 TOTAL FETCHED: ${allBusinesses.length} businesses from ${pageCount} pages`);

  // Filter businesses with primary emails
  const businessesWithEmails = allBusinesses.filter(b => 
    b.contact?.primaryEmail && b.name
  );

  console.log(`📧 ${businessesWithEmails.length} businesses have primary emails`);

  // 2. Enhanced industry categorization with better keyword matching
  console.log('\n🏭 Enhanced industry categorization...');
  
  const industryCategories = {
    'Construction & Building': [],
    'Mining & Resources': [],
    'Agriculture & Forestry': [],
    'Retail & Commerce': [],
    'Food & Hospitality': [],
    'Professional Services': [],
    'Health & Wellness': [],
    'Technology & Communications': [],
    'Transportation & Logistics': [],
    'Tourism & Recreation': [],
    'Manufacturing & Production': [],
    'Other Industries': []
  };

  // Enhanced keyword lists for each industry
  const industryKeywords = {
    'Construction & Building': [
      'construction', 'building', 'contractor', 'roofing', 'plumbing', 'electrical',
      'welding', 'carpentry', 'excavation', 'concrete', 'drywall', 'painting',
      'flooring', 'hvac', 'landscaping', 'paving', 'steel', 'lumber', 'supply',
      'home', 'renovation', 'remodel', 'repair', 'maintenance', 'construction',
      'builder', 'general contractor', 'subcontractor', 'concrete', 'masonry',
      'insulation', 'siding', 'windows', 'doors', 'kitchen', 'bathroom'
    ],
    'Mining & Resources': [
      'mining', 'mineral', 'quarry', 'aggregate', 'coal', 'metal', 'gold', 'silver',
      'copper', 'zinc', 'lead', 'iron', 'ore', 'mine', 'drilling', 'exploration',
      'extraction', 'processing', 'smelting', 'refining', 'geological', 'surveying',
      'equipment', 'machinery', 'heavy', 'industrial', 'mineral', 'resource'
    ],
    'Agriculture & Forestry': [
      'forest', 'forestry', 'logging', 'lumber', 'timber', 'wood', 'tree', 'lumber',
      'agriculture', 'farm', 'farming', 'crop', 'livestock', 'dairy', 'ranch',
      'harvest', 'seed', 'fertilizer', 'pesticide', 'tractor', 'equipment',
      'greenhouse', 'nursery', 'garden', 'landscape', 'irrigation', 'soil'
    ],
    'Retail & Commerce': [
      'store', 'shop', 'retail', 'market', 'supply', 'sales', 'outlet', 'mart',
      'boutique', 'department', 'grocery', 'pharmacy', 'hardware', 'furniture',
      'clothing', 'apparel', 'shoes', 'jewelry', 'electronics', 'appliance',
      'automotive', 'parts', 'accessories', 'gift', 'card', 'trading', 'wholesale'
    ],
    'Food & Hospitality': [
      'restaurant', 'hotel', 'cafe', 'bar', 'food', 'catering', 'inn', 'lodge',
      'motel', 'pub', 'grill', 'diner', 'pizza', 'sandwich', 'coffee', 'tea',
      'bakery', 'delicatessen', 'grocery', 'supermarket', 'convenience', 'store',
      'hospitality', 'accommodation', 'bed', 'breakfast', 'resort', 'campground'
    ],
    'Professional Services': [
      'law', 'legal', 'attorney', 'lawyer', 'accounting', 'accountant', 'financial',
      'consulting', 'consultant', 'advisory', 'adviser', 'insurance', 'real estate',
      'property', 'management', 'property management', 'broker', 'agent', 'realtor',
      'investment', 'banking', 'credit', 'loan', 'mortgage', 'tax', 'bookkeeping',
      'audit', 'planning', 'wealth', 'financial planning', 'estate', 'trust'
    ],
    'Health & Wellness': [
      'medical', 'health', 'clinic', 'dental', 'dentist', 'pharmacy', 'pharmacist',
      'therapy', 'therapist', 'wellness', 'care', 'hospital', 'physician', 'doctor',
      'nurse', 'nursing', 'mental', 'psychology', 'psychiatrist', 'counseling',
      'rehabilitation', 'physical', 'occupational', 'speech', 'chiropractic',
      'optometry', 'veterinary', 'vet', 'animal', 'health', 'fitness', 'gym'
    ],
    'Technology & Communications': [
      'tech', 'technology', 'computer', 'software', 'digital', 'web', 'internet',
      'telecom', 'telecommunications', 'communications', 'network', 'system',
      'data', 'information', 'security', 'cyber', 'electronic', 'electronics',
      'engineering', 'programming', 'development', 'design', 'graphic', 'media',
      'broadcasting', 'radio', 'television', 'cable', 'satellite', 'wireless'
    ],
    'Transportation & Logistics': [
      'transport', 'transportation', 'trucking', 'truck', 'shipping', 'logistics',
      'freight', 'delivery', 'hauling', 'haul', 'moving', 'relocation', 'courier',
      'express', 'parcel', 'package', 'cargo', 'warehouse', 'storage', 'distribution',
      'supply chain', 'fleet', 'vehicle', 'automotive', 'repair', 'service'
    ],
    'Tourism & Recreation': [
      'tour', 'tourism', 'travel', 'adventure', 'outdoor', 'recreation', 'entertainment',
      'attraction', 'park', 'museum', 'gallery', 'theater', 'theatre', 'cinema',
      'sports', 'fitness', 'gym', 'pool', 'swimming', 'skiing', 'snowboarding',
      'hiking', 'camping', 'fishing', 'hunting', 'guide', 'excursion', 'cruise'
    ],
    'Manufacturing & Production': [
      'manufacturing', 'manufacturer', 'production', 'factory', 'plant', 'industrial',
      'processing', 'assembly', 'fabrication', 'machining', 'tooling', 'equipment',
      'machinery', 'automation', 'quality', 'control', 'inspection', 'testing',
      'packaging', 'distribution', 'supply', 'component', 'part', 'product'
    ]
  };

  // Categorize businesses with enhanced matching
  businessesWithEmails.forEach(business => {
    const name = business.name.toLowerCase();
    const address = business.address?.toLowerCase() || '';
    const combined = `${name} ${address}`;
    
    let categorized = false;
    
    // Check each industry
    for (const [industryName, keywords] of Object.entries(industryKeywords)) {
      for (const keyword of keywords) {
        if (combined.includes(keyword)) {
          industryCategories[industryName].push(business);
          categorized = true;
          break;
        }
      }
      if (categorized) break;
    }
    
    // If not categorized, add to Other Industries
    if (!categorized) {
      industryCategories['Other Industries'].push(business);
    }
  });

  // 3. Show categorization results
  console.log('\n📊 Industry Categorization Results:');
  let totalCategorized = 0;
  for (const [industryName, businesses] of Object.entries(industryCategories)) {
    console.log(`📊 ${industryName}: ${businesses.length} businesses`);
    totalCategorized += businesses.length;
  }
  console.log(`\n📈 Total categorized: ${totalCategorized}`);
  console.log(`📈 Original count: ${businessesWithEmails.length}`);
  console.log(`📈 Difference: ${businessesWithEmails.length - totalCategorized}`);

  // 4. Create industry-based audience groups
  console.log('\n👥 Creating industry-based audience groups...');
  
  for (const [industryName, businesses] of Object.entries(industryCategories)) {
    if (businesses.length > 0) {
      console.log(`\n📊 Creating ${industryName}: ${businesses.length} businesses`);
      
      // Create audience group
      const audienceGroup = await prisma.audienceGroup.create({
        data: {
          name: `${industryName} - Northern BC`,
          description: `${businesses.length} ${industryName.toLowerCase()} businesses in Northern BC`,
          criteria: {
            industry: industryName,
            region: 'Northern BC',
            source: 'LeadMine',
            keywordCount: businesses.length
          }
        }
      });

      // Add businesses to group in batches
      const batchSize = 50;
      let imported = 0;
      
      for (let i = 0; i < businesses.length; i += batchSize) {
        const batch = businesses.slice(i, i + batchSize);
        
        for (const business of batch) {
          try {
            await prisma.audienceMember.create({
              data: {
                groupId: audienceGroup.id,
                businessId: business.id,
                businessName: business.name,
                primaryEmail: business.contact!.primaryEmail!,
                secondaryEmail: business.contact?.alternateEmail || null,
                tagsSnapshot: business.contact?.tags || [],
                inviteToken: business.invite?.token || null,
                meta: {
                  source: 'leadmine-industry-categorized',
                  industry: industryName,
                  address: business.address,
                  website: business.website,
                  contactPerson: business.contact?.contactPerson,
                  leadStatus: business.lead?.status,
                  leadPriority: business.lead?.priority,
                  originalName: business.name
                },
                unsubscribed: false
              }
            });
            imported++;
          } catch (error) {
            console.error(`Error importing ${business.name}:`, error);
          }
        }
      }
      
      console.log(`   ✅ Created group: ${audienceGroup.name} (${imported} members)`);
    }
  }

  // 5. Show final summary
  console.log('\n🎉 INDUSTRY-BASED AUDIENCES CREATED!');
  console.log('\n📊 Final Audience Summary:');
  
  const finalGroups = await prisma.audienceGroup.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { name: 'asc' }
  });

  let totalMembers = 0;
  for (const group of finalGroups) {
    console.log(`📊 ${group.name}: ${group._count.members} members`);
    totalMembers += group._count.members;
  }

  console.log(`\n📈 Total: ${totalMembers} businesses organized by industry`);
  console.log(`📈 Original: ${businessesWithEmails.length} businesses from LeadMine`);
  console.log(`📈 Success rate: ${Math.round((totalMembers / businessesWithEmails.length) * 100)}%`);

  console.log('\n🚀 Next Steps:');
  console.log('1. Review the industry groups at: http://localhost:3003/admin/campaign');
  console.log('2. Create industry-specific email campaigns');
  console.log('3. Tailor messaging to each industry\'s predictive AI needs');
}

betterIndustryCategorization()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
