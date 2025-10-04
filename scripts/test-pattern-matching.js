#!/usr/bin/env node

/**
 * Test script to verify the pattern matching logic
 */

function testPatternMatching() {
  console.log('🧪 Testing pattern matching logic...\n');

  // Test data from our debug
  const assistantContent = `I can help you delete templates! However, I need to clarify what you'd like to delete:

• **All templates** - Remove all existing templates
• **Specific template** - Delete a particular template by name
• **Unused templates** - Remove templates that aren't used in any campaigns

⚠️ **Warning**: Deleting templates will permanently remove them. Make sure they're not being used in active campaigns.

Which templates would you like to delete?`;

  const userMessage = 'yes delete all templates';

  // Test the pattern matching logic from the code
  const assistantContentLower = assistantContent.toLowerCase();
  const messageLower = userMessage.toLowerCase();

  console.log('📝 Test data:');
  console.log('Assistant content length:', assistantContent.length);
  console.log('User message:', userMessage);
  console.log();

  // Test individual conditions
  const condition1 = assistantContentLower.includes('which templates would you like to delete');
  const condition2 = assistantContentLower.includes('delete templates');
  const condition3 = messageLower.includes('all');
  const condition4 = messageLower === 'all templates';
  const condition5 = messageLower.includes('yes delete all');
  const condition6 = messageLower.includes('confirm');

  console.log('🔍 Individual conditions:');
  console.log('- Assistant contains "which templates would you like to delete":', condition1);
  console.log('- Assistant contains "delete templates":', condition2);
  console.log('- User message contains "all":', condition3);
  console.log('- User message equals "all templates":', condition4);
  console.log('- User message contains "yes delete all":', condition5);
  console.log('- User message contains "confirm":', condition6);
  console.log();

  // Test the full pattern
  const isTemplateDeletionConfirmation = (condition1 || condition2) &&
                                        (condition3 || condition4 || condition5 || condition6);

  console.log('🎯 Full pattern match:', isTemplateDeletionConfirmation);
  console.log();

  if (isTemplateDeletionConfirmation) {
    console.log('✅ Pattern matching should work!');
    console.log('The issue must be elsewhere in the code flow.');
  } else {
    console.log('❌ Pattern matching is failing!');
    console.log('This explains why the context analysis isn\'t working.');
  }

  // Test with different message variations
  console.log('\n🧪 Testing different message variations:');
  const variations = [
    'all templates',
    'yes delete all',
    'confirm delete all templates',
    'yes delete all templates'
  ];

  variations.forEach(variation => {
    const variationLower = variation.toLowerCase();
    const variationMatch = (condition1 || condition2) &&
                          (variationLower.includes('all') || variationLower === 'all templates' ||
                           variationLower.includes('yes delete all') || variationLower.includes('confirm'));
    console.log(`- "${variation}": ${variationMatch ? '✅' : '❌'}`);
  });
}

testPatternMatching();


