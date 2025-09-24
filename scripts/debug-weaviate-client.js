#!/usr/bin/env node

/**
 * Debug Weaviate Client Structure
 */

require('dotenv').config();

async function debugWeaviateClient() {
  console.log('🔍 Debugging Weaviate Client Structure...\n');
  
  const weaviateUrl = process.env.WEAVIATE_URL;
  const weaviateApiKey = process.env.WEAVIATE_API_KEY;
  
  if (!weaviateUrl || !weaviateApiKey) {
    console.log('❌ Missing Weaviate configuration');
    return;
  }
  
  try {
    const weaviate = require('weaviate-ts-client').default;
    
    // Initialize client exactly like AI service
    const client = weaviate.client({
      scheme: 'https',
      host: weaviateUrl.replace('https://', ''),
      apiKey: new weaviate.ApiKey(weaviateApiKey),
    });
    
    console.log('✅ Client created');
    console.log('🔍 Client structure:');
    console.log('   typeof client:', typeof client);
    console.log('   client keys:', Object.keys(client));
    
    if (client.query) {
      console.log('   ✅ client.query exists');
      console.log('   client.query keys:', Object.keys(client.query));
    } else {
      console.log('   ❌ client.query does not exist');
    }
    
    if (client.misc) {
      console.log('   ✅ client.misc exists');
      console.log('   client.misc keys:', Object.keys(client.misc));
    } else {
      console.log('   ❌ client.misc does not exist');
    }
    
    if (client.schema) {
      console.log('   ✅ client.schema exists');
      console.log('   client.schema keys:', Object.keys(client.schema));
    } else {
      console.log('   ❌ client.schema does not exist');
    }
    
    // Test meta getter
    try {
      const meta = await client.misc.metaGetter().do();
      console.log('\n✅ Meta getter works');
      console.log('   Version:', meta.version);
    } catch (error) {
      console.log('\n❌ Meta getter failed:', error.message);
    }
    
    // Test schema getter
    try {
      const schema = await client.schema.getter().do();
      console.log('\n✅ Schema getter works');
      console.log('   Collections:', schema.classes?.map(c => c.class).join(', ') || 'None');
    } catch (error) {
      console.log('\n❌ Schema getter failed:', error.message);
    }
    
    // Test query
    if (client.query) {
      try {
        const queryResult = await client.query
          .get('KnowledgeBase', ['title'])
          .withLimit(1)
          .do();
        console.log('\n✅ Query works');
        console.log('   Result keys:', Object.keys(queryResult));
      } catch (error) {
        console.log('\n❌ Query failed:', error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Failed to create client:', error.message);
  }
}

debugWeaviateClient().catch(error => {
  console.error('❌ Debug script failed:', error);
  process.exit(1);
});
