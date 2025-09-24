import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { fetchLeadMineBusinesses } from '../src/lib/leadMine'

config()
const prisma = new PrismaClient()

async function findMissingBusinesses() {
  console.log('🔍 FINDING MISSING BUSINESSES')
  console.log('==============================')
  
  try {
    // Get all businesses from database
    const dbBusinesses = await prisma.audienceMember.findMany({
      select: {
        businessId: true,
        businessName: true
      }
    })
    
    console.log(`\n📊 DATABASE HAS: ${dbBusinesses.length} businesses`)
    console.log(`\n🔍 EXPECTED: 1137 businesses`)
    console.log(`\n❓ MISSING: ${1137 - dbBusinesses.length} businesses`)
    
    // Get all businesses from LeadMine
    console.log(`\n📡 Fetching all businesses from LeadMine...`)
    
    let allLeadMineBusinesses = []
    let cursor: string | undefined
    let batchCount = 0
    
    while (true) {
      const response = await fetchLeadMineBusinesses({
        limit: 100,
        cursor: cursor
      })
      
      if (!response.data || response.data.length === 0) {
        console.log(`   - No more businesses found`)
        break
      }
      
      allLeadMineBusinesses = allLeadMineBusinesses.concat(response.data)
      batchCount++
      console.log(`   - Batch ${batchCount}: ${response.data.length} businesses (total: ${allLeadMineBusinesses.length})`)
      
      cursor = response.pagination?.nextCursor
      if (!cursor) {
        console.log(`   - No more cursor, reached end`)
        break
      }
    }
    
    console.log(`\n📊 LEADMINE HAS: ${allLeadMineBusinesses.length} businesses`)
    
    if (allLeadMineBusinesses.length !== 1137) {
      console.log(`\n❌ LEADMINE API IS RETURNING ${allLeadMineBusinesses.length} BUSINESSES, NOT 1137!`)
      console.log(`\n🔍 This suggests the LeadMine API count was wrong or there's a pagination issue`)
    } else {
      console.log(`\n✅ LeadMine API has the correct 1137 businesses`)
      
      // Find missing businesses
      const dbBusinessIds = new Set(dbBusinesses.map(b => b.businessId))
      const missingBusinesses = allLeadMineBusinesses.filter(b => !dbBusinessIds.has(b.id))
      
      console.log(`\n❌ MISSING FROM DATABASE: ${missingBusinesses.length} businesses`)
      
      if (missingBusinesses.length > 0) {
        console.log(`\n📋 FIRST 10 MISSING BUSINESSES:`)
        missingBusinesses.slice(0, 10).forEach((business, index) => {
          console.log(`${index + 1}. ${business.name} (ID: ${business.id})`)
          console.log(`   Email: ${business.contact?.primaryEmail || 'No email'}`)
        })
        
        if (missingBusinesses.length > 10) {
          console.log(`\n   ... and ${missingBusinesses.length - 10} more`)
        }
        
        console.log(`\n🔍 These businesses need to be imported`)
      }
    }
    
  } catch (error) {
    console.error('❌ Failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

findMissingBusinesses()
  .then(() => {
    console.log('\n✅ Check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Check failed:', error)
    process.exit(1)
  })



