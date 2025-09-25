async function testGlobalTemplateProduction() {
  console.log('🔍 Testing global template in production...');
  
  const mainAppUrl = 'https://rsvp.evergreenwebsolutions.ca';
  
  try {
    // Test the global template endpoint
    console.log('📄 Testing global template endpoint...');
    
    const response = await fetch(`${mainAppUrl}/api/admin/global-template`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Global template endpoint working');
      console.log('   HTML length:', result.html?.length || 0);
      console.log('   First 200 chars:', result.html?.substring(0, 200) || 'No HTML');
      
      // Test if the HTML contains the expected placeholders
      const hasSubject = result.html?.includes('{{subject}}');
      const hasInviteLink = result.html?.includes('{{invite_link}}');
      const hasBusinessName = result.html?.includes('{{business_name}}');
      
      console.log('   Has {{subject}}:', hasSubject);
      console.log('   Has {{invite_link}}:', hasInviteLink);
      console.log('   Has {{business_name}}:', hasBusinessName);
      
    } else {
      console.log('❌ Global template endpoint failed:', response.status);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
    
    // Test the invite link generation
    console.log('\n🔗 Testing invite link generation...');
    
    const testToken = 'test-token-test-availability-live-1758828765862';
    const linkBase = 'https://rsvp.evergreenwebsolutions.ca';
    const url = new URL(linkBase);
    url.searchParams.set('eid', `biz_${testToken}`);
    const trackingLink = url.toString();
    
    console.log('✅ Generated tracking link:', trackingLink);
    
    // Test if the URL is valid
    try {
      new URL(trackingLink);
      console.log('✅ URL is valid');
    } catch (error) {
      console.log('❌ URL validation failed:', error.message);
    }
    
    // Test a simple template replacement
    console.log('\n📝 Testing template replacement...');
    
    const testTemplate = '<h1>{{subject}}</h1><p>Hello {{business_name}}!</p><p><a href="{{invite_link}}">RSVP Now</a></p>';
    const testContext = {
      subject: 'Test Subject',
      business_name: 'Test Business',
      invite_link: trackingLink
    };
    
    const processedTemplate = testTemplate
      .replace(/\{\{\s*subject\s*\}\}/g, testContext.subject)
      .replace(/\{\{\s*business_name\s*\}\}/g, testContext.business_name)
      .replace(/\{\{\s*invite_link\s*\}\}/g, testContext.invite_link);
    
    console.log('✅ Template replacement working');
    console.log('   Original:', testTemplate);
    console.log('   Processed:', processedTemplate);
    
    const hasReplacedInviteLink = processedTemplate.includes(trackingLink);
    console.log('   Invite link replaced:', hasReplacedInviteLink);
    
  } catch (error) {
    console.log('❌ Error testing global template:', error.message);
  }
}

testGlobalTemplateProduction()
  .catch(console.error);
