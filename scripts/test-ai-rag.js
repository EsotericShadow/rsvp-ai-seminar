#!/usr/bin/env node

/**
 * Test AI Service RAG System
 * Tests the RAG system by importing and using the compiled AI service
 */

require('dotenv').config();

async function testAIRAGSystem() {
  console.log('🤖 Testing AI Service RAG System...\n');
  
  try {
    // Import the compiled AI service RAG system
    const { RAGIntegrationSystem } = require('../ai-service/dist/lib/rag-integration.js');
    
    console.log('✅ Successfully imported RAGIntegrationSystem');
    
    // Create an instance
    const ragSystem = new RAGIntegrationSystem();
    console.log('✅ Successfully created RAG system instance');
    
    // Test initialization
    console.log('\n🚀 Testing Knowledge Base Initialization...');
    try {
      await ragSystem.initializeKnowledgeBase();
      console.log('✅ Knowledge base initialization completed');
    } catch (error) {
      console.log(`❌ Knowledge base initialization failed: ${error.message}`);
    }
    
    // Test RAG response generation
    console.log('\n🔍 Testing RAG Response Generation...');
    
    const testQueries = [
      'How do I create email templates?',
      'Tell me about Evergreen Web Solutions',
      'What is the AI in Terrace event?',
      'How does the RSVP system work?'
    ];
    
    for (const query of testQueries) {
      try {
        console.log(`\n   Testing query: "${query}"`);
        const response = await ragSystem.generateRAGResponse(query);
        
        if (response && response.answer) {
          console.log(`   ✅ Response generated`);
          console.log(`   📝 Answer: ${response.answer.substring(0, 100)}...`);
          console.log(`   🎯 Confidence: ${response.confidence}`);
          console.log(`   📚 Sources: ${response.sources?.length || 0}`);
          console.log(`   🔗 Next Steps: ${response.nextSteps?.join(', ') || 'None'}`);
        } else {
          console.log(`   ⚠️  No response generated`);
        }
      } catch (error) {
        console.log(`   ❌ Query failed: ${error.message}`);
      }
    }
    
    console.log('\n🎉 AI RAG system test completed!');
    
  } catch (error) {
    console.log('❌ Failed to import or test AI RAG system:');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('Cannot find module')) {
      console.log('   💡 Make sure the AI service is built first:');
      console.log('      cd ai-service && npm run build');
    }
  }
}

// Run the test
testAIRAGSystem().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
