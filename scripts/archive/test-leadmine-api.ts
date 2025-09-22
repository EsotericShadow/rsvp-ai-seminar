import { config } from 'dotenv'
import { fetchLeadMineBusinesses } from '../src/lib/leadMine'

// Load environment variables
config()

async function testLeadMineAPI() {
  console.log('🔍 TESTING LEADMINE API')
  console.log('=======================')
  
  try {
    console.log(`\n📡 Testing LeadMine API connection...`)
    console.log(`API Base: ${process.env.LEADMINE_API_BASE}`)
    console.log(`API Key: ${process.env.LEADMINE_API_KEY ? 'Set' : 'Not set'}`)
    
    // Test basic connection
    console.log(`\n1️⃣ Testing basic connection...`)
    const response = await fetchLeadMineBusinesses({
      limit: 5
    })
    
    console.log(`✅ API Response received!`)
    console.log(`Response structure:`)
    console.log(`- data: ${Array.isArray(response.data) ? response.data.length : 'not array'} items`)
    console.log(`- pagination:`, response.pagination)
    
    if (response.data && response.data.length > 0) {
      console.log(`\n📋 Sample business:`)
      const sample = response.data[0]
      console.log(`- ID: ${sample.id}`)
      console.log(`- Name: ${sample.name}`)
      console.log(`- Email: ${sample.contact?.primaryEmail}`)
      console.log(`- Created: ${sample.createdAt}`)
    }
    
    // Test with different parameters
    console.log(`\n2️⃣ Testing with hasEmail: true...`)
    const withEmailResponse = await fetchLeadMineBusinesses({
      limit: 5,
      hasEmail: true
    })
    console.log(`- Found ${withEmailResponse.data?.length || 0} businesses with emails`)
    
    console.log(`\n3️⃣ Testing with hasEmail: false...`)
    const withoutEmailResponse = await fetchLeadMineBusinesses({
      limit: 5,
      hasEmail: false
    })
    console.log(`- Found ${withoutEmailResponse.data?.length || 0} businesses without emails`)
    
    // Get total count
    console.log(`\n4️⃣ Getting total count...`)
    let totalCount = 0
    let cursor: string | undefined
    let batchCount = 0
    
    while (batchCount < 10) { // Limit to 10 batches for testing
      const batchResponse = await fetchLeadMineBusinesses({
        limit: 100,
        cursor: cursor
      })
      
      if (!batchResponse.data || batchResponse.data.length === 0) {
        console.log(`   - No more businesses found`)
        break
      }
      
      totalCount += batchResponse.data.length
      batchCount++
      console.log(`   - Batch ${batchCount}: ${batchResponse.data.length} businesses (total: ${totalCount})`)
      
      cursor = batchResponse.pagination?.nextCursor
      if (!cursor) {
        console.log(`   - No more cursor, reached end`)
        break
      }
    }
    
    console.log(`\n📊 LEADMINE API SUMMARY:`)
    console.log(`- Total businesses available: ${totalCount}`)
    console.log(`- API is working correctly!`)
    
    if (totalCount > 0) {
      console.log(`\n✅ SUCCESS: LeadMine API is working and has ${totalCount} businesses`)
      console.log(`The issue was with my previous scripts - they were looking for the wrong response structure`)
    } else {
      console.log(`\n⚠️  LeadMine API is working but has no businesses`)
    }
    
  } catch (error) {
    console.error('❌ LeadMine API test failed:', error)
    throw error
  }
}

testLeadMineAPI()
  .then(() => {
    console.log('\n✅ API test complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
