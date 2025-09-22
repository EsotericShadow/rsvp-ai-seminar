import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMissingBusinesses() {
  console.log('🔍 CHECKING FOR MISSING BUSINESSES')
  console.log('==================================')
  
  try {
    // Check current database count
    const currentCount = await prisma.audienceMember.count()
    console.log(`\n📊 Current businesses in database: ${currentCount}`)
    console.log(`📊 Expected businesses from LeadMine: 1122`)
    console.log(`📊 Missing businesses: ${1122 - currentCount}`)
    
    if (currentCount < 1122) {
      console.log(`\n❌ MISSING ${1122 - currentCount} BUSINESSES!`)
      console.log(`\n🔍 Let me check what happened...`)
      
      // Check if there are any businesses that failed to import
      const allMembers = await prisma.audienceMember.findMany({
        select: {
          businessName: true,
          primaryEmail: true,
          group: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          businessName: 'asc'
        }
      })
      
      console.log(`\n📋 Current businesses by group:`)
      const groupCounts = allMembers.reduce((acc, member) => {
        const groupName = member.group.name
        acc[groupName] = (acc[groupName] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      Object.entries(groupCounts).forEach(([groupName, count]) => {
        console.log(`- ${groupName}: ${count} businesses`)
      })
      
      console.log(`\n🔍 This suggests that the LeadMine import was incomplete.`)
      console.log(`We need to import the remaining ${1122 - currentCount} businesses from LeadMine.`)
      
    } else if (currentCount > 1122) {
      console.log(`\n⚠️  More businesses than expected: ${currentCount - 1122} extra`)
    } else {
      console.log(`\n✅ Correct number of businesses: ${currentCount}`)
    }
    
  } catch (error) {
    console.error('❌ Failed to check missing businesses:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkMissingBusinesses()
  .then(() => {
    console.log('\n✅ Missing businesses check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Check failed:', error)
    process.exit(1)
  })
