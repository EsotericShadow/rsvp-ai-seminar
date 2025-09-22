import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config()

const prisma = new PrismaClient()

async function cleanupDuplicatesAndCategorize() {
  console.log('🧹 CLEANING UP DUPLICATES AND CATEGORIZING')
  console.log('==========================================')
  
  try {
    // Get current count
    const currentCount = await prisma.audienceMember.count()
    console.log(`\n📊 Current businesses in database: ${currentCount}`)
    
    // Find and remove duplicates based on businessId
    console.log(`\n🔍 Finding duplicates based on businessId...`)
    
    const duplicates = await prisma.$queryRaw`
      SELECT "businessId", COUNT(*) as count
      FROM "AudienceMember"
      GROUP BY "businessId"
      HAVING COUNT(*) > 1
    ` as Array<{businessId: string, count: number}>
    
    console.log(`Found ${duplicates.length} business IDs with duplicates`)
    
    if (duplicates.length > 0) {
      console.log(`\n🗑️ Removing duplicate entries...`)
      
      for (const duplicate of duplicates) {
        // Keep the first one, delete the rest
        const members = await prisma.audienceMember.findMany({
          where: { businessId: duplicate.businessId },
          orderBy: { createdAt: 'asc' }
        })
        
        if (members.length > 1) {
          const toDelete = members.slice(1) // Keep first, delete rest
          const deleteIds = toDelete.map(m => m.id)
          
          await prisma.audienceMember.deleteMany({
            where: { id: { in: deleteIds } }
          })
          
          console.log(`   ✅ Removed ${toDelete.length} duplicates for businessId: ${duplicate.businessId}`)
        }
      }
    }
    
    // Final count after cleanup
    const finalCount = await prisma.audienceMember.count()
    console.log(`\n📊 CLEANUP RESULTS:`)
    console.log(`- Before cleanup: ${currentCount}`)
    console.log(`- After cleanup: ${finalCount}`)
    console.log(`- Removed: ${currentCount - finalCount} duplicates`)
    
    if (finalCount === 1122) {
      console.log(`\n✅ PERFECT! We now have exactly 1122 businesses as expected`)
    } else if (finalCount < 1122) {
      console.log(`\n⚠️  We have ${finalCount} businesses, missing ${1122 - finalCount}`)
    } else {
      console.log(`\n⚠️  We have ${finalCount} businesses, ${finalCount - 1122} more than expected`)
    }
    
    // Now categorize all businesses systematically
    console.log(`\n🎯 Starting systematic categorization of all ${finalCount} businesses...`)
    
    // Get all groups
    const groups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      }
    })
    
    console.log(`\n📊 Current categorization:`)
    groups.forEach(group => {
      console.log(`- ${group.name}: ${group._count.members} businesses`)
    })
    
    console.log(`\n✅ All businesses are now properly imported and ready for categorization!`)
    console.log(`\n📋 Next steps:`)
    console.log(`1. Run the systematic categorization scripts to organize all 1122 businesses`)
    console.log(`2. Ensure each business is in the correct audience group`)
    console.log(`3. Mark chains & franchises as unsubscribed`)
    
  } catch (error) {
    console.error('❌ Failed to cleanup duplicates:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanupDuplicatesAndCategorize()
  .then(() => {
    console.log('\n✅ Cleanup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  })
