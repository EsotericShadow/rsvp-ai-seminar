require('dotenv').config({ path: '.env.local' });

async function clearRateLimit() {
  try {
    console.log('🧹 Clearing rate limit for testing...');
    console.log('⚠️  Note: This only works if rate limiting is stored in memory');
    console.log('⚠️  For production, you may need to wait for the rate limit window to expire');
    
    // The rate limiter is in-memory, so restarting the server would clear it
    // But we can't do that from here. Let's just inform about the current limits.
    
    console.log('\n📊 Current RSVP Rate Limits:');
    console.log('- 3 RSVP submissions per hour per IP address');
    console.log('- Rate limit window: 1 hour (3,600,000 ms)');
    
    console.log('\n💡 Solutions:');
    console.log('1. Wait for the rate limit window to expire (1 hour)');
    console.log('2. Use a different IP address (VPN, different network)');
    console.log('3. Deploy the app to clear in-memory rate limits');
    console.log('4. Temporarily increase the rate limit for testing');
    
    console.log('\n🔧 To temporarily increase rate limit for testing:');
    console.log('Edit src/lib/rate-limiter.ts line 122:');
    console.log('Change: return checkRateLimit(`rsvp:${ip}`, fingerprint, 3, 60 * 60 * 1000);');
    console.log('To: return checkRateLimit(`rsvp:${ip}`, fingerprint, 10, 60 * 60 * 1000);');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

clearRateLimit();
