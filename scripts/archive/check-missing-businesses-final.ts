import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { fetchLeadMineBusinesses } from '../src/lib/leadMine'

// Load environment variables
config()

const prisma = new PrismaClient()

async function checkMissingBusinessesFinal() {
  console.log('🔍 CHECKING MISSING BUSINESSES FINAL')
  console.log('====================================')
  
  try {
    // Get current count
    const currentCount = await prisma.audienceMember.count()
    console.log(`\n📊 Current businesses in database: ${currentCount}`)
    console.log(`📊 Expected total: 1122`)
    console.log(`📊 Missing: ${1122 - currentCount}`)
    
    // Get all existing business IDs and emails
    const existingBusinesses = await prisma.audienceMember.findMany({
      select: {
        businessId: true,
        primaryEmail: true
      }
    })
    
    const existingBusinessIds = new Set(existingBusinesses.map(b => b.businessId))
    const existingEmails = new Set(existingBusinesses.map(b => b.primaryEmail?.toLowerCase()).filter(Boolean))
    
    console.log(`\n🔍 Existing businesses:`)
    console.log(`- By businessId: ${existingBusinessIds.size}`)
    console.log(`- By email: ${existingEmails.size}`)
    
    // Check LeadMine for missing businesses
    console.log(`\n🔍 Checking LeadMine for missing businesses...`)
    
    let totalFromLeadMine = 0
    let newBusinesses = 0
    let duplicateBusinesses = 0
    let businessesWithoutEmails = 0
    let cursor: string | undefined
    
    while (true) {
      const response = await fetchLeadMineBusinesses({
        limit: 100,
        cursor: cursor
      })
      
      if (!response.data || response.data.length === 0) {
        break
      }
      
      totalFromLeadMine += response.data.length
      
      response.data.forEach(business => {
        if (existingBusinessIds.has(business.id)) {
          duplicateBusinesses++
        } else {
          newBusinesses++
          if (!business.contact?.primaryEmail || business.contact.primaryEmail.trim() === '') {
            businessesWithoutEmails++
          }
        }
      })
      
      cursor = response.pagination?.nextCursor
      if (!cursor) break
    }
    
    console.log(`\n📊 LEADMINE ANALYSIS:`)
    console.log(`- Total businesses in LeadMine: ${totalFromLeadMine}`)
    console.log(`- New businesses (not in DB): ${newBusinesses}`)
    console.log(`- Duplicate businesses (already in DB): ${duplicateBusinesses}`)
    console.log(`- New businesses without emails: ${businessesWithoutEmails}`)
    console.log(`- New businesses with emails: ${newBusinesses - businessesWithoutEmails}`)
    
    if (newBusinesses > 0) {
      console.log(`\n📥 Importing ${newBusinesses} missing businesses...`)
      
      // Get default group
      const defaultGroup = await prisma.audienceGroup.findFirst({
        where: { name: 'Chains & Franchises' }
      })
      
      if (!defaultGroup) {
        console.log(`❌ Could not find default group`)
        return
      }
      
      // Import missing businesses
      let importedCount = 0
      cursor = undefined
      
      while (true) {
        const response = await fetchLeadMineBusinesses({
          limit: 100,
          cursor: cursor
        })
        
        if (!response.data || response.data.length === 0) {
          break
        }
        
        // Filter out businesses we already have
        const newBusinesses = response.data.filter(business => 
          !existingBusinessIds.has(business.id)
        )
        
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
        }
        
        cursor = response.pagination?.nextCursor
        if (!cursor) break
      }
      
      // Final count
      const finalCount = await prisma.audienceMember.count()
      console.log(`\n📊 FINAL RESULTS:`)
      console.log(`- Before import: ${currentCount}`)
      console.log(`- Imported: ${importedCount} new businesses`)
      console.log(`- Final count: ${finalCount}`)
      console.log(`- Expected: 1122`)
      console.log(`- Difference: ${finalCount - 1122}`)
      
      if (finalCount === 1122) {
        console.log(`\n✅ PERFECT! We now have exactly 1122 businesses as expected`)
      } else if (finalCount < 1122) {
        console.log(`\n⚠️  We have ${finalCount} businesses, missing ${1122 - finalCount}`)
        console.log(`   This suggests some businesses in LeadMine don't have emails or have empty emails`)
      } else {
        console.log(`\n⚠️  We have ${finalCount} businesses, ${finalCount - 1122} more than expected`)
      }
    } else {
      console.log(`\n✅ All businesses from LeadMine are already in the database`)
    }
    
  } catch (error) {
    console.error('❌ Failed to check missing businesses:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkMissingBusinessesFinal()
  .then(() => {
    console.log('\n✅ Check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Check failed:', error)
    process.exit(1)
  })
