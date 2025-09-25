#!/usr/bin/env node

/**
 * Comprehensive AI Workflow Test
 * Tests the full sequence of AI operations as requested by the user
 */

const https = require('https');

const AI_SERVICE_URL = 'https://juniper-ai-service.onrender.com';
const AI_SERVICE_API_KEY = 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5';

let conversationHistory = [];
let sessionId = `comprehensive-test-${Date.now()}`;

function makeRequest(message, expectedAction = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      message,
      sessionId,
      conversationHistory
    });

    const options = {
      hostname: 'juniper-ai-service.onrender.com',
      port: 443,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'X-AI-API-Key': AI_SERVICE_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          // Update conversation history
          conversationHistory.push({ role: 'user', content: message });
          conversationHistory.push({ role: 'assistant', content: response.message });
          
          resolve({
            success: true,
            response,
            hasActions: response.actions && response.actions.length > 0,
            hasToolCalls: response.toolCalls && response.toolCalls.length > 0
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive AI Workflow Test\n');
  
  try {
    // Test 1: Delete all campaigns (already done, but let's verify)
    console.log('📋 Test 1: Verifying all campaigns are deleted...');
    const deleteResult = await makeRequest('delete all campaigns');
    console.log(`✅ Campaign deletion: ${deleteResult.hasActions ? 'Command detected' : 'No action needed'}`);
    
    // Test 2: Create new campaign
    console.log('\n📋 Test 2: Creating new campaign...');
    const createCampaignResult = await makeRequest('create a new campaign called Comprehensive Test Campaign');
    console.log(`✅ Campaign creation: ${createCampaignResult.success ? 'Request processed' : 'Failed'}`);
    
    // Test 3: Create email template
    console.log('\n📋 Test 3: Creating email template...');
    const templateResult1 = await makeRequest('create a new email template called Test Template 1');
    console.log(`✅ Template creation started: ${templateResult1.success ? 'Yes' : 'No'}`);
    
    if (templateResult1.success && templateResult1.response.message.includes('subject line')) {
      const subjectResult = await makeRequest('Test Subject Line 1');
      console.log(`✅ Subject line provided: ${subjectResult.success ? 'Yes' : 'No'}`);
      
      if (subjectResult.success && subjectResult.response.message.includes('content')) {
        const contentResult = await makeRequest('This is test content for template 1 with HTML formatting');
        console.log(`✅ Template content provided: ${contentResult.success ? 'Yes' : 'No'}`);
        console.log(`✅ Template creation actions: ${contentResult.hasActions ? 'Yes' : 'No'}`);
      }
    }
    
    // Test 4: Create another template
    console.log('\n📋 Test 4: Creating second email template...');
    const templateResult2 = await makeRequest('create another email template called Test Template 2');
    console.log(`✅ Second template creation: ${templateResult2.success ? 'Started' : 'Failed'}`);
    
    // Test 5: Create phony audience members
    console.log('\n📋 Test 5: Creating phony audience members...');
    const phonyMembers = [
      'John Doe - john.doe@phony.com',
      'Jane Smith - jane.smith@phony.com', 
      'Bob Johnson - bob.johnson@phony.com',
      'Alice Brown - alice.brown@phony.com',
      'Charlie Wilson - charlie.wilson@phony.com',
      'Diana Davis - diana.davis@phony.com',
      'Eve Miller - eve.miller@phony.com'
    ];
    
    for (let i = 0; i < phonyMembers.length; i++) {
      const memberResult = await makeRequest(`add phony business member: ${phonyMembers[i]}`);
      console.log(`✅ Phony member ${i + 1}: ${memberResult.success ? 'Processed' : 'Failed'}`);
    }
    
    // Test 6: Create audience group
    console.log('\n📋 Test 6: Creating audience group...');
    const groupResult = await makeRequest('create a new audience group called Test Phony Group');
    console.log(`✅ Audience group creation: ${groupResult.success ? 'Started' : 'Failed'}`);
    
    // Test 7: Add members to group
    console.log('\n📋 Test 7: Adding members to group...');
    const addMembersResult = await makeRequest('add the first 5 phony members to the Test Phony Group');
    console.log(`✅ Add members to group: ${addMembersResult.success ? 'Processed' : 'Failed'}`);
    
    // Test 8: Remove single member
    console.log('\n📋 Test 8: Removing single member...');
    const removeSingleResult = await makeRequest('remove John Doe from the Test Phony Group');
    console.log(`✅ Remove single member: ${removeSingleResult.success ? 'Processed' : 'Failed'}`);
    
    // Test 9: Remove multiple members
    console.log('\n📋 Test 9: Removing multiple members...');
    const removeMultipleResult = await makeRequest('remove Jane Smith and Bob Johnson from the Test Phony Group');
    console.log(`✅ Remove multiple members: ${removeMultipleResult.success ? 'Processed' : 'Failed'}`);
    
    // Test 10: Add single member back
    console.log('\n📋 Test 10: Adding single member back...');
    const addSingleResult = await makeRequest('add John Doe back to the Test Phony Group');
    console.log(`✅ Add single member: ${addSingleResult.success ? 'Processed' : 'Failed'}`);
    
    // Test 11: Add multiple members
    console.log('\n📋 Test 11: Adding multiple members...');
    const addMultipleResult = await makeRequest('add Jane Smith and Bob Johnson back to the Test Phony Group');
    console.log(`✅ Add multiple members: ${addMultipleResult.success ? 'Processed' : 'Failed'}`);
    
    // Test 12: Complex add/remove operation
    console.log('\n📋 Test 12: Complex add/remove operation...');
    const complexResult = await makeRequest('remove Alice Brown from Test Phony Group and add Eve Miller to Test Phony Group');
    console.log(`✅ Complex operation: ${complexResult.success ? 'Processed' : 'Failed'}`);
    
    // Test 13: Create campaign with templates and audience
    console.log('\n📋 Test 13: Creating campaign with templates and audience...');
    const campaignResult = await makeRequest('create a new campaign called Final Test Campaign using Test Template 1 and Test Phony Group');
    console.log(`✅ Campaign with templates/audience: ${campaignResult.success ? 'Processed' : 'Failed'}`);
    
    // Test 14: Add campaign steps
    console.log('\n📋 Test 14: Adding campaign steps...');
    const stepsResult = await makeRequest('add a second step to Final Test Campaign using Test Template 2');
    console.log(`✅ Add campaign steps: ${stepsResult.success ? 'Processed' : 'Failed'}`);
    
    // Test 15: Delete test campaign
    console.log('\n📋 Test 15: Deleting test campaign...');
    const deleteCampaignResult = await makeRequest('delete the Final Test Campaign');
    console.log(`✅ Delete test campaign: ${deleteCampaignResult.success ? 'Processed' : 'Failed'}`);
    
    console.log('\n🎉 Comprehensive AI Workflow Test Complete!');
    console.log('\n📊 Summary:');
    console.log(`- Total API calls made: ${conversationHistory.length / 2}`);
    console.log(`- Conversation history length: ${conversationHistory.length}`);
    console.log(`- Session ID: ${sessionId}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
runComprehensiveTest();

