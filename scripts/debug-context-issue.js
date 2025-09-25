#!/usr/bin/env node

/**
 * Debug script to understand the context loss issue
 */

const AI_SERVICE_URL = 'https://juniper-ai-service.onrender.com';
const AI_API_KEY = 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5';

async function debugContextIssue() {
  console.log('🔍 Debugging context loss issue...\n');

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
        sessionId: 'debug-context-test',
        conversationHistory: []
      })
    });

    const initialResult = await initialResponse.json();
    console.log('📝 Initial assistant message:');
    console.log(initialResult.message);
    console.log('\n' + '='.repeat(80) + '\n');

    // Step 2: Test confirmation with exact message content
    const confirmationResponse = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': AI_API_KEY
      },
      body: JSON.stringify({
        message: 'yes delete all templates',
        sessionId: 'debug-context-test',
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

    const confirmationResult = await confirmationResponse.json();
    console.log('📝 Confirmation response:');
    console.log(confirmationResult.message);
    console.log('\n' + '='.repeat(80) + '\n');

    // Analyze the patterns
    const assistantContent = initialResult.message.toLowerCase();
    const userMessage = 'yes delete all templates';
    
    console.log('🔍 Pattern Analysis:');
    console.log('User message:', userMessage);
    console.log('Assistant content contains "which templates would you like to delete":', assistantContent.includes('which templates would you like to delete'));
    console.log('Assistant content contains "delete templates":', assistantContent.includes('delete templates'));
    console.log('User message contains "all":', userMessage.includes('all'));
    console.log('User message contains "yes delete all":', userMessage.includes('yes delete all'));
    
    // Test the specific patterns from the code
    const isTemplateDeletionConfirmation = (assistantContent.includes('which templates would you like to delete') || 
                                            assistantContent.includes('delete templates')) &&
                                           (userMessage.includes('all') || userMessage === 'all templates' ||
                                            userMessage.includes('yes delete all') || userMessage.includes('confirm'));
    
    console.log('\n🎯 Template deletion confirmation pattern match:', isTemplateDeletionConfirmation);

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugContextIssue();
