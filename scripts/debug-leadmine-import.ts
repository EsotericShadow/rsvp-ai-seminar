import { PrismaClient } from '@prisma/client'
import { fetchLeadMineBusinesses } from '../src/lib/leadMine'

const prisma = new PrismaClient()

async function debugLeadMineImport() {
  console.log('🔍 DEBUGGING LEADMINE IMPORT')
  console.log('============================')
  
  try {
    // Check current database count
    const currentCount = await prisma.audienceMember.count()
    console.log(`\n📊 Current businesses in database: ${currentCount}`)
    
    // Test different LeadMine queries
    console.log(`\n🔍 Testing LeadMine API with different parameters...`)
    
    // 1. Test with hasEmail: true (current filter)
    console.log(`\n1️⃣ Testing with hasEmail: true...`)
    const withEmailResponse = await fetchLeadMineBusinesses({
      limit: 10,
      hasEmail: true
    })
    console.log(`   - Found ${withEmailResponse.businesses?.length || 0} businesses with emails`)
    console.log(`   - Has next cursor: ${!!withEmailResponse.nextCursor}`)
    
    // 2. Test with hasEmail: false
    console.log(`\n2️⃣ Testing with hasEmail: false...`)
    const withoutEmailResponse = await fetchLeadMineBusinesses({
      limit: 10,
      hasEmail: false
    })
    console.log(`   - Found ${withoutEmailResponse.businesses?.length || 0} businesses without emails`)
    console.log(`   - Has next cursor: ${!!withoutEmailResponse.nextCursor}`)
    
    // 3. Test with no hasEmail filter
    console.log(`\n3️⃣ Testing with no hasEmail filter...`)
    const allResponse = await fetchLeadMineBusinesses({
      limit: 10
    })
    console.log(`   - Found ${allResponse.businesses?.length || 0} total businesses`)
    console.log(`   - Has next cursor: ${!!allResponse.nextCursor}`)
    
    // 4. Test with createMissing: true
    console.log(`\n4️⃣ Testing with createMissing: true...`)
    const createMissingResponse = await fetchLeadMineBusinesses({
      limit: 10,
      createMissing: true
    })
    console.log(`   - Found ${createMissingResponse.businesses?.length || 0} businesses (createMissing)`)
    console.log(`   - Has next cursor: ${!!createMissingResponse.nextCursor}`)
    
    // 5. Check total count without filters
    console.log(`\n5️⃣ Checking total count...`)
    let totalCount = 0
    let cursor: string | undefined
    let batchCount = 0
    
    while (batchCount < 5) { // Limit to 5 batches for debugging
      const response = await fetchLeadMineBusinesses({
        limit: 100,
        cursor: cursor
      })
      
      if (!response.businesses || response.businesses.length === 0) {
        console.log(`   - No more businesses found`)
        break
      }
      
      totalCount += response.businesses.length
      batchCount++
      console.log(`   - Batch ${batchCount}: ${response.businesses.length} businesses (total so far: ${totalCount})`)
      
      cursor = response.nextCursor
      if (!cursor) {
        console.log(`   - No more cursor, reached end`)
        break
      }
    }
    
    console.log(`\n📊 LEADMINE API SUMMARY:`)
    console.log(`- Total businesses found: ${totalCount}`)
    console.log(`- Current in database: ${currentCount}`)
    console.log(`- Difference: ${totalCount - currentCount}`)
    
    // Check if there are businesses without emails that we're missing
    console.log(`\n🔍 Checking for businesses without emails...`)
    const noEmailResponse = await fetchLeadMineBusinesses({
      limit: 50,
      hasEmail: false
    })
    
    if (noEmailResponse.businesses && noEmailResponse.businesses.length > 0) {
      console.log(`\n📋 Sample businesses without emails:`)
      noEmailResponse.businesses.slice(0, 5).forEach((business, index) => {
        console.log(`   ${index + 1}. ${business.name} (${business.contact?.primaryEmail || 'no email'})`)
      })
    }
    
    console.log(`\n💡 RECOMMENDATION:`)
    if (totalCount < 1122) {
      console.log(`- LeadMine API only has ${totalCount} businesses, not 1122`)
      console.log(`- The 1122 number might be from a different source or outdated`)
    } else if (totalCount > currentCount) {
      console.log(`- LeadMine has ${totalCount} businesses, we have ${currentCount}`)
      console.log(`- We need to import the remaining ${totalCount - currentCount} businesses`)
    } else {
      console.log(`- All businesses from LeadMine are already imported`)
    }
    
  } catch (error) {
    console.error('❌ Failed to debug LeadMine import:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

debugLeadMineImport()
  .then(() => {
    console.log('\n✅ Debug complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error)
    process.exit(1)
  })
