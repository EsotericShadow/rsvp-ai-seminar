import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { fetchLeadMineBusinesses } from '../src/lib/leadMine'

// Load environment variables
config()

const prisma = new PrismaClient()

async function importRemaining84Businesses() {
  console.log('📥 IMPORTING REMAINING 84 BUSINESSES')
  console.log('===================================')
  
  try {
    // Get current count
    const currentCount = await prisma.audienceMember.count()
    console.log(`\n📊 Current businesses in database: ${currentCount}`)
    
    // Get all existing business IDs to avoid duplicates
    const existingBusinesses = await prisma.audienceMember.findMany({
      select: {
        businessId: true
      }
    })
    
    const existingBusinessIds = new Set(existingBusinesses.map(b => b.businessId))
    console.log(`\n🔍 Found ${existingBusinessIds.size} existing business IDs to avoid duplicates`)
    
    // Get default group
    const defaultGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Chains & Franchises' }
    })
    
    if (!defaultGroup) {
      console.log(`❌ Could not find default group`)
      return
    }
    
    // Import remaining businesses
    let importedCount = 0
    let cursor: string | undefined
    let batchCount = 0
    
    console.log(`\n📥 Starting import of remaining businesses...`)
    
    while (true) {
      console.log(`\n📥 Fetching batch ${batchCount + 1}...`)
      
      const response = await fetchLeadMineBusinesses({
        limit: 100,
        cursor: cursor
      })
      
      if (!response.data || response.data.length === 0) {
        console.log(`   - No more businesses found`)
        break
      }
      
      console.log(`   - Fetched ${response.data.length} businesses from LeadMine`)
      
      // Filter out businesses we already have (using businessId)
      const newBusinesses = response.data.filter(business => 
        !existingBusinessIds.has(business.id)
      )
      
      console.log(`   - ${newBusinesses.length} new businesses to import (${response.data.length - newBusinesses.length} duplicates skipped)`)
      
      if (newBusinesses.length > 0) {
        // Import new businesses
        const membersToCreate = newBusinesses.map(business => ({
          businessId: business.id,
          businessName: business.name || 'Unknown Business',
          primaryEmail: business.contact?.primaryEmail || '',
          groupId: defaultGroup.id,
          unsubscribed: false,
          tagsSnapshot: business.contact?.tags || [],
          meta: {}
        }))
        
        await prisma.audienceMember.createMany({
          data: membersToCreate
        })
        
        importedCount += newBusinesses.length
        console.log(`   ✅ Imported ${newBusinesses.length} businesses (total: ${importedCount})`)
        
        // Update existing set
        newBusinesses.forEach(business => {
          existingBusinessIds.add(business.id)
        })
      } else {
        console.log(`   - No new businesses in this batch`)
      }
      
      cursor = response.pagination?.nextCursor
      if (!cursor) {
        console.log(`   - No more cursor, reached end of data`)
        break
      }
      
      batchCount++
    }
    
    // Final count
    const finalCount = await prisma.audienceMember.count()
    console.log(`\n📊 IMPORT RESULTS:`)
    console.log(`- Initial count: ${currentCount}`)
    console.log(`- Imported: ${importedCount} new businesses`)
    console.log(`- Final count: ${finalCount}`)
    console.log(`- Total increase: ${finalCount - currentCount}`)
    
    if (finalCount >= 1122) {
      console.log(`\n✅ SUCCESS! We now have ${finalCount} businesses (target: 1122)`)
      if (finalCount > 1122) {
        console.log(`\n⚠️  We have ${finalCount - 1122} more businesses than expected`)
        console.log(`   This suggests there are some duplicates that need to be cleaned up`)
      }
    } else {
      console.log(`\n⚠️  Still missing ${1122 - finalCount} businesses`)
    }
    
  } catch (error) {
    console.error('❌ Failed to import remaining businesses:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

importRemaining84Businesses()
  .then(() => {
    console.log('\n✅ Import complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Import failed:', error)
    process.exit(1)
  })
