import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixFoodServiceOnly() {
  console.log('🍽️ STEP 7: Fixing ONLY the Restaurants & Food Service category...')
  
  try {
    // Find the food service group
    const foodGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Restaurants & Food Service' },
      include: {
        members: {
          select: {
            id: true,
            businessName: true,
            primaryEmail: true
          }
        }
      }
    })
    
    if (!foodGroup) {
      console.log('❌ Restaurants & Food Service group not found!')
      return
    }
    
    console.log(`\n📊 Current Restaurants & Food Service group has ${foodGroup.members.length} members`)
    
    // Get all businesses from other groups to find actual food service businesses
    const allMembers = await prisma.audienceMember.findMany({
      select: {
        id: true,
        businessName: true,
        primaryEmail: true,
        groupId: true,
        group: {
          select: {
            name: true
          }
        }
      }
    })
    
    console.log(`\n🔍 Searching through ${allMembers.length} total businesses for ACTUAL food service businesses...`)
    
    // Find businesses that are ACTUALLY food service
    const realFoodServiceBusinesses = allMembers.filter(member => {
      const name = (member.businessName || '').toLowerCase()
      
      // Food service keywords
      const foodServiceKeywords = [
        'restaurant', 'cafe', 'café', 'bistro', 'diner', 'eatery', 'grill',
        'pizza', 'burger', 'sandwich', 'deli', 'deli', 'bakery', 'baker',
        'catering', 'caterer', 'food truck', 'food cart', 'food service',
        'pub', 'bar', 'lounge', 'tavern', 'brewery', 'brewpub',
        'coffee', 'espresso', 'latte', 'cappuccino',
        'ice cream', 'frozen yogurt', 'gelato',
        'fast food', 'quick service', 'takeout', 'take away',
        'buffet', 'all you can eat',
        'seafood', 'steakhouse', 'bbq', 'barbecue',
        'italian', 'chinese', 'mexican', 'thai', 'indian', 'japanese',
        'sushi', 'ramen', 'noodle', 'pasta',
        'breakfast', 'lunch', 'dinner', 'brunch',
        'kitchen', 'chef', 'cooking', 'culinary'
      ]
      
      // Check if name contains food service keywords
      const hasFoodServiceKeyword = foodServiceKeywords.some(keyword => name.includes(keyword))
      
      // Also check for food service suffixes
      const hasFoodServiceSuffix = name.includes('restaurant ltd') || 
                                  name.includes('restaurant inc') ||
                                  name.includes('cafe ltd') ||
                                  name.includes('cafe inc') ||
                                  name.includes('catering ltd') ||
                                  name.includes('catering inc') ||
                                  name.includes('food service ltd') ||
                                  name.includes('food service inc')
      
      return hasFoodServiceKeyword || hasFoodServiceSuffix
    })
    
    console.log(`\n🎯 Found ${realFoodServiceBusinesses.length} businesses that are ACTUALLY food service:`)
    realFoodServiceBusinesses.forEach((member, index) => {
      const currentGroup = member.group.name
      const isInCorrectGroup = currentGroup === 'Restaurants & Food Service'
      const status = isInCorrectGroup ? '✅ ALREADY CORRECT' : `❌ WRONG (currently in ${currentGroup})`
      console.log(`${index + 1}. ${member.businessName} - ${status}`)
    })
    
    // Move incorrectly placed food service businesses to the correct group
    const incorrectlyPlaced = realFoodServiceBusinesses.filter(member => member.group.name !== 'Restaurants & Food Service')
    
    if (incorrectlyPlaced.length > 0) {
      console.log(`\n🔄 Moving ${incorrectlyPlaced.length} actual food service businesses to Restaurants & Food Service...`)
      
      for (const member of incorrectlyPlaced) {
        await prisma.audienceMember.update({
          where: { id: member.id },
          data: { groupId: foodGroup.id }
        })
        
        console.log(`  ✅ Moved: ${member.businessName} from ${member.group.name} to Restaurants & Food Service`)
      }
    } else {
      console.log(`\n✅ All actual food service businesses are already in the correct group!`)
    }
    
    // Final count
    const finalCount = await prisma.audienceMember.count({
      where: { groupId: foodGroup.id }
    })
    
    console.log(`\n📊 Final Restaurants & Food Service count: ${finalCount} ACTUAL food service businesses`)
    
    // Show what's now in food service
    const foodMembers = await prisma.audienceMember.findMany({
      where: { groupId: foodGroup.id },
      select: {
        businessName: true,
        primaryEmail: true
      }
    })
    
    console.log(`\n📋 Actual food service businesses in Restaurants & Food Service:`)
    foodMembers.forEach((member, index) => {
      console.log(`${index + 1}. ${member.businessName} (${member.primaryEmail})`)
    })
    
    console.log(`\n✅ STEP 7 COMPLETE: Restaurants & Food Service now contains ONLY actual food service businesses!`)
    
  } catch (error) {
    console.error('❌ Failed to fix food service:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixFoodServiceOnly()
  .then(() => {
    console.log('\n✅ Food service fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
