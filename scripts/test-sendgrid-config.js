async function testSendGridConfig() {
  console.log('🔍 Testing SendGrid configuration...');
  
  // Check environment variables
  console.log('🌍 Environment Variables:');
  console.log('   SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
  console.log('   CAMPAIGN_FROM_EMAIL:', process.env.CAMPAIGN_FROM_EMAIL || 'NOT SET');
  
  // Test SendGrid import
  try {
    const sgMail = require('@sendgrid/mail');
    console.log('✅ SendGrid package imported successfully');
    
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      console.log('✅ SendGrid API key set');
      
      // Test a simple email send
      console.log('\n📧 Testing SendGrid email send...');
      
      const testEmail = {
        from: 'Gabriel Lacroix <gabriel@evergreenwebsolutions.ca>',
        to: 'greenalderson@gmail.com',
        subject: 'SendGrid Test Email',
        html: '<h1>SendGrid Test</h1><p>This is a test email to verify SendGrid is working.</p>',
        text: 'SendGrid Test - This is a test email to verify SendGrid is working.',
      };
      
      const response = await sgMail.send(testEmail);
      
      if (response && response.length > 0) {
        console.log('✅ SendGrid email sent successfully!');
        console.log('   Response:', response[0]);
      } else {
        console.log('❌ SendGrid email failed - no response');
      }
      
    } else {
      console.log('❌ SENDGRID_API_KEY not set');
    }
    
  } catch (error) {
    console.log('❌ SendGrid error:', error.message);
  }
}

testSendGridConfig()
  .catch(console.error);

