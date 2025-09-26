import sgMail from '@sendgrid/mail';
import { z } from 'zod';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.FROM_EMAIL || 'AI Events <events@evergreenwebsolutions.ca>',
  replyTo: process.env.REPLY_TO_EMAIL || 'gabriel@evergreenwebsolutions.ca',
  domain: process.env.SENDGRID_DOMAIN || 'evergreenwebsolutions.ca',
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'https://rsvp.evergreenwebsolutions.ca';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>RSVP Confirmed - AI in Northern BC</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <style>
        /* Reset & base */
        html,body{margin:0;padding:0;width:100% !important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
        body{background:#f0fdf4;font-family:'Inter',system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#222;}
        img{display:block;border:0;outline:none;text-decoration:none;}
        a{color:#10b981;text-decoration:none;}
        
        /* Wrapper */
        .evergreen-wrapper{width:100%;max-width:640px;margin:40px auto;box-sizing:border-box;padding:0;}
        .evergreen-table{width:100%;border-collapse:collapse;box-shadow:0 20px 48px rgba(16,185,129,0.15);border-radius:12px;overflow:hidden;background:#fff;}
        
        /* Typography */
        h1,h2,h3,h4,p{margin:0 0 12px 0;padding:0;line-height:1.3;}
        h1{font-size:28px;color:#10b981;font-weight:700;}
        h2{font-size:20px;color:#047857;font-weight:600;}
        h3{font-size:18px;color:#047857;font-weight:600;}
        p{font-size:16px;color:#374151;margin-bottom:12px;}
        
        /* Header / logo */
        .evergreen-header{padding:24px;text-align:center;}
        .evergreen-logo{max-width:240px;height:auto;margin:8px auto;display:block;}
        
        /* HERO nested table */
        .hero-inner{width:100%;border-radius:8px;overflow:hidden;}
        .hero-left{width:8px;background:#10b981;vertical-align:top;}
        .hero-right{vertical-align:middle;padding:18px 16px;background-color:#e6f9ef; /* fallback */ background-color:rgba(16,185,129,0.06); border-radius:0 8px 8px 0;}
        .hero-title{font-size:20px;color:#065f46;font-weight:700;margin-bottom:6px;}
        .hero-sub{font-size:14px;color:#065f46;margin:0;}
        
        /* Content blocks */
        .content-cell{padding:18px 24px;}
        .evergreen-signature{background:#f0fdf4;padding:14px;border-radius:8px;border-left:4px solid #10b981;margin:14px 0;}
        .btn{display:inline-block;padding:12px 28px;border-radius:10px;font-weight:700;color:#fff !important;background:linear-gradient(135deg,#10b981 0%,#059669 100%);text-decoration:none;box-shadow:0 4px 14px rgba(16,185,129,0.3);}
        
        /* Event details section */
        .event-details{background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;margin:14px 0;}
        .event-details h3{color:#1e293b;margin-bottom:8px;}
        .event-details p{margin-bottom:4px;color:#475569;}
        
        /* Divider & footer */
        .divider{border-top:1px solid #f0fdf4;margin:16px 0;}
        .footer{padding:12px 24px 28px 24px;text-align:center;color:#6b7280;font-size:13px;}
        .social-link{display:inline-block;margin:6px 10px;text-decoration:none;color:#065f46;font-weight:600;}
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
        
        @media (max-width:480px){
            h1{font-size:22px;}
            .hero-title{font-size:18px;}
            .content-cell{padding:12px 16px;}
            .evergreen-wrapper{margin:16px auto;}
            .social-link{display:block;padding:8px 0;}
        }
    </style>
</head>
<body>
    <div class="evergreen-wrapper">
        <table class="evergreen-table" role="presentation" cellpadding="0" cellspacing="0" aria-hidden="false">
            <tbody>
                <!-- Header -->
                <tr>
                    <td class="evergreen-header" style="padding-top:22px;padding-bottom:8px;">
                        <h1 style="margin-bottom:6px;">RSVP Confirmed - AI in Northern BC</h1>
                        <img src="https://www.evergreenwebsolutions.ca/_next/image?url=%2Flogo.png&w=640&q=75" alt="Evergreen Web Solutions" class="evergreen-logo" style="max-width:240px;height:auto;" />
                    </td>
                </tr>
                
                <!-- HERO (vertical bar + translucent fill) -->
                <tr>
                    <td style="padding:0 24px 0 24px;">
                        <table class="hero-inner" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                            <tr>
                                <td class="hero-left" width="8" style="background:#10b981;"></td>
                                <td class="hero-right" style="background-color:#e6f9ef; background-color:rgba(16,185,129,0.06);">
                                    <div>
                                        <div class="hero-title">🎉 You&apos;re All Set!</div>
                                        <p class="hero-sub">Thank you for registering for our AI information session</p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                
                <!-- Greeting -->
                <tr>
                    <td class="content-cell">
                        <h2 style="margin-top:0;">Hello ${name},</h2>
                        <p style="margin-top:6px;margin-bottom:12px;">Great news! Your RSVP has been confirmed for our upcoming AI information session. We&apos;re excited to share practical AI insights that can help your business grow.</p>
                    </td>
                </tr>
                
                <!-- Event Details -->
                <tr>
                    <td class="content-cell">
                        <div class="event-details">
                            <h3>📅 Event Details</h3>
                            <p><strong>Date:</strong> Thursday, October 23, 2025</p>
                            <p><strong>Time:</strong> 5:00 PM - 7:00 PM</p>
                            <p><strong>Location:</strong> Sunshine Inn Terrace — Jasmine Room</p>
                            <p><strong>Address:</strong> 4812 Hwy 16, Terrace, BC, Canada</p>
                            <p><strong>Cost:</strong> Completely FREE</p>
                            <p><strong>Includes:</strong> Coffee, refreshments, networking, and actionable AI insights</p>
                        </div>
                    </td>
                </tr>
                
                <!-- What You'll Learn -->
                <tr>
                    <td class="content-cell">
                        <h3 style="margin-top:0;">🎯 What You&apos;ll Learn</h3>
                        <p>At this session, you&apos;ll discover:</p>
                        <ul style="color:#374151; padding-left:20px;">
                            <li>Real-world AI applications for small businesses</li>
                            <li>Cost-effective AI tools you can implement today</li>
                            <li>How to measure AI success in your operations</li>
                            <li>Networking with other local business owners</li>
                        </ul>
                    </td>
                </tr>
                
                <!-- Action Buttons -->
                <tr>
                    <td class="content-cell" style="text-align:center;padding-bottom:12px;">
                        <a href="https://www.google.com/maps/search/?api=1&query=Sunshine+Inn+Terrace+4812+Hwy+16+Terrace+BC" target="_blank" class="btn" style="display:inline-block;margin:5px;">📍 Get Directions</a>
                        <a href="https://rsvp.evergreenwebsolutions.ca/api/ics?title=AI%20in%20Northern%20BC&start=2025-10-23T17:00:00-07:00&end=2025-10-23T19:00:00-07:00&location=Sunshine%20Inn%20Terrace&desc=AI%20Information%20Session" target="_blank" class="btn" style="display:inline-block;margin:5px;">📅 Add to Calendar</a>
                    </td>
                </tr>
                
                <!-- Signature block -->
                <tr>
                    <td class="content-cell">
                        <div class="evergreen-signature">
                            <p style="margin:0;"><strong>Gabriel Lacroix</strong><br>
                            AI Solutions Specialist<br>
                            Evergreen Web Solutions<br>
                            Terrace, BC</p>
                        </div>
                    </td>
                </tr>
                
                <!-- Closing -->
                <tr>
                    <td class="content-cell">
                        <h3 style="margin-top:0;">Questions?</h3>
                        <p style="margin-bottom:6px;">If you have any questions or need to make changes to your RSVP, please don&apos;t hesitate to contact us at <a href="mailto:gabriel@evergreenwebsolutions.ca">gabriel@evergreenwebsolutions.ca</a>. We&apos;re looking forward to seeing you there!</p>
                    </td>
                </tr>
                
                <!-- Divider and footer with unsubscribe (VISIBLE) -->
                <tr>
                    <td style="padding:12px 24px 18px 24px;">
                        <div class="divider"></div>
                        <div class="footer" role="contentinfo" aria-label="Footer">
                            <div style="margin-bottom:8px;">© 2025 Gabriel Lacroix - Evergreen Web Solutions, Terrace BC</div>
                            
                            <!-- Social links: LinkedIn / Facebook / X (label + icon) -->
                            <div style="margin-bottom:12px; text-align:center;">
                                <!-- LinkedIn -->
                                <a href="https://www.linkedin.com/in/gabriel-marko-6b7aaa357/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="LinkedIn – opens in a new tab">
                                    <img src="${baseUrl}/linkedin-logo.webp" alt="LinkedIn" style="width:48px;height:48px;display:block;" />
                                </a>
                                
                                <!-- Facebook -->
                                <a href="https://www.facebook.com/share/14Exmoytvrs/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook – opens in a new tab">
                                    <img src="${baseUrl}/facebook-logo.webp" alt="Facebook" style="width:48px;height:48px;display:block;" />
                                </a>
                                
                                <!-- X (Twitter) -->
                                <a href="https://x.com/Evergreenweb3D" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="X (Twitter) – opens in a new tab">
                                    <img src="${baseUrl}/twitter-logo.webp" alt="X (Twitter)" style="width:48px;height:48px;display:block;" />
                                </a>
                            </div>
                            
                            <!-- Visible unsubscribe text (required & obvious) -->
                            <div style="font-size:13px;color:#6b7280;">
                                If you no longer wish to receive these emails, <a href="mailto:unsubscribe@evergreenwebsolutions.ca" style="color:#065f46;font-weight:600;" target="_blank" rel="noopener noreferrer">unsubscribe here</a>.
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
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

// Send RSVP confirmation email using SendGrid
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

    const msg = {
      to: [to],
      from: {
        email: 'events@evergreenwebsolutions.ca',
        name: 'AI Events'
      },
      replyTo: 'gabriel@evergreenwebsolutions.ca',
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
      categories: ['rsvp-confirmation', 'ai-event-2025'],
      customArgs: {
        rsvp_id: rsvpId,
        event_type: 'rsvp-confirmation'
      }
    };

    const response = await sgMail.send(msg);
    
    return { 
      success: true, 
      messageId: response[0].headers['x-message-id'] as string
    };

  } catch (error: any) {
    console.error('SendGrid email send failed:', error);
    
    // Handle specific SendGrid errors
    if (error.response?.body?.errors) {
      const sendGridError = error.response.body.errors[0];
      return { 
        success: false, 
        error: `SendGrid error: ${sendGridError.message}` 
      };
    }
    
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

    const msg = {
      to: [to],
      from: {
        email: 'events@evergreenwebsolutions.ca',
        name: 'AI Events'
      },
      replyTo: 'gabriel@evergreenwebsolutions.ca',
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
      categories: ['event-reminder'],
      customArgs: {
        reminder_type: 'event-reminder',
        days_until: daysUntil.toString()
      }
    };

    const response = await sgMail.send(msg);
    return { success: true, messageId: response[0].headers['x-message-id'] as string };

  } catch (error: any) {
    console.error('Reminder email failed:', error);
    return { success: false, error: error.message || 'Failed to send reminder' };
  }
}

// Handle SendGrid webhooks
export async function handleSendGridWebhook({
  type,
  data
}: {
  type: 'bounce' | 'blocked' | 'dropped' | 'delivered' | 'open' | 'click' | 'spam_report' | 'unsubscribe';
  data: any;
}) {
  try {
    console.log(`SendGrid webhook: ${type}`, data);

    // Handle different event types
    switch (type) {
      case 'bounce':
      case 'blocked':
      case 'dropped':
        // Add email to suppression list
        console.log('Email delivery failed:', data.email);
        break;
        
      case 'spam_report':
        // Handle spam complaints
        console.log('Spam complaint:', data.email);
        break;
        
      case 'delivered':
      case 'open':
      case 'click':
        // Track engagement
        console.log('Email engagement:', type, data.email);
        break;
        
      case 'unsubscribe':
        // Handle unsubscribes
        console.log('Unsubscribe:', data.email);
        break;
    }

  } catch (error) {
    console.error('SendGrid webhook handling failed:', error);
  }
}

// Test SendGrid configuration
export async function testSendGridConfiguration(): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not configured');
      return false;
    }

    // Test with a simple email
    const msg = {
      to: 'test@example.com',
      from: {
        email: 'events@evergreenwebsolutions.ca',
        name: 'AI Events'
      },
      subject: 'Test Email Configuration',
      html: '<p>This is a test email to verify SendGrid configuration.</p>',
      text: 'This is a test email to verify SendGrid configuration.',
    };

    await sgMail.send(msg);
    console.log('SendGrid configuration test successful');
    return true;

  } catch (error: any) {
    console.error('SendGrid configuration test failed:', error.message);
    return false;
  }
}
