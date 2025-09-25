#!/usr/bin/env node

/**
 * Detailed debug script to trace the exact conversation history and context analysis
 */

const AI_SERVICE_URL = 'https://juniper-ai-service.onrender.com';
const AI_API_KEY = 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5';

async function debugDetailedFlow() {
  console.log('🔍 Detailed debugging of context analysis flow...\n');

  try {
    // Step 1: Get initial response
    console.log('📝 Step 1: Getting initial response...');
    const initialResponse = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': AI_API_KEY
      },
      body: JSON.stringify({
        message: 'delete all templates',
        sessionId: 'detailed-debug-test',
        conversationHistory: []
      })
    });

    const initialResult = await initialResponse.json();
    console.log('✅ Initial response received');
    console.log('Message length:', initialResult.message.length);
    console.log('Message preview:', initialResult.message.substring(0, 100) + '...');

    // Step 2: Test with exact conversation history format
    console.log('\n📝 Step 2: Testing with exact conversation history...');
    
    const conversationHistory = [
      {
        role: 'user',
        content: 'delete all templates'
      },
      {
        role: 'assistant', 
        content: initialResult.message
      }
    ];

    console.log('Conversation history structure:');
    console.log('- Length:', conversationHistory.length);
    console.log('- User message:', conversationHistory[0].content);
    console.log('- Assistant message length:', conversationHistory[1].content.length);
    console.log('- Assistant message preview:', conversationHistory[1].content.substring(0, 100) + '...');

    const confirmationResponse = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': AI_API_KEY
      },
      body: JSON.stringify({
        message: 'yes delete all templates',
        sessionId: 'detailed-debug-test',
        conversationHistory: conversationHistory
      })
    });

    const confirmationResult = await confirmationResponse.json();
    console.log('\n✅ Confirmation response received');
    console.log('Message length:', confirmationResult.message.length);
    console.log('Message preview:', confirmationResult.message.substring(0, 150) + '...');

    // Step 3: Check if the response contains expected contextual elements
    const isContextual = confirmationResult.message.includes('Confirmed: Delete ALL templates') ||
                        confirmationResult.message.includes('absolutely sure') ||
                        confirmationResult.message.includes('YES DELETE ALL');

    console.log('\n🎯 Analysis:');
    console.log('- Is contextual response:', isContextual ? '✅ YES' : '❌ NO');
    
    if (!isContextual) {
      console.log('- Falling back to generic response');
      console.log('- This suggests analyzeContextualResponse() is not working');
      
      // Check what the generic response is about
      if (confirmationResult.message.includes('campaign')) {
        console.log('- Generic response is about campaigns (wrong context)');
      } else if (confirmationResult.message.includes('template')) {
        console.log('- Generic response is about templates (partial context)');
      } else {
        console.log('- Generic response is completely unrelated');
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugDetailedFlow();
