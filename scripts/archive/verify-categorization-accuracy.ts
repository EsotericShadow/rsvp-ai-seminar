import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCategorizationAccuracy() {
  console.log('🔍 Verifying Categorization Accuracy...\n');

  try {
    // Get all audience groups with their members
    const groups = await prisma.audienceGroup.findMany({
      include: {
        members: {
          take: 5, // Sample 5 members from each group
          orderBy: { businessName: 'asc' }
        },
        _count: { select: { members: true } }
      },
      orderBy: { name: 'asc' }
    });

    console.log('📊 Sample Verification by Category:\n');

    for (const group of groups) {
      console.log(`🏷️  ${group.name} (${group._count.members} total businesses):`);
      
      if (group.members.length === 0) {
        console.log('   ⚠️  No members in this group');
        continue;
      }

      // Show sample businesses
      for (const member of group.members) {
        console.log(`   • ${member.businessName} (${member.primaryEmail})`);
      }

      // Analyze accuracy for this category
      const categoryAnalysis = analyzeCategoryAccuracy(group.name, group.members);
      console.log(`   📈 Accuracy: ${categoryAnalysis.accuracy}% (${categoryAnalysis.correct}/${group.members.length} correct)`);
      
      if (categoryAnalysis.issues.length > 0) {
        console.log(`   ⚠️  Issues: ${categoryAnalysis.issues.join(', ')}`);
      }
      
      console.log('');
    }

    // Overall accuracy summary
    console.log('📊 Overall Accuracy Analysis:');
    const overallAccuracy = calculateOverallAccuracy(groups);
    console.log(`   🎯 Total Accuracy: ${overallAccuracy.totalAccuracy}%`);
    console.log(`   ✅ Correctly Categorized: ${overallAccuracy.correctTotal}`);
    console.log(`   ❌ Misclassified: ${overallAccuracy.incorrectTotal}`);
    console.log(`   📋 Total Sampled: ${overallAccuracy.totalSampled}`);

    // Show most problematic categories
    if (overallAccuracy.problematicCategories.length > 0) {
      console.log('\n⚠️  Categories Needing Attention:');
      overallAccuracy.problematicCategories.forEach(cat => {
        console.log(`   • ${cat.name}: ${cat.accuracy}% accuracy`);
      });
    }

  } catch (error) {
    console.error('❌ Error verifying categorization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function analyzeCategoryAccuracy(categoryName: string, members: any[]): { accuracy: number, correct: number, issues: string[] } {
  const issues: string[] = [];
  let correct = 0;

  for (const member of members) {
    const businessName = member.businessName.toLowerCase();
    const email = member.primaryEmail.toLowerCase();
    
    // Check if the business name/email matches the expected category
    const isCorrectlyCategorized = checkCategoryMatch(categoryName, businessName, email);
    
    if (isCorrectlyCategorized) {
      correct++;
    } else {
      // Identify what category this should be in
      const suggestedCategory = suggestCorrectCategory(businessName, email);
      issues.push(`${member.businessName} → should be ${suggestedCategory}`);
    }
  }

  const accuracy = members.length > 0 ? Math.round((correct / members.length) * 100) : 0;
  return { accuracy, correct, issues };
}

function checkCategoryMatch(categoryName: string, businessName: string, email: string): boolean {
  const category = categoryName.toLowerCase().replace(/\s+/g, '_').replace(/&/g, '');
  
  // Define expected keywords for each category
  const categoryKeywords = {
    'construction_contracting': ['construction', 'contracting', 'contractor', 'building', 'excavating', 'welding', 'roofing', 'plumbing', 'electrical', 'hvac', 'concrete', 'renovation', 'landscaping', 'painting', 'flooring', 'tile', 'siding', 'gutters', 'windows', 'doors', 'fencing', 'paving', 'asphalt', 'decking', 'carpentry', 'framing', 'drywall', 'masonry', 'insulation', 'spray foam', 'foundation', 'remodeling', 'restoration', 'repair', 'maintenance', 'architectural', 'engineering', 'surveying', 'civil', 'structural', 'mechanical', 'development', 'developer', 'general contractor', 'subcontractor', 'trades', 'craftsman'],
    'mining_resources': ['mining', 'mine', 'miner', 'minerals', 'ore', 'coal', 'gold', 'silver', 'copper', 'iron', 'steel', 'quarry', 'quarries', 'aggregate', 'gravel', 'sand', 'crushed stone', 'drilling', 'driller', 'exploration', 'prospecting', 'geology', 'geological', 'extraction', 'excavation', 'heavy equipment', 'trucking', 'hauling', 'resource', 'natural resources', 'energy', 'oil', 'gas', 'petroleum', 'natural gas', 'well', 'rig', 'platform', 'offshore', 'onshore', 'production', 'refinery', 'processing', 'refining'],
    'forestry_logging': ['forestry', 'logging', 'log', 'logs', 'lumber', 'lumbering', 'timber', 'timbers', 'sawmill', 'saw mills', 'mill', 'mills', 'wood', 'wood products', 'wooden', 'lumber yard', 'lumberyard', 'forest', 'forests', 'forest management', 'tree', 'trees', 'tree service', 'tree services', 'arborist', 'arborists', 'cutting', 'harvesting', 'harvest', 'harvester', 'harvesters', 'chipper', 'chippers', 'mulch', 'mulching', 'firewood', 'fire wood', 'pulp', 'pulp mill', 'paper', 'paper mill', 'paper products', 'fiber', 'fibre', 'biomass', 'reforestation', 'silviculture', 'silvicultural', 'forest products', 'wood chips', 'woodchips', 'lumber products', 'timber products', 'wood manufacturing', 'forestry services', 'logging contractor', 'logging contractors', 'forest contractor', 'forest contractors'],
    'healthcare_medical': ['medical', 'medicine', 'healthcare', 'health care', 'health', 'clinic', 'clinics', 'hospital', 'hospitals', 'doctor', 'doctors', 'physician', 'physicians', 'nurse', 'nursing', 'dental', 'dentist', 'dentists', 'orthodontist', 'orthodontics', 'denture', 'dentures', 'oral', 'oral surgery', 'surgery', 'surgical', 'surgeon', 'surgeons', 'pharmacy', 'pharmacist', 'pharmacists', 'drug', 'drugs', 'medication', 'medications', 'therapy', 'therapist', 'therapists', 'physical therapy', 'pt', 'occupational therapy', 'ot', 'speech therapy', 'massage therapy', 'massage', 'chiropractic', 'chiropractor', 'chiropractors', 'acupuncture', 'acupuncturist', 'naturopathic', 'naturopath', 'naturopaths', 'holistic', 'wellness', 'wellbeing', 'mental health', 'psychology', 'psychologist', 'psychologists', 'counseling', 'counseling', 'counselor', 'counsellor', 'psychiatry', 'psychiatrist', 'psychiatrists', 'optometry', 'optometrist', 'optometrists', 'eye care', 'vision', 'hearing', 'audiology', 'audiologist', 'audiologists', 'hearing aids', 'lab', 'laboratory', 'laboratories', 'labs', 'testing', 'diagnostic', 'diagnosis', 'x-ray', 'imaging', 'ultrasound', 'mri', 'ct', 'scan', 'scans', 'pathology', 'pathologist', 'pathologists', 'blood', 'urine', 'sample', 'samples'],
    'automotive_services': ['auto', 'automotive', 'car', 'cars', 'vehicle', 'vehicles', 'truck', 'trucks', 'motor', 'motors', 'engine', 'engines', 'transmission', 'transmissions', 'brake', 'brakes', 'braking', 'tire', 'tires', 'wheel', 'wheels', 'alignment', 'balancing', 'balance', 'oil change', 'lube', 'lubrication', 'service', 'repair', 'repairs', 'mechanic', 'mechanics', 'garage', 'garages', 'shop', 'dealership', 'dealerships', 'dealer', 'dealers', 'sales', 'leasing', 'lease', 'rental', 'rent', 'renting', 'towing', 'tow', 'towing', 'recovery', 'recover', 'collision', 'collision repair', 'body shop', 'bodywork', 'detailing', 'detail', 'wash', 'washing', 'cleaning', 'auto glass', 'windshield', 'windshields', 'exhaust', 'muffler', 'mufflers', 'performance', 'tuning', 'custom', 'customization'],
    'food_restaurants': ['restaurant', 'restaurants', 'food', 'dining', 'dine', 'cafe', 'café', 'coffee', 'coffee shop', 'bakery', 'bakeries', 'deli', 'delicatessen', 'pizza', 'pizzeria', 'burger', 'burgers', 'sandwich', 'sandwiches', 'sub', 'subs', 'subway', 'fast food', 'casual dining', 'fine dining', 'bar', 'bars', 'pub', 'pubs', 'tavern', 'taverns', 'lounge', 'lounges', 'grill', 'grills', 'steakhouse', 'seafood', 'fish', 'chicken', 'italian', 'chinese', 'mexican', 'thai', 'indian', 'japanese', 'sushi', 'buffet', 'buffets', 'catering', 'caterer', 'caterers', 'catering service', 'event', 'events', 'banquet', 'banquets', 'wedding', 'weddings', 'party', 'parties', 'kitchen', 'chef', 'chefs', 'cook', 'cooking', 'cuisine', 'menu', 'menus', 'takeout', 'take out', 'delivery', 'deliver', 'catering', 'food service', 'hospitality', 'hotel', 'hotels', 'motel', 'motels', 'inn', 'inns', 'accommodation', 'accommodations', 'lodging', 'resort', 'resorts'],
    'professional_services': ['consulting', 'consultant', 'consultants', 'advisory', 'advisor', 'advisors', 'professional services', 'business services', 'management', 'manager', 'managers', 'administration', 'administrative', 'administrator', 'administrators', 'executive', 'executives', 'corporate', 'corporation', 'corporations', 'company', 'companies', 'enterprise', 'enterprises', 'firm', 'firms', 'agency', 'agencies', 'bureau', 'bureaus', 'institute', 'institutes', 'organization', 'organizations', 'association', 'associations', 'society', 'societies', 'foundation', 'foundations', 'group', 'groups', 'team', 'teams', 'staff', 'personnel', 'human resources', 'hr', 'recruitment', 'recruit', 'recruiter', 'recruiters', 'training', 'trainer', 'trainers', 'education', 'educational', 'instructor', 'instructors', 'teacher', 'teachers', 'coach', 'coaches', 'coaching', 'mentor', 'mentors', 'mentoring', 'development', 'develop', 'developer', 'developers', 'planning', 'planner', 'planners', 'strategy', 'strategic', 'strategist', 'strategists', 'analysis', 'analyst', 'analysts', 'research', 'researcher', 'researchers', 'market research', 'marketing', 'marketer', 'marketers', 'advertising', 'advertiser', 'advertisers', 'public relations', 'pr', 'communications', 'communication', 'media', 'promotion', 'promotional', 'sales', 'seller', 'sellers', 'selling', 'business development'],
    'transportation_logistics': ['transportation', 'transport', 'transporting', 'logistics', 'logistic', 'shipping', 'ship', 'shipping', 'freight', 'freight services', 'cargo', 'cargo services', 'delivery', 'deliver', 'delivering', 'courier', 'couriers', 'express', 'express delivery', 'mail', 'postal', 'post', 'packages', 'package', 'packaging', 'warehouse', 'warehouses', 'storage', 'storing', 'distribution', 'distribute', 'distributing', 'supply chain', 'supply', 'supplies', 'procurement', 'procure', 'procuring', 'inventory management', 'inventory', 'stock', 'stocks', 'fulfillment', 'fulfill', 'fulfilling', 'order', 'orders', 'ordering', 'dispatch', 'dispatching', 'dispatch service', 'trucking', 'truck', 'trucks', 'trucking company', 'hauling', 'haul', 'hauling service', 'moving', 'movers', 'moving company', 'relocation', 'relocate', 'relocating', 'moving services', 'international', 'domestic', 'local', 'long distance', 'regional', 'national', 'cross border', 'customs', 'customs clearance', 'import', 'imports', 'export', 'exports', 'importing', 'exporting', 'trade', 'trading', 'commerce'],
    'retail_shopping': ['retail', 'store', 'stores', 'shop', 'shops', 'shopping', 'mall', 'malls', 'boutique', 'boutiques', 'department', 'departments', 'clothing', 'apparel', 'fashion', 'fashions', 'shoes', 'footwear', 'jewelry', 'jewellery', 'jewellers', 'jeweller', 'accessories', 'accessory', 'electronics', 'electronic', 'computer', 'computers', 'phone', 'phones', 'mobile', 'cell', 'tablet', 'tablets', 'appliance', 'appliances', 'furniture', 'home', 'garden', 'gardening', 'tools', 'hardware', 'sporting goods', 'sports', 'recreation', 'toys', 'books', 'bookstore', 'stationery', 'stationary', 'office supplies', 'supplies', 'gift', 'gifts', 'gift shop', 'convenience', 'convenience store', 'dollar store', 'variety', 'discount', 'outlet', 'outlets', 'clearance', 'sale', 'sales', 'merchandise', 'product', 'products', 'inventory', 'stock', 'wholesale', 'wholesaler'],
    'technology_information': ['technology', 'tech', 'information technology', 'it', 'computer', 'computers', 'software', 'software development', 'programming', 'programmer', 'programmers', 'developer', 'developers', 'development', 'web development', 'app development', 'mobile development', 'database', 'databases', 'data', 'data management', 'data analysis', 'analytics', 'business intelligence', 'bi', 'artificial intelligence', 'ai', 'machine learning', 'ml', 'automation', 'automated', 'digital', 'digitization', 'digitize', 'cybersecurity', 'security', 'network', 'networking', 'infrastructure', 'cloud', 'cloud computing', 'saas', 'software as a service', 'platform', 'platforms', 'system', 'systems', 'integration', 'integrate', 'integrating', 'api', 'apis', 'website', 'websites', 'web design', 'web development', 'e-commerce', 'ecommerce', 'online', 'internet', 'digital marketing', 'seo', 'search engine optimization', 'social media', 'content management', 'cms', 'hosting', 'web hosting', 'server', 'servers', 'server management', 'backup', 'backups', 'recovery', 'disaster recovery', 'consulting', 'consultant', 'consultants', 'support', 'technical support', 'help desk', 'maintenance', 'maintain', 'upgrades', 'upgrade', 'upgrading', 'implementation', 'implement', 'implementing', 'training', 'trainer', 'trainers'],
    'financial_services': ['financial', 'finance', 'financing', 'bank', 'banks', 'banking', 'credit union', 'credit unions', 'investment', 'investments', 'investor', 'investors', 'investing', 'advisor', 'advisors', 'advisory', 'wealth management', 'wealth', 'portfolio', 'portfolios', 'asset management', 'assets', 'funds', 'fund', 'mutual funds', 'insurance', 'insurer', 'insurers', 'underwriter', 'underwriters', 'underwriting', 'broker', 'brokers', 'brokerage', 'trading', 'trader', 'traders', 'securities', 'security', 'stocks', 'stock', 'bonds', 'bond', 'equity', 'equities', 'capital', 'venture capital', 'private equity', 'hedge fund', 'hedge funds', 'pension', 'pensions', 'retirement', 'retirement planning', 'estate planning', 'estate', 'tax', 'taxes', 'taxation', 'accounting', 'accountant', 'accountants', 'bookkeeping', 'bookkeeper', 'bookkeepers', 'audit', 'auditing', 'auditor', 'auditors', 'payroll', 'payroll services', 'payroll processing', 'billing', 'invoice', 'invoicing', 'collections', 'collection', 'debt collection', 'credit', 'credits', 'loan', 'loans', 'lending', 'lender', 'lenders', 'mortgage', 'mortgages', 'real estate', 'property', 'properties', 'commercial real estate', 'residential', 'leasing', 'lease', 'leases', 'rental', 'rentals', 'property management'],
    'real_estate_property': ['real estate', 'realtor', 'realtors', 'realty', 'property', 'properties', 'real estate agent', 'real estate agents', 'broker', 'brokers', 'brokerage', 'brokerages', 'listing', 'listings', 'sale', 'sales', 'selling', 'buying', 'purchase', 'purchasing', 'investment', 'investments', 'investor', 'investors', 'development', 'developments', 'developer', 'developers', 'construction', 'contractor', 'contractors', 'contracting', 'building', 'builders', 'build', 'residential', 'commercial', 'industrial', 'retail', 'office', 'warehouse', 'warehouses', 'land', 'lots', 'lot', 'acreage', 'acres', 'acre', 'farm', 'farms', 'ranch', 'ranches', 'estate', 'estates', 'mansion', 'mansions', 'condo', 'condos', 'condominium', 'condominiums', 'townhouse', 'townhouses', 'apartment', 'apartments', 'rental', 'rentals', 'leasing', 'lease', 'leases', 'property management', 'property manager', 'property managers', 'maintenance', 'maintain', 'repair', 'repairs', 'renovation', 'renovations', 'remodeling', 'remodel', 'restoration', 'restore', 'inspection', 'inspections', 'inspector', 'inspectors', 'appraisal', 'appraisals', 'appraiser', 'appraisers', 'assessment', 'assessments', 'assessor', 'assessors', 'valuation', 'valuations', 'evaluate', 'evaluation', 'market analysis', 'market research', 'comparative market analysis', 'cma', 'fsbo', 'for sale by owner', 'mls', 'multiple listing service'],
    'personal_services': ['personal services', 'personal care', 'beauty', 'beautician', 'beauticians', 'salon', 'salons', 'spa', 'spas', 'massage', 'therapeutic', 'therapy', 'therapist', 'therapists', 'hair', 'hairstylist', 'hairstylists', 'stylist', 'stylists', 'barber', 'barbers', 'barbershop', 'barbershops', 'nail', 'nails', 'manicure', 'manicures', 'pedicure', 'pedicures', 'facial', 'facials', 'skincare', 'skin care', 'cosmetic', 'cosmetics', 'makeup', 'make-up', 'eyelash', 'eyebrow', 'eyebrows', 'tattoo', 'tattoos', 'tattooist', 'tattooists', 'piercing', 'piercings', 'piercer', 'piercers', 'tanning', 'tan', 'sunless tanning', 'waxing', 'wax', 'threading', 'thread', 'threading', 'lash extensions', 'microblading', 'permanent makeup', 'cleaning', 'cleaner', 'cleaners', 'housekeeping', 'housekeeper', 'housekeepers', 'maid', 'maids', 'domestic', 'domestic services', 'concierge', 'concierges', 'butler', 'butlers', 'valet', 'valets', 'chauffeur', 'chauffeurs', 'driver', 'drivers', 'personal assistant', 'personal assistants', 'secretary', 'secretaries', 'administrative assistant', 'administrative assistants', 'virtual assistant', 'virtual assistants', 'errand', 'errands', 'errand service', 'errand services'],
    'entertainment_recreation': ['entertainment', 'entertain', 'recreation', 'recreational', 'leisure', 'leisure time', 'fun', 'activities', 'activity', 'events', 'event', 'event planning', 'event planner', 'event planners', 'party', 'parties', 'celebration', 'celebrations', 'festival', 'festivals', 'concert', 'concerts', 'music', 'musical', 'band', 'bands', 'orchestra', 'orchestras', 'symphony', 'symphonies', 'theater', 'theatre', 'theaters', 'theatres', 'cinema', 'cinemas', 'movie', 'movies', 'film', 'films', 'production', 'productions', 'producer', 'producers', 'director', 'directors', 'actor', 'actors', 'actress', 'actresses', 'performer', 'performers', 'performance', 'performances', 'show', 'shows', 'exhibition', 'exhibitions', 'gallery', 'galleries', 'museum', 'museums', 'art', 'arts', 'artist', 'artists', 'artistic', 'creative', 'creativity', 'design', 'designer', 'designers', 'photography', 'photographer', 'photographers', 'videography', 'videographer', 'videographers', 'dance', 'dancing', 'dancer', 'dancers', 'studio', 'studios', 'gym', 'gyms', 'fitness', 'fitness center', 'fitness centre', 'health club', 'health clubs', 'sports', 'sport', 'athletic', 'athletics', 'athlete', 'athletes', 'coach', 'coaches', 'coaching', 'training', 'trainer', 'trainers', 'personal training', 'yoga', 'pilates', 'martial arts', 'karate', 'taekwondo', 'judo', 'boxing', 'kickboxing', 'swimming', 'pool', 'pools', 'tennis', 'golf', 'golfing', 'skiing', 'snowboarding', 'hiking', 'camping', 'outdoor', 'adventure', 'adventures', 'tours', 'tour', 'touring', 'guide', 'guides', 'travel', 'traveling', 'travelling', 'vacation', 'vacations', 'holiday', 'holidays'],
    'education_training': ['education', 'educational', 'school', 'schools', 'academy', 'academies', 'university', 'universities', 'college', 'colleges', 'institute', 'institutes', 'training', 'trainer', 'trainers', 'coaching', 'coach', 'coaches', 'mentoring', 'mentor', 'mentors', 'tutoring', 'tutor', 'tutors', 'instruction', 'instructor', 'instructors', 'teaching', 'teacher', 'teachers', 'professor', 'professors', 'curriculum', 'curricula', 'course', 'courses', 'class', 'classes', 'lesson', 'lessons', 'workshop', 'workshops', 'seminar', 'seminars', 'conference', 'conferences', 'certification', 'certifications', 'certified', 'certificate', 'certificates', 'diploma', 'diplomas', 'degree', 'degrees', 'program', 'programs', 'programme', 'programmes', 'study', 'studies', 'learning', 'learn', 'learner', 'learners', 'student', 'students', 'pupil', 'pupils', 'kindergarten', 'preschool', 'elementary', 'primary', 'secondary', 'high school', 'middle school', 'special education', 'gifted', 'talented', 'vocational', 'technical', 'trade school', 'apprenticeship', 'apprenticeships', 'internship', 'internships', 'intern', 'interns', 'research', 'researcher', 'researchers', 'thesis', 'dissertation', 'academic', 'academics'],
    'personal_names_numbered': ['ltd', 'inc', 'corp', 'llc', 'llp', 'bc', 'canada', 'number', 'numbered', 'personal', 'name', 'names']
  };

  const expectedKeywords = categoryKeywords[category] || [];
  
  // Check if any expected keywords are found in business name or email
  for (const keyword of expectedKeywords) {
    if (businessName.includes(keyword) || email.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

function suggestCorrectCategory(businessName: string, email: string): string {
  // Simple suggestion logic - check for obvious mismatches
  if (businessName.includes('ltd') || businessName.includes('inc') || businessName.includes('corp') || 
      businessName.includes('bc') || businessName.includes('canada') || /\d{7,8}/.test(businessName)) {
    return 'PERSONAL_NAMES_NUMBERED';
  }
  
  if (businessName.includes('construction') || businessName.includes('contractor') || 
      businessName.includes('building') || businessName.includes('excavating') || 
      businessName.includes('welding') || businessName.includes('roofing') || 
      businessName.includes('plumbing') || businessName.includes('electrical') || 
      businessName.includes('hvac') || businessName.includes('concrete') || 
      businessName.includes('renovation') || businessName.includes('landscaping') || 
      businessName.includes('painting') || businessName.includes('flooring') || 
      businessName.includes('tile') || businessName.includes('siding') || 
      businessName.includes('gutters') || businessName.includes('windows') || 
      businessName.includes('doors') || businessName.includes('fencing') || 
      businessName.includes('paving') || businessName.includes('asphalt') || 
      businessName.includes('decking') || businessName.includes('carpentry') || 
      businessName.includes('framing') || businessName.includes('drywall') || 
      businessName.includes('masonry') || businessName.includes('insulation') || 
      businessName.includes('spray foam') || businessName.includes('foundation') || 
      businessName.includes('remodeling') || businessName.includes('restoration') || 
      businessName.includes('repair') || businessName.includes('maintenance') || 
      businessName.includes('architectural') || businessName.includes('engineering') || 
      businessName.includes('surveying') || businessName.includes('civil') || 
      businessName.includes('structural') || businessName.includes('mechanical') || 
      businessName.includes('development') || businessName.includes('developer') || 
      businessName.includes('general contractor') || businessName.includes('subcontractor') || 
      businessName.includes('trades') || businessName.includes('craftsman')) {
    return 'CONSTRUCTION_CONTRACTING';
  }
  
  if (businessName.includes('mining') || businessName.includes('mine') || 
      businessName.includes('miner') || businessName.includes('minerals') || 
      businessName.includes('ore') || businessName.includes('coal') || 
      businessName.includes('gold') || businessName.includes('silver') || 
      businessName.includes('copper') || businessName.includes('iron') || 
      businessName.includes('steel') || businessName.includes('quarry') || 
      businessName.includes('quarries') || businessName.includes('aggregate') || 
      businessName.includes('gravel') || businessName.includes('sand') || 
      businessName.includes('crushed stone') || businessName.includes('drilling') || 
      businessName.includes('driller') || businessName.includes('exploration') || 
      businessName.includes('prospecting') || businessName.includes('geology') || 
      businessName.includes('geological') || businessName.includes('extraction') || 
      businessName.includes('excavation') || businessName.includes('heavy equipment') || 
      businessName.includes('trucking') || businessName.includes('hauling') || 
      businessName.includes('resource') || businessName.includes('natural resources') || 
      businessName.includes('energy') || businessName.includes('oil') || 
      businessName.includes('gas') || businessName.includes('petroleum') || 
      businessName.includes('natural gas') || businessName.includes('well') || 
      businessName.includes('rig') || businessName.includes('platform') || 
      businessName.includes('offshore') || businessName.includes('onshore') || 
      businessName.includes('production') || businessName.includes('refinery') || 
      businessName.includes('processing') || businessName.includes('refining')) {
    return 'MINING_RESOURCES';
  }
  
  if (businessName.includes('forestry') || businessName.includes('logging') || 
      businessName.includes('log') || businessName.includes('logs') || 
      businessName.includes('lumber') || businessName.includes('lumbering') || 
      businessName.includes('timber') || businessName.includes('timbers') || 
      businessName.includes('sawmill') || businessName.includes('saw mills') || 
      businessName.includes('mill') || businessName.includes('mills') || 
      businessName.includes('wood') || businessName.includes('wood products') || 
      businessName.includes('wooden') || businessName.includes('lumber yard') || 
      businessName.includes('lumberyard') || businessName.includes('forest') || 
      businessName.includes('forests') || businessName.includes('forest management') || 
      businessName.includes('tree') || businessName.includes('trees') || 
      businessName.includes('tree service') || businessName.includes('tree services') || 
      businessName.includes('arborist') || businessName.includes('arborists') || 
      businessName.includes('cutting') || businessName.includes('harvesting') || 
      businessName.includes('harvest') || businessName.includes('harvester') || 
      businessName.includes('harvesters') || businessName.includes('chipper') || 
      businessName.includes('chippers') || businessName.includes('mulch') || 
      businessName.includes('mulching') || businessName.includes('firewood') || 
      businessName.includes('fire wood') || businessName.includes('pulp') || 
      businessName.includes('pulp mill') || businessName.includes('paper') || 
      businessName.includes('paper mill') || businessName.includes('paper products') || 
      businessName.includes('fiber') || businessName.includes('fibre') || 
      businessName.includes('biomass') || businessName.includes('reforestation') || 
      businessName.includes('silviculture') || businessName.includes('silvicultural') || 
      businessName.includes('forest products') || businessName.includes('wood chips') || 
      businessName.includes('woodchips') || businessName.includes('lumber products') || 
      businessName.includes('timber products') || businessName.includes('wood manufacturing') || 
      businessName.includes('forestry services') || businessName.includes('logging contractor') || 
      businessName.includes('logging contractors') || businessName.includes('forest contractor') || 
      businessName.includes('forest contractors')) {
    return 'FORESTRY_LOGGING';
  }
  
  return 'OTHER_INDUSTRIES';
}

function calculateOverallAccuracy(groups: any[]): { totalAccuracy: number, correctTotal: number, incorrectTotal: number, totalSampled: number, problematicCategories: any[] } {
  let correctTotal = 0;
  let incorrectTotal = 0;
  let totalSampled = 0;
  const problematicCategories: any[] = [];
  
  for (const group of groups) {
    const analysis = analyzeCategoryAccuracy(group.name, group.members);
    correctTotal += analysis.correct;
    incorrectTotal += (group.members.length - analysis.correct);
    totalSampled += group.members.length;
    
    if (analysis.accuracy < 80) {
      problematicCategories.push({
        name: group.name,
        accuracy: analysis.accuracy,
        issues: analysis.issues
      });
    }
  }
  
  const totalAccuracy = totalSampled > 0 ? Math.round((correctTotal / totalSampled) * 100) : 0;
  
  return { totalAccuracy, correctTotal, incorrectTotal, totalSampled, problematicCategories };
}

verifyCategorizationAccuracy();


