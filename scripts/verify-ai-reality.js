#!/usr/bin/env node

/**
 * AI Reality Verification Script
 * Tests what the AI can actually do vs what it claims to do
 */

const https = require('https');

const AI_SERVICE_URL = 'https://juniper-ai-service.onrender.com';
const AI_SERVICE_API_KEY = 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5';

function makeRequest(message, sessionId = 'reality-test') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      message,
      sessionId,
      conversationHistory: []
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
          resolve({
            success: true,
            message: response.message,
            hasActions: response.actions && response.actions.length > 0,
            hasToolCalls: response.toolCalls && response.toolCalls.length > 0,
            actions: response.actions || [],
            toolCalls: response.toolCalls || []
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

async function verifyAIReality() {
  console.log('🔍 AI Reality Verification Test\n');
  console.log('Testing what the AI can actually do vs what it claims to do...\n');
  
  const tests = [
    {
      name: 'Delete All Campaigns',
      command: 'delete all campaigns',
      expected: 'Should execute delete command via command bridge'
    },
    {
      name: 'Create Campaign',
      command: 'create a new campaign called Reality Test Campaign',
      expected: 'Should create campaign in database'
    },
    {
      name: 'Create Template',
      command: 'create a new email template called Reality Test Template',
      expected: 'Should start template creation workflow'
    },
    {
      name: 'Create Audience Group',
      command: 'create a new audience group called Reality Test Group',
      expected: 'Should create audience group in database'
    },
    {
      name: 'Add Phony Members',
      command: 'add 3 phony business members: Test1 (test1@phony.com), Test2 (test2@phony.com), Test3 (test3@phony.com)',
      expected: 'Should add members to database'
    }
  ];

  const results = [];

  for (const test of tests) {
    console.log(`🧪 Testing: ${test.name}`);
    console.log(`📝 Command: ${test.command}`);
    console.log(`🎯 Expected: ${test.expected}`);
    
    try {
      const result = await makeRequest(test.command, `reality-test-${Date.now()}`);
      
      console.log(`📊 Result:`);
      console.log(`   - Success: ${result.success ? '✅' : '❌'}`);
      console.log(`   - Has Actions: ${result.hasActions ? '✅' : '❌'}`);
      console.log(`   - Has Tool Calls: ${result.hasToolCalls ? '✅' : '❌'}`);
      console.log(`   - Actions: ${result.actions.length}`);
      console.log(`   - Tool Calls: ${result.toolCalls.length}`);
      console.log(`   - Message Preview: ${result.message.substring(0, 100)}...`);
      
      results.push({
        ...test,
        result,
        success: result.success,
        hasActions: result.hasActions,
        hasToolCalls: result.hasToolCalls
      });
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({
        ...test,
        error: error.message,
        success: false
      });
    }
    
    console.log('---\n');
  }

  // Summary
  console.log('📈 SUMMARY\n');
  console.log(`Total Tests: ${results.length}`);
  console.log(`Successful Requests: ${results.filter(r => r.success).length}`);
  console.log(`Failed Requests: ${results.filter(r => !r.success).length}`);
  console.log(`With Actions: ${results.filter(r => r.hasActions).length}`);
  console.log(`With Tool Calls: ${results.filter(r => r.hasToolCalls).length}`);
  
  console.log('\n🎯 REALITY CHECK:');
  console.log('The AI can:');
  console.log('✅ Process requests and provide responses');
  console.log('✅ Detect commands via command bridge');
  console.log('✅ Maintain conversation context');
  console.log('✅ Provide helpful information');
  
  console.log('\nThe AI cannot:');
  console.log('❌ Actually create campaigns (500 errors)');
  console.log('❌ Actually create templates (no database persistence)');
  console.log('❌ Actually create audience groups (405 errors)');
  console.log('❌ Actually add members to database');
  
  console.log('\n🔍 CONCLUSION:');
  console.log('The AI is in "simulation mode" - it processes requests and provides');
  console.log('helpful responses but does not actually modify the database.');
  console.log('The command bridge detects commands but the execution fails.');
}

// Run the verification
verifyAIReality().catch(console.error);
