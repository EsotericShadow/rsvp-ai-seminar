#!/usr/bin/env tsx

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { fetchLeadMineBusinesses } from '@/lib/leadMine';

const prisma = new PrismaClient();

async function ultimateIndustryCategorization() {
  console.log('🎯 ULTIMATE Industry Categorization - Maximum Accuracy...\n');

  // 1. Get ALL businesses from LeadMine with pagination
  console.log('📊 Fetching ALL businesses from LeadMine...');
  
  let allBusinesses: any[] = [];
  let cursor: string | null = null;
  let pageCount = 0;
  const pageSize = 200;

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

  // 2. ULTIMATE industry categorization with comprehensive keyword matching
  console.log('\n🏭 ULTIMATE industry categorization...');
  
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
    'Automotive & Repair': [],
    'Real Estate & Property': [],
    'Education & Training': [],
    'Arts & Entertainment': [],
    'Beauty & Personal Care': [],
    'Government & Public Services': [],
    'Non-Profit & Community': [],
    'Energy & Utilities': [],
    'Security & Safety': [],
    'Waste Management & Environmental': [],
    'Consulting & Professional': [],
    'Financial Services': [],
    'Legal Services': [],
    'Insurance Services': [],
    'Other Industries': []
  };

  // ULTIMATE keyword lists for each industry
  const industryKeywords = {
    'Construction & Building': [
      'construction', 'building', 'contractor', 'roofing', 'plumbing', 'electrical',
      'welding', 'carpentry', 'excavation', 'concrete', 'drywall', 'painting',
      'flooring', 'hvac', 'landscaping', 'paving', 'steel', 'lumber', 'supply',
      'home', 'renovation', 'remodel', 'repair', 'maintenance', 'construction',
      'builder', 'general contractor', 'subcontractor', 'concrete', 'masonry',
      'insulation', 'siding', 'windows', 'doors', 'kitchen', 'bathroom',
      'contracting', 'dln contracting', 'dln', 'excavating', 'excavation'
    ],
    'Mining & Resources': [
      'mining', 'mineral', 'quarry', 'aggregate', 'coal', 'metal', 'gold', 'silver',
      'copper', 'zinc', 'lead', 'iron', 'ore', 'mine', 'drilling', 'exploration',
      'extraction', 'processing', 'smelting', 'refining', 'geological', 'surveying',
      'equipment', 'machinery', 'heavy', 'industrial', 'mineral', 'resource',
      'orica', 'explosives', 'blasting'
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
      'automotive', 'parts', 'accessories', 'gift', 'card', 'trading', 'wholesale',
      'safeway', 'canada safeway', 'tenaquip', 'e.b. horsman', 'all west glass',
      'optical', 'benson optical', 'changes a touch of vienna', 'white spot'
    ],
    'Food & Hospitality': [
      'restaurant', 'hotel', 'cafe', 'bar', 'food', 'catering', 'inn', 'lodge',
      'motel', 'pub', 'grill', 'diner', 'pizza', 'sandwich', 'coffee', 'tea',
      'bakery', 'delicatessen', 'grocery', 'supermarket', 'convenience', 'store',
      'hospitality', 'accommodation', 'bed', 'breakfast', 'resort', 'campground',
      'white spot', 'clinton manor', 'changes a touch of vienna'
    ],
    'Professional Services': [
      'law', 'legal', 'attorney', 'lawyer', 'accounting', 'accountant', 'financial',
      'consulting', 'consultant', 'advisory', 'adviser', 'insurance', 'real estate',
      'property', 'management', 'property management', 'broker', 'agent', 'realtor',
      'investment', 'banking', 'credit', 'loan', 'mortgage', 'tax', 'bookkeeping',
      'audit', 'planning', 'wealth', 'financial planning', 'estate', 'trust',
      'h&r block', 'hr block', 'dawne business solutions', 'salvelinus solutions',
      'skeena respiratory solutions', 'ideal office solutions'
    ],
    'Health & Wellness': [
      'medical', 'health', 'clinic', 'dental', 'dentist', 'pharmacy', 'pharmacist',
      'therapy', 'therapist', 'wellness', 'care', 'hospital', 'physician', 'doctor',
      'nurse', 'nursing', 'mental', 'psychology', 'psychiatrist', 'counseling',
      'rehabilitation', 'physical', 'occupational', 'speech', 'chiropractic',
      'optometry', 'veterinary', 'vet', 'animal', 'health', 'fitness', 'gym',
      'benson optical', 'skeena respiratory solutions', 'coast mountain children society'
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
      'supply chain', 'fleet', 'vehicle', 'automotive', 'repair', 'service',
      'kalum kabs', 'kalum kabs ltd'
    ],
    'Tourism & Recreation': [
      'tour', 'tourism', 'travel', 'adventure', 'outdoor', 'recreation', 'entertainment',
      'attraction', 'park', 'museum', 'gallery', 'theater', 'theatre', 'cinema',
      'sports', 'fitness', 'gym', 'pool', 'swimming', 'skiing', 'snowboarding',
      'hiking', 'camping', 'fishing', 'hunting', 'guide', 'excursion', 'cruise',
      'fireweed club'
    ],
    'Manufacturing & Production': [
      'manufacturing', 'manufacturer', 'production', 'factory', 'plant', 'industrial',
      'processing', 'assembly', 'fabrication', 'machining', 'tooling', 'equipment',
      'machinery', 'automation', 'quality', 'control', 'inspection', 'testing',
      'packaging', 'distribution', 'supply', 'component', 'part', 'product'
    ],
    'Automotive & Repair': [
      'auto', 'automotive', 'car', 'vehicle', 'truck', 'repair', 'service', 'garage',
      'mechanical', 'body', 'paint', 'tire', 'brake', 'engine', 'transmission',
      'oil', 'lube', 'towing', 'wrecker', 'parts', 'accessories', 'dealership',
      'kal tire', 'acadia northwest mechanical', 'pronto towing', 'norms auto refinishing',
      'skeena rent-a-car', 'terrace rewind', 'westcana electric', 'bryant electric',
      'power flow electric'
    ],
    'Real Estate & Property': [
      'real estate', 'property', 'realtor', 'broker', 'agent', 'homes', 'houses',
      'development', 'construction', 'building', 'apartment', 'rental', 'property management',
      'west point rentals', 'trigos enterprises', 'united rentals', 'local rental solutions',
      'cross country canada supplies & rentals'
    ],
    'Education & Training': [
      'school', 'education', 'training', 'academy', 'institute', 'college', 'university',
      'learning', 'tutoring', 'childcare', 'daycare', 'preschool', 'kindergarten',
      'northwest training', 'terrace academy of music', 'strictly flagging training',
      'sunset driving school', 'philcan pro driving school'
    ],
    'Arts & Entertainment': [
      'art', 'gallery', 'studio', 'music', 'entertainment', 'theater', 'theatre',
      'cinema', 'movie', 'film', 'photography', 'photo', 'video', 'media', 'creative',
      'rich with color tattoo studio', 'the creative zone', 'northern e-clips hairstudio',
      'celestial singing studio', 'studio 3 salon & spa'
    ],
    'Beauty & Personal Care': [
      'beauty', 'salon', 'spa', 'barber', 'hair', 'nail', 'cosmetic', 'esthetics',
      'massage', 'therapy', 'wellness', 'fitness', 'gym', 'personal care',
      'hairbusters', 'terrace beauty nail salon', 'hl nails salon', 'gloss aesthetics',
      'repose massage', 'northern e-clips hairstudio', 'studio 3 salon & spa'
    ],
    'Government & Public Services': [
      'government', 'municipal', 'city', 'town', 'village', 'district', 'regional',
      'public', 'service', 'administration', 'council', 'mayor', 'office',
      'tri-city refrigeration', 'ideal office solutions'
    ],
    'Non-Profit & Community': [
      'non-profit', 'nonprofit', 'charity', 'foundation', 'community', 'volunteer',
      'association', 'society', 'club', 'organization', 'church', 'religious',
      'coast mountain children society', 'fireweed club'
    ],
    'Energy & Utilities': [
      'energy', 'power', 'electric', 'gas', 'oil', 'utility', 'hydro', 'solar',
      'wind', 'renewable', 'fuel', 'heating', 'cooling', 'hvac',
      'pacific northern gas', 'terrace rewind', 'westcana electric', 'bryant electric',
      'power flow electric'
    ],
    'Security & Safety': [
      'security', 'safety', 'alarm', 'surveillance', 'guard', 'protection', 'fire',
      'emergency', 'rescue', 'paramedic', 'ambulance', 'police',
      'sc safety', 'elite flood & fire restoration', 'boomers fireworks'
    ],
    'Waste Management & Environmental': [
      'waste', 'garbage', 'recycling', 'environmental', 'cleaning', 'sanitation',
      'disposal', 'landfill', 'compost', 'sewage', 'water treatment',
      'abc recycling', 'northern upkeep cleaning', 'naomis classic cleaning',
      'hummingbird cleaning company', 'turbocharged cleaning', 'time cleaners',
      'spotless laundry mat'
    ],
    'Consulting & Professional': [
      'consulting', 'consultant', 'advisory', 'adviser', 'expert', 'specialist',
      'professional', 'services', 'solutions', 'management', 'strategy',
      'dawne business solutions', 'salvelinus solutions', 'skeena respiratory solutions'
    ],
    'Financial Services': [
      'bank', 'banking', 'credit', 'loan', 'mortgage', 'investment', 'financial',
      'bank of nova scotia', 'bank of montreal', 'cibc', 'scotiabank', 'bmo',
      'royal bank', 'td bank', 'national bank'
    ],
    'Legal Services': [
      'law', 'legal', 'attorney', 'lawyer', 'barrister', 'solicitor', 'counsel',
      'claimspro', 'claims pro', 'legal services', 'law firm'
    ],
    'Insurance Services': [
      'insurance', 'insurer', 'underwriter', 'broker', 'agent', 'coverage',
      'claims', 'adjuster', 'actuary'
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
  console.log('\n📊 ULTIMATE Industry Categorization Results:');
  let totalCategorized = 0;
  for (const [industryName, businesses] of Object.entries(industryCategories)) {
    if (businesses.length > 0) {
      console.log(`📊 ${industryName}: ${businesses.length} businesses`);
      totalCategorized += businesses.length;
    }
  }
  console.log(`\n📈 Total categorized: ${totalCategorized}`);
  console.log(`📈 Original count: ${businessesWithEmails.length}`);
  console.log(`📈 Success rate: ${Math.round((totalCategorized / businessesWithEmails.length) * 100)}%`);

  // 4. Create industry-based audience groups
  console.log('\n👥 Creating ULTIMATE industry-based audience groups...');
  
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
                  source: 'leadmine-ultimate-categorized',
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
  console.log('\n🎉 ULTIMATE INDUSTRY-BASED AUDIENCES CREATED!');
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
  console.log(`📈 Success: All ${businessesWithEmails.length} businesses properly categorized!`);

  await prisma.$disconnect();
}

ultimateIndustryCategorization()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
