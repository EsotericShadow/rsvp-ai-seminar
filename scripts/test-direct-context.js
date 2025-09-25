#!/usr/bin/env node

/**
 * Test script to directly test the context analysis logic
 */

const AI_SERVICE_URL = 'https://juniper-ai-service.onrender.com';
const AI_API_KEY = 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5';

async function testDirectContext() {
  console.log('🧪 Testing direct context analysis...\n');

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
        sessionId: 'direct-context-test',
        conversationHistory: []
      })
    });

    const initialResult = await initialResponse.json();
    console.log('✅ Initial response received');

    // Step 2: Test with different conversation history formats
    const formats = [
      // Format 1: Standard format
      [
        { role: 'user', content: 'delete all templates' },
        { role: 'assistant', content: initialResult.message }
      ],
      // Format 2: With timestamps
      [
        { role: 'user', content: 'delete all templates', timestamp: new Date() },
        { role: 'assistant', content: initialResult.message, timestamp: new Date() }
      ],
      // Format 3: With additional fields
      [
        { role: 'user', content: 'delete all templates', timestamp: new Date().toISOString() },
        { role: 'assistant', content: initialResult.message, timestamp: new Date().toISOString() }
      ]
    ];

    for (let i = 0; i < formats.length; i++) {
      console.log(`\n🧪 Testing format ${i + 1}:`);
      console.log('Format:', JSON.stringify(formats[i], null, 2));
      
      const response = await fetch(`${AI_SERVICE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-API-Key': AI_API_KEY
        },
        body: JSON.stringify({
          message: 'yes delete all templates',
          sessionId: `direct-context-test-${i}`,
          conversationHistory: formats[i]
        })
      });

      const result = await response.json();
      const isContextual = result.message.includes('Confirmed: Delete ALL templates') ||
                          result.message.includes('absolutely sure');
      
      console.log(`Result: ${isContextual ? '✅ CONTEXTUAL' : '❌ GENERIC'}`);
      if (!isContextual) {
        console.log(`Message: ${result.message.substring(0, 100)}...`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDirectContext();

