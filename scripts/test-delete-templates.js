#!/usr/bin/env node

/**
 * Test script to verify delete all templates functionality
 */

const AI_SERVICE_URL = 'https://juniper-ai-service.onrender.com';
const AI_API_KEY = 'REDACTED_CREDENTIAL';

async function testDeleteTemplates() {
  console.log('🧪 Testing delete all templates functionality...\n');

  try {
    // Step 1: Initial request
    console.log('📝 Step 1: Requesting to delete all templates');
    const initialResponse = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': AI_API_KEY
      },
      body: JSON.stringify({
        message: 'delete all templates',
        sessionId: 'delete-templates-test-5',
        conversationHistory: []
      })
    });

    if (!initialResponse.ok) {
      throw new Error(`HTTP ${initialResponse.status}: ${await initialResponse.text()}`);
    }

    const initialResult = await initialResponse.json();
    console.log('✅ Initial response received');
    console.log('Message:', initialResult.message.substring(0, 100) + '...');

    // Step 2: Confirmation response
    console.log('\n📝 Step 2: Confirming deletion');
    const confirmationResponse = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': AI_API_KEY
      },
      body: JSON.stringify({
        message: 'yes delete all templates',
        sessionId: 'delete-templates-test-5',
        conversationHistory: [
          {
            role: 'user',
            content: 'delete all templates'
          },
          {
            role: 'assistant',
            content: initialResult.message
          }
        ]
      })
    });

    if (!confirmationResponse.ok) {
      throw new Error(`HTTP ${confirmationResponse.status}: ${await confirmationResponse.text()}`);
    }

    const confirmationResult = await confirmationResponse.json();
    console.log('✅ Confirmation response received');
    console.log('Message:', confirmationResult.message);
    
    if (confirmationResult.message.toLowerCase().includes('executing')) {
      console.log('🎉 SUCCESS: AI is executing the delete command!');
    } else if (confirmationResult.message.toLowerCase().includes('deleted')) {
      console.log('🎉 SUCCESS: AI has deleted the templates!');
    } else {
      console.log('⚠️  AI is not executing the delete command as expected');
      console.log('Response suggests:', confirmationResult.message.substring(0, 200));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDeleteTemplates();
