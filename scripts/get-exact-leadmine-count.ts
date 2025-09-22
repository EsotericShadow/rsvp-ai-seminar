import { config } from 'dotenv'
import { fetchLeadMineBusinesses } from '../src/lib/leadMine'

// Load environment variables
config()

async function getExactLeadMineCount() {
  console.log('🔍 GETTING EXACT LEADMINE COUNT')
  console.log('===============================')
  
  try {
    console.log(`\n📡 Fetching ALL businesses from LeadMine to get exact count...`)
    
    let totalCount = 0
    let cursor: string | undefined
    let batchCount = 0
    const batchSize = 100
    
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
      
      totalCount += response.data.length
      batchCount++
      console.log(`   - Batch ${batchCount}: ${response.data.length} businesses`)
      console.log(`   - Total so far: ${totalCount}`)
      console.log(`   - Has next cursor: ${!!response.pagination?.nextCursor}`)
      
      cursor = response.pagination?.nextCursor
      if (!cursor) {
        console.log(`   - No more cursor, reached end of data`)
        break
      }
      
      // Safety limit to prevent infinite loops
      if (batchCount > 50) {
        console.log(`   - Safety limit reached (50 batches), stopping`)
        break
      }
    }
    
    console.log(`\n📊 EXACT LEADMINE COUNT:`)
    console.log(`- Total businesses in LeadMine: ${totalCount}`)
    console.log(`- Batches fetched: ${batchCount}`)
    console.log(`- Expected: 1122`)
    console.log(`- Difference: ${totalCount - 1122}`)
    
    if (totalCount === 1122) {
      console.log(`\n✅ PERFECT! LeadMine has exactly 1122 businesses as expected`)
    } else if (totalCount < 1122) {
      console.log(`\n⚠️  LeadMine has ${totalCount} businesses, missing ${1122 - totalCount}`)
      console.log(`   Possible reasons:`)
      console.log(`   1. Some businesses were deleted from LeadMine`)
      console.log(`   2. There's a filter or limit being applied`)
      console.log(`   3. The 1122 number was from a different time period`)
    } else {
      console.log(`\n⚠️  LeadMine has ${totalCount} businesses, more than expected 1122`)
      console.log(`   Extra: ${totalCount - 1122} businesses`)
    }
    
  } catch (error) {
    console.error('❌ Failed to get exact count:', error)
    throw error
  }
}

getExactLeadMineCount()
  .then(() => {
    console.log('\n✅ Count check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Count check failed:', error)
    process.exit(1)
  })
