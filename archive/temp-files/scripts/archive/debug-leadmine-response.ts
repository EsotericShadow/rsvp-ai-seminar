import { config } from 'dotenv'
import { fetchLeadMineBusinesses } from '../src/lib/leadMine'

// Load environment variables
config()

async function debugLeadMineResponse() {
  console.log('🔍 DEBUGGING LEADMINE RESPONSE STRUCTURE')
  console.log('========================================')
  
  try {
    console.log(`\n📡 Testing LeadMine API response structure...`)
    
    const response = await fetchLeadMineBusinesses({
      limit: 5
    })
    
    console.log(`\n📋 Full response object:`)
    console.log(JSON.stringify(response, null, 2))
    
    console.log(`\n🔍 Response analysis:`)
    console.log(`- Type: ${typeof response}`)
    console.log(`- Keys: ${Object.keys(response)}`)
    
    if (response.businesses) {
      console.log(`- businesses type: ${typeof response.businesses}`)
      console.log(`- businesses is array: ${Array.isArray(response.businesses)}`)
      if (Array.isArray(response.businesses)) {
        console.log(`- businesses length: ${response.businesses.length}`)
      }
    }
    
    if (response.pagination) {
      console.log(`- pagination:`, response.pagination)
    }
    
    // Check if there's a different key for businesses
    const possibleKeys = ['data', 'businesses', 'results', 'items', 'list']
    for (const key of possibleKeys) {
      if (response[key]) {
        console.log(`- Found key '${key}': ${Array.isArray(response[key]) ? response[key].length : 'not array'} items`)
      }
    }
    
  } catch (error) {
    console.error('❌ LeadMine API debug failed:', error)
    throw error
  }
}

debugLeadMineResponse()
  .then(() => {
    console.log('\n✅ Debug complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error)
    process.exit(1)
  })
