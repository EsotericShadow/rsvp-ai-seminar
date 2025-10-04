const { generateEmailHTML } = require('../src/lib/email-template');

async function testEmailGeneration() {
  console.log('🔍 Testing email generation directly...');
  
  try {
    // Test the generateEmailHTML function directly
    const html = await generateEmailHTML({
      subject: 'Test Email Subject',
      greeting: 'Hello!',
      body: '<h1>Welcome to Our Test Campaign!</h1><p>Hello Green Alderson,</p><p>This is a test email.</p><p><a href="{{invite_link}}">RSVP Now</a></p>',
      ctaText: 'View details & RSVP',
      ctaLink: 'https://rsvp.evergreenwebsolutions.ca/?eid=biz_test-token-test-green-alderson-1758828765084',
      inviteToken: 'test-token-test-green-alderson-1758828765084',
      businessName: 'Green Alderson Test Account',
      businessId: 'test-green-alderson',
    });
    
    console.log('✅ Email HTML generated successfully!');
    console.log('📄 HTML length:', html.length);
    console.log('📄 First 200 characters:', html.substring(0, 200));
    
    // Check if the HTML contains the expected elements
    const hasInviteLink = html.includes('https://rsvp.evergreenwebsolutions.ca/?eid=biz_test-token-test-green-alderson-1758828765084');
    const hasBusinessName = html.includes('Green Alderson Test Account');
    const hasTrackingPixel = html.includes('/api/__pixel');
    
    console.log('🔍 HTML Analysis:');
    console.log('   Has invite link:', hasInviteLink);
    console.log('   Has business name:', hasBusinessName);
    console.log('   Has tracking pixel:', hasTrackingPixel);
    
    // Test with Resend to see if the HTML is valid
    console.log('\n📤 Testing HTML with Resend...');
    
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const emailResponse = await resend.emails.send({
      from: 'Gabriel Lacroix <gabriel@evergreenwebsolutions.ca>',
      to: ['greenalderson@gmail.com'],
      subject: 'Direct Email Generation Test',
      html: html,
      text: 'This is a test email generated directly from the email template system.',
    });
    
    if (emailResponse.error) {
      console.log('❌ Resend error:', emailResponse.error);
    } else {
      console.log('✅ Email sent successfully via Resend!');
      console.log('Response:', emailResponse.data);
    }
    
  } catch (error) {
    console.log('❌ Error in email generation:', error.message);
    console.log('Stack:', error.stack);
  }
}

testEmailGeneration()
  .catch(console.error);

