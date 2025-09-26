require('dotenv').config({ path: '.env.local' });
const sgMail = require('@sendgrid/mail');

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function generateRSVPConfirmationHTML(name, eventDetails) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>RSVP Confirmed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .event-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6b7280; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #10b981; margin-top: 0; }
        .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 RSVP Confirmed!</h1>
        <p>Thank you for registering for our AI event</p>
      </div>
      
      <div class="content">
        <h2>Hello ${name},</h2>
        
        <p>Great news! Your RSVP has been confirmed for our upcoming AI information session.</p>
        
        <div class="event-details">
          <h3>Event Details</h3>
          <p><strong>Date:</strong> ${eventDetails.date}</p>
          <p><strong>Time:</strong> ${eventDetails.time}</p>
          <p><strong>Location:</strong> ${eventDetails.location}</p>
          <p><strong>Address:</strong> ${eventDetails.address}</p>
        </div>
        
        <p>We're excited to share practical AI insights that can help your business grow. You'll learn about:</p>
        <ul>
          <li>Real-world AI applications for small businesses</li>
          <li>Cost-effective AI tools you can implement today</li>
          <li>How to measure AI success in your operations</li>
          <li>Networking with other local business owners</li>
        </ul>
        
        <p>If you have any questions or need to make changes to your RSVP, please don't hesitate to contact us.</p>
        
        <p>Looking forward to seeing you there!</p>
        
        <p>Best regards,<br>
        <strong>Gabriel Lacroix</strong><br>
        AI Solutions Specialist<br>
        Evergreen Web Solutions</p>
      </div>
      
      <div class="footer">
        <p>© 2025 Evergreen Web Solutions, Terrace BC</p>
        <p>If you no longer wish to receive these emails, <a href="mailto:unsubscribe@evergreenwebsolutions.ca">unsubscribe here</a>.</p>
      </div>
    </body>
    </html>
  `;
}

function generateRSVPConfirmationText(name, eventDetails) {
  return `
    RSVP Confirmed - AI in Northern BC Information Session
    
    Hello ${name},
    
    Great news! Your RSVP has been confirmed for our upcoming AI information session.
    
    Event Details:
    Date: ${eventDetails.date}
    Time: ${eventDetails.time}
    Location: ${eventDetails.location}
    Address: ${eventDetails.address}
    
    We're excited to share practical AI insights that can help your business grow. You'll learn about:
    - Real-world AI applications for small businesses
    - Cost-effective AI tools you can implement today
    - How to measure AI success in your operations
    - Networking with other local business owners
    
    If you have any questions or need to make changes to your RSVP, please don't hesitate to contact us.
    
    Looking forward to seeing you there!
    
    Best regards,
    Gabriel Lacroix
    AI Solutions Specialist
    Evergreen Web Solutions
    
    © 2025 Evergreen Web Solutions, Terrace BC
  `;
}

async function testRSVPConfirmation() {
  try {
    console.log('🧪 Testing RSVP Confirmation Email...');
    
    const eventDetails = {
      date: 'Thursday, October 23, 2025',
      time: '6:00 PM - 8:30 PM',
      location: 'Sunshine Inn Terrace — Jasmine Room',
      address: '4812 Hwy 16, Terrace, BC, Canada'
    };

    const msg = {
      to: 'greenalderson@gmail.com',
      from: {
        email: 'events@evergreenwebsolutions.ca',
        name: 'AI Events'
      },
      replyTo: 'gabriel@evergreenwebsolutions.ca',
      subject: 'RSVP Confirmed: AI in Northern BC - October 23, 2025',
      html: generateRSVPConfirmationHTML('Green Alderson', eventDetails),
      text: generateRSVPConfirmationText('Green Alderson', eventDetails),
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@evergreenwebsolutions.ca>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'X-Campaign-ID': 'ai-event-2025',
        'X-RSVP-ID': 'test-rsvp-12345',
        'X-Mailer': 'Evergreen Web Solutions RSVP System',
      },
      categories: ['rsvp-confirmation', 'ai-event-2025'],
      customArgs: {
        rsvp_id: 'test-rsvp-12345',
        event_type: 'rsvp-confirmation'
      }
    };

    const response = await sgMail.send(msg);
    
    console.log('✅ RSVP confirmation sent successfully!');
    console.log('📧 Message ID:', response[0].headers['x-message-id']);
    
  } catch (error) {
    console.error('❌ Error testing RSVP confirmation:', error);
    
    if (error.response?.body?.errors) {
      console.error('SendGrid API errors:', error.response.body.errors);
    }
  }
}

testRSVPConfirmation();
