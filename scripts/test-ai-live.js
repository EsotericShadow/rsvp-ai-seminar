#!/usr/bin/env node

/**
 * Live AI Test - Tests the AI with real conversations
 * This script demonstrates the AI's capabilities with actual API calls
 */

const fetch = require('node-fetch');

// Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:10000';
const AI_API_KEY = process.env.AI_SERVICE_API_KEY || 'test-key-123';

class LiveAITester {
  constructor() {
    this.conversationHistory = [];
    this.testResults = [];
  }

  async runLiveTests() {
    console.log('🚀 Starting Live AI Tests\n');
    console.log(`AI Service: ${AI_SERVICE_URL}`);
    console.log(`API Key: ${AI_API_KEY ? 'Set' : 'Not set'}\n`);
    
    try {
      // Test 1: Basic Health Check
      await this.testHealth();
      
      // Test 2: Template Knowledge
      await this.testTemplateKnowledge();
      
      // Test 3: Template Creation Flow
      await this.testTemplateCreationFlow();
      
      // Test 4: Campaign Deletion Flow
      await this.testCampaignDeletionFlow();
      
      // Print Results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Live test suite failed:', error);
    }
  }

  async testHealth() {
    console.log('🔍 Testing AI Service Health...');
    
    try {
      const response = await fetch(`${AI_SERVICE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ AI service is healthy');
        console.log(`   Status: ${data.status}`);
        console.log(`   Timestamp: ${data.timestamp}`);
        this.addResult('Health Check', true, 'Service is healthy');
      } else {
        console.log(`❌ Health check failed: ${response.status}`);
        this.addResult('Health Check', false, `HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Health check failed: ${error.message}`);
      this.addResult('Health Check', false, error.message);
    }
  }

  async testTemplateKnowledge() {
    console.log('\n📧 Testing Template Knowledge...');
    
    try {
      const response = await this.sendMessage('What template variables are available?');
      
      if (response.success) {
        const content = response.data.message.toLowerCase();
        const hasVariables = content.includes('businessname') || content.includes('invite_link') || content.includes('greeting');
        
        if (hasVariables) {
          console.log('✅ AI knows about template variables');
          console.log(`   Response length: ${response.data.message.length} characters`);
          console.log(`   Sources: ${response.data.sources ? response.data.sources.length : 0}`);
          this.addResult('Template Knowledge', true, 'AI has comprehensive template knowledge');
        } else {
          console.log('❌ AI response missing template variables');
          this.addResult('Template Knowledge', false, 'Missing template variables');
        }
      } else {
        console.log(`❌ Template knowledge test failed: ${response.error}`);
        this.addResult('Template Knowledge', false, response.error);
      }
    } catch (error) {
      console.log(`❌ Template knowledge test failed: ${error.message}`);
      this.addResult('Template Knowledge', false, error.message);
    }
  }

  async testTemplateCreationFlow() {
    console.log('\n🔄 Testing Template Creation Flow...');
    
    try {
      // Step 1: Start template creation
      console.log('   Step 1: Starting template creation...');
      const step1 = await this.sendMessage('Create a template named "Live Test Template"');
      
      if (!step1.success) {
        this.addResult('Template Creation', false, 'Failed to start template creation');
        return;
      }
      
      console.log('   ✅ Template creation started');
      console.log(`   Response: ${step1.data.message.substring(0, 100)}...`);
      
      // Step 2: Provide subject
      console.log('   Step 2: Providing subject line...');
      const step2 = await this.sendMessage('Live Test Subject');
      
      if (!step2.success) {
        this.addResult('Template Creation', false, 'Failed to provide subject');
        return;
      }
      
      console.log('   ✅ Subject line accepted');
      console.log(`   Response: ${step2.data.message.substring(0, 100)}...`);
      
      // Step 3: Provide content
      console.log('   Step 3: Providing content...');
      const step3 = await this.sendMessage('This is a test template created during live testing.');
      
      if (step3.success && step3.data.message.includes('template')) {
        console.log('   ✅ Template creation completed');
        console.log(`   Response: ${step3.data.message.substring(0, 100)}...`);
        console.log(`   Actions: ${step3.data.actions ? step3.data.actions.length : 0}`);
        this.addResult('Template Creation', true, 'Template creation flow completed successfully');
      } else {
        console.log('   ❌ Template creation failed');
        this.addResult('Template Creation', false, 'Template creation flow failed');
      }
    } catch (error) {
      console.log(`❌ Template creation test failed: ${error.message}`);
      this.addResult('Template Creation', false, error.message);
    }
  }

  async testCampaignDeletionFlow() {
    console.log('\n🗑️ Testing Campaign Deletion Flow...');
    
    try {
      // Step 1: Start deletion
      console.log('   Step 1: Starting campaign deletion...');
      const step1 = await this.sendMessage('delete all campaigns');
      
      if (!step1.success) {
        this.addResult('Campaign Deletion', false, 'Failed to start deletion');
        return;
      }
      
      console.log('   ✅ Deletion started');
      console.log(`   Response: ${step1.data.message.substring(0, 100)}...`);
      
      // Step 2: Specify target
      console.log('   Step 2: Specifying deletion target...');
      const step2 = await this.sendMessage('all campaigns');
      
      if (!step2.success) {
        this.addResult('Campaign Deletion', false, 'Failed to specify target');
        return;
      }
      
      console.log('   ✅ Target specified');
      console.log(`   Response: ${step2.data.message.substring(0, 100)}...`);
      
      // Step 3: Final confirmation
      console.log('   Step 3: Final confirmation...');
      const step3 = await this.sendMessage('YES DELETE ALL');
      
      if (step3.success && step3.data.message.includes('EXECUTING')) {
        console.log('   ✅ Final confirmation recognized');
        this.addResult('Campaign Deletion', true, 'Final confirmation recognized');
      } else {
        console.log('   ⚠️ Final confirmation not recognized');
        console.log(`   Response: ${step3.data.message.substring(0, 100)}...`);
        this.addResult('Campaign Deletion', false, 'Final confirmation not recognized');
      }
    } catch (error) {
      console.log(`❌ Campaign deletion test failed: ${error.message}`);
      this.addResult('Campaign Deletion', false, error.message);
    }
  }

  async sendMessage(message) {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-API-Key': AI_API_KEY
        },
        body: JSON.stringify({
          message: message,
          sessionId: 'live-test-session',
          conversationHistory: this.conversationHistory
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update conversation history
        this.conversationHistory.push({ role: 'user', content: message, timestamp: Date.now() });
        this.conversationHistory.push({ role: 'assistant', content: data.message, timestamp: Date.now() });
        
        return { success: true, data };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  addResult(test, success, message) {
    this.testResults.push({ test, success, message });
  }

  printResults() {
    console.log('\n📊 Live Test Results:');
    console.log('=' .repeat(50));
    
    const passed = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;
    const percentage = Math.round((passed / total) * 100);
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Success Rate: ${percentage}%`);
    
    console.log('\n📋 Detailed Results:');
    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.message}`);
    });
    
    if (percentage >= 80) {
      console.log('\n🎉 Live AI Tests: PASSED');
    } else {
      console.log('\n⚠️ Live AI Tests: NEEDS IMPROVEMENT');
    }
    
    console.log('\n💡 To run these tests:');
    console.log('   npm run test-ai-live');
    console.log('   or');
    console.log('   node scripts/test-ai-live.js');
  }
}

// Run the tests
async function main() {
  const tester = new LiveAITester();
  await tester.runLiveTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { LiveAITester };
