async function testUrlConstruction() {
  console.log('🔍 Testing URL construction...');
  
  // Test with the production environment variables
  const linkBase = process.env.CAMPAIGN_LINK_BASE?.replace(/\/$/, '') || 'https://rsvp.evergreenwebsolutions.ca';
  console.log('📝 CAMPAIGN_LINK_BASE from env:', process.env.CAMPAIGN_LINK_BASE);
  console.log('🔗 Processed linkBase:', linkBase);
  
  const testToken = 'test-token-test-availability-live-1758828765862';
  
  try {
    // Test URL construction
    console.log('\n🔗 Testing URL construction...');
    const url = new URL(linkBase);
    url.searchParams.set('eid', `biz_${testToken}`);
    const trackingLink = url.toString();
    
    console.log('✅ URL constructed successfully:', trackingLink);
    
    // Test URL validation
    new URL(trackingLink);
    console.log('✅ URL is valid');
    
    // Test the inviteLinkFromToken function directly
    console.log('\n🔧 Testing inviteLinkFromToken function...');
    
    // Import the function (simulate it)
    function inviteLinkFromToken(token) {
      const linkBase = process.env.CAMPAIGN_LINK_BASE?.replace(/\/$/, '') || 'https://rsvp.evergreenwebsolutions.ca';
      const url = new URL(linkBase);
      url.searchParams.set('eid', `biz_${token}`);
      return url.toString();
    }
    
    const result = inviteLinkFromToken(testToken);
    console.log('✅ inviteLinkFromToken result:', result);
    
    // Test with different token formats
    console.log('\n🧪 Testing with different token formats...');
    
    const tokens = [
      'test-token-test-availability-live-1758828765862',
      'test-token-test-green-alderson-1758828765084',
      'test-token-test-tangible-outlook-1758828765524',
      null,
      undefined,
      '',
      'invalid-url-token'
    ];
    
    tokens.forEach((token, index) => {
      try {
        if (token) {
          const url = new URL(linkBase);
          url.searchParams.set('eid', `biz_${token}`);
          const result = url.toString();
          console.log(`   ${index + 1}. Token: "${token}" -> ✅ ${result}`);
        } else {
          console.log(`   ${index + 1}. Token: ${token} -> ⏭️  Skipped (null/undefined)`);
        }
      } catch (error) {
        console.log(`   ${index + 1}. Token: "${token}" -> ❌ Error: ${error.message}`);
      }
    });
    
  } catch (error) {
    console.log('❌ URL construction failed:', error.message);
    console.log('Stack:', error.stack);
  }
}

testUrlConstruction()
  .catch(console.error);

