import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.FROM_EMAIL || 'AI Events <events@evergreenwebsolutions.ca>',
  replyTo: process.env.REPLY_TO_EMAIL || 'gabriel@evergreenwebsolutions.ca',
  domain: process.env.RESEND_DOMAIN || 'evergreenwebsolutions.ca',
  bounceEmail: process.env.BOUNCE_EMAIL || 'bounces@evergreenwebsolutions.ca',
};

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Check if email domain is valid
export function isValidEmailDomain(email: string): boolean {
  const domain = email.split('@')[1];
  if (!domain) return false;
  
  // Common disposable email domains to block
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
    'mailinator.com', 'yopmail.com', 'temp-mail.org'
  ];
  
  return !disposableDomains.includes(domain.toLowerCase());
}

// Generate RSVP confirmation email HTML
function generateRSVPConfirmationHTML(name: string, eventDetails: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSVP Confirmed - AI in Northern BC</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <!-- Header -->
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">AI in Northern BC</h1>
      <p style="color: white; margin: 5px 0 0 0; font-size: 16px;">Information Session</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px 20px;">
      <h2 style="color: #1f2937; margin-top: 0;">RSVP Confirmed!</h2>
      <p style="color: #374151; font-size: 16px;">Hi ${name},</p>
      <p style="color: #374151; font-size: 16px;">Thank you for registering for our AI information session. Your seat has been reserved!</p>
      
      <!-- Event Details Card -->
      <div style="background-color: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #10b981; margin-top: 0; font-size: 18px;">📅 Event Details</h3>
        <p style="margin: 8px 0; color: #374151;"><strong>Date:</strong> Thursday, October 23, 2025</p>
        <p style="margin: 8px 0; color: #374151;"><strong>Time:</strong> 6:00 PM - 8:30 PM (Doors open at 6:00 PM)</p>
        <p style="margin: 8px 0; color: #374151;"><strong>Location:</strong> Sunshine Inn Terrace — Jasmine Room</p>
        <p style="margin: 8px 0; color: #374151;"><strong>Address:</strong> 4812 Hwy 16, Terrace, BC, Canada</p>
      </div>
      
      <!-- What to Expect -->
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #92400e; margin-top: 0; font-size: 18px;">🎯 What You'll Learn</h3>
        <ul style="color: #374151; padding-left: 20px;">
          <li>Real local examples of AI automation and machine learning</li>
          <li>Practical implementation strategies for Northern BC businesses</li>
          <li>Cost-effective AI solutions that actually work</li>
          <li>Networking with other business leaders implementing AI</li>
        </ul>
      </div>
      
      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.google.com/maps/search/?api=1&query=Sunshine+Inn+Terrace+4812+Hwy+16+Terrace+BC" 
           style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
          📍 Get Directions
        </a>
        <a href="https://rsvp.evergreenwebsolutions.ca/api/ics?title=AI%20in%20Northern%20BC&start=2025-10-23T18:00:00-07:00&end=2025-10-23T20:30:00-07:00&location=Sunshine%20Inn%20Terrace&desc=AI%20Information%20Session" 
           style="background-color: #374151; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
          📅 Add to Calendar
        </a>
      </div>
      
      <!-- Contact Info -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
        <p style="color: #374151; font-size: 16px;">Questions? Contact us:</p>
        <p style="color: #374151; margin: 5px 0;">
          <strong>Gabriel Lacroix</strong><br>
          Evergreen Web Solutions<br>
          <a href="mailto:gabriel@evergreenwebsolutions.ca" style="color: #10b981;">gabriel@evergreenwebsolutions.ca</a>
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280; margin: 5px 0;">
        <strong>Evergreen Web Solutions</strong><br>
        Terrace, BC, Canada<br>
        AI and Digital Strategy for Northern BC
      </p>
      <p style="font-size: 12px; color: #6b7280; margin: 15px 0 5px 0;">
        <a href="mailto:unsubscribe@evergreenwebsolutions.ca" style="color: #6b7280; text-decoration: none;">Unsubscribe</a> | 
        <a href="https://rsvp.evergreenwebsolutions.ca/privacy" style="color: #6b7280; text-decoration: none;">Privacy Policy</a> | 
        <a href="https://rsvp.evergreenwebsolutions.ca/conduct" style="color: #6b7280; text-decoration: none;">Code of Conduct</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Generate RSVP confirmation email text version
function generateRSVPConfirmationText(name: string, eventDetails: any): string {
  return `
RSVP Confirmed - AI in Northern BC Information Session

Hi ${name},

Thank you for registering for our AI information session. Your seat has been reserved!

EVENT DETAILS
Date: Thursday, October 23, 2025
Time: 6:00 PM - 8:30 PM (Doors open at 6:00 PM)
Location: Sunshine Inn Terrace — Jasmine Room
Address: 4812 Hwy 16, Terrace, BC, Canada

WHAT YOU'LL LEARN
• Real local examples of AI automation and machine learning
• Practical implementation strategies for Northern BC businesses
• Cost-effective AI solutions that actually work
• Networking with other business leaders implementing AI

GET DIRECTIONS
https://www.google.com/maps/search/?api=1&query=Sunshine+Inn+Terrace+4812+Hwy+16+Terrace+BC

ADD TO CALENDAR
https://rsvp.evergreenwebsolutions.ca/api/ics?title=AI%20in%20Northern%20BC&start=2025-10-23T18:00:00-07:00&end=2025-10-23T20:30:00-07:00

Questions? Contact us:
Gabriel Lacroix
Evergreen Web Solutions
gabriel@evergreenwebsolutions.ca

---
Evergreen Web Solutions
Terrace, BC, Canada
AI and Digital Strategy for Northern BC

Unsubscribe: mailto:unsubscribe@evergreenwebsolutions.ca
Privacy Policy: https://rsvp.evergreenwebsolutions.ca/privacy
  `;
}

// Send RSVP confirmation email
export async function sendRSVPConfirmation({
  to,
  name,
  rsvpId
}: {
  to: string;
  name: string;
  rsvpId: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Validate email
    if (!validateEmail(to)) {
      return { success: false, error: 'Invalid email address' };
    }

    if (!isValidEmailDomain(to)) {
      return { success: false, error: 'Email domain not allowed' };
    }

    const eventDetails = {
      date: 'Thursday, October 23, 2025',
      time: '6:00 PM - 8:30 PM',
      location: 'Sunshine Inn Terrace — Jasmine Room',
      address: '4812 Hwy 16, Terrace, BC, Canada'
    };

    const response = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [to],
      replyTo: EMAIL_CONFIG.replyTo,
      subject: `RSVP Confirmed: AI in Northern BC - October 23, 2025`,
      html: generateRSVPConfirmationHTML(name, eventDetails),
      text: generateRSVPConfirmationText(name, eventDetails),
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@evergreenwebsolutions.ca>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'X-Campaign-ID': 'ai-event-2025',
        'X-RSVP-ID': rsvpId,
        'X-Mailer': 'Evergreen Web Solutions RSVP System',
      },
      tags: [
        { name: 'type', value: 'rsvp-confirmation' },
        { name: 'event', value: 'ai-northern-bc-2025' },
        { name: 'rsvp-id', value: rsvpId }
      ]
    });

    return { 
      success: true, 
      messageId: response.data?.id 
    };

  } catch (error: any) {
    console.error('Email send failed:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send email' 
    };
  }
}

// Send event reminder email
export async function sendEventReminder({
  to,
  name,
  daysUntil
}: {
  to: string;
  name: string;
  daysUntil: number;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!validateEmail(to) || !isValidEmailDomain(to)) {
      return { success: false, error: 'Invalid email address' };
    }

    const subject = daysUntil === 1 
      ? 'Reminder: AI in Northern BC - Tomorrow!'
      : `Reminder: AI in Northern BC - ${daysUntil} days away`;

    const response = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [to],
      replyTo: EMAIL_CONFIG.replyTo,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Friendly Reminder</h2>
          <p>Hi ${name},</p>
          <p>Just a quick reminder that our AI in Northern BC information session is ${daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`}!</p>
          <p><strong>Date:</strong> Thursday, October 23, 2025<br>
          <strong>Time:</strong> 6:00 PM - 8:30 PM<br>
          <strong>Location:</strong> Sunshine Inn Terrace — Jasmine Room</p>
          <p>We're looking forward to seeing you there!</p>
          <p>Best regards,<br>Gabriel Lacroix</p>
        </div>
      `,
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@evergreenwebsolutions.ca>',
        'X-Campaign-ID': 'ai-event-reminder',
      },
      tags: [
        { name: 'type', value: 'event-reminder' },
        { name: 'days-until', value: daysUntil.toString() }
      ]
    });

    return { success: true, messageId: response.data?.id };

  } catch (error: any) {
    console.error('Reminder email failed:', error);
    return { success: false, error: error.message || 'Failed to send reminder' };
  }
}

// Handle email bounces and complaints
export async function handleEmailWebhook({
  type,
  data
}: {
  type: 'email.bounced' | 'email.complained' | 'email.delivered' | 'email.opened' | 'email.clicked';
  data: any;
}) {
  try {
    // Log the event
    console.log(`Email webhook: ${type}`, data);

    // Handle bounces
    if (type === 'email.bounced') {
      // Add email to suppression list
      // Update database to mark email as bounced
      console.log('Email bounced:', data.email);
    }

    // Handle complaints
    if (type === 'email.complained') {
      // Add email to suppression list immediately
      console.log('Spam complaint:', data.email);
    }

    // Handle engagement tracking
    if (['email.delivered', 'email.opened', 'email.clicked'].includes(type)) {
      // Update engagement metrics in database
      console.log('Email engagement:', type, data.email);
    }

  } catch (error) {
    console.error('Webhook handling failed:', error);
  }
}

// Test email configuration
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return false;
    }

    // Test with a simple email
    const response = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: ['test@example.com'],
      subject: 'Test Email Configuration',
      html: '<p>This is a test email to verify configuration.</p>',
    });

    console.log('Email configuration test successful:', response.data?.id);
    return true;

  } catch (error: any) {
    console.error('Email configuration test failed:', error.message);
    return false;
  }
}
