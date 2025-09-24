import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

config()
const prisma = new PrismaClient()

async function debugChainClassification() {
  console.log('🔍 DEBUGGING CHAIN CLASSIFICATION')
  console.log('=================================')
  
  try {
    const groups = await prisma.audienceGroup.findMany()
    const groupMap = new Map(groups.map(g => [g.name, g.id]))
    
    const chainsGroupId = groupMap.get('Chains & Franchises')
    const businesses = await prisma.audienceMember.findMany({
      where: { groupId: chainsGroupId },
      take: 20, // Look at first 20
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`\n📊 EXAMINING FIRST 20 BUSINESSES IN CHAINS & FRANCHISES:`)
    console.log(`\n🔍 Let me manually analyze each one to see if they're actually chains:`)
    
    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i]
      const name = business.businessName || 'Unknown'
      const email = business.primaryEmail || ''
      
      console.log(`\n${i + 1}. ${name}`)
      console.log(`   Email: ${email}`)
      
      // Let me manually analyze if this is actually a chain
      let isActuallyChain = false
      let reason = ''
      
      // Check if it's a known major chain
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
        isActuallyChain = true
        reason = 'Known major chain/franchise'
      }
      // Check if it's a local business that just has "LTD" or "INC" in the name
      else if (name.includes('LTD') || name.includes('INC') || name.includes('CORP')) {
        isActuallyChain = false
        reason = 'Local business with corporate structure (LTD/INC/CORP)'
      }
      // Check if it's a numbered business
      else if (/^[0-9A-Z\s#\.\-]+$/.test(name)) {
        isActuallyChain = false
        reason = 'Numbered business'
      }
      // Check if it's a personal name
      else if (name.split(' ').length <= 3 && !name.includes('LTD') && !name.includes('INC') && !name.includes('CORP')) {
        isActuallyChain = false
        reason = 'Personal name'
      }
      // Everything else
      else {
        isActuallyChain = false
        reason = 'Local business - not a chain'
      }
      
      console.log(`   → ${isActuallyChain ? '✅ LEGITIMATE CHAIN' : '❌ NOT A CHAIN'}: ${reason}`)
      if (!isActuallyChain) {
        console.log(`   → Should be moved to another category`)
      }
    }
    
    console.log(`\n📊 SUMMARY:`)
    console.log(`- I need to be much more strict about what constitutes a "chain"`)
    console.log(`- Most businesses with LTD/INC are local businesses, not chains`)
    console.log(`- I should only classify as chains if they're known major franchises`)
    console.log(`- The current logic is too broad and catching local businesses`)
    
  } catch (error) {
    console.error('❌ Failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

debugChainClassification()
  .then(() => {
    console.log('\n✅ Debug complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error)
    process.exit(1)
  })



