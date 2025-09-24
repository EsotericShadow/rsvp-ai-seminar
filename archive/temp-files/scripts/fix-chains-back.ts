import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

config()
const prisma = new PrismaClient()

async function fixChainsBack() {
  console.log('🔧 FIXING CHAINS BACK TO CORRECT GROUP')
  console.log('=====================================')
  
  try {
    const groups = await prisma.audienceGroup.findMany()
    const groupMap = new Map(groups.map(g => [g.name, g.id]))
    
    const personalNamesGroupId = groupMap.get('Personal Names')
    const chainsGroupId = groupMap.get('Chains & Franchises')
    
    // Get the businesses that were incorrectly moved to Personal Names
    const incorrectBusinesses = await prisma.audienceMember.findMany({
      where: { 
        groupId: personalNamesGroupId,
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
    
    console.log(`\n📊 CORRECTED TOTALS:`)
    updatedGroups.forEach(group => {
      console.log(`- ${group.name}: ${group._count.members} businesses`)
    })
    
    console.log(`\n✅ Chains fixed!`)
    
  } catch (error) {
    console.error('❌ Failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixChainsBack()
  .then(() => {
    console.log('\n✅ Complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })




