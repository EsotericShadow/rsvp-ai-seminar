#!/usr/bin/env node

/**
 * Fix AI Service Authentication
 * This script helps identify and fix the authentication issues between AI service and main app
 */

const https = require('https');

// Test the current API key that the AI service should be using
const TEST_API_KEY = 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5';

async function testMainAppAPI() {
  console.log('🔍 Testing Main App Internal API Authentication\n');
  
  const testEndpoint = 'https://rsvp.evergreenwebsolutions.ca/api/internal/campaigns/delete-all';
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'rsvp.evergreenwebsolutions.ca',
      port: 443,
      path: '/api/internal/campaigns/delete-all',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': TEST_API_KEY
      }
    };

    console.log('📡 Testing API endpoint:', testEndpoint);
    console.log('🔑 Using API key:', TEST_API_KEY.substring(0, 20) + '...');
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📊 Response Status: ${res.statusCode}`);
        console.log(`📄 Response Body: ${data}`);
        
        if (res.statusCode === 200) {
          console.log('✅ API authentication is working!');
          resolve({ success: true, status: res.statusCode, data });
        } else if (res.statusCode === 401) {
          console.log('❌ API authentication failed - 401 Unauthorized');
          console.log('🔧 This means the AI_SERVICE_API_KEY environment variable is not set correctly on Vercel');
          resolve({ success: false, status: res.statusCode, data });
        } else {
          console.log(`⚠️ Unexpected status code: ${res.statusCode}`);
          resolve({ success: false, status: res.statusCode, data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

async function testAIServiceAPIKey() {
  console.log('\n🤖 Testing AI Service API Key Configuration\n');
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      message: 'test authentication',
      sessionId: 'auth-test',
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
        'X-AI-API-Key': TEST_API_KEY
      }
    };

    console.log('📡 Testing AI Service endpoint');
    console.log('🔑 Using API key:', TEST_API_KEY.substring(0, 20) + '...');
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📊 AI Service Response Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ AI Service is accessible');
          resolve({ success: true, status: res.statusCode });
        } else {
          console.log(`❌ AI Service returned status: ${res.statusCode}`);
          resolve({ success: false, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ AI Service request failed:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🚀 AI Service Authentication Fix Script\n');
  console.log('This script will help identify and fix authentication issues.\n');
  
  try {
    // Test 1: Check if main app API accepts our API key
    await testMainAppAPI();
    
    // Test 2: Check if AI service is accessible
    await testAIServiceAPIKey();
    
    console.log('\n📋 DIAGNOSIS:');
    console.log('If you see 401 errors, the issue is:');
    console.log('1. The AI_SERVICE_API_KEY environment variable is not set on Vercel');
    console.log('2. Or the API key values don\'t match between Render and Vercel');
    
    console.log('\n🔧 SOLUTION:');
    console.log('1. Go to Vercel dashboard for rsvp.evergreenwebsolutions.ca');
    console.log('2. Go to Settings > Environment Variables');
    console.log('3. Add/update AI_SERVICE_API_KEY with this value:');
    console.log(`   ${TEST_API_KEY}`);
    console.log('4. Redeploy the Vercel app');
    console.log('5. Test again');
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

main();
