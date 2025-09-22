import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config()

const prisma = new PrismaClient()

async function categorizeBatch2() {
  console.log('🎯 CATEGORIZING BATCH 2 (Second 100 businesses)')
  console.log('===============================================')
  
  try {
    // Get all groups
    const groups = await prisma.audienceGroup.findMany()
    const groupMap = new Map(groups.map(g => [g.name, g.id]))
    
    // Get next 100 businesses from Chains & Franchises
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
    
    console.log(`\n📊 Processing ${businesses.length} businesses from Chains & Franchises...`)
    
    // Categorize each business
    let categorized = 0
    const categories = {
      chains: 0,
      healthcare: 0,
      construction: 0,
      professional: 0,
      retail: 0,
      restaurants: 0,
      personalCare: 0,
      personalNames: 0,
      numbered: 0
    }
    
    for (const business of businesses) {
      const name = business.businessName?.toLowerCase() || ''
      const email = business.primaryEmail?.toLowerCase() || ''
      
      let targetGroup = 'Chains & Franchises' // default
      
      // 1. Numbered Businesses (only numbers/letters, no clear identifiers)
      if (/^[0-9a-z\s#\.\-]+$/.test(name) && !name.includes('ltd') && !name.includes('inc') && !name.includes('corp')) {
        targetGroup = 'Numbered Businesses'
        categories.numbered++
      }
      // 2. Personal Names (individual professionals without clear business identifiers)
      else if (name.match(/^(dr\.|mr\.|ms\.|mrs\.|prof\.)/) || 
               (name.split(' ').length <= 3 && !name.includes('ltd') && !name.includes('inc') && !name.includes('corp') && !name.includes('&'))) {
        targetGroup = 'Personal Names'
        categories.personalNames++
      }
      // 3. Chains & Franchises (large corporations, franchises, chains)
      else if (name.includes('mcdonald') || name.includes('starbucks') || name.includes('walmart') || 
               name.includes('tim hortons') || name.includes('subway') || name.includes('pizza hut') ||
               name.includes('kfc') || name.includes('burger king') || name.includes('dairy queen') ||
               name.includes('a&w') || name.includes('white spot') || name.includes('denny') ||
               name.includes('days inn') || name.includes('holiday inn') || name.includes('best western') ||
               name.includes('super 8') || name.includes('comfort inn') || name.includes('ramada') ||
               name.includes('bank of') || name.includes('royal bank') || name.includes('td bank') ||
               name.includes('cibc') || name.includes('bmo') || name.includes('scotiabank') ||
               name.includes('canadian tire') || name.includes('home depot') || name.includes('lowes') ||
               name.includes('walmart') || name.includes('costco') || name.includes('loblaws') ||
               name.includes('sobeys') || name.includes('metro') || name.includes('shoppers drug mart') ||
               name.includes('rexall') || name.includes('pharmasave') || name.includes('london drugs') ||
               name.includes('7-eleven') || name.includes('circle k') || name.includes('esso') ||
               name.includes('shell') || name.includes('petro-canada') || name.includes('chevron') ||
               name.includes('kal tire') || name.includes('fountain tire') || name.includes('goodyear') ||
               name.includes('mister car wash') || name.includes('co-op') || name.includes('franchise') ||
               name.includes('chain') || name.includes('corporate') || name.includes('headquarters')) {
        targetGroup = 'Chains & Franchises'
        categories.chains++
      }
      // 4. Healthcare & Wellness
      else if (name.includes('dr.') || name.includes('doctor') || name.includes('clinic') || 
               name.includes('medical') || name.includes('health') || name.includes('dental') ||
               name.includes('pharmacy') || name.includes('pharmacist') || name.includes('therapy') ||
               name.includes('physiotherapy') || name.includes('chiropractic') || name.includes('optometry') ||
               name.includes('veterinary') || name.includes('vet') || name.includes('wellness') ||
               name.includes('counseling') || name.includes('counselling') || name.includes('psychology') ||
               name.includes('psychiatry') || name.includes('nursing') || name.includes('care') ||
               name.includes('hospital') || name.includes('health center') || name.includes('health centre')) {
        targetGroup = 'Healthcare & Wellness'
        categories.healthcare++
      }
      // 5. Home & Construction Services
      else if (name.includes('construction') || name.includes('contractor') || name.includes('building') ||
               name.includes('plumbing') || name.includes('electrical') || name.includes('heating') ||
               name.includes('hvac') || name.includes('roofing') || name.includes('flooring') ||
               name.includes('painting') || name.includes('landscaping') || name.includes('excavation') ||
               name.includes('concrete') || name.includes('welding') || name.includes('carpentry') ||
               name.includes('renovation') || name.includes('remodeling') || name.includes('repair') ||
               name.includes('maintenance') || name.includes('cleaning') || name.includes('janitorial') ||
               name.includes('security') || name.includes('alarm') || name.includes('locksmith') ||
               name.includes('moving') || name.includes('storage') || name.includes('property') ||
               name.includes('real estate') || name.includes('property management') || name.includes('rental')) {
        targetGroup = 'Home & Construction Services'
        categories.construction++
      }
      // 6. Professional Services
      else if (name.includes('law') || name.includes('legal') || name.includes('attorney') ||
               name.includes('accounting') || name.includes('accountant') || name.includes('bookkeeping') ||
               name.includes('consulting') || name.includes('consultant') || name.includes('engineering') ||
               name.includes('engineer') || name.includes('architect') || name.includes('surveying') ||
               name.includes('surveyor') || name.includes('insurance') || name.includes('financial') ||
               name.includes('investment') || name.includes('advisory') || name.includes('advisory') ||
               name.includes('management') || name.includes('marketing') || name.includes('advertising') ||
               name.includes('design') || name.includes('planning') || name.includes('development') ||
               name.includes('technology') || name.includes('software') || name.includes('it') ||
               name.includes('computer') || name.includes('web') || name.includes('digital')) {
        targetGroup = 'Professional Services'
        categories.professional++
      }
      // 7. Retail & E-commerce
      else if (name.includes('store') || name.includes('shop') || name.includes('boutique') ||
               name.includes('retail') || name.includes('merchandise') || name.includes('goods') ||
               name.includes('equipment') || name.includes('supplies') || name.includes('materials') ||
               name.includes('tools') || name.includes('hardware') || name.includes('furniture') ||
               name.includes('appliance') || name.includes('electronics') || name.includes('computer') ||
               name.includes('phone') || name.includes('camera') || name.includes('jewelry') ||
               name.includes('jewellery') || name.includes('clothing') || name.includes('fashion') ||
               name.includes('shoes') || name.includes('accessories') || name.includes('gifts') ||
               name.includes('toys') || name.includes('sports') || name.includes('outdoor') ||
               name.includes('automotive') || name.includes('auto') || name.includes('car') ||
               name.includes('motorcycle') || name.includes('boat') || name.includes('marine') ||
               name.includes('cannabis') || name.includes('cbd') || name.includes('dispensary')) {
        targetGroup = 'Retail & E-commerce'
        categories.retail++
      }
      // 8. Restaurants & Food Service
      else if (name.includes('restaurant') || name.includes('cafe') || name.includes('coffee') ||
               name.includes('bar') || name.includes('pub') || name.includes('grill') ||
               name.includes('diner') || name.includes('bistro') || name.includes('eatery') ||
               name.includes('food') || name.includes('catering') || name.includes('caterer') ||
               name.includes('bakery') || name.includes('deli') || name.includes('pizza') ||
               name.includes('burger') || name.includes('sandwich') || name.includes('sub') ||
               name.includes('taco') || name.includes('mexican') || name.includes('chinese') ||
               name.includes('japanese') || name.includes('thai') || name.includes('indian') ||
               name.includes('italian') || name.includes('greek') || name.includes('mediterranean') ||
               name.includes('seafood') || name.includes('steak') || name.includes('bbq') ||
               name.includes('buffet') || name.includes('fast food') || name.includes('takeout') ||
               name.includes('delivery') || name.includes('food truck') || name.includes('catering')) {
        targetGroup = 'Restaurants & Food Service'
        categories.restaurants++
      }
      // 9. Personal Care & Beauty
      else if (name.includes('salon') || name.includes('spa') || name.includes('barber') ||
               name.includes('hair') || name.includes('beauty') || name.includes('nails') ||
               name.includes('massage') || name.includes('therapy') || name.includes('wellness') ||
               name.includes('fitness') || name.includes('gym') || name.includes('yoga') ||
               name.includes('pilates') || name.includes('dance') || name.includes('martial arts') ||
               name.includes('tanning') || name.includes('aesthetics') || name.includes('cosmetics') ||
               name.includes('makeup') || name.includes('skincare') || name.includes('facial') ||
               name.includes('waxing') || name.includes('eyebrow') || name.includes('lash') ||
               name.includes('tattoo') || name.includes('piercing') || name.includes('body art')) {
        targetGroup = 'Personal Care & Beauty'
        categories.personalCare++
      }
      
      // Move to target group
      const targetGroupId = groupMap.get(targetGroup)
      if (targetGroupId) {
        await prisma.audienceMember.update({
          where: { id: business.id },
          data: { 
            groupId: targetGroupId,
            unsubscribed: targetGroup === 'Chains & Franchises' // Mark chains as unsubscribed
          }
        })
        categorized++
        
        if (categorized % 10 === 0) {
          console.log(`   ✅ Categorized ${categorized}/${businesses.length} businesses...`)
        }
      }
    }
    
    console.log(`\n📊 BATCH 2 CATEGORIZATION RESULTS:`)
    console.log(`- Total processed: ${categorized}`)
    console.log(`- Chains & Franchises: ${categories.chains}`)
    console.log(`- Healthcare & Wellness: ${categories.healthcare}`)
    console.log(`- Home & Construction: ${categories.construction}`)
    console.log(`- Professional Services: ${categories.professional}`)
    console.log(`- Retail & E-commerce: ${categories.retail}`)
    console.log(`- Restaurants & Food Service: ${categories.restaurants}`)
    console.log(`- Personal Care & Beauty: ${categories.personalCare}`)
    console.log(`- Personal Names: ${categories.personalNames}`)
    console.log(`- Numbered Businesses: ${categories.numbered}`)
    
    // Show current totals
    const updatedGroups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      }
    })
    
    console.log(`\n📊 CURRENT TOTALS AFTER BATCH 2:`)
    updatedGroups.forEach(group => {
      console.log(`- ${group.name}: ${group._count.members} businesses`)
    })
    
    console.log(`\n✅ Batch 2 categorization complete!`)
    
  } catch (error) {
    console.error('❌ Failed to categorize batch 2:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

categorizeBatch2()
  .then(() => {
    console.log('\n✅ Batch 2 complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Batch 2 failed:', error)
    process.exit(1)
  })
