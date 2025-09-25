#!/usr/bin/env ts-node

/**
 * Weaviate RAG System Test
 * Tests Weaviate using the same approach as the AI service
 */

import weaviate from 'weaviate-ts-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testWeaviateRAG() {
  console.log('🔗 Testing Weaviate RAG System...\n');
  
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
    // Initialize Weaviate client (same as AI service)
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
    
    // Check collections using the same approach as AI service
    console.log('📚 Checking Collections...');
    
    try {
      const collections = await client.schema.getter().do();
      const collectionNames = collections.classes?.map((c: any) => c.class) || [];
      
      console.log(`   Found ${collectionNames.length} collections: ${collectionNames.join(', ')}`);
      
      const expectedCollections = ['KnowledgeBase', 'BusinessData'];
      for (const expected of expectedCollections) {
        if (collectionNames.includes(expected)) {
          console.log(`   ✅ ${expected}: Found`);
          
          // Test collection access using the same method as AI service
          try {
            const collection = client.collections.get(expected);
            console.log(`      📊 Collection accessible via client.collections.get()`);
            
            // Try to get a sample entry
            try {
              const sampleResults = await collection.query.bm25('test', {
                limit: 1,
                returnProperties: ['title', 'category', 'source']
              });
              
              const sample = sampleResults.objects?.[0];
              if (sample) {
                console.log(`      📋 Sample entry: ${sample.properties?.title || 'Untitled'}`);
              } else {
                console.log(`      ⚠️  Collection exists but appears empty`);
              }
            } catch (error) {
              console.log(`      ⚠️  Could not query sample: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            
          } catch (error) {
            console.log(`      ❌ Could not access collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } else {
          console.log(`   ❌ ${expected}: Missing`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Could not get schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Test search functionality using the same approach as AI service
    console.log('\n🔍 Testing Search Functionality...');
    
    try {
      const collection = client.collections.get('KnowledgeBase');
      
      const testQueries = ['template', 'campaign', 'Evergreen', 'AI in Terrace'];
      
      for (const query of testQueries) {
        try {
          console.log(`   Testing query: "${query}"`);
          
          const searchResults = await collection.query.bm25(query, {
            limit: 2,
            returnProperties: ['title', 'content', 'category', 'source', 'tags']
          });
          
          const results = searchResults.objects || [];
          console.log(`      ✅ Found ${results.length} results`);
          
          if (results.length > 0) {
            results.forEach((result: any, index: number) => {
              console.log(`         ${index + 1}. ${result.properties?.title || 'Untitled'} (${result.properties?.category || 'Unknown'})`);
            });
          }
        } catch (error) {
          console.log(`      ❌ Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Could not access KnowledgeBase collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Test knowledge base initialization (like AI service does)
    console.log('\n🚀 Testing Knowledge Base Initialization...');
    
    try {
      // Check if we can create collections (this tests permissions)
      const collections = await client.schema.getter().do();
      const collectionNames = collections.classes?.map((c: any) => c.class) || [];
      
      if (!collectionNames.includes('KnowledgeBase')) {
        console.log('   ⚠️  KnowledgeBase collection missing - AI service will need to create it');
      } else {
        console.log('   ✅ KnowledgeBase collection exists');
      }
      
      if (!collectionNames.includes('BusinessData')) {
        console.log('   ⚠️  BusinessData collection missing - AI service will need to create it');
      } else {
        console.log('   ✅ BusinessData collection exists');
      }
      
    } catch (error) {
      console.log(`   ❌ Could not check collections for initialization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    console.log('\n🎉 Weaviate RAG system test completed!');
    console.log('\n💡 Summary:');
    console.log('   - If connection works, Weaviate is accessible');
    console.log('   - If collections exist, the AI service has been initialized');
    console.log('   - If search works, the RAG system is functional');
    console.log('   - If collections are missing, run the AI service to initialize them');
    
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
testWeaviateRAG().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});

