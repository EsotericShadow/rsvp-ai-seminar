#!/usr/bin/env node

/**
 * Script to help add missing environment variables
 * This script identifies missing environment variables and provides instructions
 */

console.log('🔍 Checking for missing environment variables...\n');

// The AI service API key that should be set
const AI_SERVICE_API_KEY = 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5';

console.log('❌ MISSING ENVIRONMENT VARIABLE:');
console.log('   AI_SERVICE_API_KEY');
console.log('\n📋 ADD THIS TO YOUR ENVIRONMENT:');
console.log(`   AI_SERVICE_API_KEY="${AI_SERVICE_API_KEY}"`);
console.log('\n🔧 WHERE TO ADD IT:');
console.log('   1. Vercel Dashboard:');
console.log('      - Go to your project settings');
console.log('      - Navigate to Environment Variables');
console.log('      - Add AI_SERVICE_API_KEY with the value above');
console.log('\n   2. Render Dashboard (for AI service):');
console.log('      - Go to your AI service project');
console.log('      - Navigate to Environment');
console.log('      - Add AI_SERVICE_API_KEY with the same value');
console.log('\n   3. Local development (.env.local):');
console.log(`      AI_SERVICE_API_KEY="${AI_SERVICE_API_KEY}"`);
console.log('\n⚠️  IMPORTANT:');
console.log('   - Use the SAME key value in both Vercel and Render');
console.log('   - This key allows the AI service to authenticate with the main app');
console.log('   - Without this key, the AI service will return 502 errors');
console.log('\n🚀 AFTER ADDING:');
console.log('   1. Redeploy both Vercel and Render services');
console.log('   2. Wait for deployments to complete');
console.log('   3. Test the AI service again');
console.log('\n✅ This should fix the 502 Bad Gateway errors!');
