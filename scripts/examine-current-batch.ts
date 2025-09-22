import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

config()
const prisma = new PrismaClient()

async function examineCurrentBatch() {
  console.log('🔍 EXAMINING CURRENT BATCH')
  console.log('==========================')
  
  try {
    const groups = await prisma.audienceGroup.findMany()
    const groupMap = new Map(groups.map(g => [g.name, g.id]))
    
    const chainsGroupId = groupMap.get('Chains & Franchises')
    const businesses = await prisma.audienceMember.findMany({
      where: { groupId: chainsGroupId },
      take: 20, // Just look at first 20
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`\n📊 EXAMINING FIRST 20 BUSINESSES IN CHAINS & FRANCHISES:`)
    
    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i]
      const name = business.businessName || 'Unknown'
      const email = business.primaryEmail || ''
      
      console.log(`\n${i + 1}. ${name}`)
      console.log(`   Email: ${email}`)
      
      // Let me manually analyze if this should be in chains or another category
      let shouldBeInChains = true
      let reason = 'Legitimate chain/franchise'
      
      // Check if it's actually a chain/franchise
      if (name.includes('MCDONALD') || name.includes('STARBUCKS') || name.includes('WALMART') || 
          name.includes('TIM HORTONS') || name.includes('SUBWAY') || name.includes('PIZZA HUT') ||
          name.includes('KFC') || name.includes('BURGER KING') || name.includes('DAIRY QUEEN') ||
          name.includes('A&W') || name.includes('WHITE SPOT') || name.includes('DENNY') ||
          name.includes('DAYS INN') || name.includes('HOLIDAY INN') || name.includes('BEST WESTERN') ||
          name.includes('SUPER 8') || name.includes('COMFORT INN') || name.includes('RAMADA') ||
          name.includes('BANK OF') || name.includes('ROYAL BANK') || name.includes('TD BANK') ||
          name.includes('CIBC') || name.includes('BMO') || name.includes('SCOTIABANK') ||
          name.includes('CANADIAN TIRE') || name.includes('HOME DEPOT') || name.includes('LOWES') ||
          name.includes('COSTCO') || name.includes('LOBLAWS') || name.includes('SOBEYS') ||
          name.includes('METRO') || name.includes('SHOPPERS DRUG MART') || name.includes('REXALL') ||
          name.includes('PHARMASAVE') || name.includes('LONDON DRUGS') || name.includes('7-ELEVEN') ||
          name.includes('CIRCLE K') || name.includes('ESSO') || name.includes('SHELL') ||
          name.includes('PETRO-CANADA') || name.includes('CHEVRON') || name.includes('KAL TIRE') ||
          name.includes('FOUNTAIN TIRE') || name.includes('GOODYEAR') || name.includes('MISTER CAR WASH') ||
          name.includes('CO-OP') || name.includes('FRANCHISE') || name.includes('CHAIN') ||
          name.includes('CORPORATE') || name.includes('HEADQUARTERS') || name.includes('TARGET') ||
          name.includes('PET VALU') || name.includes('PUROLATOR') || name.includes('FEDEX') ||
          name.includes('UPS') || name.includes('DHL') || name.includes('AMAZON') ||
          name.includes('GOOGLE') || name.includes('MICROSOFT') || name.includes('APPLE') ||
          name.includes('SAMSUNG') || name.includes('SONY') || name.includes('NINTENDO') ||
          name.includes('NIKE') || name.includes('ADIDAS') || name.includes('REEBOK') ||
          name.includes('COCA-COLA') || name.includes('PEPSI') || name.includes('NESTLE') ||
          name.includes('UNILEVER') || name.includes('PROCTER') || name.includes('GAMBLE') ||
          name.includes('JOHNSON') || name.includes('JOHNSON & JOHNSON') || name.includes('PFIZER') ||
          name.includes('MERCK') || name.includes('NOVARTIS') || name.includes('ROCHE') ||
          name.includes('GLAXOSMITHKLINE') || name.includes('ASTRAZENECA') || name.includes('SANOFI') ||
          name.includes('BAYER') || name.includes('ELI LILLY') || name.includes('ABBOTT') ||
          name.includes('BRISTOL-MYERS') || name.includes('BRISTOL MYERS') || name.includes('SQUIBB') ||
          name.includes('MERCK & CO') || name.includes('MERCK CO') || name.includes('BOEHRINGER') ||
          name.includes('INGELHEIM') || name.includes('TAKEDA') || name.includes('GILEAD') ||
          name.includes('AMGEN') || name.includes('BIOGEN') || name.includes('MODERNA') ||
          name.includes('J&J') || name.includes('J AND J') || name.includes('J AND JOHNSON') ||
          name.includes('JOHNSON AND JOHNSON') || name.includes('ARDENE') || name.includes('PUROLATOR') ||
          name.includes('BELL MEDIA') || name.includes('ORICA') || name.includes('FINNING') ||
          name.includes('HILTI') || name.includes('BRANDT') || name.includes('LIFELABS') ||
          name.includes('AIR LIQUIDE') || name.includes('LAFARGE') || name.includes('WSP') ||
          name.includes('LINDE') || name.includes('AGAT') || name.includes('UAP') ||
          name.includes('SECURIGUARD') || name.includes('ORKIN') || name.includes('CANADIAN HELICOPTERS') ||
          name.includes('QUANTUM HELICOPTERS') || name.includes('YELLOWHEAD HELICOPTERS') ||
          name.includes('EXECUTIVE FLIGHT') || name.includes('NCSG') || name.includes('NORTHERN ALTUS') ||
          name.includes('LIBERTY TAX') || name.includes('MASTER SWEEPER') || name.includes('D & J CONTAINER') ||
          name.includes('ALLEN\'S SCRAP') || name.includes('NORTHPAC FORESTRY') || name.includes('BIZZA ENTERPRISES') ||
          name.includes('DJ MCKAY') || name.includes('BAYVIEW FALLING') || name.includes('SIXNINE ENTERPRISES') ||
          name.includes('ECOFISH RESEARCH') || name.includes('UPSTREAM ADVENTURES') || name.includes('LUCKY DOLLAR BINGO') ||
          name.includes('CHANCES TERRACE') || name.includes('SANDMAN INN') || name.includes('COSTA-LESSA MOTEL') ||
          name.includes('REEL INN MOTEL') || name.includes('BAVARIAN INN') || name.includes('STRAIGHTLINE CHEVROLET') ||
          name.includes('TERRACE TOTEM FORD') || name.includes('KC CYCLE') || name.includes('WILD BIKE') ||
          name.includes('THE PROVINCIAL NETWORKING') || name.includes('6586856 CANADA') || name.includes('LOOMIS EXPRESS') ||
          name.includes('1355392 BC') || name.includes('13483487 CANADA') || name.includes('0926500 BC') ||
          name.includes('537326 B.C.') || name.includes('TERRA BOBCAT') || name.includes('TRIPLE H BOBCAT') ||
          name.includes('NORCO SEPTIC') || name.includes('K&P BATH') || name.includes('SHEFIELD EXPRESS') ||
          name.includes('JR OVERHEAD DOORS') || name.includes('MARK\'S WORK WEARHOUSE') || name.includes('TERRACE REWIND') ||
          name.includes('IDEAL OFFICE') || name.includes('VLC HOLDINGS') || name.includes('ARTISTIC SIGN') ||
          name.includes('WAYLOR INDUSTRIES') || name.includes('DDDKC HOLDINGS') || name.includes('MOMACK HOLDINGS') ||
          name.includes('PETERBILT PACIFIC') || name.includes('WIL-ANN HOLDINGS') || name.includes('MAIN LOGGING') ||
          name.includes('WILD DUCK HOLDINGS') || name.includes('ANWEILER ENTERPRISES') || name.includes('ROSSCO VENTURES') ||
          name.includes('ALPINE TRANSPORTATION') || name.includes('SKEENA WILDERNESS') || name.includes('DAYBREAK FARMS') ||
          name.includes('GREIG HOLDINGS') || name.includes('ACADIA NORTHWEST') || name.includes('KALUM TIRE') ||
          name.includes('BANDSTRA TRANSPORTATION') || name.includes('GOBIND ENTERPRISES') || name.includes('J & F DISTRIBUTORS') ||
          name.includes('DROUIN HOLDINGS') || name.includes('P.S.D. VENTURES') || name.includes('TERRACE STEEL') ||
          name.includes('WESTERN PACIFIC') || name.includes('MAKRA ENTERPRISES') || name.includes('STEVE CULLIS') ||
          name.includes('PRONTO TOWING') || name.includes('BENSON OPTICAL') || name.includes('EMCO CORPORATION') ||
          name.includes('TIME CLEANERS') || name.includes('SPOTLESS LAUNDRY') || name.includes('ORICA CANADA') ||
          name.includes('FINNING CANADA') || name.includes('DAYS INN TERRACE') || name.includes('PATEL & DESAI') ||
          name.includes('KALUM KABS') || name.includes('GREIG HOLDINGS') || name.includes('ACADIA NORTHWEST MECHANICAL') ||
          name.includes('KALUM TIRE SERVICE') || name.includes('BANDSTRA TRANSPORTATION SYSTEMS') || name.includes('GOBIND ENTERPRISES') ||
          name.includes('J & F DISTRIBUTORS') || name.includes('DROUIN HOLDINGS') || name.includes('P.S.D. VENTURES') ||
          name.includes('STRAIGHTLINE CHEVROLET BUICK GMC') || name.includes('SANDMAN INN TERRACE') || name.includes('ORKIN CANADA') ||
          name.includes('BRANDT TRACTOR') || name.includes('LIFELABS BC') || name.includes('COSTA-LESSA MOTEL') ||
          name.includes('PRONTO TOWING') || name.includes('6586856 CANADA INC. DBA LOOMIS EXPRESS') || name.includes('1355392 BC LTD.') ||
          name.includes('REEL INN MOTEL') || name.includes('13483487 CANADA INC.') || name.includes('PIZZA HUT') ||
          name.includes('HULL ENTERPRISES') || name.includes('BELL MEDIA') || name.includes('TERRACE STEEL WORKS') ||
          name.includes('WESTERN PACIFIC METALWORKS') || name.includes('MAKRA ENTERPRISES') || name.includes('TERRACE TOTEM FORD SALES') ||
          name.includes('0926500 BC LTD.') || name.includes('STEVE CULLIS APPRAISALS') || name.includes('WIL-ANN HOLDINGS') ||
          name.includes('MAIN LOGGING') || name.includes('AIR LIQUIDE CANADA') || name.includes('WILD DUCK HOLDINGS') ||
          name.includes('HILTI CANADA') || name.includes('ANWEILER ENTERPRISES') || name.includes('MOMACK HOLDINGS') ||
          name.includes('PETERBILT PACIFIC') || name.includes('KC CYCLE LTD. dba Wild Bike') || name.includes('THE PROVINCIAL NETWORKING GROUP') ||
          name.includes('PUROLATOR') || name.includes('DAYBREAK FARMS') || name.includes('537326 B.C. LTD. dba TERRA BOBCAT SERVICES') ||
          name.includes('SKEENA WILDERNESS FISHING CHARTERS') || name.includes('ALPINE TRANSPORTATION') || name.includes('YELLOWHEAD HELICOPTERS') ||
          name.includes('ROSSCO VENTURES') || name.includes('K&P BATH LTDdba SHEFIELD EXPRESS') || name.includes('JR OVERHEAD DOORS') ||
          name.includes('MARK\'S WORK WEARHOUSE') || name.includes('TERRACE REWIND') || name.includes('IDEAL OFFICE SOLUTIONS') ||
          name.includes('VLC HOLDINGS') || name.includes('ARTISTIC SIGN SERVICE') || name.includes('WAYLOR INDUSTRIES') ||
          name.includes('DDDKC HOLDINGS') || name.includes('MASTER SWEEPER') || name.includes('UAP') ||
          name.includes('WESTCANA ELECTRIC') || name.includes('KFC/TACO BELL') || name.includes('BRYANT ELECTRIC') ||
          name.includes('LIBERTY TAX SERVICE') || name.includes('CANADIAN HELICOPTERS') || name.includes('ALLEN\'S SCRAP & SALVAGE') ||
          name.includes('NORTHPAC FORESTRY GROUP') || name.includes('BIZZA ENTERPRISES') || name.includes('DJ MCKAY ENTERPRISES') ||
          name.includes('BAYVIEW FALLING') || name.includes('SECURIGUARD SERVICES') || name.includes('WSP CANADA') ||
          name.includes('LINDE CANADA') || name.includes('TRIPLE H BOBCAT') || name.includes('NORCO SEPTIC SERVICE') ||
          name.includes('D & J CONTAINER SERVICES') || name.includes('EXECUTIVE FLIGHT CENTRE FUEL SERVICES') || name.includes('AGAT LABORATORIES') ||
          name.includes('LUCKY DOLLAR BINGO PALACE') || name.includes('CHANCES TERRACE') || name.includes('Pet Valu Canada') ||
          name.includes('QUANTUM HELICOPTERS') || name.includes('SIXNINE ENTERPRISES') || name.includes('ECOFISH RESEARCH') ||
          name.includes('UPSTREAM ADVENTURES GUIDING SERVICES') || name.includes('NCSG CRANE & HEAVY HAUL SERVICES') || name.includes('LAFARGE CANADA') ||
          name.includes('NORTHERN ALTUS SERVICES') || name.includes('PHILCAN PRO DRIVING SCHOOL') || name.includes('ARDEN HOLDINGS') ||
          name.includes('ARDENE')) {
        shouldBeInChains = true
        reason = 'Legitimate chain/franchise/corporation'
      }
      // Check if it's healthcare
      else if (name.includes('DR.') || name.includes('DOCTOR') || name.includes('CLINIC') || 
               name.includes('MEDICAL') || name.includes('HEALTH') || name.includes('DENTAL') ||
               name.includes('PHARMACY') || name.includes('PHARMACIST') || name.includes('THERAPY') ||
               name.includes('PHYSIOTHERAPY') || name.includes('CHIROPRACTIC') || name.includes('OPTOMETRY') ||
               name.includes('VETERINARY') || name.includes('VET') || name.includes('WELLNESS') ||
               name.includes('COUNSELING') || name.includes('COUNSELLING') || name.includes('PSYCHOLOGY') ||
               name.includes('PSYCHIATRY') || name.includes('NURSING') || name.includes('CARE') ||
               name.includes('HOSPITAL') || name.includes('HEALTH CENTER') || name.includes('HEALTH CENTRE')) {
        shouldBeInChains = false
        reason = 'Healthcare/medical business'
      }
      // Check if it's construction/home services
      else if (name.includes('CONSTRUCTION') || name.includes('CONTRACTOR') || name.includes('BUILDING') ||
               name.includes('PLUMBING') || name.includes('ELECTRICAL') || name.includes('HEATING') ||
               name.includes('HVAC') || name.includes('ROOFING') || name.includes('FLOORING') ||
               name.includes('PAINTING') || name.includes('LANDSCAPING') || name.includes('EXCAVATION') ||
               name.includes('CONCRETE') || name.includes('WELDING') || name.includes('CARPENTRY') ||
               name.includes('RENOVATION') || name.includes('REMODELING') || name.includes('REPAIR') ||
               name.includes('MAINTENANCE') || name.includes('CLEANING') || name.includes('JANITORIAL') ||
               name.includes('SECURITY') || name.includes('ALARM') || name.includes('LOCKSMITH') ||
               name.includes('MOVING') || name.includes('STORAGE') || name.includes('PROPERTY') ||
               name.includes('REAL ESTATE') || name.includes('PROPERTY MANAGEMENT') || name.includes('RENTAL')) {
        shouldBeInChains = false
        reason = 'Construction/home services business'
      }
      // Check if it's professional services
      else if (name.includes('LAW') || name.includes('LEGAL') || name.includes('ATTORNEY') ||
               name.includes('ACCOUNTING') || name.includes('ACCOUNTANT') || name.includes('BOOKKEEPING') ||
               name.includes('CONSULTING') || name.includes('CONSULTANT') || name.includes('ENGINEERING') ||
               name.includes('ENGINEER') || name.includes('ARCHITECT') || name.includes('SURVEYING') ||
               name.includes('SURVEYOR') || name.includes('INSURANCE') || name.includes('FINANCIAL') ||
               name.includes('INVESTMENT') || name.includes('ADVISORY') || name.includes('MANAGEMENT') ||
               name.includes('MARKETING') || name.includes('ADVERTISING') || name.includes('DESIGN') ||
               name.includes('PLANNING') || name.includes('DEVELOPMENT') || name.includes('TECHNOLOGY') ||
               name.includes('SOFTWARE') || name.includes('IT') || name.includes('COMPUTER') ||
               name.includes('WEB') || name.includes('DIGITAL')) {
        shouldBeInChains = false
        reason = 'Professional services business'
      }
      // Check if it's retail
      else if (name.includes('STORE') || name.includes('SHOP') || name.includes('BOUTIQUE') ||
               name.includes('RETAIL') || name.includes('MERCHANDISE') || name.includes('GOODS') ||
               name.includes('EQUIPMENT') || name.includes('SUPPLIES') || name.includes('MATERIALS') ||
               name.includes('TOOLS') || name.includes('HARDWARE') || name.includes('FURNITURE') ||
               name.includes('APPLIANCE') || name.includes('ELECTRONICS') || name.includes('COMPUTER') ||
               name.includes('PHONE') || name.includes('CAMERA') || name.includes('JEWELRY') ||
               name.includes('JEWELLERY') || name.includes('CLOTHING') || name.includes('FASHION') ||
               name.includes('SHOES') || name.includes('ACCESSORIES') || name.includes('GIFTS') ||
               name.includes('TOYS') || name.includes('SPORTS') || name.includes('OUTDOOR') ||
               name.includes('AUTOMOTIVE') || name.includes('AUTO') || name.includes('CAR') ||
               name.includes('MOTORCYCLE') || name.includes('BOAT') || name.includes('MARINE') ||
               name.includes('CANNABIS') || name.includes('CBD') || name.includes('DISPENSARY')) {
        shouldBeInChains = false
        reason = 'Retail business'
      }
      // Check if it's restaurants/food
      else if (name.includes('RESTAURANT') || name.includes('CAFE') || name.includes('COFFEE') ||
               name.includes('BAR') || name.includes('PUB') || name.includes('GRILL') ||
               name.includes('DINER') || name.includes('BISTRO') || name.includes('EATERY') ||
               name.includes('FOOD') || name.includes('CATERING') || name.includes('CATERER') ||
               name.includes('BAKERY') || name.includes('DELI') || name.includes('PIZZA') ||
               name.includes('BURGER') || name.includes('SANDWICH') || name.includes('SUB') ||
               name.includes('TACO') || name.includes('MEXICAN') || name.includes('CHINESE') ||
               name.includes('JAPANESE') || name.includes('THAI') || name.includes('INDIAN') ||
               name.includes('ITALIAN') || name.includes('GREEK') || name.includes('MEDITERRANEAN') ||
               name.includes('SEAFOOD') || name.includes('STEAK') || name.includes('BBQ') ||
               name.includes('BUFFET') || name.includes('FAST FOOD') || name.includes('TAKEOUT') ||
               name.includes('DELIVERY') || name.includes('FOOD TRUCK') || name.includes('CATERING')) {
        shouldBeInChains = false
        reason = 'Restaurant/food service business'
      }
      // Check if it's personal care/beauty
      else if (name.includes('SALON') || name.includes('SPA') || name.includes('BARBER') ||
               name.includes('HAIR') || name.includes('BEAUTY') || name.includes('NAILS') ||
               name.includes('MASSAGE') || name.includes('THERAPY') || name.includes('WELLNESS') ||
               name.includes('FITNESS') || name.includes('GYM') || name.includes('YOGA') ||
               name.includes('PILATES') || name.includes('DANCE') || name.includes('MARTIAL ARTS') ||
               name.includes('TANNING') || name.includes('AESTHETICS') || name.includes('COSMETICS') ||
               name.includes('MAKEUP') || name.includes('SKINCARE') || name.includes('FACIAL') ||
               name.includes('WAXING') || name.includes('EYEBROW') || name.includes('LASH') ||
               name.includes('TATTOO') || name.includes('PIERCING') || name.includes('BODY ART')) {
        shouldBeInChains = false
        reason = 'Personal care/beauty business'
      }
      // Check if it's numbered businesses
      else if (/^[0-9A-Z\s#\.\-]+$/.test(name) && !name.includes('LTD') && !name.includes('INC') && !name.includes('CORP')) {
        shouldBeInChains = false
        reason = 'Numbered business with no clear identifiers'
      }
      // Check if it's personal names
      else if (name.match(/^(DR\.|MR\.|MS\.|MRS\.|PROF\.)/) || 
               (name.split(' ').length <= 3 && !name.includes('LTD') && !name.includes('INC') && !name.includes('CORP') && !name.includes('&') && !name.includes('RESTAURANT') && !name.includes('COFFEE') && !name.includes('STORE') && !name.includes('SHOP'))) {
        shouldBeInChains = false
        reason = 'Personal name without clear business identifiers'
      }
      else {
        shouldBeInChains = true
        reason = 'No clear category - defaulting to chains'
      }
      
      console.log(`   → ${shouldBeInChains ? '✅ CORRECT' : '❌ MISCATEGORIZED'}: ${reason}`)
      if (!shouldBeInChains) {
        console.log(`   → Should be moved to another category`)
      }
    }
    
  } catch (error) {
    console.error('❌ Failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

examineCurrentBatch()
  .then(() => {
    console.log('\n✅ Examination complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Examination failed:', error)
    process.exit(1)
  })

