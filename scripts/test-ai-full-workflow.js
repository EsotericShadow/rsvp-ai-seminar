#!/usr/bin/env node

/**
 * Full AI Workflow Test Suite
 * Tests the complete end-to-end workflow including cleanup
 */

const fetch = require('node-fetch');

// Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:10000';
const AI_API_KEY = process.env.AI_SERVICE_API_KEY || 'test-key-123';

class FullWorkflowTester {
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

  async runFullWorkflowTests() {
    console.log('🚀 Starting Full AI Workflow Test Suite\n');
    console.log(`AI Service: ${AI_SERVICE_URL}`);
    console.log(`API Key: ${AI_API_KEY ? 'Set' : 'Not set'}\n`);
    
    try {
      // Phase 0: Cleanup
      await this.testCleanup();
      
      // Phase 1: Template Creation and Management
      await this.testTemplateWorkflow();
      
      // Phase 2: Audience Management
      await this.testAudienceWorkflow();
      
      // Phase 3: Campaign Management
      await this.testCampaignWorkflow();
      
      // Phase 4: Final Cleanup
      await this.testFinalCleanup();
      
      // Print Results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Full workflow test suite failed:', error);
    }
  }

  async testCleanup() {
    console.log('🧹 Phase 0: Testing Cleanup Operations...');
    
    try {
      // Delete all campaigns
      console.log('   Step 1: Deleting all campaigns...');
      const step1 = await this.sendMessage('delete all campaigns');
      if (!step1.success) {
        this.addResult('Cleanup - Campaigns Start', false, 'Failed to start campaign deletion');
        return;
      }
      
      const step2 = await this.sendMessage('all campaigns');
      if (!step2.success) {
        this.addResult('Cleanup - Campaigns Target', false, 'Failed to specify campaign deletion target');
        return;
      }
      
      const step3 = await this.sendMessage('YES DELETE ALL');
      if (step3.success) {
        this.addResult('Cleanup - Campaigns Complete', true, 'Campaign deletion initiated');
      } else {
        this.addResult('Cleanup - Campaigns Complete', false, 'Campaign deletion failed');
      }
      
      // Delete phony business entries
      console.log('   Step 2: Deleting phony business entries...');
      const step4 = await this.sendMessage('delete all phony business entries from lead mine');
      if (step4.success) {
        this.addResult('Cleanup - Lead Mine', true, 'Phony business entries deletion initiated');
      } else {
        this.addResult('Cleanup - Lead Mine', false, 'Lead mine cleanup failed');
      }
      
    } catch (error) {
      this.addResult('Cleanup', false, error.message);
    }
  }

  async testTemplateWorkflow() {
    console.log('\n📧 Phase 1: Testing Template Workflow...');
    
    try {
      // Create main template
      console.log('   Step 1: Creating main template...');
      const step1 = await this.sendMessage('Create a template named "AI Event Welcome"');
      if (!step1.success) {
        this.addResult('Template - Creation Start', false, 'Failed to start template creation');
        return;
      }
      
      const step2 = await this.sendMessage('Welcome to AI in Terrace!');
      if (!step2.success) {
        this.addResult('Template - Subject', false, 'Failed to provide subject');
        return;
      }
      
      const step3 = await this.sendMessage('Thank you for registering for our AI in Terrace event. We look forward to seeing you there!');
      if (step3.success) {
        this.addResult('Template - Creation Complete', true, 'Main template created successfully');
        this.createdResources.templates.push('AI Event Welcome');
      } else {
        this.addResult('Template - Creation Complete', false, 'Main template creation failed');
      }
      
      // Create follow-up template
      console.log('   Step 2: Creating follow-up template...');
      const step4 = await this.sendMessage('Create a template named "Event Reminder"');
      if (!step4.success) {
        this.addResult('Template - Follow-up Start', false, 'Failed to start follow-up template creation');
        return;
      }
      
      const step5 = await this.sendMessage('Reminder: AI in Terrace Event Tomorrow');
      if (!step5.success) {
        this.addResult('Template - Follow-up Subject', false, 'Failed to provide follow-up subject');
        return;
      }
      
      const step6 = await this.sendMessage('Don\'t forget about our AI in Terrace event tomorrow at 2 PM. We look forward to seeing you there!');
      if (step6.success) {
        this.addResult('Template - Follow-up Complete', true, 'Follow-up template created successfully');
        this.createdResources.templates.push('Event Reminder');
      } else {
        this.addResult('Template - Follow-up Complete', false, 'Follow-up template creation failed');
      }
      
      // Edit template
      console.log('   Step 3: Editing template...');
      const step7 = await this.sendMessage('Edit the AI Event Welcome template');
      if (!step7.success) {
        this.addResult('Template - Edit Start', false, 'Failed to start template editing');
        return;
      }
      
      const step8 = await this.sendMessage('Update the greeting title to "Welcome to AI in Terrace!"');
      if (step8.success) {
        this.addResult('Template - Edit Complete', true, 'Template edited successfully');
      } else {
        this.addResult('Template - Edit Complete', false, 'Template editing failed');
      }
      
    } catch (error) {
      this.addResult('Template Workflow', false, error.message);
    }
  }

  async testAudienceWorkflow() {
    console.log('\n👥 Phase 2: Testing Audience Workflow...');
    
    try {
      // Create phony business entries
      console.log('   Step 1: Creating phony business entries...');
      const businesses = [
        { name: 'Tech Solutions Inc', email: 'contact@techsolutions.com', owner: 'John Smith' },
        { name: 'Digital Marketing Pro', email: 'info@digitalmarketingpro.com', owner: 'Sarah Johnson' },
        { name: 'AI Consulting Group', email: 'hello@aiconsulting.com', owner: 'Mike Wilson' },
        { name: 'Web Development Co', email: 'team@webdevco.com', owner: 'Emily Davis' },
        { name: 'Software Solutions Ltd', email: 'contact@softwaresolutions.com', owner: 'David Brown' },
        { name: 'Data Analytics Inc', email: 'info@dataanalytics.com', owner: 'Lisa Anderson' },
        { name: 'Cloud Services Pro', email: 'support@cloudservices.com', owner: 'Tom Miller' }
      ];
      
      for (const business of businesses) {
        const step = await this.sendMessage(`Add business to lead mine: ${business.name} (${business.email}) owned by ${business.owner}`);
        if (step.success) {
          this.createdResources.members.push(business);
        }
      }
      
      if (this.createdResources.members.length === 7) {
        this.addResult('Audience - Business Creation', true, 'All 7 phony businesses created successfully');
      } else {
        this.addResult('Audience - Business Creation', false, `Only ${this.createdResources.members.length}/7 businesses created`);
      }
      
      // Create audience group
      console.log('   Step 2: Creating audience group...');
      const step1 = await this.sendMessage('Create an audience group named "AI Event Attendees"');
      if (!step1.success) {
        this.addResult('Audience - Group Start', false, 'Failed to start audience group creation');
        return;
      }
      
      const step2 = await this.sendMessage('Add the first 5 businesses from lead mine to this group');
      if (!step2.success) {
        this.addResult('Audience - Group Members', false, 'Failed to add members to group');
        return;
      }
      
      const step3 = await this.sendMessage('Save the audience group');
      if (step3.success) {
        this.addResult('Audience - Group Complete', true, 'Audience group created successfully');
        this.createdResources.audiences.push('AI Event Attendees');
      } else {
        this.addResult('Audience - Group Complete', false, 'Audience group creation failed');
      }
      
      // Test member removal (single)
      console.log('   Step 3: Testing single member removal...');
      const step4 = await this.sendMessage('Remove contact@techsolutions.com from AI Event Attendees');
      if (step4.success) {
        this.addResult('Audience - Single Removal', true, 'Single member removed successfully');
      } else {
        this.addResult('Audience - Single Removal', false, 'Single member removal failed');
      }
      
      // Test member removal (multiple)
      console.log('   Step 4: Testing multiple member removal...');
      const step5 = await this.sendMessage('Remove info@digitalmarketingpro.com, hello@aiconsulting.com, and team@webdevco.com from AI Event Attendees');
      if (step5.success) {
        this.addResult('Audience - Multiple Removal', true, 'Multiple members removed successfully');
      } else {
        this.addResult('Audience - Multiple Removal', false, 'Multiple member removal failed');
      }
      
      // Test member addition (single)
      console.log('   Step 5: Testing single member addition...');
      const step6 = await this.sendMessage('Add contact@softwaresolutions.com to AI Event Attendees');
      if (step6.success) {
        this.addResult('Audience - Single Addition', true, 'Single member added successfully');
      } else {
        this.addResult('Audience - Single Addition', false, 'Single member addition failed');
      }
      
      // Test member addition (multiple)
      console.log('   Step 6: Testing multiple member addition...');
      const step7 = await this.sendMessage('Add info@dataanalytics.com, support@cloudservices.com, and contact@techsolutions.com to AI Event Attendees');
      if (step7.success) {
        this.addResult('Audience - Multiple Addition', true, 'Multiple members added successfully');
      } else {
        this.addResult('Audience - Multiple Addition', false, 'Multiple member addition failed');
      }
      
      // Test complex operations
      console.log('   Step 7: Testing complex operations...');
      const step8 = await this.sendMessage('Remove contact@techsolutions.com and add info@digitalmarketingpro.com to AI Event Attendees');
      if (step8.success) {
        this.addResult('Audience - Complex Operations', true, 'Complex add/remove operations successful');
      } else {
        this.addResult('Audience - Complex Operations', false, 'Complex operations failed');
      }
      
    } catch (error) {
      this.addResult('Audience Workflow', false, error.message);
    }
  }

  async testCampaignWorkflow() {
    console.log('\n📢 Phase 3: Testing Campaign Workflow...');
    
    try {
      // Create campaign
      console.log('   Step 1: Creating campaign...');
      const step1 = await this.sendMessage('Create a campaign named "AI in Terrace Event Campaign"');
      if (!step1.success) {
        this.addResult('Campaign - Creation Start', false, 'Failed to start campaign creation');
        return;
      }
      
      const step2 = await this.sendMessage('Use the AI Event Attendees audience');
      if (!step2.success) {
        this.addResult('Campaign - Audience', false, 'Failed to specify audience');
        return;
      }
      
      const step3 = await this.sendMessage('Use the AI Event Welcome template');
      if (!step3.success) {
        this.addResult('Campaign - Template', false, 'Failed to specify template');
        return;
      }
      
      const step4 = await this.sendMessage('Schedule it for tomorrow at 2 PM');
      if (step4.success) {
        this.addResult('Campaign - Creation Complete', true, 'Campaign created successfully');
        this.createdResources.campaigns.push('AI in Terrace Event Campaign');
      } else {
        this.addResult('Campaign - Creation Complete', false, 'Campaign creation failed');
      }
      
      // Add campaign steps
      console.log('   Step 2: Adding campaign steps...');
      const step5 = await this.sendMessage('Add a step to the AI in Terrace Event Campaign: send the Event Reminder template 24 hours after the first email');
      if (!step5.success) {
        this.addResult('Campaign - Step 1', false, 'Failed to add first step');
        return;
      }
      
      const step6 = await this.sendMessage('Add another step: send a thank you email 48 hours after the first email');
      if (step6.success) {
        this.addResult('Campaign - Step 2', true, 'Campaign steps added successfully');
      } else {
        this.addResult('Campaign - Step 2', false, 'Campaign steps addition failed');
      }
      
      // Edit campaign
      console.log('   Step 3: Editing campaign...');
      const step7 = await this.sendMessage('Edit the AI in Terrace Event Campaign');
      if (!step7.success) {
        this.addResult('Campaign - Edit Start', false, 'Failed to start campaign editing');
        return;
      }
      
      const step8 = await this.sendMessage('Change the name to "Updated AI in Terrace Event Campaign"');
      if (step8.success) {
        this.addResult('Campaign - Edit Complete', true, 'Campaign edited successfully');
      } else {
        this.addResult('Campaign - Edit Complete', false, 'Campaign editing failed');
      }
      
    } catch (error) {
      this.addResult('Campaign Workflow', false, error.message);
    }
  }

  async testFinalCleanup() {
    console.log('\n🧹 Phase 4: Testing Final Cleanup...');
    
    try {
      // Delete the test campaign
      console.log('   Step 1: Deleting test campaign...');
      const step1 = await this.sendMessage('Delete the campaign "Updated AI in Terrace Event Campaign"');
      if (!step1.success) {
        this.addResult('Final Cleanup - Campaign', false, 'Failed to delete test campaign');
        return;
      }
      
      const step2 = await this.sendMessage('Yes, delete it');
      if (step2.success) {
        this.addResult('Final Cleanup - Campaign', true, 'Test campaign deleted successfully');
      } else {
        this.addResult('Final Cleanup - Campaign', false, 'Test campaign deletion failed');
      }
      
      // Delete the test audience group
      console.log('   Step 2: Deleting test audience group...');
      const step3 = await this.sendMessage('Delete the audience group "AI Event Attendees"');
      if (step3.success) {
        this.addResult('Final Cleanup - Audience', true, 'Test audience group deleted successfully');
      } else {
        this.addResult('Final Cleanup - Audience', false, 'Test audience group deletion failed');
      }
      
      // Delete the test templates
      console.log('   Step 3: Deleting test templates...');
      const step4 = await this.sendMessage('Delete the templates "AI Event Welcome" and "Event Reminder"');
      if (step4.success) {
        this.addResult('Final Cleanup - Templates', true, 'Test templates deleted successfully');
      } else {
        this.addResult('Final Cleanup - Templates', false, 'Test templates deletion failed');
      }
      
      // Delete phony business entries
      console.log('   Step 4: Deleting phony business entries...');
      const step5 = await this.sendMessage('Delete all the phony business entries we created from lead mine');
      if (step5.success) {
        this.addResult('Final Cleanup - Lead Mine', true, 'Phony business entries deleted successfully');
      } else {
        this.addResult('Final Cleanup - Lead Mine', false, 'Phony business entries deletion failed');
      }
      
    } catch (error) {
      this.addResult('Final Cleanup', false, error.message);
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
          sessionId: 'full-workflow-test-session',
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
    console.log('\n📊 Full Workflow Test Results:');
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
      console.log('\n🎉 Full Workflow Tests: PASSED');
    } else {
      console.log('\n⚠️ Full Workflow Tests: NEEDS IMPROVEMENT');
    }
    
    console.log('\n💡 To run these tests:');
    console.log('   npm run test-ai-full-workflow');
    console.log('   or');
    console.log('   node scripts/test-ai-full-workflow.js');
  }
}

// Run the tests
async function main() {
  const tester = new FullWorkflowTester();
  await tester.runFullWorkflowTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FullWorkflowTester };
