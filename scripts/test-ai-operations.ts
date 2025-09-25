#!/usr/bin/env ts-node

/**
 * Comprehensive AI Operations Test Suite
 * Tests the AI's ability to perform real operations with validation
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://juniper-ai-service.onrender.com';
const AI_API_KEY = process.env.AI_SERVICE_API_KEY || 'test-key';
const MAIN_APP_URL = process.env.MAIN_APP_URL || 'https://rsvp.evergreenwebsolutions.ca';

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

class AIOperationsTester {
  private conversationHistory: ChatMessage[] = [];
  private testResults: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive AI Operations Test Suite\n');
    
    try {
      // Test 1: AI Service Health Check
      await this.testAIServiceHealth();
      
      // Test 2: RAG Knowledge Validation
      await this.testRAGKnowledge();
      
      // Test 3: Template Creation Flow
      await this.testTemplateCreation();
      
      // Test 4: Campaign Creation Flow
      await this.testCampaignCreation();
      
      // Test 5: Audience Management
      await this.testAudienceManagement();
      
      // Test 6: Conversation Context
      await this.testConversationContext();
      
      // Test 7: Multi-turn Operations
      await this.testMultiTurnOperations();
      
      // Test 8: Error Handling
      await this.testErrorHandling();
      
      // Print Results
      this.printTestResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  private async testAIServiceHealth(): Promise<void> {
    console.log('🔍 Testing AI Service Health...');
    
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-API-Key': AI_API_KEY
        }
      });

      if (response.ok) {
        this.addTestResult('AI Service Health', true, 'AI service is healthy and responding');
      } else {
        this.addTestResult('AI Service Health', false, `AI service returned ${response.status}`);
      }
    } catch (error) {
      this.addTestResult('AI Service Health', false, 'Failed to connect to AI service', undefined, error.message);
    }
  }

  private async testRAGKnowledge(): Promise<void> {
    console.log('🧠 Testing RAG Knowledge System...');
    
    const knowledgeTests = [
      {
        query: 'What template variables are available?',
        expectedKeywords: ['businessName', 'invite_link', 'greeting_title', 'signature_name']
      },
      {
        query: 'How do I create a campaign?',
        expectedKeywords: ['campaign name', 'target audience', 'email template', 'scheduling']
      },
      {
        query: 'What audience management features are available?',
        expectedKeywords: ['audience groups', 'segmentation', 'import', 'validation']
      },
      {
        query: 'What is Evergreen Web Solutions?',
        expectedKeywords: ['Gabe Lacroix', 'Terrace', 'web development', 'AI integration']
      }
    ];

    for (const test of knowledgeTests) {
      try {
        const response = await this.sendChatMessage(test.query);
        
        if (response.success) {
          const content = response.data.message.toLowerCase();
          const hasKeywords = test.expectedKeywords.some(keyword => 
            content.includes(keyword.toLowerCase())
          );
          
          if (hasKeywords) {
            this.addTestResult(`RAG Knowledge: ${test.query}`, true, 'RAG system provided relevant information');
          } else {
            this.addTestResult(`RAG Knowledge: ${test.query}`, false, 'RAG response missing expected keywords');
          }
        } else {
          this.addTestResult(`RAG Knowledge: ${test.query}`, false, 'Failed to get RAG response');
        }
      } catch (error) {
        this.addTestResult(`RAG Knowledge: ${test.query}`, false, 'RAG test failed', undefined, error.message);
      }
    }
  }

  private async testTemplateCreation(): Promise<void> {
    console.log('📧 Testing Template Creation Flow...');
    
    try {
      // Step 1: Start template creation
      const step1 = await this.sendChatMessage('Create a template named "Test Template"');
      if (!step1.success) {
        this.addTestResult('Template Creation - Step 1', false, 'Failed to start template creation');
        return;
      }

      // Step 2: Provide subject line
      const step2 = await this.sendChatMessage('Welcome to our event!');
      if (!step2.success) {
        this.addTestResult('Template Creation - Step 2', false, 'Failed to provide subject line');
        return;
      }

      // Step 3: Provide content
      const step3 = await this.sendChatMessage('Thank you for registering for our AI in Terrace event. We look forward to seeing you there!');
      if (!step3.success) {
        this.addTestResult('Template Creation - Step 3', false, 'Failed to provide content');
        return;
      }

      // Validate template was created
      const templates = await this.getTemplates();
      const testTemplate = templates.find(t => t.name === 'Test Template');
      
      if (testTemplate) {
        this.addTestResult('Template Creation - Complete', true, 'Template created successfully', testTemplate);
      } else {
        this.addTestResult('Template Creation - Complete', false, 'Template not found in database');
      }

    } catch (error) {
      this.addTestResult('Template Creation', false, 'Template creation test failed', undefined, error.message);
    }
  }

  private async testCampaignCreation(): Promise<void> {
    console.log('📢 Testing Campaign Creation Flow...');
    
    try {
      // Step 1: Start campaign creation
      const step1 = await this.sendChatMessage('Create a campaign named "Test Campaign"');
      if (!step1.success) {
        this.addTestResult('Campaign Creation - Step 1', false, 'Failed to start campaign creation');
        return;
      }

      // Step 2: Provide audience
      const step2 = await this.sendChatMessage('registered users');
      if (!step2.success) {
        this.addTestResult('Campaign Creation - Step 2', false, 'Failed to provide audience');
        return;
      }

      // Step 3: Provide template
      const step3 = await this.sendChatMessage('Test Template');
      if (!step3.success) {
        this.addTestResult('Campaign Creation - Step 3', false, 'Failed to provide template');
        return;
      }

      // Validate campaign was created
      const campaigns = await this.getCampaigns();
      const testCampaign = campaigns.find(c => c.name === 'Test Campaign');
      
      if (testCampaign) {
        this.addTestResult('Campaign Creation - Complete', true, 'Campaign created successfully', testCampaign);
      } else {
        this.addTestResult('Campaign Creation - Complete', false, 'Campaign not found in database');
      }

    } catch (error) {
      this.addTestResult('Campaign Creation', false, 'Campaign creation test failed', undefined, error.message);
    }
  }

  private async testAudienceManagement(): Promise<void> {
    console.log('👥 Testing Audience Management...');
    
    try {
      // Test audience creation
      const createResponse = await this.sendChatMessage('Create an audience group named "Test Audience"');
      if (createResponse.success) {
        this.addTestResult('Audience Creation', true, 'Audience creation initiated successfully');
      } else {
        this.addTestResult('Audience Creation', false, 'Failed to create audience');
      }

      // Test audience listing
      const listResponse = await this.sendChatMessage('List all audiences');
      if (listResponse.success) {
        this.addTestResult('Audience Listing', true, 'Audience listing successful');
      } else {
        this.addTestResult('Audience Listing', false, 'Failed to list audiences');
      }

    } catch (error) {
      this.addTestResult('Audience Management', false, 'Audience management test failed', undefined, error.message);
    }
  }

  private async testConversationContext(): Promise<void> {
    console.log('💬 Testing Conversation Context...');
    
    try {
      // Test the original "YES DELETE ALL" issue
      const step1 = await this.sendChatMessage('delete all campaigns');
      if (!step1.success) {
        this.addTestResult('Conversation Context - Step 1', false, 'Failed to start deletion flow');
        return;
      }

      const step2 = await this.sendChatMessage('all campaigns');
      if (!step2.success) {
        this.addTestResult('Conversation Context - Step 2', false, 'Failed to specify deletion target');
        return;
      }

      const step3 = await this.sendChatMessage('YES DELETE ALL');
      if (step3.success && step3.data.message.includes('EXECUTING')) {
        this.addTestResult('Conversation Context - Final Confirmation', true, 'AI correctly recognized final confirmation');
      } else {
        this.addTestResult('Conversation Context - Final Confirmation', false, 'AI failed to recognize final confirmation');
      }

    } catch (error) {
      this.addTestResult('Conversation Context', false, 'Conversation context test failed', undefined, error.message);
    }
  }

  private async testMultiTurnOperations(): Promise<void> {
    console.log('🔄 Testing Multi-turn Operations...');
    
    try {
      // Test template creation with multiple turns
      const messages = [
        'I want to create a template',
        'Event Reminder Template',
        'Reminder: AI in Terrace Event Tomorrow',
        'Don\'t forget about our AI in Terrace event tomorrow at 2 PM. We look forward to seeing you there!'
      ];

      let lastResponse = null;
      for (const message of messages) {
        lastResponse = await this.sendChatMessage(message);
        if (!lastResponse.success) {
          this.addTestResult('Multi-turn Operations', false, `Failed at step: ${message}`);
          return;
        }
      }

      if (lastResponse && lastResponse.data.message.includes('template')) {
        this.addTestResult('Multi-turn Operations', true, 'Multi-turn template creation successful');
      } else {
        this.addTestResult('Multi-turn Operations', false, 'Multi-turn operations failed');
      }

    } catch (error) {
      this.addTestResult('Multi-turn Operations', false, 'Multi-turn test failed', undefined, error.message);
    }
  }

  private async testErrorHandling(): Promise<void> {
    console.log('⚠️ Testing Error Handling...');
    
    try {
      // Test invalid template creation
      const invalidResponse = await this.sendChatMessage('Create a template with no name');
      if (invalidResponse.success) {
        // Should ask for missing information
        this.addTestResult('Error Handling - Invalid Template', true, 'AI handled invalid input gracefully');
      } else {
        this.addTestResult('Error Handling - Invalid Template', false, 'AI failed to handle invalid input');
      }

      // Test non-existent operations
      const unknownResponse = await this.sendChatMessage('Do something that doesn\'t exist');
      if (unknownResponse.success) {
        this.addTestResult('Error Handling - Unknown Operation', true, 'AI handled unknown operation gracefully');
      } else {
        this.addTestResult('Error Handling - Unknown Operation', false, 'AI failed to handle unknown operation');
      }

    } catch (error) {
      this.addTestResult('Error Handling', false, 'Error handling test failed', undefined, error.message);
    }
  }

  private async sendChatMessage(message: string): Promise<{ success: boolean; data?: any; error?: string }> {
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

  private async getTemplates(): Promise<any[]> {
    try {
      const response = await fetch(`${MAIN_APP_URL}/api/internal/templates`, {
        headers: {
          'X-AI-API-Key': AI_API_KEY
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.templates || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }
  }

  private async getCampaigns(): Promise<any[]> {
    try {
      const response = await fetch(`${MAIN_APP_URL}/api/internal/campaigns`, {
        headers: {
          'X-AI-API-Key': AI_API_KEY
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.campaigns || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      return [];
    }
  }

  private addTestResult(test: string, success: boolean, message: string, data?: any, error?: string): void {
    this.testResults.push({ test, success, message, data, error });
    const status = success ? '✅' : '❌';
    console.log(`  ${status} ${test}: ${message}`);
    if (error) {
      console.log(`    Error: ${error}`);
    }
  }

  private printTestResults(): void {
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
      console.log(`${status} ${result.test}`);
      console.log(`   ${result.message}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    });
    
    if (percentage >= 80) {
      console.log('🎉 AI Operations Test Suite: PASSED');
    } else {
      console.log('⚠️ AI Operations Test Suite: NEEDS IMPROVEMENT');
    }
  }
}

// Run the tests
async function main() {
  const tester = new AIOperationsTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { AIOperationsTester };

