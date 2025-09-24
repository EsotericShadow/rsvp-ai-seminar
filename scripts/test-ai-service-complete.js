#!/usr/bin/env node

/**
 * Complete AI Service Test
 * Tests the AI service end-to-end including Weaviate integration
 */

require('dotenv').config();

async function testAIService() {
  console.log('🤖 Testing AI Service End-to-End...\n');
  
  const aiServiceUrl = 'https://juniper-ai-service.onrender.com';
  const apiKey = process.env.AI_SERVICE_API_KEY || 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5';
  
  console.log(`🔗 AI Service URL: ${aiServiceUrl}`);
  console.log(`🔑 API Key: ${apiKey ? 'Set' : 'Missing'}\n`);
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${aiServiceUrl}/health`);
    const healthData = await healthResponse.json();
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthData)}\n`);
    
    if (healthResponse.status !== 200) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }
    
    // Test 2: Chat Endpoint (without API key - should fail)
    console.log('2️⃣ Testing Chat Endpoint (without API key)...');
    try {
      const chatResponse = await fetch(`${aiServiceUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Hello',
          conversationHistory: []
        })
      });
      
      const chatData = await chatResponse.json();
      console.log(`   Status: ${chatResponse.status}`);
      console.log(`   Response: ${JSON.stringify(chatData)}`);
      
      if (chatResponse.status === 401) {
        console.log('   ✅ Correctly rejected unauthorized request\n');
      } else {
        console.log('   ⚠️  Expected 401 but got different status\n');
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}\n`);
    }
    
    // Test 3: Chat Endpoint (with API key)
    console.log('3️⃣ Testing Chat Endpoint (with API key)...');
    try {
      const chatResponse = await fetch(`${aiServiceUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-API-Key': apiKey
        },
        body: JSON.stringify({
          message: 'Hello, can you help me create a template?',
          conversationHistory: []
        })
      });
      
      console.log(`   Status: ${chatResponse.status}`);
      
      if (chatResponse.status === 200) {
        const chatData = await chatResponse.json();
        console.log(`   Response: ${JSON.stringify(chatData, null, 2)}`);
        console.log('   ✅ Chat endpoint working with API key\n');
      } else {
        const errorData = await chatResponse.text();
        console.log(`   Response: ${errorData}`);
        console.log(`   ⚠️  Chat endpoint returned status ${chatResponse.status}\n`);
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}\n`);
    }
    
    // Test 4: Test Weaviate Integration
    console.log('4️⃣ Testing Weaviate Integration...');
    try {
      const ragResponse = await fetch(`${aiServiceUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-API-Key': apiKey
        },
        body: JSON.stringify({
          message: 'Tell me about Evergreen Web Solutions',
          conversationHistory: []
        })
      });
      
      console.log(`   Status: ${ragResponse.status}`);
      
      if (ragResponse.status === 200) {
        const ragData = await ragResponse.json();
        console.log(`   Response: ${JSON.stringify(ragData, null, 2)}`);
        console.log('   ✅ RAG integration working\n');
      } else {
        const errorData = await ragResponse.text();
        console.log(`   Response: ${errorData}`);
        console.log(`   ⚠️  RAG test returned status ${ragResponse.status}\n`);
      }
    } catch (error) {
      console.log(`   ❌ RAG test failed: ${error.message}\n`);
    }
    
    console.log('🎉 AI Service test completed!');
    
  } catch (error) {
    console.log('❌ Test failed:');
    console.log(`   Error: ${error.message}`);
  }
}

// Run the test
testAIService().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
