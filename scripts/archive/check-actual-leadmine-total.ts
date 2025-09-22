import { PrismaClient } from '@prisma/client'
import { fetchLeadMineBusinesses } from '../src/lib/leadMine'

const prisma = new PrismaClient()

async function checkActualLeadMineTotal() {
  console.log('🔍 CHECKING ACTUAL LEADMINE TOTAL')
  console.log('=================================')
  
  try {
    // Check current database count
    const currentCount = await prisma.audienceMember.count()
    console.log(`\n📊 Current businesses in database: ${currentCount}`)
    
    // Try to get ALL businesses from LeadMine without any filters
    console.log(`\n🔍 Fetching ALL businesses from LeadMine (no filters)...`)
    
    let totalFromLeadMine = 0
    let cursor: string | undefined
    let batchCount = 0
    const maxBatches = 20 // Safety limit
    
    while (batchCount < maxBatches) {
      console.log(`\n📥 Fetching batch ${batchCount + 1}...`)
      
      const response = await fetchLeadMineBusinesses({
        limit: 100,
        cursor: cursor
      })
      
      if (!response.businesses || response.businesses.length === 0) {
        console.log(`   - No more businesses found`)
        break
      }
      
      totalFromLeadMine += response.businesses.length
      batchCount++
      console.log(`   - Batch ${batchCount}: ${response.businesses.length} businesses`)
      console.log(`   - Total so far: ${totalFromLeadMine}`)
      console.log(`   - Has next cursor: ${!!response.nextCursor}`)
      
      cursor = response.nextCursor
      if (!cursor) {
        console.log(`   - No more cursor, reached end of data`)
        break
      }
    }
    
    console.log(`\n📊 LEADMINE API RESULTS:`)
    console.log(`- Total businesses in LeadMine: ${totalFromLeadMine}`)
    console.log(`- Current in database: ${currentCount}`)
    console.log(`- Difference: ${totalFromLeadMine - currentCount}`)
    
    // Check if we need to import more
    if (totalFromLeadMine > currentCount) {
      console.log(`\n📥 Need to import ${totalFromLeadMine - currentCount} more businesses`)
      
      // Get existing business names to avoid duplicates
      const existingBusinesses = await prisma.audienceMember.findMany({
        select: {
          businessName: true,
          primaryEmail: true
        }
      })
      
      const existingNames = new Set(existingBusinesses.map(b => b.businessName?.toLowerCase()))
      const existingEmails = new Set(existingBusinesses.map(b => b.primaryEmail?.toLowerCase()))
      
      console.log(`\n🔍 Found ${existingNames.size} existing businesses to avoid duplicates`)
      
      // Import remaining businesses
      let importedCount = 0
      cursor = undefined
      
      while (importedCount < (totalFromLeadMine - currentCount)) {
        const response = await fetchLeadMineBusinesses({
          limit: 100,
          cursor: cursor
        })
        
        if (!response.businesses || response.businesses.length === 0) {
          break
        }
        
        // Filter out duplicates
        const newBusinesses = response.businesses.filter(business => {
          const name = business.name?.toLowerCase()
          const email = business.contact?.primaryEmail?.toLowerCase()
          
          return name && 
                 email && 
                 !existingNames.has(name) && 
                 !existingEmails.has(email)
        })
        
        if (newBusinesses.length > 0) {
          // Get default group
          const defaultGroup = await prisma.audienceGroup.findFirst({
            where: { name: 'Chains & Franchises' }
          })
          
          if (defaultGroup) {
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
            console.log(`   ✅ Imported ${newBusinesses.length} new businesses (total: ${importedCount})`)
            
            // Update existing sets
            newBusinesses.forEach(business => {
              existingNames.add(business.name?.toLowerCase() || '')
              existingEmails.add(business.contact?.primaryEmail?.toLowerCase() || '')
            })
          }
        }
        
        cursor = response.nextCursor
        if (!cursor) break
      }
      
      const finalCount = await prisma.audienceMember.count()
      console.log(`\n📊 FINAL RESULTS:`)
      console.log(`- Total businesses in LeadMine: ${totalFromLeadMine}`)
      console.log(`- Final count in database: ${finalCount}`)
      console.log(`- Successfully imported: ${finalCount - currentCount} new businesses`)
      
    } else {
      console.log(`\n✅ All businesses from LeadMine are already imported`)
    }
    
    // Check if the 1122 number was correct
    console.log(`\n💡 ANALYSIS:`)
    if (totalFromLeadMine === 1122) {
      console.log(`✅ The 1122 number was correct - LeadMine has exactly 1122 businesses`)
    } else if (totalFromLeadMine < 1122) {
      console.log(`⚠️  LeadMine has ${totalFromLeadMine} businesses, not 1122`)
      console.log(`   The 1122 number might be from a different source or time period`)
    } else {
      console.log(`⚠️  LeadMine has ${totalFromLeadMine} businesses, more than 1122`)
      console.log(`   The 1122 number might be outdated`)
    }
    
  } catch (error) {
    console.error('❌ Failed to check LeadMine total:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkActualLeadMineTotal()
  .then(() => {
    console.log('\n✅ Check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Check failed:', error)
    process.exit(1)
  })
