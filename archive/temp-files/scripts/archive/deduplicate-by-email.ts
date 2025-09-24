import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config()

const prisma = new PrismaClient()

async function deduplicateByEmail() {
  console.log('🧹 DEDUPLICATING BY EMAIL EXACT MATCH')
  console.log('====================================')
  
  try {
    // Get current count
    const currentCount = await prisma.audienceMember.count()
    console.log(`\n📊 Current businesses in database: ${currentCount}`)
    
    // Find duplicates based on email exact match
    console.log(`\n🔍 Finding duplicates based on email exact match...`)
    
    const duplicates = await prisma.$queryRaw`
      SELECT "primaryEmail", COUNT(*) as count
      FROM "AudienceMember"
      WHERE "primaryEmail" IS NOT NULL AND "primaryEmail" != ''
      GROUP BY "primaryEmail"
      HAVING COUNT(*) > 1
    ` as Array<{primaryEmail: string, count: number}>
    
    console.log(`Found ${duplicates.length} email addresses with duplicates`)
    
    if (duplicates.length > 0) {
      console.log(`\n📋 Sample duplicate emails:`)
      duplicates.slice(0, 10).forEach(({primaryEmail, count}) => {
        console.log(`   - "${primaryEmail}": ${count} times`)
      })
      
      console.log(`\n🗑️ Removing duplicate entries (keeping the first one)...`)
      
      let totalRemoved = 0
      for (const duplicate of duplicates) {
        // Get all members with this email, ordered by creation date
        const members = await prisma.audienceMember.findMany({
          where: { primaryEmail: duplicate.primaryEmail },
          orderBy: { createdAt: 'asc' }
        })
        
        if (members.length > 1) {
          const toDelete = members.slice(1) // Keep first, delete rest
          const deleteIds = toDelete.map(m => m.id)
          
          await prisma.audienceMember.deleteMany({
            where: { id: { in: deleteIds } }
          })
          
          totalRemoved += toDelete.length
          console.log(`   ✅ Removed ${toDelete.length} duplicates for email: ${duplicate.primaryEmail}`)
        }
      }
      
      console.log(`\n📊 DUPLICATE REMOVAL RESULTS:`)
      console.log(`- Total duplicates removed: ${totalRemoved}`)
    } else {
      console.log(`\n✅ No email duplicates found!`)
    }
    
    // Final count after cleanup
    const finalCount = await prisma.audienceMember.count()
    console.log(`\n📊 FINAL RESULTS:`)
    console.log(`- Before deduplication: ${currentCount}`)
    console.log(`- After deduplication: ${finalCount}`)
    console.log(`- Removed: ${currentCount - finalCount} duplicates`)
    
    if (finalCount === 1122) {
      console.log(`\n✅ PERFECT! We now have exactly 1122 businesses as expected`)
    } else if (finalCount < 1122) {
      console.log(`\n⚠️  We have ${finalCount} businesses, missing ${1122 - finalCount}`)
    } else {
      console.log(`\n⚠️  We have ${finalCount} businesses, ${finalCount - 1122} more than expected`)
    }
    
    // Show current categorization
    const groups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      }
    })
    
    console.log(`\n📊 Current categorization after deduplication:`)
    groups.forEach(group => {
      console.log(`- ${group.name}: ${group._count.members} businesses`)
    })
    
  } catch (error) {
    console.error('❌ Failed to deduplicate by email:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

deduplicateByEmail()
  .then(() => {
    console.log('\n✅ Deduplication complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Deduplication failed:', error)
    process.exit(1)
  })
