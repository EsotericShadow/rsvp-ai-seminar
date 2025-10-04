#!/usr/bin/env node

/**
 * Setup Test Environment
 * Ensures all required environment variables are set for AI testing
 */

require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = [
  'AI_SERVICE_URL',
  'AI_SERVICE_API_KEY',
  'MAIN_APP_URL',
  'WEAVIATE_URL',
  'WEAVIATE_API_KEY'
];

function checkEnvironment() {
  console.log('🔧 Checking Test Environment...\n');
  
  let allSet = true;
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Not set`);
      allSet = false;
    }
  });
  
  console.log('\n📋 Environment Summary:');
  console.log(`AI Service URL: ${process.env.AI_SERVICE_URL || 'Not set'}`);
  console.log(`AI API Key: ${process.env.AI_SERVICE_API_KEY ? 'Set' : 'Not set'}`);
  console.log(`Main App URL: ${process.env.MAIN_APP_URL || 'Not set'}`);
  console.log(`Weaviate URL: ${process.env.WEAVIATE_URL || 'Not set'}`);
  console.log(`Weaviate API Key: ${process.env.WEAVIATE_API_KEY ? 'Set' : 'Not set'}`);
  
  if (allSet) {
    console.log('\n🎉 Environment is ready for testing!');
    console.log('\nAvailable test commands:');
    console.log('  npm run test-ai        - Quick AI tests');
    console.log('  npm run test-ai-core   - Core functionality tests');
    console.log('  npm run test-ai-rag    - RAG system tests');
    console.log('  npm run test-ai-full   - Comprehensive test suite');
  } else {
    console.log('\n⚠️ Environment is not ready. Please set the missing variables.');
    console.log('\nRequired variables:');
    requiredEnvVars.forEach(varName => {
      if (!process.env[varName]) {
        console.log(`  - ${varName}`);
      }
    });
  }
  
  return allSet;
}

if (require.main === module) {
  checkEnvironment();
}

module.exports = { checkEnvironment };


