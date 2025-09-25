#!/usr/bin/env node

/**
 * Test script to verify the context analysis logic locally
 */

// Simulate the context analysis logic from the AI service
function analyzeContextualResponse(message, conversationHistory) {
  console.log('🚀 CONTEXT ANALYSIS CALLED - LOCAL TEST');
  if (conversationHistory.length < 1) {
    console.log('🔍 Context analysis: No conversation history');
    return null;
  }
  
  console.log('🔍 Context analysis debug:', {
    message,
    historyLength: conversationHistory.length,
    lastAssistantMessage: conversationHistory[conversationHistory.length - 1]?.content?.substring(0, 100)
  });
  
  const messageLower = message.toLowerCase().trim();
  
  // Get conversation context
  const recentMessages = conversationHistory.slice(-8);
  const assistantMessages = recentMessages.filter(msg => msg.role === 'assistant');
  const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
  
  if (!lastAssistantMessage) {
    console.log('🔍 Context analysis: No assistant message found in recent history');
    return null;
  }
  
  const assistantContent = lastAssistantMessage.content.toLowerCase();
  console.log('🔍 Assistant content preview:', assistantContent.substring(0, 100) + '...');
  
  // Test the pattern matching
  const isTemplateDeletionConfirmation = (assistantContent.includes('which templates would you like to delete') || 
                                          assistantContent.includes('delete templates')) &&
                                         (messageLower.includes('all') || messageLower === 'all templates' ||
                                          messageLower.includes('yes delete all') || messageLower.includes('confirm'));
  
  console.log('🎯 Template deletion confirmation pattern match:', isTemplateDeletionConfirmation);
  
  if (isTemplateDeletionConfirmation) {
    console.log('✅ Pattern matched! Should return contextual response');
    return {
      message: "✅ **Confirmed: Delete ALL templates**\n\n⚠️ **This will permanently delete ALL templates.**\n\nBefore proceeding, I need to check:\n\n1. **Template usage** - Which templates are used in active campaigns\n2. **List all templates** - Show you what will be deleted\n3. **Confirm deletion** - Get your final confirmation\n\n⚠️ **Warning**: Deleting templates used in campaigns may break those campaigns.\n\nAre you absolutely sure you want to delete ALL templates? Type 'YES DELETE ALL' to confirm.",
      confidence: 0.95,
      actions: [{
        type: 'delete_all_templates',
        data: { confirmation: 'pending' }
      }],
      nextSteps: ['Check template usage', 'List templates', 'Confirm deletion']
    };
  }
  
  console.log('❌ No pattern matched, returning null');
  return null;
}

// Test the logic
function testContextLogic() {
  console.log('🧪 Testing context analysis logic locally...\n');

  const conversationHistory = [
    {
      role: 'user',
      content: 'delete all templates'
    },
    {
      role: 'assistant',
      content: `I can help you delete templates! However, I need to clarify what you'd like to delete:

• **All templates** - Remove all existing templates
• **Specific template** - Delete a particular template by name
• **Unused templates** - Remove templates that aren't used in any campaigns

⚠️ **Warning**: Deleting templates will permanently remove them. Make sure they're not being used in active campaigns.

Which templates would you like to delete?`
    }
  ];

  const testMessages = [
    'yes delete all templates',
    'all templates',
    'yes delete all',
    'confirm delete all templates'
  ];

  testMessages.forEach(message => {
    console.log(`\n🧪 Testing message: "${message}"`);
    const result = analyzeContextualResponse(message, conversationHistory);
    
    if (result) {
      console.log('✅ SUCCESS: Contextual response generated');
      console.log('Message preview:', result.message.substring(0, 100) + '...');
    } else {
      console.log('❌ FAILED: No contextual response');
    }
  });
}

testContextLogic();

