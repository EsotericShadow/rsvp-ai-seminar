import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { fetchLeadMineBusinesses } from '../src/lib/leadMine'

// Load environment variables
config()

const prisma = new PrismaClient()

async function importAllLeadMineBusinesses() {
  console.log('📥 IMPORTING ALL LEADMINE BUSINESSES')
  console.log('===================================')
  
  try {
    // Get current count
    const currentCount = await prisma.audienceMember.count()
    console.log(`\n📊 Current businesses in database: ${currentCount}`)
    
    // Get all existing business names and emails to avoid duplicates
    const existingBusinesses = await prisma.audienceMember.findMany({
      select: {
        businessName: true,
        primaryEmail: true
      }
    })
    
    const existingNames = new Set(existingBusinesses.map(b => b.businessName?.toLowerCase()))
    const existingEmails = new Set(existingBusinesses.map(b => b.primaryEmail?.toLowerCase()))
    
    console.log(`\n🔍 Found ${existingNames.size} existing businesses to avoid duplicates`)
    
    // Get default group (we'll categorize them later)
    const defaultGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Chains & Franchises' } // Use chains as default since we'll categorize properly
    })
    
    if (!defaultGroup) {
      console.log(`❌ Could not find default group`)
      return
    }
    
    // Import all businesses from LeadMine
    let importedCount = 0
    let cursor: string | undefined
    let batchCount = 0
    const batchSize = 100
    
    console.log(`\n📥 Starting import from LeadMine...`)
    
    while (true) {
      console.log(`\n📥 Fetching batch ${batchCount + 1}...`)
      
      const response = await fetchLeadMineBusinesses({
        limit: batchSize,
        cursor: cursor
      })
      
      if (!response.data || response.data.length === 0) {
        console.log(`   - No more businesses found`)
        break
      }
      
      console.log(`   - Fetched ${response.data.length} businesses from LeadMine`)
      
      // Filter out businesses we already have
      const newBusinesses = response.data.filter(business => {
        const name = business.name?.toLowerCase()
        const email = business.contact?.primaryEmail?.toLowerCase()
        
        return name && 
               email && 
               !existingNames.has(name) && 
               !existingEmails.has(email)
      })
      
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
        
        // Update existing sets to avoid duplicates in next batch
        newBusinesses.forEach(business => {
          existingNames.add(business.name?.toLowerCase() || '')
          existingEmails.add(business.contact?.primaryEmail?.toLowerCase() || '')
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
    
    if (finalCount > currentCount) {
      console.log(`\n✅ SUCCESS! Imported ${importedCount} new businesses from LeadMine`)
      console.log(`\n📋 Next step: Categorize the newly imported businesses systematically`)
      console.log(`   - Run the categorization scripts to properly organize them`)
      console.log(`   - The new businesses are currently in the default group`)
    } else {
      console.log(`\n⚠️  No new businesses were imported`)
    }
    
  } catch (error) {
    console.error('❌ Failed to import LeadMine businesses:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

importAllLeadMineBusinesses()
  .then(() => {
    console.log('\n✅ Import complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Import failed:', error)
    process.exit(1)
  })
