import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

config()
const prisma = new PrismaClient()

// Comprehensive list of known Canadian/Northern BC chains
const KNOWN_CHAINS = [
  // Fast Food & Restaurants
  'MCDONALD', 'STARBUCKS', 'TIM HORTONS', 'SUBWAY', 'PIZZA HUT', 'KFC', 'BURGER KING', 
  'DAIRY QUEEN', 'A&W', 'WHITE SPOT', 'DENNY', 'WENDY', 'ARBY', 'HARVEY', 'MARY BROWN',
  'LITTLE CAESAR', 'DOMINO', 'PAPA JOHN', 'BOSTON PIZZA', 'EAST SIDE MARIO', 'MONTANA',
  
  // Hotels & Motels
  'DAYS INN', 'HOLIDAY INN', 'BEST WESTERN', 'SUPER 8', 'COMFORT INN', 'RAMADA',
  'SANDMAN', 'COAST', 'DELTA', 'FAIRMONT', 'WESTIN', 'SHERATON', 'MARRIOTT',
  
  // Banks & Financial
  'BANK OF', 'ROYAL BANK', 'TD BANK', 'CIBC', 'BMO', 'SCOTIABANK', 'DESJARDINS',
  'NATIONAL BANK', 'HSBC', 'TANGERINE', 'PC FINANCIAL',
  
  // Retail & Department Stores
  'CANADIAN TIRE', 'HOME DEPOT', 'LOWES', 'COSTCO', 'WALMART', 'TARGET', 'SEARS',
  'LOBLAWS', 'SOBEYS', 'METRO', 'FRESHCO', 'FOOD BASICS', 'NO FRILLS',
  'SHOPPERS DRUG MART', 'REXALL', 'PHARMASAVE', 'LONDON DRUGS', 'JEAN COUTU',
  '7-ELEVEN', 'CIRCLE K', 'MAC\'S', 'ESSO', 'SHELL', 'PETRO-CANADA', 'CHEVRON',
  'PET VALU', 'PETSMART', 'PETLAND',
  
  // Automotive
  'KAL TIRE', 'FOUNTAIN TIRE', 'GOODYEAR', 'BRIDGESTONE', 'MICHELIN',
  'MISTER CAR WASH', 'SPEEDY GLASS', 'GLASSMATE', 'AUTO GLASS',
  
  // Technology & Communications
  'BELL', 'ROGERS', 'TELUS', 'SHAW', 'EASTLINK', 'COGECO', 'VIDEOTRON',
  'APPLE', 'MICROSOFT', 'GOOGLE', 'AMAZON', 'FACEBOOK', 'TWITTER',
  
  // Healthcare & Pharmaceutical
  'LIFELABS', 'DYNACARE', 'BANTING', 'MEDICINE SHOPPE', 'GUARDIAN',
  'JOHNSON & JOHNSON', 'PFIZER', 'MERCK', 'NOVARTIS', 'ROCHE', 'BAYER',
  
  // Transportation & Logistics
  'PUROLATOR', 'FEDEX', 'UPS', 'DHL', 'CANADA POST', 'LOOMIS',
  'GREYHOUND', 'VIA RAIL', 'AIR CANADA', 'WESTJET',
  
  // Energy & Utilities
  'BC HYDRO', 'FORTIS', 'ATCO', 'ENMAX', 'EPCOR', 'SASKPOWER',
  
  // Construction & Industrial
  'FINNING', 'ORICA', 'HILTI', 'BRANDT', 'AIR LIQUIDE', 'LAFARGE', 'WSP',
  'LINDE', 'AGAT', 'UAP', 'SECURIGUARD', 'ORKIN', 'CANADIAN HELICOPTERS',
  
  // Retail Chains
  'MARK\'S WORK WEARHOUSE', 'WINNERS', 'MARSHALLS', 'HOMESENSE', 'TJX',
  'ARDENE', 'CLAIRE\'S', 'ACCESSORIZE', 'BATH & BODY WORKS', 'THE BODY SHOP',
  'LUSH', 'SEPHORA', 'ULTA', 'MACY\'S', 'NORDSTROM', 'HOLT RENFREW',
  
  // Grocery & Food
  'SAFEWAY', 'IGA', 'THRIFTY FOODS', 'WHOLE FOODS', 'TRADER JOE\'S',
  'SPROUTS', 'EARTHFARE', 'NATURAL GROCERS',
  
  // Entertainment & Recreation
  'CINEPLEX', 'LANDMARK', 'IMAX', 'AMC', 'REGAL', 'CARMICHAEL',
  'GOODLIFE FITNESS', 'PLANET FITNESS', 'ANYTIME FITNESS', 'ORANGE THEORY',
  
  // Home & Garden
  'RONA', 'HOME HARDWARE', 'KENT', 'REVY', 'BUILDING BOX', 'HOME DEPOT',
  'LOWES', 'IKEA', 'ASHLEY FURNITURE', 'LEON\'S', 'THE BRICK',
  
  // Automotive Dealers
  'FORD', 'CHEVROLET', 'GMC', 'BUICK', 'CADILLAC', 'CHRYSLER', 'DODGE',
  'JEEP', 'RAM', 'HONDA', 'TOYOTA', 'NISSAN', 'MAZDA', 'SUBARU', 'HYUNDAI',
  'KIA', 'VOLKSWAGEN', 'AUDI', 'BMW', 'MERCEDES', 'LEXUS', 'ACURA', 'INFINITI',
  
  // Northern BC Specific
  'TERRACE', 'PRINCE GEORGE', 'PRINCE RUPERT', 'SMITHERS', 'KITIMAT',
  'HAZELTON', 'HOUSTON', 'BURNS LAKE', 'VANDERHOOF', 'FORT ST. JAMES',
  'MACKENZIE', 'CHETWYND', 'DAWSON CREEK', 'FORT NELSON', 'DEASE LAKE'
]

// Industry identifier patterns
const INDUSTRY_PATTERNS = {
  healthcare: [
    'DR.', 'DOCTOR', 'CLINIC', 'MEDICAL', 'HEALTH', 'DENTAL', 'PHARMACY', 'PHARMACIST',
    'THERAPY', 'PHYSIOTHERAPY', 'CHIROPRACTIC', 'OPTOMETRY', 'OPTOMETRIST', 'VETERINARY', 'VET',
    'WELLNESS', 'COUNSELING', 'COUNSELLING', 'PSYCHOLOGY', 'PSYCHIATRY', 'NURSING', 'CARE',
    'HOSPITAL', 'HEALTH CENTER', 'HEALTH CENTRE', 'MEDICAL CENTER', 'MEDICAL CENTRE',
    'SURGERY', 'SURGICAL', 'EMERGENCY', 'URGENT CARE', 'WALK-IN', 'FAMILY PRACTICE',
    'PEDIATRIC', 'GERIATRIC', 'CARDIOLOGY', 'DERMATOLOGY', 'GYNECOLOGY', 'UROLOGY',
    'ORTHOPEDIC', 'NEUROLOGY', 'ONCOLOGY', 'RADIOLOGY', 'PATHOLOGY', 'ANESTHESIA'
  ],
  
  construction: [
    'CONSTRUCTION', 'CONTRACTOR', 'BUILDING', 'PLUMBING', 'ELECTRICAL', 'HEATING',
    'HVAC', 'ROOFING', 'FLOORING', 'PAINTING', 'LANDSCAPING', 'EXCAVATION',
    'CONCRETE', 'WELDING', 'CARPENTRY', 'RENOVATION', 'REMODELING', 'REPAIR',
    'MAINTENANCE', 'CLEANING', 'JANITORIAL', 'SECURITY', 'ALARM', 'LOCKSMITH',
    'MOVING', 'STORAGE', 'PROPERTY', 'REAL ESTATE', 'PROPERTY MANAGEMENT', 'RENTAL',
    'EXCAVATION', 'DEMOLITION', 'FOUNDATION', 'FRAMING', 'DRYWALL', 'TILING',
    'MASONRY', 'STEEL', 'METALWORK', 'FABRICATION', 'MACHINING', 'BOBCAT',
    'EQUIPMENT', 'RENTAL', 'TOOLS', 'SUPPLIES', 'MATERIALS'
  ],
  
  professional: [
    'LAW', 'LEGAL', 'ATTORNEY', 'LAWYER', 'BARRISTER', 'SOLICITOR', 'NOTARY',
    'ACCOUNTING', 'ACCOUNTANT', 'BOOKKEEPING', 'TAX', 'AUDIT', 'FINANCIAL',
    'CONSULTING', 'CONSULTANT', 'ENGINEERING', 'ENGINEER', 'ARCHITECT', 'SURVEYING',
    'SURVEYOR', 'INSURANCE', 'INVESTMENT', 'ADVISORY', 'MANAGEMENT', 'MARKETING',
    'ADVERTISING', 'DESIGN', 'PLANNING', 'DEVELOPMENT', 'TECHNOLOGY', 'SOFTWARE',
    'IT', 'COMPUTER', 'WEB', 'DIGITAL', 'APPRAISAL', 'VALUATION', 'ASSESSMENT'
  ],
  
  retail: [
    'STORE', 'SHOP', 'BOUTIQUE', 'RETAIL', 'MERCHANDISE', 'GOODS', 'EQUIPMENT',
    'SUPPLIES', 'MATERIALS', 'TOOLS', 'HARDWARE', 'FURNITURE', 'APPLIANCE',
    'ELECTRONICS', 'COMPUTER', 'PHONE', 'CAMERA', 'JEWELRY', 'JEWELLERY',
    'CLOTHING', 'FASHION', 'SHOES', 'ACCESSORIES', 'GIFTS', 'TOYS', 'SPORTS',
    'OUTDOOR', 'AUTOMOTIVE', 'AUTO', 'CAR', 'MOTORCYCLE', 'BOAT', 'MARINE',
    'CANNABIS', 'CBD', 'DISPENSARY', 'COLLECTIBLES', 'CARDS', 'POKEMON', 'YUGIOH',
    'HOCKEY', 'BASEBALL', 'MAGIC', 'GAMES', 'HOBBIES', 'ANTIQUES', 'VINTAGE'
  ],
  
  restaurants: [
    'RESTAURANT', 'CAFE', 'COFFEE', 'BAR', 'PUB', 'GRILL', 'DINER', 'BISTRO',
    'EATERY', 'FOOD', 'CATERING', 'CATERER', 'BAKERY', 'DELI', 'PIZZA', 'BURGER',
    'SANDWICH', 'SUB', 'TACO', 'MEXICAN', 'CHINESE', 'JAPANESE', 'THAI', 'INDIAN',
    'ITALIAN', 'GREEK', 'MEDITERRANEAN', 'SEAFOOD', 'STEAK', 'BBQ', 'BUFFET',
    'FAST FOOD', 'TAKEOUT', 'DELIVERY', 'FOOD TRUCK', 'CATERING', 'BREWERY',
    'DISTILLERY', 'WINERY', 'VINEYARD'
  ],
  
  personalCare: [
    'SALON', 'SPA', 'BARBER', 'HAIR', 'BEAUTY', 'NAILS', 'MASSAGE', 'THERAPY',
    'WELLNESS', 'FITNESS', 'GYM', 'YOGA', 'PILATES', 'DANCE', 'MARTIAL ARTS',
    'TANNING', 'AESTHETICS', 'COSMETICS', 'MAKEUP', 'SKINCARE', 'FACIAL',
    'WAXING', 'EYEBROW', 'LASH', 'TATTOO', 'PIERCING', 'BODY ART', 'MANICURE',
    'PEDICURE', 'HAIRSTYLIST', 'BARBERSHOP', 'BEAUTY PARLOR', 'BEAUTY PARLOUR'
  ],
  
  transportation: [
    'TAXI', 'CAB', 'KABS', 'TRANSPORT', 'TRANSPORTATION', 'SHUTTLE', 'BUS',
    'COACH', 'CHARTER', 'TOUR', 'GUIDE', 'HELICOPTER', 'AIRCRAFT', 'AVIATION',
    'FLIGHT', 'PILOT', 'DRIVING', 'LESSONS', 'SCHOOL', 'TRAINING', 'LICENSE',
    'LICENCE', 'MOTORCYCLE', 'BIKE', 'CYCLE', 'AUTO', 'CAR', 'TRUCK', 'FLEET'
  ],
  
  agriculture: [
    'FARM', 'FARMING', 'RANCH', 'RANCHING', 'CATTLE', 'LIVESTOCK', 'CROP',
    'SEED', 'NURSERY', 'GREENHOUSE', 'GARDEN', 'LANDSCAPING', 'FLORIST',
    'FLOWERS', 'PLANTS', 'TREES', 'SHRUBS', 'VEGETABLES', 'FRUITS', 'GRAIN',
    'FEED', 'SUPPLIES', 'EQUIPMENT', 'TRACTOR', 'MACHINERY', 'IRRIGATION'
  ],
  
  forestry: [
    'FORESTRY', 'LOGGING', 'LUMBER', 'WOOD', 'TIMBER', 'SAWMILL', 'MILL',
    'CUTTING', 'FALLING', 'BUCKING', 'SKIDDING', 'HAULING', 'TRUCKING',
    'TRANSPORT', 'SUPPLY', 'EQUIPMENT', 'MACHINERY', 'TOOLS', 'SAFETY'
  ],
  
  mining: [
    'MINING', 'MINE', 'MINERAL', 'ORE', 'GOLD', 'SILVER', 'COPPER', 'COAL',
    'GRAVEL', 'SAND', 'STONE', 'QUARRY', 'EXCAVATION', 'DRILLING', 'BLASTING',
    'EXPLORATION', 'PROSPECTING', 'GEOLOGY', 'GEOLOGICAL', 'SURVEY', 'MAPPING'
  ],
  
  tourism: [
    'TOURISM', 'TOUR', 'GUIDE', 'ADVENTURE', 'OUTDOOR', 'FISHING', 'HUNTING',
    'CAMPING', 'HIKING', 'SKIING', 'SNOWBOARDING', 'SNOWMOBILE', 'ATV',
    'RECREATION', 'ENTERTAINMENT', 'EVENTS', 'WEDDING', 'CONFERENCE', 'MEETING',
    'ACCOMMODATION', 'LODGING', 'MOTEL', 'HOTEL', 'INN', 'RESORT', 'CABIN'
  ]
}

async function industryBasedCategorization() {
  console.log('🏭 INDUSTRY-BASED CATEGORIZATION')
  console.log('=================================')
  
  try {
    const groups = await prisma.audienceGroup.findMany()
    const groupMap = new Map(groups.map(g => [g.name, g.id]))
    
    // Create Miscellaneous group if it doesn't exist
    let miscGroupId = groupMap.get('Miscellaneous')
    if (!miscGroupId) {
      const miscGroup = await prisma.audienceGroup.create({
        data: {
          name: 'Miscellaneous',
          description: 'Businesses that need manual categorization',
          meta: {}
        }
      })
      miscGroupId = miscGroup.id
      groupMap.set('Miscellaneous', miscGroupId)
    }
    
    const chainsGroupId = groupMap.get('Chains & Franchises')
    const businesses = await prisma.audienceMember.findMany({
      where: { groupId: chainsGroupId },
      take: 100,
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`\n📊 Processing ${businesses.length} businesses with INDUSTRY-BASED logic...`)
    
    let categorized = 0
    let misc = 0
    const categories = {
      chains: 0,
      healthcare: 0,
      construction: 0,
      professional: 0,
      retail: 0,
      restaurants: 0,
      personalCare: 0,
      transportation: 0,
      agriculture: 0,
      forestry: 0,
      mining: 0,
      tourism: 0,
      personalNames: 0,
      numbered: 0,
      misc: 0
    }
    
    for (const business of businesses) {
      const name = business.businessName?.toUpperCase() || ''
      const email = business.primaryEmail?.toUpperCase() || ''
      const fullText = `${name} ${email}`.toUpperCase()
      
      let targetGroup = 'Miscellaneous'
      let confidence = 'LOW'
      let reason = ''
      
      // 1. Check if it's a known chain first
      const isKnownChain = KNOWN_CHAINS.some(chain => 
        name.includes(chain) || email.includes(chain.toLowerCase())
      )
      
      if (isKnownChain) {
        targetGroup = 'Chains & Franchises'
        confidence = 'HIGH'
        reason = 'Known Canadian/Northern BC chain'
        categories.chains++
      }
      // 2. Check for industry patterns
      else if (INDUSTRY_PATTERNS.healthcare.some(pattern => fullText.includes(pattern))) {
        targetGroup = 'Healthcare & Wellness'
        confidence = 'HIGH'
        reason = 'Healthcare/medical industry identifier'
        categories.healthcare++
      }
      else if (INDUSTRY_PATTERNS.construction.some(pattern => fullText.includes(pattern))) {
        targetGroup = 'Home & Construction Services'
        confidence = 'HIGH'
        reason = 'Construction/home services industry identifier'
        categories.construction++
      }
      else if (INDUSTRY_PATTERNS.professional.some(pattern => fullText.includes(pattern))) {
        targetGroup = 'Professional Services'
        confidence = 'HIGH'
        reason = 'Professional services industry identifier'
        categories.professional++
      }
      else if (INDUSTRY_PATTERNS.retail.some(pattern => fullText.includes(pattern))) {
        targetGroup = 'Retail & E-commerce'
        confidence = 'HIGH'
        reason = 'Retail industry identifier'
        categories.retail++
      }
      else if (INDUSTRY_PATTERNS.restaurants.some(pattern => fullText.includes(pattern))) {
        targetGroup = 'Restaurants & Food Service'
        confidence = 'HIGH'
        reason = 'Restaurant/food service industry identifier'
        categories.restaurants++
      }
      else if (INDUSTRY_PATTERNS.personalCare.some(pattern => fullText.includes(pattern))) {
        targetGroup = 'Personal Care & Beauty'
        confidence = 'HIGH'
        reason = 'Personal care/beauty industry identifier'
        categories.personalCare++
      }
      else if (INDUSTRY_PATTERNS.transportation.some(pattern => fullText.includes(pattern))) {
        targetGroup = 'Transportation & Logistics'
        confidence = 'HIGH'
        reason = 'Transportation industry identifier'
        categories.transportation++
      }
      else if (INDUSTRY_PATTERNS.agriculture.some(pattern => fullText.includes(pattern))) {
        targetGroup = 'Agriculture & Landscaping'
        confidence = 'HIGH'
        reason = 'Agriculture/landscaping industry identifier'
        categories.agriculture++
      }
      else if (INDUSTRY_PATTERNS.forestry.some(pattern => fullText.includes(pattern))) {
        targetGroup = 'Forestry & Logging'
        confidence = 'HIGH'
        reason = 'Forestry/logging industry identifier'
        categories.forestry++
      }
      else if (INDUSTRY_PATTERNS.mining.some(pattern => fullText.includes(pattern))) {
        targetGroup = 'Mining & Resources'
        confidence = 'HIGH'
        reason = 'Mining/resources industry identifier'
        categories.mining++
      }
      else if (INDUSTRY_PATTERNS.tourism.some(pattern => fullText.includes(pattern))) {
        targetGroup = 'Tourism & Recreation'
        confidence = 'HIGH'
        reason = 'Tourism/recreation industry identifier'
        categories.tourism++
      }
      // 3. Check for numbered businesses
      else if (/^[0-9A-Z\s#\.\-]+$/.test(name) && !name.includes('LTD') && !name.includes('INC') && !name.includes('CORP')) {
        targetGroup = 'Numbered Businesses'
        confidence = 'HIGH'
        reason = 'Numbered business with no clear identifiers'
        categories.numbered++
      }
      // 4. Check for personal names (very specific)
      else if (name.match(/^(DR\.|MR\.|MS\.|MRS\.|PROF\.)/) || 
               (name.split(' ').length <= 3 && !name.includes('LTD') && !name.includes('INC') && !name.includes('CORP') && !name.includes('&') && !name.includes('RESTAURANT') && !name.includes('COFFEE') && !name.includes('STORE') && !name.includes('SHOP') && !name.includes('MCDONALD') && !name.includes('STARBUCKS') && !name.includes('WALMART') && !name.includes('HOME DEPOT') && !name.includes('SUBWAY') && !name.includes('TIM HORTONS') && !name.includes('TARGET'))) {
        targetGroup = 'Personal Names'
        confidence = 'HIGH'
        reason = 'Personal name without clear business identifiers'
        categories.personalNames++
      }
      // 5. Everything else goes to Miscellaneous
      else {
        targetGroup = 'Miscellaneous'
        confidence = 'LOW'
        reason = 'No clear industry identifier found'
        categories.misc++
      }
      
      // Move to target group
      const targetGroupId = groupMap.get(targetGroup)
      if (targetGroupId) {
        await prisma.audienceMember.update({
          where: { id: business.id },
          data: { 
            groupId: targetGroupId,
            unsubscribed: targetGroup === 'Chains & Franchises'
          }
        })
        
        if (targetGroup !== 'Miscellaneous') {
          categorized++
        } else {
          misc++
        }
        
        if (categorized % 10 === 0) {
          console.log(`   ✅ Categorized ${categorized} businesses...`)
        }
      }
    }
    
    console.log(`\n📊 INDUSTRY-BASED CATEGORIZATION RESULTS:`)
    console.log(`- Total processed: ${businesses.length}`)
    console.log(`- High confidence categorized: ${categorized}`)
    console.log(`- Sent to Miscellaneous: ${misc}`)
    console.log(`- Categorization rate: ${((categorized / businesses.length) * 100).toFixed(1)}%`)
    
    console.log(`\n📊 BREAKDOWN:`)
    console.log(`- Chains & Franchises: ${categories.chains}`)
    console.log(`- Healthcare & Wellness: ${categories.healthcare}`)
    console.log(`- Home & Construction: ${categories.construction}`)
    console.log(`- Professional Services: ${categories.professional}`)
    console.log(`- Retail & E-commerce: ${categories.retail}`)
    console.log(`- Restaurants & Food Service: ${categories.restaurants}`)
    console.log(`- Personal Care & Beauty: ${categories.personalCare}`)
    console.log(`- Transportation & Logistics: ${categories.transportation}`)
    console.log(`- Agriculture & Landscaping: ${categories.agriculture}`)
    console.log(`- Forestry & Logging: ${categories.forestry}`)
    console.log(`- Mining & Resources: ${categories.mining}`)
    console.log(`- Tourism & Recreation: ${categories.tourism}`)
    console.log(`- Personal Names: ${categories.personalNames}`)
    console.log(`- Numbered Businesses: ${categories.numbered}`)
    console.log(`- Miscellaneous: ${categories.misc}`)
    
    // Show current totals
    const updatedGroups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      }
    })
    
    console.log(`\n📊 CURRENT TOTALS:`)
    updatedGroups.forEach(group => {
      console.log(`- ${group.name}: ${group._count.members} businesses`)
    })
    
    console.log(`\n✅ Industry-based categorization complete!`)
    console.log(`\n📋 NEXT STEPS:`)
    console.log(`1. Review the Miscellaneous category manually`)
    console.log(`2. Move businesses from Miscellaneous to correct categories`)
    console.log(`3. Run this script again on the next 100 businesses`)
    
  } catch (error) {
    console.error('❌ Failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

industryBasedCategorization()
  .then(() => {
    console.log('\n✅ Complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })


