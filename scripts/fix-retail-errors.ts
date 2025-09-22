import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixRetailErrors() {
  console.log('🔧 Fixing retail categorization errors...')
  
  try {
    // Find the groups
    const retailGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Retail & E-commerce' }
    })
    
    const personalCareGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Personal Care & Beauty' }
    })
    
    const foodGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Restaurants & Food Service' }
    })
    
    const healthcareGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Healthcare & Wellness' }
    })
    
    const constructionGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Home & Construction Services' }
    })
    
    if (!retailGroup || !personalCareGroup || !foodGroup || !healthcareGroup || !constructionGroup) {
      console.log('❌ Required groups not found!')
      return
    }
    
    // Businesses that were incorrectly moved to retail
    const incorrectMoves = [
      {
        name: 'GRAND OL\'E BARBER SHOP',
        correctGroupId: personalCareGroup.id,
        correctGroupName: 'Personal Care & Beauty'
      },
      {
        name: 'THE NUK BARBER SHOP',
        correctGroupId: personalCareGroup.id,
        correctGroupName: 'Personal Care & Beauty'
      },
      {
        name: 'KEPT BARBERSHOP AND SUPPLY',
        correctGroupId: personalCareGroup.id,
        correctGroupName: 'Personal Care & Beauty'
      },
      {
        name: 'LUCKY GARDEN RESTAURANT',
        correctGroupId: foodGroup.id,
        correctGroupName: 'Restaurants & Food Service'
      },
      {
        name: 'CVS Pharmacy',
        correctGroupId: healthcareGroup.id,
        correctGroupName: 'Healthcare & Wellness'
      },
      {
        name: 'PHARMASAVE #1110 Owned & Operated by: TERRACE LAKELSE PHARMACY INC.',
        correctGroupId: healthcareGroup.id,
        correctGroupName: 'Healthcare & Wellness'
      },
      {
        name: 'FIRST CHOICE BUILDERS SUPPLY LTD. [TIMBERMART]',
        correctGroupId: constructionGroup.id,
        correctGroupName: 'Home & Construction Services'
      },
      {
        name: 'NORS CONSTRUCTION EQUIPMENT CANADA GW,LTD.',
        correctGroupId: constructionGroup.id,
        correctGroupName: 'Home & Construction Services'
      },
      {
        name: 'TIMBER BARON CONTRACTING (2013) LTD. (SHOP)',
        correctGroupId: constructionGroup.id,
        correctGroupName: 'Home & Construction Services'
      }
    ]
    
    console.log(`\n🔄 Moving ${incorrectMoves.length} incorrectly categorized businesses back to their proper groups...`)
    
    for (const move of incorrectMoves) {
      // Find the business in retail group
      const member = await prisma.audienceMember.findFirst({
        where: {
          groupId: retailGroup.id,
          businessName: move.name
        }
      })
      
      if (member) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: move.correctGroupId }
        })
        
        console.log(`  ✅ Moved: ${move.name} from Retail & E-commerce to ${move.correctGroupName}`)
      } else {
        console.log(`  ⚠️  Could not find: ${move.name} in retail group`)
      }
    }
    
    // Final counts
    const finalCounts = await Promise.all([
      prisma.audienceMember.count({ where: { groupId: retailGroup.id } }),
      prisma.audienceMember.count({ where: { groupId: personalCareGroup.id } }),
      prisma.audienceMember.count({ where: { groupId: foodGroup.id } }),
      prisma.audienceMember.count({ where: { groupId: healthcareGroup.id } }),
      prisma.audienceMember.count({ where: { groupId: constructionGroup.id } })
    ])
    
    console.log(`\n📊 Final counts after corrections:`)
    console.log(`- Retail & E-commerce: ${finalCounts[0]} members`)
    console.log(`- Personal Care & Beauty: ${finalCounts[1]} members`)
    console.log(`- Restaurants & Food Service: ${finalCounts[2]} members`)
    console.log(`- Healthcare & Wellness: ${finalCounts[3]} members`)
    console.log(`- Home & Construction Services: ${finalCounts[4]} members`)
    
    console.log(`\n✅ Retail categorization errors fixed!`)
    
  } catch (error) {
    console.error('❌ Failed to fix retail errors:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixRetailErrors()
  .then(() => {
    console.log('\n✅ Retail error fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
