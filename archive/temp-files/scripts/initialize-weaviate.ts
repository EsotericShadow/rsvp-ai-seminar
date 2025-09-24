#!/usr/bin/env tsx

import { getClient, testWeaviateConnection, initializeWeaviateSchema } from '../src/lib/weaviate/client'
import { knowledgeIngestion } from '../src/lib/weaviate/knowledgeIngestion'

async function main() {
  console.log('🚀 Initializing Weaviate knowledge base...')
  
  try {
    // Test connection
    console.log('📡 Testing Weaviate connection...')
    const isConnected = await testWeaviateConnection()
    if (!isConnected) {
      throw new Error('Failed to connect to Weaviate')
    }
    console.log('✅ Connected to Weaviate successfully')
    
    // Initialize schema (skip if already exists)
    console.log('📚 Checking Weaviate schema...')
    try {
      await initializeWeaviateSchema()
      console.log('✅ Schema initialized successfully')
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('✅ Schema already exists, skipping...')
      } else {
        throw error
      }
    }
    
    // Ingest knowledge
    console.log('📖 Ingesting system knowledge...')
    await knowledgeIngestion.ingestSystemKnowledge()
    console.log('✅ Knowledge ingestion complete')
    
    console.log('🎉 Weaviate initialization complete!')
    
  } catch (error) {
    console.error('❌ Initialization failed:', error)
    process.exit(1)
  }
}

main()
