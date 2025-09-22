import { PrismaClient } from '@prisma/client'
import { fetchLeadMineBusinesses } from '../src/lib/leadMine'

const prisma = new PrismaClient()

async function importRemainingBusinesses() {
  console.log('📥 IMPORTING REMAINING BUSINESSES FROM LEADMINE')
  console.log('===============================================')
  
  try {
    // Get current count
    const currentCount = await prisma.audienceMember.count()
    console.log(`\n📊 Current businesses in database: ${currentCount}`)
    console.log(`📊 Expected total: 1122`)
    console.log(`📊 Need to import: ${1122 - currentCount} more businesses`)
    
    // Get all existing business names to avoid duplicates
    const existingBusinesses = await prisma.audienceMember.findMany({
      select: {
        businessName: true,
        primaryEmail: true
      }
    })
    
    const existingNames = new Set(existingBusinesses.map(b => b.businessName?.toLowerCase()))
    const existingEmails = new Set(existingBusinesses.map(b => b.primaryEmail?.toLowerCase()))
    
    console.log(`\n🔍 Found ${existingNames.size} existing businesses to avoid duplicates`)
    
    // Import businesses from LeadMine in batches
    let importedCount = 0
    let cursor: string | undefined
    const batchSize = 100
    
    console.log(`\n📥 Starting import from LeadMine...`)
    
    while (importedCount < (1122 - currentCount)) {
      console.log(`\n📥 Fetching batch ${Math.floor(importedCount / batchSize) + 1}...`)
      
      const response = await fetchLeadMineBusinesses({
        limit: batchSize,
        cursor: cursor,
        hasEmail: true
      })
      
      if (!response.businesses || response.businesses.length === 0) {
        console.log(`\n✅ No more businesses to import from LeadMine`)
        break
      }
      
      console.log(`📥 Fetched ${response.businesses.length} businesses from LeadMine`)
      
      // Filter out businesses we already have
      const newBusinesses = response.businesses.filter(business => {
        const name = business.name?.toLowerCase()
        const email = business.contact?.primaryEmail?.toLowerCase()
        
        return name && 
               email && 
               !existingNames.has(name) && 
               !existingEmails.has(email)
      })
      
      console.log(`📥 ${newBusinesses.length} new businesses to import (${response.businesses.length - newBusinesses.length} duplicates skipped)`)
      
      if (newBusinesses.length === 0) {
        console.log(`\n✅ No new businesses in this batch, moving to next batch...`)
        cursor = response.nextCursor
        continue
      }
      
      // Get the default group (we'll categorize them later)
      const defaultGroup = await prisma.audienceGroup.findFirst({
        where: { name: 'Chains & Franchises' } // Use chains as default since we'll categorize properly
      })
      
      if (!defaultGroup) {
        console.log(`❌ Could not find default group`)
        break
      }
      
      // Import new businesses
      const membersToCreate = newBusinesses.map(business => ({
        businessName: business.name || 'Unknown Business',
        primaryEmail: business.contact?.primaryEmail || '',
        groupId: defaultGroup.id,
        isUnsubscribed: false
      }))
      
      await prisma.audienceMember.createMany({
        data: membersToCreate
      })
      
      importedCount += newBusinesses.length
      console.log(`✅ Imported ${newBusinesses.length} businesses (total: ${importedCount})`)
      
      // Update existing sets to avoid duplicates in next batch
      newBusinesses.forEach(business => {
        existingNames.add(business.name?.toLowerCase() || '')
        existingEmails.add(business.contact?.primaryEmail?.toLowerCase() || '')
      })
      
      cursor = response.nextCursor
      
      // Break if we've reached the target
      if (importedCount >= (1122 - currentCount)) {
        console.log(`\n🎯 Reached target of ${1122 - currentCount} additional businesses`)
        break
      }
    }
    
    // Final count
    const finalCount = await prisma.audienceMember.count()
    console.log(`\n📊 FINAL COUNT:`)
    console.log(`- Total businesses in database: ${finalCount}`)
    console.log(`- Expected: 1122`)
    console.log(`- Difference: ${finalCount - 1122}`)
    
    if (finalCount >= 1122) {
      console.log(`\n✅ SUCCESS! All businesses imported from LeadMine`)
      console.log(`\n📋 Next step: Categorize the newly imported businesses systematically`)
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

importRemainingBusinesses()
  .then(() => {
    console.log('\n✅ Import complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Import failed:', error)
    process.exit(1)
  })
