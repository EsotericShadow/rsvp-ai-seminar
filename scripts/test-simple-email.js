const { Resend } = require('resend');

async function testSimpleEmail() {
  console.log('🔍 Testing simple email sending...');
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  // Test with a simple email first
  console.log('📤 Sending simple test email...');
  
  try {
    const emailResponse = await resend.emails.send({
      from: 'Gabriel Lacroix <gabriel@evergreenwebsolutions.ca>',
      to: ['greenalderson@gmail.com'], // Your email
      subject: 'Simple Test Email',
      html: '<h1>Test Email</h1><p>This is a simple test email to verify Resend is working.</p>',
      text: 'Test Email - This is a simple test email to verify Resend is working.',
    });
    
    if (emailResponse.error) {
      console.log('❌ Resend error:', emailResponse.error);
    } else {
      console.log('✅ Simple email sent successfully!');
      console.log('Response:', emailResponse.data);
    }
    
  } catch (error) {
    console.log('❌ Email sending failed:', error.message);
  }
  
  // Test with tracking link
  console.log('\n📤 Testing email with tracking link...');
  
  try {
    const trackingLink = 'https://rsvp.evergreenwebsolutions.ca/?eid=biz_test-token-test-green-alderson-1758828765084';
    
    const emailResponse = await resend.emails.send({
      from: 'Gabriel Lacroix <gabriel@evergreenwebsolutions.ca>',
      to: ['greenalderson@gmail.com'], // Your email
      subject: 'Test Email with Tracking Link',
      html: `
        <h1>Test Email with Tracking</h1>
        <p>Hello Green Alderson,</p>
        <p>This is a test email with a tracking link.</p>
        <p><a href="${trackingLink}">Click here to RSVP</a></p>
        <p>Best regards,<br>The Test Team</p>
      `,
      text: `
        Test Email with Tracking
        
        Hello Green Alderson,
        
        This is a test email with a tracking link.
        
        Click here to RSVP: ${trackingLink}
        
        Best regards,
        The Test Team
      `,
    });
    
    if (emailResponse.error) {
      console.log('❌ Resend error with tracking link:', emailResponse.error);
    } else {
      console.log('✅ Email with tracking link sent successfully!');
      console.log('Response:', emailResponse.data);
    }
    
  } catch (error) {
    console.log('❌ Email with tracking link failed:', error.message);
  }
}

testSimpleEmail()
  .catch(console.error);
