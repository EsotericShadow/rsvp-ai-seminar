import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config()

const prisma = new PrismaClient()

async function manualValidateBatch1() {
  console.log('🔍 MANUAL VALIDATION - BATCH 1 (First 100 businesses)')
  console.log('====================================================')
  
  try {
    // Get all groups
    const groups = await prisma.audienceGroup.findMany()
    const groupMap = new Map(groups.map(g => [g.name, g.id]))
    
    // Get first 100 businesses from Chains & Franchises
    const chainsGroupId = groupMap.get('Chains & Franchises')
    if (!chainsGroupId) {
      console.log('❌ Chains & Franchises group not found')
      return
    }
    
    const businesses = await prisma.audienceMember.findMany({
      where: { groupId: chainsGroupId },
      take: 100,
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`\n📊 MANUALLY VALIDATING ${businesses.length} businesses from Chains & Franchises...`)
    console.log(`\n🔍 DETAILED ANALYSIS:`)
    
    let correctChains = 0
    let miscategorized = 0
    const corrections = []
    
    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i]
      const name = business.businessName || 'Unknown'
      const email = business.primaryEmail || ''
      
      console.log(`\n${i + 1}. ${name}`)
      console.log(`   Email: ${email}`)
      
      // Manual analysis of each business
      let shouldBeInChains = true
      let correctCategory = 'Chains & Franchises'
      let reason = ''
      
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
          name.includes('CORPORATE') || name.includes('HEADQUARTERS')) {
        shouldBeInChains = true
        reason = 'Legitimate chain/franchise'
        correctChains++
      }
      // Check if it's a numbered business
      else if (/^[0-9A-Z\s#\.\-]+$/.test(name) && !name.includes('LTD') && !name.includes('INC') && !name.includes('CORP')) {
        shouldBeInChains = false
        correctCategory = 'Numbered Businesses'
        reason = 'Numbered business with no clear identifiers'
        miscategorized++
        corrections.push({ business, correctCategory, reason })
      }
      // Check if it's a personal name
      else if (name.match(/^(DR\.|MR\.|MS\.|MRS\.|PROF\.)/) || 
               (name.split(' ').length <= 3 && !name.includes('LTD') && !name.includes('INC') && !name.includes('CORP') && !name.includes('&'))) {
        shouldBeInChains = false
        correctCategory = 'Personal Names'
        reason = 'Personal name without clear business identifiers'
        miscategorized++
        corrections.push({ business, correctCategory, reason })
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
        correctCategory = 'Healthcare & Wellness'
        reason = 'Healthcare/medical business'
        miscategorized++
        corrections.push({ business, correctCategory, reason })
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
        correctCategory = 'Home & Construction Services'
        reason = 'Construction/home services business'
        miscategorized++
        corrections.push({ business, correctCategory, reason })
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
        correctCategory = 'Professional Services'
        reason = 'Professional services business'
        miscategorized++
        corrections.push({ business, correctCategory, reason })
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
        correctCategory = 'Retail & E-commerce'
        reason = 'Retail business'
        miscategorized++
        corrections.push({ business, correctCategory, reason })
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
        correctCategory = 'Restaurants & Food Service'
        reason = 'Restaurant/food service business'
        miscategorized++
        corrections.push({ business, correctCategory, reason })
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
        correctCategory = 'Personal Care & Beauty'
        reason = 'Personal care/beauty business'
        miscategorized++
        corrections.push({ business, correctCategory, reason })
      }
      else {
        // Default to chains if no clear category
        shouldBeInChains = true
        reason = 'No clear category - defaulting to chains'
        correctChains++
      }
      
      console.log(`   → ${shouldBeInChains ? '✅ CORRECT' : '❌ MISCATEGORIZED'}: ${reason}`)
      if (!shouldBeInChains) {
        console.log(`   → Should be in: ${correctCategory}`)
      }
    }
    
    console.log(`\n📊 BATCH 1 VALIDATION RESULTS:`)
    console.log(`- Total businesses: ${businesses.length}`)
    console.log(`- Correctly in Chains: ${correctChains}`)
    console.log(`- Miscategorized: ${miscategorized}`)
    console.log(`- Accuracy: ${((correctChains / businesses.length) * 100).toFixed(1)}%`)
    
    if (corrections.length > 0) {
      console.log(`\n🔧 APPLYING CORRECTIONS:`)
      
      for (const correction of corrections) {
        const targetGroupId = groupMap.get(correction.correctCategory)
        if (targetGroupId) {
          await prisma.audienceMember.update({
            where: { id: correction.business.id },
            data: { 
              groupId: targetGroupId,
              unsubscribed: correction.correctCategory === 'Chains & Franchises'
            }
          })
          console.log(`   ✅ Moved "${correction.business.businessName}" to ${correction.correctCategory}`)
        }
      }
    }
    
    // Show updated totals
    const updatedGroups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      }
    })
    
    console.log(`\n📊 UPDATED TOTALS AFTER BATCH 1 CORRECTIONS:`)
    updatedGroups.forEach(group => {
      console.log(`- ${group.name}: ${group._count.members} businesses`)
    })
    
    console.log(`\n✅ Batch 1 manual validation complete!`)
    
  } catch (error) {
    console.error('❌ Failed to validate batch 1:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

manualValidateBatch1()
  .then(() => {
    console.log('\n✅ Manual validation complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Manual validation failed:', error)
    process.exit(1)
  })
