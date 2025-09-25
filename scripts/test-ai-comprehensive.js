#!/usr/bin/env node

/**
 * Comprehensive AI Test Suite
 * Tests the complete end-to-end workflow of the AI system
 */

const fetch = require('node-fetch');

// Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:10000';
const AI_API_KEY = process.env.AI_SERVICE_API_KEY || 'test-key-123';

class ComprehensiveAITester {
  constructor() {
    this.conversationHistory = [];
    this.testResults = [];
    this.createdResources = {
      campaigns: [],
      templates: [],
      audiences: [],
      members: []
    };
  }

  async runComprehensiveTests() {
    console.log('🚀 Starting Comprehensive AI Test Suite\n');
    console.log(`AI Service: ${AI_SERVICE_URL}`);
    console.log(`API Key: ${AI_API_KEY ? 'Set' : 'Not set'}\n`);
    
    try {
      // Phase 1: Campaign Management
      await this.testCampaignDeletion();
      await this.testCampaignCreation();
      await this.testCampaignEditing();
      await this.testCampaignDeletionSingle();
      
      // Phase 2: Template Management
      await this.testTemplateCreation();
      await this.testTemplateEditing();
      
      // Phase 3: Audience Management
      await this.testAudienceMemberCreation();
      await this.testAudienceGroupCreation();
      await this.testAudienceMemberRemoval();
      await this.testAudienceMemberAddition();
      await this.testAudienceComplexOperations();
      
      // Phase 4: Campaign with Template and Audience
      await this.testCampaignWithTemplateAndAudience();
      await this.testCampaignSteps();
      
      // Print Results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Comprehensive test suite failed:', error);
    }
  }

  async testCampaignDeletion() {
    console.log('🗑️ Phase 1.1: Testing Campaign Deletion (All Campaigns)...');
    
    try {
      // Step 1: Start deletion
      const step1 = await this.sendMessage('delete all campaigns');
      if (!step1.success) {
        this.addResult('Campaign Deletion - Start', false, 'Failed to start deletion');
        return;
      }
      
      // Step 2: Specify target
      const step2 = await this.sendMessage('all campaigns');
      if (!step2.success) {
        this.addResult('Campaign Deletion - Target', false, 'Failed to specify target');
        return;
      }
      
      // Step 3: Final confirmation
      const step3 = await this.sendMessage('YES DELETE ALL');
      if (step3.success && step3.data.message.includes('EXECUTING')) {
        this.addResult('Campaign Deletion - Complete', true, 'All campaigns deleted successfully');
      } else {
        this.addResult('Campaign Deletion - Complete', false, 'Final confirmation not recognized');
      }
    } catch (error) {
      this.addResult('Campaign Deletion', false, error.message);
    }
  }

  async testCampaignCreation() {
    console.log('\n📢 Phase 1.2: Testing Campaign Creation...');
    
    try {
      const step1 = await this.sendMessage('Create a campaign named "Test Campaign 1"');
      if (!step1.success) {
        this.addResult('Campaign Creation - Start', false, 'Failed to start campaign creation');
        return;
      }
      
      const step2 = await this.sendMessage('Test Audience Group');
      if (!step2.success) {
        this.addResult('Campaign Creation - Audience', false, 'Failed to specify audience');
        return;
      }
      
      const step3 = await this.sendMessage('Test Template');
      if (!step3.success) {
        this.addResult('Campaign Creation - Template', false, 'Failed to specify template');
        return;
      }
      
      const step4 = await this.sendMessage('Send immediately');
      if (step4.success && step4.data.message.includes('campaign')) {
        this.addResult('Campaign Creation - Complete', true, 'Campaign created successfully');
        this.createdResources.campaigns.push('Test Campaign 1');
      } else {
        this.addResult('Campaign Creation - Complete', false, 'Campaign creation failed');
      }
    } catch (error) {
      this.addResult('Campaign Creation', false, error.message);
    }
  }

  async testCampaignEditing() {
    console.log('\n✏️ Phase 1.3: Testing Campaign Editing...');
    
    try {
      const step1 = await this.sendMessage('Edit the campaign "Test Campaign 1"');
      if (!step1.success) {
        this.addResult('Campaign Editing - Start', false, 'Failed to start campaign editing');
        return;
      }
      
      const step2 = await this.sendMessage('Change the name to "Updated Test Campaign"');
      if (!step2.success) {
        this.addResult('Campaign Editing - Name', false, 'Failed to change campaign name');
        return;
      }
      
      const step3 = await this.sendMessage('Add a description: "This is an updated test campaign"');
      if (step3.success && step3.data.message.includes('updated')) {
        this.addResult('Campaign Editing - Complete', true, 'Campaign edited successfully');
      } else {
        this.addResult('Campaign Editing - Complete', false, 'Campaign editing failed');
      }
    } catch (error) {
      this.addResult('Campaign Editing', false, error.message);
    }
  }

  async testCampaignDeletionSingle() {
    console.log('\n🗑️ Phase 1.4: Testing Single Campaign Deletion...');
    
    try {
      const step1 = await this.sendMessage('Delete the campaign "Updated Test Campaign"');
      if (!step1.success) {
        this.addResult('Single Campaign Deletion - Start', false, 'Failed to start single campaign deletion');
        return;
      }
      
      const step2 = await this.sendMessage('Yes, delete it');
      if (step2.success && step2.data.message.includes('deleted')) {
        this.addResult('Single Campaign Deletion - Complete', true, 'Single campaign deleted successfully');
      } else {
        this.addResult('Single Campaign Deletion - Complete', false, 'Single campaign deletion failed');
      }
    } catch (error) {
      this.addResult('Single Campaign Deletion', false, error.message);
    }
  }

  async testTemplateCreation() {
    console.log('\n📧 Phase 2.1: Testing Template Creation...');
    
    try {
      const step1 = await this.sendMessage('Create a template named "Test Template 1"');
      if (!step1.success) {
        this.addResult('Template Creation - Start', false, 'Failed to start template creation');
        return;
      }
      
      const step2 = await this.sendMessage('Welcome to our AI event!');
      if (!step2.success) {
        this.addResult('Template Creation - Subject', false, 'Failed to provide subject');
        return;
      }
      
      const step3 = await this.sendMessage('Thank you for registering for our AI in Terrace event. We look forward to seeing you there!');
      if (step3.success && step3.data.message.includes('template')) {
        this.addResult('Template Creation - Complete', true, 'Template created successfully');
        this.createdResources.templates.push('Test Template 1');
      } else {
        this.addResult('Template Creation - Complete', false, 'Template creation failed');
      }
    } catch (error) {
      this.addResult('Template Creation', false, error.message);
    }
  }

  async testTemplateEditing() {
    console.log('\n✏️ Phase 2.2: Testing Template Editing...');
    
    try {
      const step1 = await this.sendMessage('Edit the template "Test Template 1"');
      if (!step1.success) {
        this.addResult('Template Editing - Start', false, 'Failed to start template editing');
        return;
      }
      
      const step2 = await this.sendMessage('Update the greeting title to "Welcome to AI in Terrace!"');
      if (!step2.success) {
        this.addResult('Template Editing - Greeting', false, 'Failed to update greeting');
        return;
      }
      
      const step3 = await this.sendMessage('Update the signature name to "Gabe Lacroix"');
      if (!step3.success) {
        this.addResult('Template Editing - Signature', false, 'Failed to update signature');
        return;
      }
      
      const step4 = await this.sendMessage('Update the button text to "Register Now"');
      if (step4.success && step4.data.message.includes('updated')) {
        this.addResult('Template Editing - Complete', true, 'Template edited successfully');
      } else {
        this.addResult('Template Editing - Complete', false, 'Template editing failed');
      }
    } catch (error) {
      this.addResult('Template Editing', false, error.message);
    }
  }

  async testAudienceMemberCreation() {
    console.log('\n👥 Phase 3.1: Testing Audience Member Creation...');
    
    try {
      const members = [
        { name: 'John Smith', email: 'john.smith@example.com' },
        { name: 'Sarah Johnson', email: 'sarah.johnson@example.com' },
        { name: 'Mike Wilson', email: 'mike.wilson@example.com' },
        { name: 'Emily Davis', email: 'emily.davis@example.com' },
        { name: 'David Brown', email: 'david.brown@example.com' },
        { name: 'Lisa Anderson', email: 'lisa.anderson@example.com' },
        { name: 'Tom Miller', email: 'tom.miller@example.com' }
      ];
      
      for (const member of members) {
        const step1 = await this.sendMessage(`Add audience member: ${member.name} (${member.email})`);
        if (step1.success) {
          this.createdResources.members.push(member);
        }
      }
      
      if (this.createdResources.members.length === 7) {
        this.addResult('Audience Member Creation', true, 'All 7 audience members created successfully');
      } else {
        this.addResult('Audience Member Creation', false, `Only ${this.createdResources.members.length}/7 members created`);
      }
    } catch (error) {
      this.addResult('Audience Member Creation', false, error.message);
    }
  }

  async testAudienceGroupCreation() {
    console.log('\n👥 Phase 3.2: Testing Audience Group Creation...');
    
    try {
      const step1 = await this.sendMessage('Create an audience group named "Test Audience Group"');
      if (!step1.success) {
        this.addResult('Audience Group Creation - Start', false, 'Failed to start audience group creation');
        return;
      }
      
      const step2 = await this.sendMessage('Add the first 5 members from the lead mine database');
      if (!step2.success) {
        this.addResult('Audience Group Creation - Members', false, 'Failed to add members to group');
        return;
      }
      
      const step3 = await this.sendMessage('Save the audience group');
      if (step3.success && step3.data.message.includes('audience')) {
        this.addResult('Audience Group Creation - Complete', true, 'Audience group created successfully');
        this.createdResources.audiences.push('Test Audience Group');
      } else {
        this.addResult('Audience Group Creation - Complete', false, 'Audience group creation failed');
      }
    } catch (error) {
      this.addResult('Audience Group Creation', false, error.message);
    }
  }

  async testAudienceMemberRemoval() {
    console.log('\n➖ Phase 3.3: Testing Audience Member Removal...');
    
    try {
      // Remove 1 member
      const step1 = await this.sendMessage('Remove john.smith@example.com from the Test Audience Group');
      if (!step1.success) {
        this.addResult('Member Removal - Single', false, 'Failed to remove single member');
        return;
      }
      
      // Remove 3 members
      const step2 = await this.sendMessage('Remove sarah.johnson@example.com, mike.wilson@example.com, and emily.davis@example.com from the Test Audience Group');
      if (step2.success && step2.data.message.includes('removed')) {
        this.addResult('Member Removal - Multiple', true, 'Multiple members removed successfully');
      } else {
        this.addResult('Member Removal - Multiple', false, 'Multiple member removal failed');
      }
    } catch (error) {
      this.addResult('Member Removal', false, error.message);
    }
  }

  async testAudienceMemberAddition() {
    console.log('\n➕ Phase 3.4: Testing Audience Member Addition...');
    
    try {
      // Add 1 member
      const step1 = await this.sendMessage('Add lisa.anderson@example.com to the Test Audience Group');
      if (!step1.success) {
        this.addResult('Member Addition - Single', false, 'Failed to add single member');
        return;
      }
      
      // Add 3 members
      const step2 = await this.sendMessage('Add david.brown@example.com, tom.miller@example.com, and john.smith@example.com to the Test Audience Group');
      if (step2.success && step2.data.message.includes('added')) {
        this.addResult('Member Addition - Multiple', true, 'Multiple members added successfully');
      } else {
        this.addResult('Member Addition - Multiple', false, 'Multiple member addition failed');
      }
    } catch (error) {
      this.addResult('Member Addition', false, error.message);
    }
  }

  async testAudienceComplexOperations() {
    console.log('\n🔄 Phase 3.5: Testing Complex Audience Operations...');
    
    try {
      const step1 = await this.sendMessage('Remove emily.davis@example.com and add sarah.johnson@example.com to the Test Audience Group');
      if (step1.success && step1.data.message.includes('updated')) {
        this.addResult('Complex Audience Operations', true, 'Complex add/remove operations successful');
      } else {
        this.addResult('Complex Audience Operations', false, 'Complex operations failed');
      }
    } catch (error) {
      this.addResult('Complex Audience Operations', false, error.message);
    }
  }

  async testCampaignWithTemplateAndAudience() {
    console.log('\n📢 Phase 4.1: Testing Campaign with Template and Audience...');
    
    try {
      const step1 = await this.sendMessage('Create a campaign named "Final Test Campaign"');
      if (!step1.success) {
        this.addResult('Campaign with Template/Audience - Start', false, 'Failed to start campaign creation');
        return;
      }
      
      const step2 = await this.sendMessage('Use the Test Audience Group');
      if (!step2.success) {
        this.addResult('Campaign with Template/Audience - Audience', false, 'Failed to specify audience');
        return;
      }
      
      const step3 = await this.sendMessage('Use the Test Template 1');
      if (!step3.success) {
        this.addResult('Campaign with Template/Audience - Template', false, 'Failed to specify template');
        return;
      }
      
      const step4 = await this.sendMessage('Schedule it for tomorrow at 2 PM');
      if (step4.success && step4.data.message.includes('campaign')) {
        this.addResult('Campaign with Template/Audience - Complete', true, 'Campaign created with template and audience');
        this.createdResources.campaigns.push('Final Test Campaign');
      } else {
        this.addResult('Campaign with Template/Audience - Complete', false, 'Campaign creation failed');
      }
    } catch (error) {
      this.addResult('Campaign with Template/Audience', false, error.message);
    }
  }

  async testCampaignSteps() {
    console.log('\n📋 Phase 4.2: Testing Campaign Steps...');
    
    try {
      // Create additional templates for steps
      const step1 = await this.sendMessage('Create a template named "Follow-up Template"');
      if (!step1.success) {
        this.addResult('Campaign Steps - Template 1', false, 'Failed to create follow-up template');
        return;
      }
      
      const step2 = await this.sendMessage('Reminder: AI in Terrace Event Tomorrow');
      if (!step2.success) {
        this.addResult('Campaign Steps - Subject 1', false, 'Failed to provide follow-up subject');
        return;
      }
      
      const step3 = await this.sendMessage('Don\'t forget about our AI in Terrace event tomorrow at 2 PM. We look forward to seeing you there!');
      if (!step3.success) {
        this.addResult('Campaign Steps - Content 1', false, 'Failed to provide follow-up content');
        return;
      }
      
      // Create second template
      const step4 = await this.sendMessage('Create a template named "Thank You Template"');
      if (!step4.success) {
        this.addResult('Campaign Steps - Template 2', false, 'Failed to create thank you template');
        return;
      }
      
      const step5 = await this.sendMessage('Thank you for attending!');
      if (!step5.success) {
        this.addResult('Campaign Steps - Subject 2', false, 'Failed to provide thank you subject');
        return;
      }
      
      const step6 = await this.sendMessage('Thank you for attending our AI in Terrace event. We hope you found it valuable!');
      if (!step6.success) {
        this.addResult('Campaign Steps - Content 2', false, 'Failed to provide thank you content');
        return;
      }
      
      // Add steps to campaign
      const step7 = await this.sendMessage('Add a step to the Final Test Campaign: send the Follow-up Template 24 hours after the first email');
      if (!step7.success) {
        this.addResult('Campaign Steps - Step 1', false, 'Failed to add first step');
        return;
      }
      
      const step8 = await this.sendMessage('Add another step: send the Thank You Template 48 hours after the first email');
      if (step8.success && step8.data.message.includes('step')) {
        this.addResult('Campaign Steps - Complete', true, 'Campaign steps created successfully');
      } else {
        this.addResult('Campaign Steps - Complete', false, 'Campaign steps creation failed');
      }
    } catch (error) {
      this.addResult('Campaign Steps', false, error.message);
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
          sessionId: 'comprehensive-test-session',
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
    console.log('\n📊 Comprehensive Test Results:');
    console.log('=' .repeat(60));
    
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
    
    console.log('\n📦 Created Resources:');
    console.log(`Campaigns: ${this.createdResources.campaigns.length}`);
    console.log(`Templates: ${this.createdResources.templates.length}`);
    console.log(`Audiences: ${this.createdResources.audiences.length}`);
    console.log(`Members: ${this.createdResources.members.length}`);
    
    if (percentage >= 80) {
      console.log('\n🎉 Comprehensive AI Tests: PASSED');
    } else {
      console.log('\n⚠️ Comprehensive AI Tests: NEEDS IMPROVEMENT');
    }
    
    console.log('\n💡 To run these tests:');
    console.log('   npm run test-ai-comprehensive');
    console.log('   or');
    console.log('   node scripts/test-ai-comprehensive.js');
  }
}

// Run the tests
async function main() {
  const tester = new ComprehensiveAITester();
  await tester.runComprehensiveTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ComprehensiveAITester };
