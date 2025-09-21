// Global email template with consistent styling
export async function generateEmailHTML(content: {
  subject?: string;
  greeting?: string;
  body: string;
  ctaText?: string;
  ctaLink?: string;
  footer?: string;
  inviteToken?: string;
  businessName?: string;
  businessId?: string;
}) {
  const {
    subject = '',
    greeting = 'Hi there,',
    body,
    ctaText = 'View details & RSVP',
    ctaLink = '#',
    footer = 'Looking forward to seeing you,<br />Gabriel Lacroix<br />Evergreen Web Solutions',
    inviteToken,
    businessName = 'Valued Customer',
    businessId = ''
  } = content;

  // Get global template from API
  let globalTemplate = '';
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/global-template`);
    if (response.ok) {
      const data = await response.json();
      globalTemplate = data.html;
    }
  } catch (error) {
    console.error('Failed to fetch global template:', error);
  }

  // Fallback to default template if API fails
  if (!globalTemplate) {
    globalTemplate = getDefaultTemplate();
  }

  // Add tracking pixel if inviteToken is provided
  const trackingPixel = inviteToken 
    ? `<img src="/api/__pixel?token=${inviteToken}&eid=biz_${inviteToken}" width="1" height="1" style="display:none;" />`
    : '';

  // Replace variables in global template
  const finalHTML = globalTemplate
    .replace(/\{\{subject\}\}/g, subject)
    .replace(/\{\{greeting_title\}\}/g, 'Welcome to Evergreen AI!')
    .replace(/\{\{greeting_message\}\}/g, greeting || 'Thank you for your interest in our upcoming informational session about practical AI tools for Northern BC businesses.')
    .replace(/\{\{signature_name\}\}/g, 'Gabriel Lacroix')
    .replace(/\{\{signature_title\}\}/g, 'AI Solutions Specialist')
    .replace(/\{\{signature_company\}\}/g, 'Evergreen Web Solutions')
    .replace(/\{\{signature_location\}\}/g, 'Terrace, BC')
    .replace(/\{\{main_content_title\}\}/g, 'What You\'ll Learn')
    .replace(/\{\{main_content_body\}\}/g, body) // This should be the individual template's htmlBody content
    .replace(/\{\{button_text\}\}/g, ctaText)
    .replace(/\{\{button_link\}\}/g, ctaLink)
    .replace(/\{\{additional_info_title\}\}/g, 'Event Details')
    .replace(/\{\{additional_info_body\}\}/g, 'Date: October 23rd, 2025<br>Time: 6:00 PM - 8:00 PM<br>Location: Terrace, BC<br>Cost: Free (includes coffee & refreshments)<br>Networking: Yes')
    .replace(/\{\{closing_title\}\}/g, 'Looking Forward')
    .replace(/\{\{closing_message\}\}/g, 'We\'re excited to share these practical AI solutions with you and help your business grow.')
    .replace(/\{\{closing_signature\}\}/g, 'Gabriel Lacroix<br>Evergreen Web Solutions<br>Terrace, BC')
    .replace(/\{\{business_name\}\}/g, businessName)
    .replace(/\{\{business_id\}\}/g, businessId)
    .replace(/\{\{invite_link\}\}/g, ctaLink)
    .replace(/\{\{unsubscribe_link\}\}/g, `/unsubscribe?token=${inviteToken || ''}`);

  // Add tracking pixel to the end
  return finalHTML + trackingPixel;
}

// Fallback default template
function getDefaultTemplate() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f8f8f8;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(to right, #10b981, #059669);
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px;
            color: #374151;
        }
        .content p {
            margin-bottom: 15px;
            color: #374151;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background-color: #10b981;
            color: #ffffff;
            padding: 12px 25px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
        }
        .footer {
            background-color: #f1f1f1;
            color: #6b7280;
            padding: 20px 30px;
            font-size: 12px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer a {
            color: #10b981;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Evergreen AI Seminar</h1>
        </div>
        <div class="content">
            {{content}}
            <div class="button-container">
                <a href="{{button_link}}" class="button">{{button_text}}</a>
            </div>
            <p>Looking forward to seeing you,</p>
            <p>Gabriel Lacroix<br>Evergreen Web Solutions</p>
        </div>
        <div class="footer">
            <p>You are receiving this email because you are a valued business in Northern BC.</p>
            <p>&copy; 2025 Evergreen Web Solutions. All rights reserved.</p>
            <p><a href="{{unsubscribe_link}}">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`;
}

// Generate plain text version
export function generateEmailText(content: {
  greeting?: string;
  body: string;
  ctaText?: string;
  ctaLink?: string;
  footer?: string;
}) {
  const {
    greeting = 'Hi there,',
    body,
    ctaText = 'View details & RSVP',
    ctaLink = '#',
    footer = 'Looking forward to seeing you,\nGabriel Lacroix\nEvergreen Web Solutions'
  } = content;

  const ctaSection = ctaLink !== '#' ? `\n\n${ctaText}: ${ctaLink}` : '';

  return `${greeting}

${body}${ctaSection}

---
${footer}

---
Unsubscribe: /unsubscribe
Contact: gabriel@evergreenwebsolutions.ca`.trim();
}

// Helper function to convert HTML content to plain text
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}
