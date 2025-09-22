import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config()

const prisma = new PrismaClient()

async function fixBatch1Errors() {
  console.log('🔧 FIXING BATCH 1 ERRORS')
  console.log('========================')
  
  try {
    // Get all groups
    const groups = await prisma.audienceGroup.findMany()
    const groupMap = new Map(groups.map(g => [g.name, g.id]))
    
    // Get the businesses that were incorrectly moved to Personal Names
    const personalNamesGroupId = groupMap.get('Personal Names')
    const chainsGroupId = groupMap.get('Chains & Franchises')
    
    if (!personalNamesGroupId || !chainsGroupId) {
      console.log('❌ Groups not found')
      return
    }
    
    const incorrectBusinesses = await prisma.audienceMember.findMany({
      where: { groupId: personalNamesGroupId },
      where: {
        businessName: {
          in: [
            "McDonald's Restaurant",
            "Starbucks Coffee", 
            "Walmart Supercenter",
            "Home Depot",
            "Subway Sandwiches",
            "Tim Hortons",
            "Target Corporation"
          ]
        }
      }
    })
    
    console.log(`\n🔧 Found ${incorrectBusinesses.length} businesses to move back to Chains & Franchises`)
    
    // Move them back to Chains & Franchises
    for (const business of incorrectBusinesses) {
      await prisma.audienceMember.update({
        where: { id: business.id },
        data: { 
          groupId: chainsGroupId,
          unsubscribed: true // Mark as unsubscribed
        }
      })
      console.log(`   ✅ Moved "${business.businessName}" back to Chains & Franchises`)
    }
    
    // Show updated totals
    const updatedGroups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      }
    })
    
    console.log(`\n📊 CORRECTED TOTALS AFTER FIXING BATCH 1 ERRORS:`)
    updatedGroups.forEach(group => {
      console.log(`- ${group.name}: ${group._count.members} businesses`)
    })
    
    console.log(`\n✅ Batch 1 errors fixed!`)
    
  } catch (error) {
    console.error('❌ Failed to fix batch 1 errors:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixBatch1Errors()
  .then(() => {
    console.log('\n✅ Error fixing complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fixing failed:', error)
    process.exit(1)
  })
