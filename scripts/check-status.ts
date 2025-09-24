import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

config()
const prisma = new PrismaClient()

async function checkStatus() {
  console.log('📊 CURRENT STATUS CHECK')
  console.log('======================')
  
  try {
    const groups = await prisma.audienceGroup.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      }
    })
    
    console.log(`\n📊 CURRENT TOTALS:`)
    groups.forEach(group => {
      console.log(`- ${group.name}: ${group._count.members} businesses`)
    })
    
    const total = groups.reduce((sum, group) => sum + group._count.members, 0)
    console.log(`\n📈 TOTAL BUSINESSES: ${total}`)
    
    // Check how many are still in Chains & Franchises
    const chainsGroup = groups.find(g => g.name === 'Chains & Franchises')
    if (chainsGroup) {
      console.log(`\n🔍 REMAINING IN CHAINS & FRANCHISES: ${chainsGroup._count.members}`)
      console.log(`📋 This means we need to process ${chainsGroup._count.members} more businesses`)
    }
    
  } catch (error) {
    console.error('❌ Failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkStatus()
  .then(() => {
    console.log('\n✅ Status check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Status check failed:', error)
    process.exit(1)
  })



