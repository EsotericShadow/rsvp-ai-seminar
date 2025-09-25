async function testInviteLinkProduction() {
  console.log('🔍 Testing invite link generation in production...');
  
  const testToken = 'test-token-test-availability-live-1758828765862';
  
  // Test the invite link generation function directly
  console.log('🔗 Testing inviteLinkFromToken function:');
  
  try {
    // Simulate the production environment
    const linkBase = process.env.CAMPAIGN_LINK_BASE?.replace(/\/$/, '') || 'https://rsvp.evergreenwebsolutions.ca';
    console.log('   linkBase:', linkBase);
    
    const url = new URL(linkBase);
    url.searchParams.set('eid', `biz_${testToken}`);
    const trackingLink = url.toString();
    
    console.log('   ✅ Generated tracking link:', trackingLink);
    console.log('   ✅ URL is valid');
    
    // Test if the URL can be parsed back
    const parsedUrl = new URL(trackingLink);
    console.log('   ✅ URL can be parsed back');
    console.log('   ✅ eid parameter:', parsedUrl.searchParams.get('eid'));
    
  } catch (error) {
    console.log('   ❌ Error generating invite link:', error.message);
    console.log('   Stack:', error.stack);
  }
  
  // Test the actual API endpoint that might be failing
  console.log('\n📤 Testing the invite link generation via API...');
  
  try {
    const response = await fetch('https://rsvp.evergreenwebsolutions.ca/api/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: testToken,
        action: 'test'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ RSVP API response:', result);
    } else {
      console.log('   ❌ RSVP API failed:', response.status);
      const errorText = await response.text();
      console.log('   Error details:', errorText);
    }
    
  } catch (error) {
    console.log('   ❌ RSVP API error:', error.message);
  }
  
  // Test the global template endpoint
  console.log('\n📄 Testing global template endpoint...');
  
  try {
    const response = await fetch('https://rsvp.evergreenwebsolutions.ca/api/admin/global-template');
    
    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ Global template response length:', result.html?.length || 0);
    } else {
      console.log('   ❌ Global template failed:', response.status);
      const errorText = await response.text();
      console.log('   Error details:', errorText);
    }
    
  } catch (error) {
    console.log('   ❌ Global template error:', error.message);
  }
}

testInviteLinkProduction()
  .catch(console.error);
