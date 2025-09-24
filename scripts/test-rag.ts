#!/usr/bin/env tsx

import { knowledgeIngestion } from '../src/lib/weaviate/knowledgeIngestion'

async function testRAG() {
  console.log('🧪 Testing RAG system...')
  
  const testQueries = [
    'How do I create a new campaign?',
    'What are the database models?',
    'How do I manage email templates?',
    'What are the API endpoints?',
    'How do I segment audiences?'
  ]
  
  for (const query of testQueries) {
    console.log(`\n🔍 Query: "${query}"`)
    
    try {
      const knowledgeResults = await knowledgeIngestion.searchKnowledge(query, 2)
      const businessResults = await knowledgeIngestion.searchBusinessData(query, 1)
      
      console.log(`📚 Knowledge results (${knowledgeResults.length}):`)
      knowledgeResults.forEach((result, i) => {
        console.log(`  ${i + 1}. ${result.title} (${result.category})`)
        console.log(`     ${result.content.substring(0, 100)}...`)
      })
      
      console.log(`🏢 Business results (${businessResults.length}):`)
      businessResults.forEach((result, i) => {
        console.log(`  ${i + 1}. ${result.businessName} (${result.industry})`)
      })
      
    } catch (error) {
      console.error(`❌ Error for query "${query}":`, error)
    }
  }
  
  console.log('\n✅ RAG testing complete!')
}

testRAG()

