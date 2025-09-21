#!/usr/bin/env tsx

/**
 * Comprehensive Test Script for Email Template Synchronization
 * 
 * This script tests:
 * 1. Global template settings persistence
 * 2. Global HTML template loading/saving
 * 3. Individual template editor sync
 * 4. Template preview generation
 * 5. Cross-component communication
 */

import prisma from '../src/lib/prisma';
import { generateEmailHTML } from '../src/lib/email-template';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

class TemplateSyncTester {
  private results: TestResult[] = [];
  private baseUrl = 'http://localhost:3000';

  private addResult(test: string, status: 'PASS' | 'FAIL', message: string, details?: any) {
    this.results.push({ test, status, message, details });
    console.log(`${status === 'PASS' ? '✅' : '❌'} ${test}: ${message}`);
    if (details && status === 'FAIL') {
      console.log('   Details:', details);
    }
  }

  async testGlobalTemplateSettingsAPI() {
    console.log('\n🔍 Testing Global Template Settings API...');
    
    try {
      // Test GET endpoint
      const getResponse = await fetch(`${this.baseUrl}/api/admin/global-template-settings`);
      const getData = await getResponse.json();
      
      if (getResponse.ok) {
        this.addResult(
          'Global Template Settings GET',
          'PASS',
          'Successfully retrieved global template settings',
          { fields: Object.keys(getData) }
        );
      } else {
        this.addResult(
          'Global Template Settings GET',
          'FAIL',
          'Failed to retrieve global template settings',
          { error: getData }
        );
        return;
      }

      // Test POST endpoint with modified settings
      const testSettings = {
        ...getData,
        global_hero_title: 'TEST: Updated Hero Title',
        global_hero_message: 'TEST: This is a test message to verify persistence',
        global_signature_name: 'TEST: John Doe',
        global_event_date: 'TEST: January 1st, 2026'
      };

      const postResponse = await fetch(`${this.baseUrl}/api/admin/global-template-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testSettings)
      });

      const postData = await postResponse.json();

      if (postResponse.ok) {
        this.addResult(
          'Global Template Settings POST',
          'PASS',
          'Successfully updated global template settings',
          { updatedFields: ['global_hero_title', 'global_hero_message', 'global_signature_name', 'global_event_date'] }
        );
      } else {
        this.addResult(
          'Global Template Settings POST',
          'FAIL',
          'Failed to update global template settings',
          { error: postData }
        );
        return;
      }

      // Verify persistence by fetching again
      const verifyResponse = await fetch(`${this.baseUrl}/api/admin/global-template-settings`);
      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok && verifyData.global_hero_title === testSettings.global_hero_title) {
        this.addResult(
          'Global Template Settings Persistence',
          'PASS',
          'Settings persist correctly after update',
          { verified: verifyData.global_hero_title }
        );
      } else {
        this.addResult(
          'Global Template Settings Persistence',
          'FAIL',
          'Settings did not persist after update',
          { expected: testSettings.global_hero_title, actual: verifyData.global_hero_title }
        );
      }

    } catch (error) {
      this.addResult(
        'Global Template Settings API',
        'FAIL',
        'API test failed with exception',
        { error: error.message }
      );
    }
  }

  async testGlobalHTMLTemplateAPI() {
    console.log('\n🔍 Testing Global HTML Template API...');
    
    try {
      // Test GET endpoint
      const getResponse = await fetch(`${this.baseUrl}/api/admin/global-template`);
      const getData = await getResponse.json();
      
      if (getResponse.ok && getData.html) {
        this.addResult(
          'Global HTML Template GET',
          'PASS',
          'Successfully retrieved global HTML template',
          { htmlLength: getData.html.length }
        );
      } else {
        this.addResult(
          'Global HTML Template GET',
          'FAIL',
          'Failed to retrieve global HTML template',
          { error: getData }
        );
        return;
      }

      // Test POST endpoint with modified template
      const testHTML = getData.html.replace(
        '{{subject}}',
        'TEST: Modified Template - {{subject}}'
      );

      const postResponse = await fetch(`${this.baseUrl}/api/admin/global-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: testHTML })
      });

      const postData = await postResponse.json();

      if (postResponse.ok) {
        this.addResult(
          'Global HTML Template POST',
          'PASS',
          'Successfully updated global HTML template',
          { modified: true }
        );
      } else {
        this.addResult(
          'Global HTML Template POST',
          'FAIL',
          'Failed to update global HTML template',
          { error: postData }
        );
        return;
      }

      // Verify persistence
      const verifyResponse = await fetch(`${this.baseUrl}/api/admin/global-template`);
      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok && verifyData.html.includes('TEST: Modified Template - {{subject}}')) {
        this.addResult(
          'Global HTML Template Persistence',
          'PASS',
          'HTML template persists correctly after update',
          { verified: true }
        );
      } else {
        this.addResult(
          'Global HTML Template Persistence',
          'FAIL',
          'HTML template did not persist after update',
          { found: verifyData.html.includes('TEST: Modified Template - {{subject}}') }
        );
      }

    } catch (error) {
      this.addResult(
        'Global HTML Template API',
        'FAIL',
        'API test failed with exception',
        { error: error.message }
      );
    }
  }

  async testEmailTemplateGeneration() {
    console.log('\n🔍 Testing Email Template Generation...');
    
    try {
      // Get current global settings
      const settingsResponse = await fetch(`${this.baseUrl}/api/admin/global-template-settings`);
      const globalSettings = await settingsResponse.json();

      if (!settingsResponse.ok) {
        this.addResult(
          'Email Template Generation',
          'FAIL',
          'Cannot test email generation without global settings',
          { error: globalSettings }
        );
        return;
      }

      // Test email generation with sample data
      const testData = {
        subject: 'TEST: Sample Email Subject',
        greeting_title: 'TEST: Greeting Title',
        greeting_message: 'TEST: Greeting message content',
        signature_name: 'TEST: Signature Name',
        signature_title: 'TEST: Signature Title',
        signature_company: 'TEST: Signature Company',
        signature_location: 'TEST: Signature Location',
        main_content_title: 'TEST: Main Content Title',
        body: '<p>TEST: This is the main content body with <strong>HTML formatting</strong>.</p>',
        ctaText: 'TEST: Button Text',
        ctaLink: 'https://example.com/test-link',
        additional_info_title: 'TEST: Additional Info Title',
        additional_info_body: '<p>TEST: Additional information content.</p>',
        closing_title: 'TEST: Closing Title',
        closing_message: 'TEST: Closing message content.',
        businessName: 'TEST: Sample Business',
        businessId: 'test-business-123',
        // Global template variables
        global_hero_title: globalSettings.global_hero_title || 'Default Hero Title',
        global_hero_message: globalSettings.global_hero_message || 'Default Hero Message',
        global_signature_name: globalSettings.global_signature_name || 'Default Signature Name',
        global_signature_title: globalSettings.global_signature_title || 'Default Signature Title',
        global_signature_company: globalSettings.global_signature_company || 'Default Signature Company',
        global_signature_location: globalSettings.global_signature_location || 'Default Signature Location',
        global_event_title: globalSettings.global_event_title || 'Default Event Title',
        global_event_date: globalSettings.global_event_date || 'Default Event Date',
        global_event_time: globalSettings.global_event_time || 'Default Event Time',
        global_event_location: globalSettings.global_event_location || 'Default Event Location',
        global_event_cost: globalSettings.global_event_cost || 'Default Event Cost',
        global_event_includes: globalSettings.global_event_includes || 'Default Event Includes',
      };

      const generatedHTML = await generateEmailHTML(testData);

      if (generatedHTML && generatedHTML.includes('TEST: Sample Email Subject')) {
        this.addResult(
          'Email Template Generation',
          'PASS',
          'Email HTML generated successfully with all variables',
          { htmlLength: generatedHTML.length, containsTestData: true }
        );
      } else {
        this.addResult(
          'Email Template Generation',
          'FAIL',
          'Email HTML generation failed or missing test data',
          { htmlLength: generatedHTML?.length, containsTestData: generatedHTML?.includes('TEST: Sample Email Subject') }
        );
      }

      // Test that global settings are properly integrated
      const hasGlobalHero = generatedHTML.includes(testData.global_hero_title);
      const hasGlobalSignature = generatedHTML.includes(testData.global_signature_name);
      const hasGlobalEvent = generatedHTML.includes(testData.global_event_title);

      if (hasGlobalHero && hasGlobalSignature && hasGlobalEvent) {
        this.addResult(
          'Global Settings Integration',
          'PASS',
          'Global template settings properly integrated into generated email',
          { hasGlobalHero, hasGlobalSignature, hasGlobalEvent }
        );
      } else {
        this.addResult(
          'Global Settings Integration',
          'FAIL',
          'Global template settings not properly integrated',
          { hasGlobalHero, hasGlobalSignature, hasGlobalEvent }
        );
      }

    } catch (error) {
      this.addResult(
        'Email Template Generation',
        'FAIL',
        'Email generation test failed with exception',
        { error: error.message }
      );
    }
  }

  async testDatabasePersistence() {
    console.log('\n🔍 Testing Database Persistence...');
    
    try {
      // Check if GlobalTemplateSettings table exists and has data
      const settingsCount = await prisma.globalTemplateSettings.count();
      
      if (settingsCount > 0) {
        this.addResult(
          'Database Settings Table',
          'PASS',
          `Found ${settingsCount} global template settings record(s)`,
          { count: settingsCount }
        );

        // Get the latest settings
        const latestSettings = await prisma.globalTemplateSettings.findFirst({
          orderBy: { createdAt: 'desc' }
        });

        if (latestSettings) {
          this.addResult(
            'Database Settings Content',
            'PASS',
            'Successfully retrieved settings from database',
            { 
              hasHeroTitle: !!latestSettings.global_hero_title,
              hasSignature: !!latestSettings.global_signature_name,
              hasEventDetails: !!latestSettings.global_event_title,
              createdAt: latestSettings.createdAt
            }
          );
        } else {
          this.addResult(
            'Database Settings Content',
            'FAIL',
            'No settings found in database',
            {}
          );
        }
      } else {
        this.addResult(
          'Database Settings Table',
          'FAIL',
          'No global template settings found in database',
          { count: settingsCount }
        );
      }

    } catch (error) {
      this.addResult(
        'Database Persistence',
        'FAIL',
        'Database test failed with exception',
        { error: error.message }
      );
    }
  }

  async testIndividualTemplateAPI() {
    console.log('\n🔍 Testing Individual Template API...');
    
    try {
      // Get a sample template
      const template = await prisma.campaignTemplate.findFirst();
      
      if (!template) {
        this.addResult(
          'Individual Template API',
          'FAIL',
          'No templates found in database to test',
          {}
        );
        return;
      }

      // Test GET endpoint
      const getResponse = await fetch(`${this.baseUrl}/api/admin/templates/${template.id}`);
      const getData = await getResponse.json();
      
      if (getResponse.ok) {
        this.addResult(
          'Individual Template GET',
          'PASS',
          'Successfully retrieved individual template',
          { templateId: template.id, templateName: getData.name }
        );
      } else {
        this.addResult(
          'Individual Template GET',
          'FAIL',
          'Failed to retrieve individual template',
          { error: getData }
        );
        return;
      }

      // Test PUT endpoint with modified template
      const updatedTemplate = {
        ...getData,
        greeting_title: 'TEST: Updated Greeting Title',
        main_content_title: 'TEST: Updated Main Content Title',
        button_text: 'TEST: Updated Button Text'
      };

      const putResponse = await fetch(`${this.baseUrl}/api/admin/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTemplate)
      });

      const putData = await putResponse.json();

      if (putResponse.ok) {
        this.addResult(
          'Individual Template PUT',
          'PASS',
          'Successfully updated individual template',
          { updatedFields: ['greeting_title', 'main_content_title', 'button_text'] }
        );
      } else {
        this.addResult(
          'Individual Template PUT',
          'FAIL',
          'Failed to update individual template',
          { error: putData }
        );
        return;
      }

      // Verify persistence
      const verifyResponse = await fetch(`${this.baseUrl}/api/admin/templates/${template.id}`);
      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok && verifyData.greeting_title === updatedTemplate.greeting_title) {
        this.addResult(
          'Individual Template Persistence',
          'PASS',
          'Individual template persists correctly after update',
          { verified: verifyData.greeting_title }
        );
      } else {
        this.addResult(
          'Individual Template Persistence',
          'FAIL',
          'Individual template did not persist after update',
          { expected: updatedTemplate.greeting_title, actual: verifyData.greeting_title }
        );
      }

    } catch (error) {
      this.addResult(
        'Individual Template API',
        'FAIL',
        'Individual template test failed with exception',
        { error: error.message }
      );
    }
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive Template Synchronization Tests...\n');
    
    await this.testGlobalTemplateSettingsAPI();
    await this.testGlobalHTMLTemplateAPI();
    await this.testEmailTemplateGeneration();
    await this.testDatabasePersistence();
    await this.testIndividualTemplateAPI();

    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    
    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        console.log(`   - ${result.test}: ${result.message}`);
      });
    }

    console.log('\n🔍 DETAILED RESULTS:');
    this.results.forEach(result => {
      console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${result.test}`);
      console.log(`   ${result.message}`);
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
      console.log('');
    });

    return { passed, failed, results: this.results };
  }
}

// Run the tests
async function main() {
  const tester = new TemplateSyncTester();
  const results = await tester.runAllTests();
  
  if (results.failed > 0) {
    console.log('\n❌ Template synchronization system has issues that need to be fixed.');
    process.exit(1);
  } else {
    console.log('\n✅ All template synchronization tests passed!');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export default TemplateSyncTester;
