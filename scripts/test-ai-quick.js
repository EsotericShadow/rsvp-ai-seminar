#!/usr/bin/env node

/**
 * Quick AI Test - Tests the most critical functionality
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://juniper-ai-service.onrender.com';
const AI_API_KEY = process.env.AI_SERVICE_API_KEY || 'test-key-123';

async function testAIConnection() {
  console.log('🔍 Testing AI Service Connection...');
  
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': AI_API_KEY
      }
    });

    if (response.ok) {
      console.log('✅ AI service is responding');
      return true;
    } else {
      console.log(`❌ AI service returned ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    return false;
  }
}

async function testChatEndpoint() {
  console.log('💬 Testing Chat Endpoint...');
  
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': AI_API_KEY
      },
      body: JSON.stringify({
        message: 'Hello, can you help me create a template?',
        sessionId: 'test-session',
        conversationHistory: []
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Chat endpoint is working');
      console.log(`   Response: ${data.message.substring(0, 100)}...`);
      return true;
    } else {
      console.log(`❌ Chat endpoint returned ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Chat test failed: ${error.message}`);
    return false;
  }
}

async function testTemplateKnowledge() {
  console.log('📧 Testing Template Knowledge...');
  
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': AI_API_KEY
      },
      body: JSON.stringify({
        message: 'What template variables are available?',
        sessionId: 'test-session',
        conversationHistory: []
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.message.toLowerCase();
      
      if (content.includes('businessname') || content.includes('invite_link') || content.includes('greeting')) {
        console.log('✅ AI knows about template variables');
        console.log(`   Response: ${data.message.substring(0, 100)}...`);
        return true;
      } else {
        console.log('❌ AI response missing template variables');
        console.log(`   Response: ${data.message.substring(0, 100)}...`);
        return false;
      }
    } else {
      console.log(`❌ Template knowledge test returned ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Template knowledge test failed: ${error.message}`);
    return false;
  }
}

async function testConversationContext() {
  console.log('🔄 Testing Conversation Context (Original Issue)...');
  
  try {
    // Step 1: Start deletion flow
    const step1 = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': AI_API_KEY
      },
      body: JSON.stringify({
        message: 'delete all campaigns',
        sessionId: 'test-session',
        conversationHistory: []
      })
    });

    if (!step1.ok) {
      console.log('❌ Failed to start deletion flow');
      return false;
    }

    const step1Data = await step1.json();
    const conversationHistory = [
      { role: 'user', content: 'delete all campaigns', timestamp: Date.now() },
      { role: 'assistant', content: step1Data.message, timestamp: Date.now() }
    ];

    // Step 2: Specify target
    const step2 = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': AI_API_KEY
      },
      body: JSON.stringify({
        message: 'all campaigns',
        sessionId: 'test-session',
        conversationHistory: conversationHistory
      })
    });

    if (!step2.ok) {
      console.log('❌ Failed to specify deletion target');
      return false;
    }

    const step2Data = await step2.json();
    conversationHistory.push(
      { role: 'user', content: 'all campaigns', timestamp: Date.now() },
      { role: 'assistant', content: step2Data.message, timestamp: Date.now() }
    );

    // Step 3: Final confirmation (the original issue)
    const step3 = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': AI_API_KEY
      },
      body: JSON.stringify({
        message: 'YES DELETE ALL',
        sessionId: 'test-session',
        conversationHistory: conversationHistory
      })
    });

    if (step3.ok) {
      const step3Data = await step3.json();
      if (step3Data.message.includes('EXECUTING')) {
        console.log('✅ AI correctly recognized final confirmation');
        console.log(`   Response: ${step3Data.message.substring(0, 100)}...`);
        return true;
      } else {
        console.log('❌ AI failed to recognize final confirmation');
        console.log(`   Response: ${step3Data.message.substring(0, 100)}...`);
        return false;
      }
    } else {
      console.log(`❌ Final confirmation test returned ${step3.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Conversation context test failed: ${error.message}`);
    return false;
  }
}

async function runQuickTests() {
  console.log('🚀 Starting Quick AI Tests\n');
  
  const tests = [
    { name: 'AI Connection', fn: testAIConnection },
    { name: 'Chat Endpoint', fn: testChatEndpoint },
    { name: 'Template Knowledge', fn: testTemplateKnowledge },
    { name: 'Conversation Context', fn: testConversationContext }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) passed++;
  }

  console.log('\n📊 Quick Test Results:');
  console.log('=' .repeat(30));
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);

  if (passed >= total * 0.75) {
    console.log('\n🎉 Quick Tests: PASSED');
  } else {
    console.log('\n⚠️ Quick Tests: NEEDS IMPROVEMENT');
  }
}

// Run the tests
if (require.main === module) {
  runQuickTests().catch(console.error);
}

module.exports = { runQuickTests };
