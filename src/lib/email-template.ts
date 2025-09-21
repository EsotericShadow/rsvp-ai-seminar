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
  // New template variables
  greeting_title?: string;
  greeting_message?: string;
  signature_name?: string;
  signature_title?: string;
  signature_company?: string;
  signature_location?: string;
  main_content_title?: string;
  additional_info_title?: string;
  additional_info_body?: string;
  closing_title?: string;
  closing_message?: string;
  // Global template variables
  global_hero_title?: string;
  global_hero_message?: string;
  global_signature_name?: string;
  global_signature_title?: string;
  global_signature_company?: string;
  global_signature_location?: string;
  global_event_title?: string;
  global_event_date?: string;
  global_event_time?: string;
  global_event_location?: string;
  global_event_cost?: string;
  global_event_includes?: string;
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
    businessId = '',
    // New template variables with defaults
    greeting_title = '',
    greeting_message = '',
    signature_name = 'Gabriel Lacroix',
    signature_title = 'AI Solutions Specialist',
    signature_company = 'Evergreen Web Solutions',
    signature_location = 'Terrace, BC',
    main_content_title = '',
    additional_info_title = '',
    additional_info_body = '',
    closing_title = '',
    closing_message = '',
    // Global template variables with defaults
    global_hero_title = 'Welcome to Evergreen AI',
    global_hero_message = 'Thank you for your interest in our upcoming informational session about practical AI tools for Northern BC businesses.',
    global_signature_name = 'Gabriel Lacroix',
    global_signature_title = 'AI Solutions Specialist',
    global_signature_company = 'Evergreen Web Solutions',
    global_signature_location = 'Terrace, BC',
    global_event_title = 'Event Details',
    global_event_date = 'October 23rd, 2025',
    global_event_time = '6:00 PM - 8:00 PM',
    global_event_location = 'Terrace, BC',
    global_event_cost = 'Free',
    global_event_includes = 'Coffee, refreshments, networking, and actionable AI insights'
  } = content;

  // Get global template from API
  let globalTemplate = '';
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    const response = await fetch(`${baseUrl}/api/admin/global-template`);
    if (response.ok) {
      const data = await response.json();
      globalTemplate = data.html;
    } else {
      console.error('Failed to fetch global template, status:', response.status);
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
    .replace(/\{\{greeting_title\}\}/g, greeting_title)
    .replace(/\{\{greeting_message\}\}/g, greeting_message)
    .replace(/\{\{signature_name\}\}/g, signature_name)
    .replace(/\{\{signature_title\}\}/g, signature_title)
    .replace(/\{\{signature_company\}\}/g, signature_company)
    .replace(/\{\{signature_location\}\}/g, signature_location)
    .replace(/\{\{main_content_title\}\}/g, main_content_title)
    .replace(/\{\{main_content_body\}\}/g, body)
    .replace(/\{\{button_text\}\}/g, ctaText)
    .replace(/\{\{button_link\}\}/g, ctaLink)
    .replace(/\{\{additional_info_title\}\}/g, additional_info_title)
    .replace(/\{\{additional_info_body\}\}/g, additional_info_body)
    .replace(/\{\{closing_title\}\}/g, closing_title)
    .replace(/\{\{closing_message\}\}/g, closing_message)
    .replace(/\{\{business_name\}\}/g, businessName)
    .replace(/\{\{business_id\}\}/g, businessId)
    .replace(/\{\{invite_link\}\}/g, ctaLink)
    .replace(/\{\{unsubscribe_link\}\}/g, `/unsubscribe?token=${inviteToken || ''}`)
    // Global template variables
    .replace(/\{\{global_hero_title\}\}/g, global_hero_title)
    .replace(/\{\{global_hero_message\}\}/g, global_hero_message)
    .replace(/\{\{global_signature_name\}\}/g, global_signature_name)
    .replace(/\{\{global_signature_title\}\}/g, global_signature_title)
    .replace(/\{\{global_signature_company\}\}/g, global_signature_company)
    .replace(/\{\{global_signature_location\}\}/g, global_signature_location)
    .replace(/\{\{global_event_title\}\}/g, global_event_title)
    .replace(/\{\{global_event_date\}\}/g, global_event_date)
    .replace(/\{\{global_event_time\}\}/g, global_event_time)
    .replace(/\{\{global_event_location\}\}/g, global_event_location)
    .replace(/\{\{global_event_cost\}\}/g, global_event_cost)
    .replace(/\{\{global_event_includes\}\}/g, global_event_includes);

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
