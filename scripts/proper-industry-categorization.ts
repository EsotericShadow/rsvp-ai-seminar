import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive and accurate industry categorization
const PROPER_INDUSTRY_CATEGORIZATION = {
  'CONSTRUCTION_CONTRACTING': [
    'construction', 'contracting', 'contractor', 'contractors', 'building', 'builders',
    'excavating', 'excavation', 'excavator', 'welding', 'welder', 'welded',
    'drywall', 'masonry', 'roofing', 'roofer', 'plumbing', 'plumber', 'heating',
    'electrical', 'electric', 'electrician', 'hvac', 'refrigeration', 'refrigerator',
    'insulation', 'spray foam', 'foam', 'carpentry', 'carpenter', 'framing',
    'concrete', 'cement', 'foundation', 'foundations', 'renovation', 'renovations',
    'remodeling', 'remodel', 'restoration', 'restore', 'repair', 'repairs',
    'maintenance', 'maintain', 'landscaping', 'landscape', 'landscaper',
    'paving', 'asphalt', 'driveway', 'sidewalk', 'decking', 'deck', 'fencing',
    'fence', 'fencing', 'siding', 'gutters', 'gutter', 'windows', 'doors',
    'flooring', 'floors', 'floor', 'tile', 'tiling', 'painting', 'painter',
    'paint', 'interior design', 'design', 'architectural', 'architect',
    'engineering', 'engineer', 'surveying', 'surveyor', 'civil', 'structural',
    'mechanical', 'mechanics', 'industrial', 'commercial', 'residential',
    'development', 'developments', 'developer', 'developers', 'general contractor',
    'gc', 'subcontractor', 'sub', 'trades', 'trade', 'craftsman', 'craftsmanship'
  ],
  
  'AUTOMOTIVE_SERVICES': [
    'auto', 'automotive', 'car', 'cars', 'vehicle', 'vehicles', 'truck', 'trucks',
    'motor', 'motors', 'engine', 'engines', 'transmission', 'transmissions',
    'brake', 'brakes', 'braking', 'tire', 'tires', 'wheel', 'wheels', 'alignment',
    'balancing', 'balance', 'oil change', 'lube', 'lubrication', 'service',
    'repair', 'repairs', 'mechanic', 'mechanics', 'garage', 'garages', 'shop',
    'dealership', 'dealerships', 'dealer', 'dealers', 'sales', 'leasing', 'lease',
    'rental', 'rent', 'renting', 'towing', 'tow', 'towing', 'recovery', 'recover',
    'collision', 'collision repair', 'body shop', 'bodywork', 'detailing', 'detail',
    'wash', 'washing', 'cleaning', 'auto glass', 'windshield', 'windshields',
    'exhaust', 'muffler', 'mufflers', 'performance', 'tuning', 'custom', 'customization'
  ],
  
  'MANUFACTURING_INDUSTRIAL': [
    'manufacturing', 'manufacturer', 'manufacturers', 'production', 'produce',
    'fabrication', 'fabricate', 'fabricated', 'machining', 'machine', 'machines',
    'machinist', 'machinists', 'tooling', 'tools', 'tool', 'equipment', 'machinery',
    'industrial', 'industry', 'industries', 'factory', 'factories', 'plant', 'plants',
    'facility', 'facilities', 'workshop', 'workshops', 'shop', 'shops', 'mill', 'mills',
    'foundry', 'foundries', 'steel', 'metal', 'metals', 'aluminum', 'copper', 'brass',
    'plastic', 'plastics', 'composite', 'composites', 'assembly', 'assembling',
    'precision', 'precision manufacturing', 'cnc', 'automation', 'automated',
    'robotics', 'robotic', 'quality control', 'qc', 'inspection', 'inspections',
    'testing', 'test', 'tests', 'calibration', 'calibrate', 'certification', 'certified'
  ],
  
  'HEALTHCARE_MEDICAL': [
    'medical', 'medicine', 'healthcare', 'health care', 'health', 'clinic', 'clinics',
    'hospital', 'hospitals', 'doctor', 'doctors', 'physician', 'physicians', 'nurse',
    'nursing', 'dental', 'dentist', 'dentists', 'orthodontist', 'orthodontics',
    'denture', 'dentures', 'oral', 'oral surgery', 'surgery', 'surgical', 'surgeon',
    'surgeons', 'pharmacy', 'pharmacist', 'pharmacists', 'drug', 'drugs', 'medication',
    'medications', 'therapy', 'therapist', 'therapists', 'physical therapy', 'pt',
    'occupational therapy', 'ot', 'speech therapy', 'massage therapy', 'massage',
    'chiropractic', 'chiropractor', 'chiropractors', 'acupuncture', 'acupuncturist',
    'naturopathic', 'naturopath', 'naturopaths', 'holistic', 'wellness', 'wellbeing',
    'mental health', 'psychology', 'psychologist', 'psychologists', 'counseling',
    'counselling', 'counselor', 'counsellor', 'psychiatry', 'psychiatrist',
    'psychiatrists', 'optometry', 'optometrist', 'optometrists', 'eye care', 'vision',
    'hearing', 'audiology', 'audiologist', 'audiologists', 'hearing aids', 'lab',
    'laboratory', 'laboratories', 'labs', 'testing', 'diagnostic', 'diagnosis',
    'x-ray', 'imaging', 'ultrasound', 'mri', 'ct', 'scan', 'scans', 'pathology',
    'pathologist', 'pathologists', 'blood', 'urine', 'sample', 'samples'
  ],
  
  'RETAIL_SHOPPING': [
    'retail', 'store', 'stores', 'shop', 'shops', 'shopping', 'mall', 'malls',
    'boutique', 'boutiques', 'department', 'departments', 'clothing', 'apparel',
    'fashion', 'fashions', 'shoes', 'footwear', 'jewelry', 'jewellery', 'jewellers',
    'jeweller', 'accessories', 'accessory', 'electronics', 'electronic', 'computer',
    'computers', 'phone', 'phones', 'mobile', 'cell', 'tablet', 'tablets',
    'appliance', 'appliances', 'furniture', 'home', 'garden', 'gardening', 'tools',
    'hardware', 'sporting goods', 'sports', 'recreation', 'toys', 'books', 'bookstore',
    'stationery', 'stationary', 'office supplies', 'supplies', 'gift', 'gifts',
    'gift shop', 'convenience', 'convenience store', 'dollar store', 'variety',
    'discount', 'outlet', 'outlets', 'clearance', 'sale', 'sales', 'merchandise',
    'product', 'products', 'inventory', 'stock', 'wholesale', 'wholesaler'
  ],
  
  'FOOD_RESTAURANTS': [
    'restaurant', 'restaurants', 'food', 'dining', 'dine', 'cafe', 'café', 'coffee',
    'coffee shop', 'bakery', 'bakeries', 'deli', 'delicatessen', 'pizza', 'pizzeria',
    'burger', 'burgers', 'sandwich', 'sandwiches', 'sub', 'subs', 'subway',
    'fast food', 'casual dining', 'fine dining', 'bar', 'bars', 'pub', 'pubs',
    'tavern', 'taverns', 'lounge', 'lounges', 'grill', 'grills', 'steakhouse',
    'seafood', 'fish', 'chicken', 'italian', 'chinese', 'mexican', 'thai', 'indian',
    'japanese', 'sushi', 'buffet', 'buffets', 'catering', 'caterer', 'caterers',
    'catering service', 'event', 'events', 'banquet', 'banquets', 'wedding',
    'weddings', 'party', 'parties', 'kitchen', 'chef', 'chefs', 'cook', 'cooking',
    'cuisine', 'menu', 'menus', 'takeout', 'take out', 'delivery', 'deliver',
    'catering', 'food service', 'hospitality', 'hotel', 'hotels', 'motel', 'motels',
    'inn', 'inns', 'accommodation', 'accommodations', 'lodging', 'resort', 'resorts'
  ],
  
  'PROFESSIONAL_SERVICES': [
    'consulting', 'consultant', 'consultants', 'advisory', 'advisor', 'advisors',
    'professional services', 'business services', 'management', 'manager', 'managers',
    'administration', 'administrative', 'administrator', 'administrators', 'executive',
    'executives', 'corporate', 'corporation', 'corporations', 'company', 'companies',
    'enterprise', 'enterprises', 'firm', 'firms', 'agency', 'agencies', 'bureau',
    'bureaus', 'institute', 'institutes', 'organization', 'organizations', 'association',
    'associations', 'society', 'societies', 'foundation', 'foundations', 'group',
    'groups', 'team', 'teams', 'staff', 'personnel', 'human resources', 'hr',
    'recruitment', 'recruit', 'recruiter', 'recruiters', 'training', 'trainer',
    'trainers', 'education', 'educational', 'instructor', 'instructors', 'teacher',
    'teachers', 'coach', 'coaches', 'coaching', 'mentor', 'mentors', 'mentoring',
    'development', 'develop', 'developer', 'developers', 'planning', 'planner',
    'planners', 'strategy', 'strategic', 'strategist', 'strategists', 'analysis',
    'analyst', 'analysts', 'research', 'researcher', 'researchers', 'market research',
    'marketing', 'marketer', 'marketers', 'advertising', 'advertiser', 'advertisers',
    'public relations', 'pr', 'communications', 'communication', 'media', 'promotion',
    'promotional', 'sales', 'seller', 'sellers', 'selling', 'business development'
  ],
  
  'FINANCIAL_SERVICES': [
    'financial', 'finance', 'financing', 'bank', 'banks', 'banking', 'credit union',
    'credit unions', 'investment', 'investments', 'investor', 'investors', 'investing',
    'advisor', 'advisors', 'advisory', 'wealth management', 'wealth', 'portfolio',
    'portfolios', 'asset management', 'assets', 'funds', 'fund', 'mutual funds',
    'insurance', 'insurer', 'insurers', 'underwriter', 'underwriters', 'underwriting',
    'broker', 'brokers', 'brokerage', 'trading', 'trader', 'traders', 'securities',
    'security', 'stocks', 'stock', 'bonds', 'bond', 'equity', 'equities', 'capital',
    'venture capital', 'private equity', 'hedge fund', 'hedge funds', 'pension',
    'pensions', 'retirement', 'retirement planning', 'estate planning', 'estate',
    'tax', 'taxes', 'taxation', 'accounting', 'accountant', 'accountants', 'bookkeeping',
    'bookkeeper', 'bookkeepers', 'audit', 'auditing', 'auditor', 'auditors',
    'payroll', 'payroll services', 'payroll processing', 'billing', 'invoice',
    'invoicing', 'collections', 'collection', 'debt collection', 'credit', 'credits',
    'loan', 'loans', 'lending', 'lender', 'lenders', 'mortgage', 'mortgages',
    'real estate', 'property', 'properties', 'commercial real estate', 'residential',
    'leasing', 'lease', 'leases', 'rental', 'rentals', 'property management'
  ],
  
  'TRANSPORTATION_LOGISTICS': [
    'transportation', 'transport', 'transporting', 'logistics', 'logistic', 'shipping',
    'ship', 'shipping', 'freight', 'freight services', 'cargo', 'cargo services',
    'delivery', 'deliver', 'delivering', 'courier', 'couriers', 'express', 'express delivery',
    'mail', 'postal', 'post', 'packages', 'package', 'packaging', 'warehouse', 'warehouses',
    'storage', 'storing', 'distribution', 'distribute', 'distributing', 'supply chain',
    'supply', 'supplies', 'procurement', 'procure', 'procuring', 'inventory management',
    'inventory', 'stock', 'stocks', 'fulfillment', 'fulfill', 'fulfilling', 'order',
    'orders', 'ordering', 'dispatch', 'dispatching', 'dispatch service', 'trucking',
    'truck', 'trucks', 'trucking company', 'hauling', 'haul', 'hauling service',
    'moving', 'movers', 'moving company', 'relocation', 'relocate', 'relocating',
    'moving services', 'international', 'domestic', 'local', 'long distance', 'regional',
    'national', 'cross border', 'customs', 'customs clearance', 'import', 'imports',
    'export', 'exports', 'importing', 'exporting', 'trade', 'trading', 'commerce'
  ],
  
  'TECHNOLOGY_INFORMATION': [
    'technology', 'tech', 'information technology', 'it', 'computer', 'computers',
    'software', 'software development', 'programming', 'programmer', 'programmers',
    'developer', 'developers', 'development', 'web development', 'app development',
    'mobile development', 'database', 'databases', 'data', 'data management',
    'data analysis', 'analytics', 'business intelligence', 'bi', 'artificial intelligence',
    'ai', 'machine learning', 'ml', 'automation', 'automated', 'digital', 'digitization',
    'digitize', 'cybersecurity', 'security', 'network', 'networking', 'infrastructure',
    'cloud', 'cloud computing', 'saas', 'software as a service', 'platform', 'platforms',
    'system', 'systems', 'integration', 'integrate', 'integrating', 'api', 'apis',
    'website', 'websites', 'web design', 'web development', 'e-commerce', 'ecommerce',
    'online', 'internet', 'digital marketing', 'seo', 'search engine optimization',
    'social media', 'content management', 'cms', 'hosting', 'web hosting', 'server',
    'servers', 'server management', 'backup', 'backups', 'recovery', 'disaster recovery',
    'consulting', 'consultant', 'consultants', 'support', 'technical support',
    'help desk', 'maintenance', 'maintain', 'upgrades', 'upgrade', 'upgrading',
    'implementation', 'implement', 'implementing', 'training', 'trainer', 'trainers'
  ],
  
  'REAL_ESTATE_PROPERTY': [
    'real estate', 'realtor', 'realtors', 'realty', 'property', 'properties',
    'real estate agent', 'real estate agents', 'broker', 'brokers', 'brokerage',
    'brokerages', 'listing', 'listings', 'sale', 'sales', 'selling', 'buying',
    'purchase', 'purchasing', 'investment', 'investments', 'investor', 'investors',
    'development', 'developments', 'developer', 'developers', 'construction',
    'contractor', 'contractors', 'contracting', 'building', 'builders', 'build',
    'residential', 'commercial', 'industrial', 'retail', 'office', 'warehouse',
    'warehouses', 'land', 'lots', 'lot', 'acreage', 'acres', 'acre', 'farm',
    'farms', 'ranch', 'ranches', 'estate', 'estates', 'mansion', 'mansions',
    'condo', 'condos', 'condominium', 'condominiums', 'townhouse', 'townhouses',
    'apartment', 'apartments', 'rental', 'rentals', 'leasing', 'lease', 'leases',
    'property management', 'property manager', 'property managers', 'maintenance',
    'maintain', 'repair', 'repairs', 'renovation', 'renovations', 'remodeling',
    'remodel', 'restoration', 'restore', 'inspection', 'inspections', 'inspector',
    'inspectors', 'appraisal', 'appraisals', 'appraiser', 'appraisers', 'assessment',
    'assessments', 'assessor', 'assessors', 'valuation', 'valuations', 'evaluate',
    'evaluation', 'market analysis', 'market research', 'comparative market analysis',
    'cma', 'fsbo', 'for sale by owner', 'mls', 'multiple listing service'
  ],
  
  'ENTERTAINMENT_RECREATION': [
    'entertainment', 'entertain', 'recreation', 'recreational', 'leisure', 'leisure time',
    'fun', 'activities', 'activity', 'events', 'event', 'event planning', 'event planner',
    'event planners', 'party', 'parties', 'celebration', 'celebrations', 'festival',
    'festivals', 'concert', 'concerts', 'music', 'musical', 'band', 'bands',
    'orchestra', 'orchestras', 'symphony', 'symphonies', 'theater', 'theatre',
    'theaters', 'theatres', 'cinema', 'cinemas', 'movie', 'movies', 'film', 'films',
    'production', 'productions', 'producer', 'producers', 'director', 'directors',
    'actor', 'actors', 'actress', 'actresses', 'performer', 'performers', 'performance',
    'performances', 'show', 'shows', 'exhibition', 'exhibitions', 'gallery', 'galleries',
    'museum', 'museums', 'art', 'arts', 'artist', 'artists', 'artistic', 'creative',
    'creativity', 'design', 'designer', 'designers', 'photography', 'photographer',
    'photographers', 'videography', 'videographer', 'videographers', 'dance', 'dancing',
    'dancer', 'dancers', 'studio', 'studios', 'gym', 'gyms', 'fitness', 'fitness center',
    'fitness centre', 'health club', 'health clubs', 'sports', 'sport', 'athletic',
    'athletics', 'athlete', 'athletes', 'coach', 'coaches', 'coaching', 'training',
    'trainer', 'trainers', 'personal training', 'yoga', 'pilates', 'martial arts',
    'karate', 'taekwondo', 'judo', 'boxing', 'kickboxing', 'swimming', 'pool', 'pools',
    'tennis', 'golf', 'golfing', 'skiing', 'snowboarding', 'hiking', 'camping',
    'outdoor', 'adventure', 'adventures', 'tours', 'tour', 'touring', 'guide', 'guides',
    'travel', 'traveling', 'travelling', 'vacation', 'vacations', 'holiday', 'holidays'
  ],
  
  'EDUCATION_TRAINING': [
    'education', 'educational', 'school', 'schools', 'academy', 'academies',
    'university', 'universities', 'college', 'colleges', 'institute', 'institutes',
    'training', 'trainer', 'trainers', 'coaching', 'coach', 'coaches', 'mentoring',
    'mentor', 'mentors', 'tutoring', 'tutor', 'tutors', 'instruction', 'instructor',
    'instructors', 'teaching', 'teacher', 'teachers', 'professor', 'professors',
    'curriculum', 'curricula', 'course', 'courses', 'class', 'classes', 'lesson',
    'lessons', 'workshop', 'workshops', 'seminar', 'seminars', 'conference',
    'conferences', 'certification', 'certifications', 'certified', 'certificate',
    'certificates', 'diploma', 'diplomas', 'degree', 'degrees', 'program', 'programs',
    'programme', 'programmes', 'study', 'studies', 'learning', 'learn', 'learner',
    'learners', 'student', 'students', 'pupil', 'pupils', 'kindergarten', 'preschool',
    'elementary', 'primary', 'secondary', 'high school', 'middle school', 'special education',
    'gifted', 'talented', 'vocational', 'technical', 'trade school', 'apprenticeship',
    'apprenticeships', 'internship', 'internships', 'intern', 'interns', 'research',
    'researcher', 'researchers', 'thesis', 'dissertation', 'academic', 'academics'
  ],
  
  'PERSONAL_SERVICES': [
    'personal services', 'personal care', 'beauty', 'beautician', 'beauticians',
    'salon', 'salons', 'spa', 'spas', 'massage', 'therapeutic', 'therapy', 'therapist',
    'therapists', 'hair', 'hairstylist', 'hairstylists', 'stylist', 'stylists',
    'barber', 'barbers', 'barbershop', 'barbershops', 'nail', 'nails', 'manicure',
    'manicures', 'pedicure', 'pedicures', 'facial', 'facials', 'skincare', 'skin care',
    'cosmetic', 'cosmetics', 'makeup', 'make-up', 'eyelash', 'eyebrow', 'eyebrows',
    'tattoo', 'tattoos', 'tattooist', 'tattooists', 'piercing', 'piercings',
    'piercer', 'piercers', 'tanning', 'tan', 'sunless tanning', 'waxing', 'wax',
    'threading', 'thread', 'threading', 'lash extensions', 'microblading', 'permanent makeup',
    'cleaning', 'cleaner', 'cleaners', 'housekeeping', 'housekeeper', 'housekeepers',
    'maid', 'maids', 'domestic', 'domestic services', 'concierge', 'concierges',
    'butler', 'butlers', 'valet', 'valets', 'chauffeur', 'chauffeurs', 'driver',
    'drivers', 'personal assistant', 'personal assistants', 'secretary', 'secretaries',
    'administrative assistant', 'administrative assistants', 'virtual assistant',
    'virtual assistants', 'errand', 'errands', 'errand service', 'errand services'
  ]
};

function categorizeBusinessByName(businessName: string, email: string): string {
  const name = businessName.toLowerCase();
  const emailLower = email.toLowerCase();
  
  // Check each category with comprehensive rules
  for (const [category, keywords] of Object.entries(PROPER_INDUSTRY_CATEGORIZATION)) {
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

async function properIndustryCategorization() {
  console.log('🎯 Proper Industry Categorization...\n');

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

    console.log('\n📊 New Proper Categorization:');
    for (const [category, members] of newCategorization) {
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`   • ${groupName}: ${members.length} businesses`);
    }

    // Clear existing data
    console.log('\n🧹 Clearing existing audience data...');
    await prisma.audienceMember.deleteMany({});
    await prisma.audienceGroup.deleteMany({});

    // Create new audience groups
    console.log('\n👥 Creating proper audience groups...');
    
    for (const [category, members] of newCategorization) {
      if (members.length === 0) continue;
      
      const groupName = category.replace(/_/g, ' & ').replace(/\b\w/g, l => l.toUpperCase());
      
      console.log(`   Creating: ${groupName} (${members.length} businesses)`);
      
      const audienceGroup = await prisma.audienceGroup.create({
        data: {
          name: groupName,
          description: `Businesses in ${groupName.toLowerCase()} industry - proper comprehensive categorization`,
          criteria: {
            industry: category,
            minMembers: members.length,
            categorizationMethod: 'proper_comprehensive_analysis',
            improved: true,
            semanticAnalysis: true,
            comprehensiveKeywords: true
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
              categorizedBy: 'proper_comprehensive_analysis'
            }
          }
        });
      }
      
      console.log(`   ✅ Added ${members.length} members to ${groupName}`);
    }

    // Final summary
    console.log('\n🎉 Proper Industry Categorization Complete!');
    console.log('\n📊 Final Summary:');
    
    const finalGroups = await prisma.audienceGroup.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' }
    });
    
    const totalMembers = finalGroups.reduce((sum, group) => sum + group._count.members, 0);
    
    console.log(`   📧 Total Audience Groups: ${finalGroups.length}`);
    console.log(`   👥 Total Audience Members: ${totalMembers}`);
    
    console.log('\n📋 Proper Audience Groups:');
    finalGroups.forEach(group => {
      console.log(`   • ${group.name}: ${group._count.members} businesses`);
    });

  } catch (error) {
    console.error('❌ Error in proper categorization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

properIndustryCategorization();


