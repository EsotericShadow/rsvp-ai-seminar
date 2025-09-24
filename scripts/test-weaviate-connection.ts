#!/usr/bin/env ts-node

/**
 * Simple Weaviate Connection Test
 * Tests basic Weaviate connectivity and data without dependencies on main app
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
    
    // Check collections
    console.log('📚 Checking Collections...');
    const schema = await client.schema.getter().do();
    const collections = schema.classes?.map((c: any) => c.class) || [];
    
    console.log(`   Found ${collections.length} collections: ${collections.join(', ')}`);
    
    const expectedCollections = ['KnowledgeBase', 'BusinessData'];
    for (const expected of expectedCollections) {
      if (collections.includes(expected)) {
        console.log(`   ✅ ${expected}: Found`);
        
        // Get count of entries
        try {
          const collection = client.collections.get(expected);
          const count = await collection.aggregate.overAll().do();
          
          const entryCount = count.totalCount || 0;
          console.log(`      📊 Entries: ${entryCount}`);
        } catch (error) {
          console.log(`      ⚠️  Could not count entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        console.log(`   ❌ ${expected}: Missing`);
      }
    }
    
    // Test search functionality
    console.log('\n🔍 Testing Search Functionality...');
    
    if (collections.includes('KnowledgeBase')) {
      try {
        const collection = client.collections.get('KnowledgeBase');
        const searchResults = await collection.query.bm25('template', {
          limit: 3,
          returnProperties: ['title', 'category', 'source']
        });
        
        const results = searchResults.objects || [];
        console.log(`   ✅ Search test successful: Found ${results.length} results for "template"`);
        
        if (results.length > 0) {
          console.log('   📋 Sample results:');
          results.forEach((result: any, index: number) => {
            console.log(`      ${index + 1}. ${result.properties.title} (${result.properties.category})`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Search test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log('\n🎉 Weaviate connection test completed successfully!');
    
  } catch (error) {
    console.log('❌ Connection failed:');
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof Error && error.message.includes('401')) {
      console.log('   💡 This might be an authentication issue. Check your API key.');
    } else if (error instanceof Error && error.message.includes('ENOTFOUND')) {
      console.log('   💡 This might be a network issue. Check your Weaviate URL.');
    }
  }
}

// Run the test
testWeaviateConnection().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
