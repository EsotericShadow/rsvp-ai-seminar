require('dotenv').config({ path: '.env.local' });
const sgMail = require('@sendgrid/mail');

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function testSendGridConfirmation() {
  try {
    console.log('🔑 SendGrid API Key:', process.env.SENDGRID_API_KEY ? 'Set' : 'Missing');
    console.log('📧 From Email:', process.env.FROM_EMAIL);
    console.log('🌐 Domain:', process.env.SENDGRID_DOMAIN);

    const msg = {
      to: 'greenalderson@gmail.com',
      from: {
        email: 'events@evergreenwebsolutions.ca',
        name: 'AI Events'
      },
      replyTo: 'gabriel@evergreenwebsolutions.ca',
      subject: 'Test RSVP Confirmation Email',
      html: `
        <h1>Test RSVP Confirmation</h1>
        <p>Hello Green,</p>
        <p>This is a test email to verify SendGrid is working for RSVP confirmations.</p>
        <p><strong>Event Details:</strong></p>
        <ul>
          <li>Date: Thursday, October 23, 2025</li>
          <li>Time: 6:00 PM - 8:30 PM</li>
          <li>Location: Sunshine Inn Terrace — Jasmine Room</li>
          <li>Address: 4812 Hwy 16, Terrace, BC, Canada</li>
        </ul>
        <p>If you receive this email, SendGrid is working correctly!</p>
        <p>Best regards,<br>Gabriel Lacroix</p>
      `,
      text: `
        Test RSVP Confirmation
        
        Hello Green,
        
        This is a test email to verify SendGrid is working for RSVP confirmations.
        
        Event Details:
        - Date: Thursday, October 23, 2025
        - Time: 6:00 PM - 8:30 PM
        - Location: Sunshine Inn Terrace — Jasmine Room
        - Address: 4812 Hwy 16, Terrace, BC, Canada
        
        If you receive this email, SendGrid is working correctly!
        
        Best regards,
        Gabriel Lacroix
      `,
      headers: {
        'X-Campaign-ID': 'test-rsvp-confirmation',
        'X-Mailer': 'Evergreen Web Solutions RSVP System',
      },
      categories: ['test-rsvp-confirmation'],
      customArgs: {
        test_type: 'rsvp-confirmation'
      }
    };

    console.log('📤 Sending test email...');
    const response = await sgMail.send(msg);
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', response[0].headers['x-message-id']);
    
  } catch (error) {
    console.error('❌ SendGrid error:', error);
    
    if (error.response?.body?.errors) {
      console.error('SendGrid API errors:', error.response.body.errors);
    }
  }
}

testSendGridConfirmation();
