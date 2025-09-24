#!/usr/bin/env tsx

import { config } from 'dotenv'
import { getClient, testWeaviateConnection, initializeWeaviateSchema } from '../src/lib/weaviate/client'
import { knowledgeIngestion } from '../src/lib/weaviate/knowledgeIngestion'

// Load environment variables
config()

async function setupRAGSystem() {
  console.log('🚀 Setting up RAG system with Weaviate...')
  
  try {
    // Step 1: Test Weaviate connection
    console.log('\n1. Testing Weaviate connection...')
    const isConnected = await testWeaviateConnection()
    if (!isConnected) {
      throw new Error('Failed to connect to Weaviate. Please check your configuration.')
    }
    console.log('✅ Weaviate connection successful')

    // Step 2: Initialize schema
    console.log('\n2. Initializing Weaviate schema...')
    await initializeWeaviateSchema()
    console.log('✅ Schema initialized')

    // Step 3: Ingest knowledge
    console.log('\n3. Ingesting system knowledge...')
    await knowledgeIngestion.ingestSystemKnowledge()
    console.log('✅ Knowledge ingestion complete')

    // Step 4: Test search functionality
    console.log('\n4. Testing search functionality...')
    const testQuery = 'create campaign'
    const results = await knowledgeIngestion.searchKnowledge(testQuery, 3)
    console.log(`Found ${results.length} results for "${testQuery}"`)
    
    if (results.length > 0) {
      console.log('Sample result:', {
        title: results[0].title,
        category: results[0].category,
        content: results[0].content.substring(0, 100) + '...'
      })
    }

    console.log('\n🎉 RAG system setup complete!')
    console.log('\nNext steps:')
    console.log('1. Update PersonalAIAssistant to use RAGDatabaseAgent')
    console.log('2. Test the RAG agent with queries')
    console.log('3. Monitor Weaviate for knowledge base growth')

  } catch (error) {
    console.error('❌ RAG system setup failed:', error)
    process.exit(1)
  }
}

// Run setup if called directly
if (require.main === module) {
  setupRAGSystem()
}

export { setupRAGSystem }


