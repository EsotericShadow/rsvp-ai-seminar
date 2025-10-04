#!/usr/bin/env ts-node

/**
 * Simple Weaviate Connection Test
 * Tests basic Weaviate connectivity using the legacy API
 */

import weaviate from 'weaviate-ts-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
    // Initialize Weaviate client
    const client = weaviate.client({
      scheme: 'https',
      host: weaviateUrl.replace('https://', ''),
      apiKey: new weaviate.ApiKey(weaviateApiKey),
    });
    
    console.log('🔌 Connecting to Weaviate...');
    
    // Test connection by getting meta information
    const meta = await client.misc.metaGetter().do();
    console.log('✅ Connected successfully!');
    console.log(`   Version: ${meta.version}`);
    console.log(`   Hostname: ${meta.hostname}`);
    console.log(`   Modules: ${Object.keys(meta.modules || {}).join(', ')}\n`);
    
    // Check collections using legacy API
    console.log('📚 Checking Collections...');
    const schema = await client.schema.getter().do();
    const collections = schema.classes?.map((c: any) => c.class) || [];
    
    console.log(`   Found ${collections.length} collections: ${collections.join(', ')}`);
    
    const expectedCollections = ['KnowledgeBase', 'BusinessData'];
    for (const expected of expectedCollections) {
      if (collections.includes(expected)) {
        console.log(`   ✅ ${expected}: Found`);
        
        // Try to get a sample entry to verify data exists
        try {
          const sampleQuery = await client.query
            .get(expected, ['title', 'category', 'source'])
            .withLimit(1)
            .do();
          
          const sample = sampleQuery.data.Get[expected]?.[0];
          if (sample) {
            console.log(`      📊 Has data: ${sample.title || 'Untitled'}`);
          } else {
            console.log(`      ⚠️  Collection exists but appears empty`);
          }
        } catch (error) {
          console.log(`      ⚠️  Could not query sample: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        console.log(`   ❌ ${expected}: Missing`);
      }
    }
    
    // Test basic search functionality
    console.log('\n🔍 Testing Search Functionality...');
    
    if (collections.includes('KnowledgeBase')) {
      try {
        const searchResults = await client.query
          .get('KnowledgeBase', ['title', 'category', 'source'])
          .withBm25({ query: 'template' })
          .withLimit(3)
          .do();
        
        const results = searchResults.data.Get.KnowledgeBase || [];
        console.log(`   ✅ Search test successful: Found ${results.length} results for "template"`);
        
        if (results.length > 0) {
          console.log('   📋 Sample results:');
          results.forEach((result: any, index: number) => {
            console.log(`      ${index + 1}. ${result.title} (${result.category})`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Search test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log('\n🎉 Weaviate connection test completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   - If collections are missing, the AI service needs to initialize them');
    console.log('   - If collections exist but are empty, knowledge ingestion needs to run');
    console.log('   - If search fails, check that vectorization is working');
    
  } catch (error) {
    console.log('❌ Connection failed:');
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof Error && error.message.includes('401')) {
      console.log('   💡 This might be an authentication issue. Check your API key.');
    } else if (error instanceof Error && error.message.includes('ENOTFOUND')) {
      console.log('   💡 This might be a network issue. Check your Weaviate URL.');
    } else if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      console.log('   💡 Weaviate server might be down. Check if the service is running.');
    }
  }
}

// Run the test
testWeaviateConnection().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});


