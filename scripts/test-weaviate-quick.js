#!/usr/bin/env node

/**
 * Quick Weaviate Connection Test
 * Tests basic Weaviate connectivity with correct API syntax
 */

require('dotenv').config();

async function testWeaviateConnection() {
  console.log('🔗 Testing Weaviate Connection...\n');
  
  const weaviateUrl = process.env.WEAVIATE_URL;
  const weaviateApiKey = process.env.WEAVIATE_API_KEY;
  
  if (!weaviateUrl || !weaviateApiKey) {
    console.log('❌ Missing Weaviate configuration:');
    console.log(`   WEAVIATE_URL: ${weaviateUrl ? '✅ Set' : '❌ Missing'}`);
    console.log(`   WEAVIATE_API_KEY: ${weaviateApiKey ? '✅ Set' : '❌ Missing'}`);
    return;
  }
  
  console.log(`📍 Weaviate URL: ${weaviateUrl}`);
  console.log(`🔑 API Key: ${weaviateApiKey ? 'Set' : 'Missing'}\n`);
  
  try {
    // Import weaviate with correct syntax
    const weaviate = require('weaviate-ts-client');
    
    // Initialize Weaviate client
    const client = weaviate.default.client({
      scheme: 'https',
      host: weaviateUrl.replace('https://', ''),
      apiKey: new weaviate.default.ApiKey(weaviateApiKey),
    });
    
    console.log('🔌 Connecting to Weaviate...');
    
    // Test connection by getting meta information
    const meta = await client.misc.metaGetter().do();
    console.log('✅ Connected successfully!');
    console.log(`   Version: ${meta.version}`);
    console.log(`   Hostname: ${meta.hostname}`);
    
    // Check collections
    console.log('\n📚 Checking Collections...');
    const schema = await client.schema.getter().do();
    const collections = schema.classes?.map((c) => c.class) || [];
    
    console.log(`   Found ${collections.length} collections: ${collections.join(', ')}`);
    
    const expectedCollections = ['KnowledgeBase', 'BusinessData'];
    for (const expected of expectedCollections) {
      if (collections.includes(expected)) {
        console.log(`   ✅ ${expected}: Found`);
      } else {
        console.log(`   ❌ ${expected}: Missing`);
      }
    }
    
    // Test search functionality
    console.log('\n🔍 Testing Search Functionality...');
    
    if (collections.includes('KnowledgeBase')) {
      try {
        const searchResults = await client.graphql
          .get()
          .withClassName('KnowledgeBase')
          .withFields('title content category')
          .withBm25({ query: 'template' })
          .withLimit(3)
          .do();
        
        const results = searchResults.data.Get.KnowledgeBase || [];
        console.log(`   ✅ Search test successful: Found ${results.length} results for "template"`);
        
        if (results.length > 0) {
          console.log('   📋 Sample results:');
          results.forEach((result, index) => {
            console.log(`      ${index + 1}. ${result.title} (${result.category})`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Search test failed: ${error.message || 'Unknown error'}`);
      }
    }
    
    console.log('\n🎉 Weaviate connection test completed successfully!');
    
  } catch (error) {
    console.log('❌ Connection failed:');
    console.log(`   Error: ${error.message || 'Unknown error'}`);
    
    if (error.message && error.message.includes('401')) {
      console.log('   💡 This might be an authentication issue. Check your API key.');
    } else if (error.message && error.message.includes('ENOTFOUND')) {
      console.log('   💡 This might be a network issue. Check your Weaviate URL.');
    } else if (error.message && error.message.includes('ECONNREFUSED')) {
      console.log('   💡 Weaviate server might be down. Check if the service is running.');
    }
  }
}

// Run the test
testWeaviateConnection().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
