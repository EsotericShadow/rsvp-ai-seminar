import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixFoodServiceErrors() {
  console.log('🔧 Fixing food service categorization errors...')
  
  try {
    // Find the groups
    const foodGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Restaurants & Food Service' }
    })
    
    const personalCareGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Personal Care & Beauty' }
    })
    
    const constructionGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Home & Construction Services' }
    })
    
    const professionalGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Professional Services' }
    })
    
    if (!foodGroup || !personalCareGroup || !constructionGroup || !professionalGroup) {
      console.log('❌ Required groups not found!')
      return
    }
    
    // Businesses that were incorrectly moved to food service
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
        name: 'Michelle Hay Notary Public Inc.',
        correctGroupId: professionalGroup.id,
        correctGroupName: 'Professional Services'
      },
      {
        name: 'TIMBER BARON CONTRACTING (2013) LTD. (SHOP)',
        correctGroupId: constructionGroup.id,
        correctGroupName: 'Home & Construction Services'
      },
      {
        name: 'HomeShowCase Kitchens Appliances Spas Ltd.',
        correctGroupId: personalCareGroup.id,
        correctGroupName: 'Personal Care & Beauty'
      }
    ]
    
    console.log(`\n🔄 Moving ${incorrectMoves.length} incorrectly categorized businesses back to their proper groups...`)
    
    for (const move of incorrectMoves) {
      // Find the business in food service group
      const member = await prisma.audienceMember.findFirst({
        where: {
          groupId: foodGroup.id,
          businessName: move.name
        }
      })
      
      if (member) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: move.correctGroupId }
        })
        
        console.log(`  ✅ Moved: ${move.name} from Restaurants & Food Service to ${move.correctGroupName}`)
      } else {
        console.log(`  ⚠️  Could not find: ${move.name} in food service group`)
      }
    }
    
    // Final counts
    const finalCounts = await Promise.all([
      prisma.audienceMember.count({ where: { groupId: foodGroup.id } }),
      prisma.audienceMember.count({ where: { groupId: personalCareGroup.id } }),
      prisma.audienceMember.count({ where: { groupId: constructionGroup.id } }),
      prisma.audienceMember.count({ where: { groupId: professionalGroup.id } })
    ])
    
    console.log(`\n📊 Final counts after corrections:`)
    console.log(`- Restaurants & Food Service: ${finalCounts[0]} members`)
    console.log(`- Personal Care & Beauty: ${finalCounts[1]} members`)
    console.log(`- Home & Construction Services: ${finalCounts[2]} members`)
    console.log(`- Professional Services: ${finalCounts[3]} members`)
    
    console.log(`\n✅ Food service categorization errors fixed!`)
    
  } catch (error) {
    console.error('❌ Failed to fix food service errors:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixFoodServiceErrors()
  .then(() => {
    console.log('\n✅ Food service error fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
