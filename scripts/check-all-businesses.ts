import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

config()
const prisma = new PrismaClient()

async function checkAllBusinesses() {
  console.log('📊 CHECKING ALL BUSINESSES')
  console.log('==========================')
  
  try {
    const groups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      }
    })
    
    console.log(`\n📊 CURRENT TOTALS BY GROUP:`)
    let total = 0
    groups.forEach(group => {
      console.log(`- ${group.name}: ${group._count.members} businesses`)
      total += group._count.members
    })
    
    console.log(`\n📈 TOTAL BUSINESSES: ${total}`)
    console.log(`\n🔍 EXPECTED: 1137 businesses`)
    console.log(`\n❓ MISSING: ${1137 - total} businesses`)
    
    if (total !== 1137) {
      console.log(`\n🔍 Let me check what happened to the missing businesses...`)
      
      // Check if there are businesses in other groups
      const allBusinesses = await prisma.audienceMember.findMany({
        select: {
          id: true,
          businessName: true,
          groupId: true
        }
      })
      
      console.log(`\n📊 ACTUAL TOTAL IN DATABASE: ${allBusinesses.length}`)
      
      if (allBusinesses.length !== 1137) {
        console.log(`\n❌ DATABASE IS MISSING ${1137 - allBusinesses.length} BUSINESSES!`)
        console.log(`\n🔍 This suggests some businesses were deleted or never imported properly`)
      } else {
        console.log(`\n✅ All 1137 businesses are in the database`)
        console.log(`\n🔍 The issue is that some businesses are in groups other than Chains & Franchises`)
        
        // Show which groups have businesses
        const groupCounts = new Map()
        allBusinesses.forEach(business => {
          const group = groups.find(g => g.id === business.groupId)
          if (group) {
            groupCounts.set(group.name, (groupCounts.get(group.name) || 0) + 1)
          }
        })
        
        console.log(`\n📊 ACTUAL DISTRIBUTION:`)
        for (const [groupName, count] of groupCounts.entries()) {
          console.log(`- ${groupName}: ${count} businesses`)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkAllBusinesses()
  .then(() => {
    console.log('\n✅ Check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Check failed:', error)
    process.exit(1)
  })


