#!/usr/bin/env node

/**
 * Real AI Operations Test
 * Tests actual database operations with verification
 */

const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

// Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:10000';
const AI_API_KEY = process.env.AI_SERVICE_API_KEY || 'test-key-123';
const MAIN_APP_URL = process.env.MAIN_APP_URL || 'https://rsvp.evergreenwebsolutions.ca';

const prisma = new PrismaClient();

class RealOperationsTester {
  constructor() {
    this.conversationHistory = [];
    this.testResults = [];
    this.initialCounts = {};
  }

  async runRealOperationsTests() {
    console.log('🚀 Starting Real AI Operations Test\n');
    console.log(`AI Service: ${AI_SERVICE_URL}`);
    console.log(`API Key: ${AI_API_KEY ? 'Set' : 'Not set'}\n`);
    
    try {
      // Get initial counts
      await this.getInitialCounts();
      
      // Test 1: Actually delete all campaigns
      await this.testRealCampaignDeletion();
      
      // Test 2: Create a real template
      await this.testRealTemplateCreation();
      
      // Test 3: Create a real audience group
      await this.testRealAudienceCreation();
      
      // Test 4: Create a real campaign
      await this.testRealCampaignCreation();
      
      // Test 5: Clean up test data
      await this.testCleanup();
      
      // Print Results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Real operations test failed:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  async getInitialCounts() {
    console.log('📊 Getting initial database counts...');
    
    this.initialCounts = {
      campaigns: await prisma.campaign.count(),
      templates: await prisma.campaignTemplate.count(),
      audienceGroups: await prisma.audienceGroup.count(),
      audienceMembers: await prisma.audienceMember.count()
    };
    
    console.log(`Initial counts:`);
    console.log(`  Campaigns: ${this.initialCounts.campaigns}`);
    console.log(`  Templates: ${this.initialCounts.templates}`);
    console.log(`  Audience Groups: ${this.initialCounts.audienceGroups}`);
    console.log(`  Audience Members: ${this.initialCounts.audienceMembers}\n`);
  }

  async testRealCampaignDeletion() {
    console.log('🗑️ Testing Real Campaign Deletion...');
    
    try {
      // Step 1: Start deletion
      const step1 = await this.sendMessage('delete all campaigns');
      if (!step1.success) {
        this.addResult('Real Campaign Deletion - Start', false, 'Failed to start deletion');
        return;
      }
      
      // Step 2: Specify target
      const step2 = await this.sendMessage('all campaigns');
      if (!step2.success) {
        this.addResult('Real Campaign Deletion - Target', false, 'Failed to specify target');
        return;
      }
      
      // Step 3: Final confirmation
      const step3 = await this.sendMessage('YES DELETE ALL');
      if (!step3.success) {
        this.addResult('Real Campaign Deletion - Confirmation', false, 'Failed to confirm deletion');
        return;
      }
      
      // Wait a moment for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if campaigns were actually deleted
      const currentCount = await prisma.campaign.count();
      if (currentCount === 0) {
        this.addResult('Real Campaign Deletion - Complete', true, `All ${this.initialCounts.campaigns} campaigns deleted successfully`);
      } else {
        this.addResult('Real Campaign Deletion - Complete', false, `Only ${this.initialCounts.campaigns - currentCount} of ${this.initialCounts.campaigns} campaigns deleted`);
      }
      
    } catch (error) {
      this.addResult('Real Campaign Deletion', false, error.message);
    }
  }

  async testRealTemplateCreation() {
    console.log('\n📧 Testing Real Template Creation...');
    
    try {
      const step1 = await this.sendMessage('Create a template named "Real Test Template"');
      if (!step1.success) {
        this.addResult('Real Template Creation - Start', false, 'Failed to start template creation');
        return;
      }
      
      const step2 = await this.sendMessage('Real Test Subject');
      if (!step2.success) {
        this.addResult('Real Template Creation - Subject', false, 'Failed to provide subject');
        return;
      }
      
      const step3 = await this.sendMessage('This is a real test template created by the AI.');
      if (!step3.success) {
        this.addResult('Real Template Creation - Content', false, 'Failed to provide content');
        return;
      }
      
      // Wait a moment for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if template was actually created
      const currentCount = await prisma.campaignTemplate.count();
      if (currentCount > this.initialCounts.templates) {
        this.addResult('Real Template Creation - Complete', true, 'Template created successfully');
      } else {
        this.addResult('Real Template Creation - Complete', false, 'Template not found in database');
      }
      
    } catch (error) {
      this.addResult('Real Template Creation', false, error.message);
    }
  }

  async testRealAudienceCreation() {
    console.log('\n👥 Testing Real Audience Creation...');
    
    try {
      // Create a test audience member first
      const member = await prisma.audienceMember.create({
        data: {
          businessName: 'Test Business',
          primaryEmail: 'test@example.com',
          inviteToken: 'test-token-123'
        }
      });
      
      const step1 = await this.sendMessage('Create an audience group named "Real Test Audience"');
      if (!step1.success) {
        this.addResult('Real Audience Creation - Start', false, 'Failed to start audience creation');
        return;
      }
      
      const step2 = await this.sendMessage('Add test@example.com to this group');
      if (!step2.success) {
        this.addResult('Real Audience Creation - Member', false, 'Failed to add member');
        return;
      }
      
      // Wait a moment for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if audience group was actually created
      const currentCount = await prisma.audienceGroup.count();
      if (currentCount > this.initialCounts.audienceGroups) {
        this.addResult('Real Audience Creation - Complete', true, 'Audience group created successfully');
      } else {
        this.addResult('Real Audience Creation - Complete', false, 'Audience group not found in database');
      }
      
    } catch (error) {
      this.addResult('Real Audience Creation', false, error.message);
    }
  }

  async testRealCampaignCreation() {
    console.log('\n📢 Testing Real Campaign Creation...');
    
    try {
      const step1 = await this.sendMessage('Create a campaign named "Real Test Campaign"');
      if (!step1.success) {
        this.addResult('Real Campaign Creation - Start', false, 'Failed to start campaign creation');
        return;
      }
      
      const step2 = await this.sendMessage('Use the Real Test Audience');
      if (!step2.success) {
        this.addResult('Real Campaign Creation - Audience', false, 'Failed to specify audience');
        return;
      }
      
      const step3 = await this.sendMessage('Use the Real Test Template');
      if (!step3.success) {
        this.addResult('Real Campaign Creation - Template', false, 'Failed to specify template');
        return;
      }
      
      const step4 = await this.sendMessage('Send immediately');
      if (!step4.success) {
        this.addResult('Real Campaign Creation - Schedule', false, 'Failed to specify schedule');
        return;
      }
      
      // Wait a moment for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if campaign was actually created
      const currentCount = await prisma.campaign.count();
      if (currentCount > 0) {
        this.addResult('Real Campaign Creation - Complete', true, 'Campaign created successfully');
      } else {
        this.addResult('Real Campaign Creation - Complete', false, 'Campaign not found in database');
      }
      
    } catch (error) {
      this.addResult('Real Campaign Creation', false, error.message);
    }
  }

  async testCleanup() {
    console.log('\n🧹 Testing Cleanup...');
    
    try {
      // Delete test campaign
      const step1 = await this.sendMessage('Delete the campaign "Real Test Campaign"');
      if (step1.success) {
        this.addResult('Cleanup - Campaign', true, 'Test campaign deletion initiated');
      } else {
        this.addResult('Cleanup - Campaign', false, 'Test campaign deletion failed');
      }
      
      // Delete test audience group
      const step2 = await this.sendMessage('Delete the audience group "Real Test Audience"');
      if (step2.success) {
        this.addResult('Cleanup - Audience', true, 'Test audience group deletion initiated');
      } else {
        this.addResult('Cleanup - Audience', false, 'Test audience group deletion failed');
      }
      
      // Delete test template
      const step3 = await this.sendMessage('Delete the template "Real Test Template"');
      if (step3.success) {
        this.addResult('Cleanup - Template', true, 'Test template deletion initiated');
      } else {
        this.addResult('Cleanup - Template', false, 'Test template deletion failed');
      }
      
    } catch (error) {
      this.addResult('Cleanup', false, error.message);
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
          sessionId: 'real-operations-test-session',
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
    console.log('\n📊 Real Operations Test Results:');
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
      console.log('\n🎉 Real Operations Tests: PASSED');
    } else {
      console.log('\n⚠️ Real Operations Tests: NEEDS IMPROVEMENT');
    }
  }
}

// Run the tests
async function main() {
  const tester = new RealOperationsTester();
  await tester.runRealOperationsTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RealOperationsTester };
