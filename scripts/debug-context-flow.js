#!/usr/bin/env node

/**
 * Debug script to trace the exact flow of context analysis
 */

const AI_SERVICE_URL = 'https://juniper-ai-service.onrender.com';
const AI_API_KEY = 'REDACTED_CREDENTIAL';

async function debugContextFlow() {
  console.log('🔍 Debugging context analysis flow...\n');

  try {
    // Step 1: Get initial response
    const initialResponse = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': AI_API_KEY
      },
      body: JSON.stringify({
        message: 'delete all templates',
        sessionId: 'debug-flow-test',
        conversationHistory: []
      })
    });

    const initialResult = await initialResponse.json();
    console.log('📝 Initial response received');
    
    // Step 2: Test with minimal conversation history
    console.log('\n🧪 Testing with minimal conversation history...');
    const minimalResponse = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': AI_API_KEY
      },
      body: JSON.stringify({
        message: 'yes delete all templates',
        sessionId: 'debug-flow-test',
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

    const minimalResult = await minimalResponse.json();
    console.log('📝 Minimal conversation result:');
    console.log(minimalResult.message.substring(0, 100) + '...');

    // Step 3: Test with different message variations
    const variations = [
      'all templates',
      'yes delete all',
      'confirm delete all templates',
      'yes delete all templates'
    ];

    for (const variation of variations) {
      console.log(`\n🧪 Testing variation: "${variation}"`);
      
      const variationResponse = await fetch(`${AI_SERVICE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-API-Key': AI_API_KEY
        },
        body: JSON.stringify({
          message: variation,
          sessionId: 'debug-flow-test',
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

      const variationResult = await variationResponse.json();
      const isContextual = variationResult.message.includes('Confirmed: Delete ALL templates') || 
                          variationResult.message.includes('absolutely sure');
      
      console.log(`   Result: ${isContextual ? '✅ CONTEXTUAL' : '❌ GENERIC'}`);
      if (!isContextual) {
        console.log(`   Message: ${variationResult.message.substring(0, 80)}...`);
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugContextFlow();
