#!/usr/bin/env node

/**
 * Core AI Functionality Test
 * Tests the essential AI operations with real API calls
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://juniper-ai-service.onrender.com';
const AI_API_KEY = process.env.AI_SERVICE_API_KEY || 'test-key';
const MAIN_APP_URL = process.env.MAIN_APP_URL || 'https://rsvp.evergreenwebsolutions.ca';

class CoreAITester {
  constructor() {
    this.conversationHistory = [];
    this.testResults = [];
  }

  async runCoreTests() {
    console.log('🚀 Starting Core AI Functionality Tests\n');
    
    try {
      // Test 1: AI Service Connection
      await this.testAIConnection();
      
      // Test 2: Template Knowledge
      await this.testTemplateKnowledge();
      
      // Test 3: Campaign Knowledge
      await this.testCampaignKnowledge();
      
      // Test 4: Conversation Context (Original Issue)
      await this.testConversationContext();
      
      // Test 5: Template Creation Flow
      await this.testTemplateCreationFlow();
      
      // Print Results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testAIConnection() {
    console.log('🔍 Testing AI Service Connection...');
    
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-API-Key': AI_API_KEY
        }
      });

      if (response.ok) {
        this.addResult('AI Connection', true, 'AI service is responding');
      } else {
        this.addResult('AI Connection', false, `AI service returned ${response.status}`);
      }
    } catch (error) {
      this.addResult('AI Connection', false, `Connection failed: ${error.message}`);
    }
  }

  async testTemplateKnowledge() {
    console.log('📧 Testing Template Knowledge...');
    
    try {
      const response = await this.sendMessage('What template variables are available?');
      
      if (response.success) {
        const content = response.data.message.toLowerCase();
        const hasVariables = content.includes('businessname') || content.includes('invite_link') || content.includes('greeting');
        
        if (hasVariables) {
          this.addResult('Template Knowledge', true, 'AI knows about template variables');
        } else {
          this.addResult('Template Knowledge', false, 'AI response missing template variables');
        }
      } else {
        this.addResult('Template Knowledge', false, 'Failed to get template knowledge');
      }
    } catch (error) {
      this.addResult('Template Knowledge', false, `Template knowledge test failed: ${error.message}`);
    }
  }

  async testCampaignKnowledge() {
    console.log('📢 Testing Campaign Knowledge...');
    
    try {
      const response = await this.sendMessage('How do I create a campaign?');
      
      if (response.success) {
        const content = response.data.message.toLowerCase();
        const hasCampaignInfo = content.includes('campaign name') || content.includes('audience') || content.includes('template');
        
        if (hasCampaignInfo) {
          this.addResult('Campaign Knowledge', true, 'AI knows about campaign creation');
        } else {
          this.addResult('Campaign Knowledge', false, 'AI response missing campaign info');
        }
      } else {
        this.addResult('Campaign Knowledge', false, 'Failed to get campaign knowledge');
      }
    } catch (error) {
      this.addResult('Campaign Knowledge', false, `Campaign knowledge test failed: ${error.message}`);
    }
  }

  async testConversationContext() {
    console.log('💬 Testing Conversation Context (Original Issue)...');
    
    try {
      // Step 1: Start deletion flow
      const step1 = await this.sendMessage('delete all campaigns');
      if (!step1.success) {
        this.addResult('Conversation Context', false, 'Failed to start deletion flow');
        return;
      }

      // Step 2: Specify target
      const step2 = await this.sendMessage('all campaigns');
      if (!step2.success) {
        this.addResult('Conversation Context', false, 'Failed to specify deletion target');
        return;
      }

      // Step 3: Final confirmation (the original issue)
      const step3 = await this.sendMessage('YES DELETE ALL');
      if (step3.success && step3.data.message.includes('EXECUTING')) {
        this.addResult('Conversation Context', true, 'AI correctly recognized final confirmation');
      } else {
        this.addResult('Conversation Context', false, 'AI failed to recognize final confirmation');
        console.log('    Response:', step3.data?.message?.substring(0, 100) + '...');
      }
    } catch (error) {
      this.addResult('Conversation Context', false, `Conversation context test failed: ${error.message}`);
    }
  }

  async testTemplateCreationFlow() {
    console.log('🔄 Testing Template Creation Flow...');
    
    try {
      // Step 1: Start template creation
      const step1 = await this.sendMessage('Create a template named "Test Template"');
      if (!step1.success) {
        this.addResult('Template Creation', false, 'Failed to start template creation');
        return;
      }

      // Step 2: Provide subject
      const step2 = await this.sendMessage('Test Subject');
      if (!step2.success) {
        this.addResult('Template Creation', false, 'Failed to provide subject');
        return;
      }

      // Step 3: Provide content
      const step3 = await this.sendMessage('This is test content for the template');
      if (step3.success && step3.data.message.includes('template')) {
        this.addResult('Template Creation', true, 'Template creation flow completed');
      } else {
        this.addResult('Template Creation', false, 'Template creation flow failed');
      }
    } catch (error) {
      this.addResult('Template Creation', false, `Template creation test failed: ${error.message}`);
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
          sessionId: 'test-session',
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
    const status = success ? '✅' : '❌';
    console.log(`  ${status} ${test}: ${message}`);
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
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
      console.log('\n🎉 Core AI Tests: PASSED');
    } else {
      console.log('\n⚠️ Core AI Tests: NEEDS IMPROVEMENT');
    }
  }
}

// Run the tests
async function main() {
  const tester = new CoreAITester();
  await tester.runCoreTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CoreAITester };
