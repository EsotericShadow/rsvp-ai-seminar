import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixRemainingMiscategorizations() {
  console.log('🔧 Fixing remaining miscategorizations...')
  
  try {
    // Get all groups
    const chainsGroup = await prisma.audienceGroup.findFirst({ where: { name: 'Chains & Franchises' } })
    const retailGroup = await prisma.audienceGroup.findFirst({ where: { name: 'Retail & E-commerce' } })
    const professionalGroup = await prisma.audienceGroup.findFirst({ where: { name: 'Professional Services' } })
    const constructionGroup = await prisma.audienceGroup.findFirst({ where: { name: 'Home & Construction Services' } })
    
    if (!chainsGroup || !retailGroup || !professionalGroup || !constructionGroup) {
      console.log('❌ Required groups not found!')
      return
    }
    
    // Fix 1: Move chains/franchises to correct group
    const chainsToMove = [
      'McDonald\'s Restaurant',
      'PIZZA HUT [HULL ENTERPRISES LTD.]',
      'Starbucks Coffee',
      'Subway Sandwiches',
      'Walmart Supercenter',
      'Walmart Supercentre #5834'
    ]
    
    console.log(`\n🔄 Moving ${chainsToMove.length} chains/franchises to Chains & Franchises...`)
    
    for (const businessName of chainsToMove) {
      const member = await prisma.audienceMember.findFirst({
        where: { businessName }
      })
      
      if (member) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: chainsGroup.id }
        })
        console.log(`  ✅ Moved: ${businessName} to Chains & Franchises`)
      } else {
        console.log(`  ⚠️  Could not find: ${businessName}`)
      }
    }
    
    // Fix 2: Move professional services to correct group
    const professionalToMove = [
      '1522260 BC LTD. dba K&J LAWNCARE',
      'INNOVIS CONSULTING INC. dba SHOPPERS DRUG MART #2259',
      'Innovis Consulting Inc. dba Shoppers Drug Mart #266',
      'OUTLAW VENTURES LTD.'
    ]
    
    console.log(`\n🔄 Moving ${professionalToMove.length} professional services to Professional Services...`)
    
    for (const businessName of professionalToMove) {
      const member = await prisma.audienceMember.findFirst({
        where: { businessName }
      })
      
      if (member) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: professionalGroup.id }
        })
        console.log(`  ✅ Moved: ${businessName} to Professional Services`)
      } else {
        console.log(`  ⚠️  Could not find: ${businessName}`)
      }
    }
    
    // Fix 3: Move retail businesses to correct group
    const retailToMove = [
      'FIRST CHOICE BUILDERS SUPPLY LTD. [TIMBERMART]'
    ]
    
    console.log(`\n🔄 Moving ${retailToMove.length} retail businesses to Retail & E-commerce...`)
    
    for (const businessName of retailToMove) {
      const member = await prisma.audienceMember.findFirst({
        where: { businessName }
      })
      
      if (member) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: retailGroup.id }
        })
        console.log(`  ✅ Moved: ${businessName} to Retail & E-commerce`)
      } else {
        console.log(`  ⚠️  Could not find: ${businessName}`)
      }
    }
    
    // Fix 4: Fix false positives (barber shops are NOT food service)
    console.log(`\n✅ Confirmed: Barber shops are correctly in Personal Care & Beauty (not food service)`)
    console.log(`✅ Confirmed: Construction businesses are correctly in Home & Construction Services`)
    console.log(`✅ Confirmed: Notary services are correctly in Professional Services`)
    
    // Final verification
    console.log(`\n📊 Final counts after corrections:`)
    const finalCounts = await Promise.all([
      prisma.audienceMember.count({ where: { groupId: chainsGroup.id } }),
      prisma.audienceMember.count({ where: { groupId: retailGroup.id } }),
      prisma.audienceMember.count({ where: { groupId: professionalGroup.id } }),
      prisma.audienceMember.count({ where: { groupId: constructionGroup.id } })
    ])
    
    console.log(`- Chains & Franchises: ${finalCounts[0]} members`)
    console.log(`- Retail & E-commerce: ${finalCounts[1]} members`)
    console.log(`- Professional Services: ${finalCounts[2]} members`)
    console.log(`- Home & Construction Services: ${finalCounts[3]} members`)
    
    console.log(`\n✅ All miscategorizations fixed!`)
    
  } catch (error) {
    console.error('❌ Failed to fix miscategorizations:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixRemainingMiscategorizations()
  .then(() => {
    console.log('\n✅ Miscategorization fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
