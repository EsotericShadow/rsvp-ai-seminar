#!/usr/bin/env node

/**
 * RAG System Validation Test
 * Tests the RAG system's knowledge and response quality
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://juniper-ai-service.onrender.com';
const AI_API_KEY = process.env.AI_SERVICE_API_KEY || 'test-key';

class RAGSystemTester {
  constructor() {
    this.testResults = [];
  }

  async runRAGTests() {
    console.log('🧠 Starting RAG System Validation Tests\n');
    
    try {
      // Test 1: Template Structure Knowledge
      await this.testTemplateStructureKnowledge();
      
      // Test 2: Campaign Management Knowledge
      await this.testCampaignManagementKnowledge();
      
      // Test 3: Audience Management Knowledge
      await this.testAudienceManagementKnowledge();
      
      // Test 4: Business Context Knowledge
      await this.testBusinessContextKnowledge();
      
      // Test 5: System Capabilities Knowledge
      await this.testSystemCapabilitiesKnowledge();
      
      // Print Results
      this.printResults();
      
    } catch (error) {
      console.error('❌ RAG test suite failed:', error);
    }
  }

  async testTemplateStructureKnowledge() {
    console.log('📧 Testing Template Structure Knowledge...');
    
    const tests = [
      {
        query: 'What template variables are available?',
        expectedKeywords: ['businessName', 'invite_link', 'greeting_title', 'signature_name', 'main_content']
      },
      {
        query: 'How do I create an email template?',
        expectedKeywords: ['name', 'subject', 'htmlBody', 'textBody', 'required']
      },
      {
        query: 'What are the template fields?',
        expectedKeywords: ['greeting_title', 'greeting_message', 'signature_name', 'main_content_title']
      }
    ];

    for (const test of tests) {
      await this.testKnowledgeQuery('Template Structure', test.query, test.expectedKeywords);
    }
  }

  async testCampaignManagementKnowledge() {
    console.log('📢 Testing Campaign Management Knowledge...');
    
    const tests = [
      {
        query: 'How do I create a campaign?',
        expectedKeywords: ['campaign name', 'target audience', 'email template', 'scheduling']
      },
      {
        query: 'What campaign statuses are available?',
        expectedKeywords: ['DRAFT', 'SCHEDULED', 'PAUSED', 'COMPLETED', 'CANCELLED']
      },
      {
        query: 'What campaign options are available?',
        expectedKeywords: ['smart send windows', 'rate limiting', 'multiple steps', 'performance tracking']
      }
    ];

    for (const test of tests) {
      await this.testKnowledgeQuery('Campaign Management', test.query, test.expectedKeywords);
    }
  }

  async testAudienceManagementKnowledge() {
    console.log('👥 Testing Audience Management Knowledge...');
    
    const tests = [
      {
        query: 'How do I create an audience group?',
        expectedKeywords: ['group name', 'description', 'criteria', 'segmentation']
      },
      {
        query: 'What audience features are available?',
        expectedKeywords: ['industry-based', 'geographic', 'behavioral', 'import', 'validation']
      },
      {
        query: 'How do I manage audience members?',
        expectedKeywords: ['add members', 'bulk import', 'email validation', 'unsubscribe']
      }
    ];

    for (const test of tests) {
      await this.testKnowledgeQuery('Audience Management', test.query, test.expectedKeywords);
    }
  }

  async testBusinessContextKnowledge() {
    console.log('🏢 Testing Business Context Knowledge...');
    
    const tests = [
      {
        query: 'What is Evergreen Web Solutions?',
        expectedKeywords: ['Gabe Lacroix', 'Terrace', 'web development', 'AI integration']
      },
      {
        query: 'What is the AI in Terrace event?',
        expectedKeywords: ['business seminar', 'AI opportunities', 'needs assessment', 'local businesses']
      },
      {
        query: 'What services does Evergreen offer?',
        expectedKeywords: ['web development', 'digital marketing', 'AI integration', 'custom software']
      }
    ];

    for (const test of tests) {
      await this.testKnowledgeQuery('Business Context', test.query, test.expectedKeywords);
    }
  }

  async testSystemCapabilitiesKnowledge() {
    console.log('⚙️ Testing System Capabilities Knowledge...');
    
    const tests = [
      {
        query: 'What can the RSVP system do?',
        expectedKeywords: ['campaign management', 'template creation', 'audience segmentation', 'analytics']
      },
      {
        query: 'What automation features are available?',
        expectedKeywords: ['workflow automation', 'trigger-based', 'automated follow-ups', 'smart segmentation']
      },
      {
        query: 'What analytics are available?',
        expectedKeywords: ['open rates', 'click rates', 'RSVP rates', 'performance tracking']
      }
    ];

    for (const test of tests) {
      await this.testKnowledgeQuery('System Capabilities', test.query, test.expectedKeywords);
    }
  }

  async testKnowledgeQuery(category, query, expectedKeywords) {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-API-Key': AI_API_KEY
        },
        body: JSON.stringify({
          message: query,
          sessionId: 'rag-test-session',
          conversationHistory: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.message.toLowerCase();
        
        const foundKeywords = expectedKeywords.filter(keyword => 
          content.includes(keyword.toLowerCase())
        );
        
        const percentage = Math.round((foundKeywords.length / expectedKeywords.length) * 100);
        
        if (percentage >= 60) {
          this.addResult(`${category}: ${query}`, true, `Found ${foundKeywords.length}/${expectedKeywords.length} keywords (${percentage}%)`);
        } else {
          this.addResult(`${category}: ${query}`, false, `Only found ${foundKeywords.length}/${expectedKeywords.length} keywords (${percentage}%)`);
        }
        
        // Log the response for debugging
        console.log(`    Response: ${data.message.substring(0, 100)}...`);
        
      } else {
        this.addResult(`${category}: ${query}`, false, `HTTP ${response.status}`);
      }
    } catch (error) {
      this.addResult(`${category}: ${query}`, false, `Error: ${error.message}`);
    }
  }

  addResult(test, success, message) {
    this.testResults.push({ test, success, message });
    const status = success ? '✅' : '❌';
    console.log(`  ${status} ${test}: ${message}`);
  }

  printResults() {
    console.log('\n📊 RAG System Test Results:');
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
    
    if (percentage >= 70) {
      console.log('\n🎉 RAG System Tests: PASSED');
    } else {
      console.log('\n⚠️ RAG System Tests: NEEDS IMPROVEMENT');
    }
  }
}

// Run the tests
async function main() {
  const tester = new RAGSystemTester();
  await tester.runRAGTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RAGSystemTester };

