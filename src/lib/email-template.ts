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
  // Get base URL for images and links
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'https://rsvp.evergreenwebsolutions.ca';
  
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

  // Get global template directly from database
  let globalTemplate = '';
  try {
    // Import prisma dynamically to avoid issues
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const globalTemplateData = await prisma.globalHTMLTemplate.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    
    if (globalTemplateData) {
      globalTemplate = globalTemplateData.html;
      console.log('Global template loaded from database successfully, length:', globalTemplate.length);
      console.log('Has evergreen-logo.png:', globalTemplate.includes('evergreen-logo.png'));
      console.log('Has {{base_url}}:', globalTemplate.includes('{{base_url}}'));
    } else {
      console.log('No active global template found in database');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Failed to load global template from database:', error);
  }

  // Fallback to default template if database fails
  if (!globalTemplate) {
    console.log('Using fallback template');
    globalTemplate = getDefaultTemplate();
  }

  // Add tracking pixel if inviteToken is provided
  const trackingPixel = inviteToken 
    ? `<img src="/api/__pixel?token=${inviteToken}&eid=biz_${inviteToken}" width="1" height="1" style="display:none;" />`
    : '';

  // Replace variables in global template using proper regex escaping
  const replacements = {
    '{{subject}}': subject,
    '{{greeting_title}}': greeting_title,
    '{{greeting_message}}': greeting_message,
    '{{signature_name}}': signature_name,
    '{{signature_title}}': signature_title,
    '{{signature_company}}': signature_company,
    '{{signature_location}}': signature_location,
    '{{main_content_title}}': main_content_title,
    '{{main_content_body}}': body,
    '{{button_text}}': ctaText,
    '{{button_link}}': ctaLink,
    '{{additional_info_title}}': additional_info_title,
    '{{additional_info_body}}': additional_info_body,
    '{{closing_title}}': closing_title,
    '{{closing_message}}': closing_message,
    '{{business_name}}': businessName,
    '{{business_id}}': businessId,
    '{{invite_token}}': inviteToken || '',
    '{{invite_link}}': ctaLink,
    '{{unsubscribe_link}}': `/unsubscribe?token=${inviteToken || ''}`,
    '{{base_url}}': baseUrl,
    // Global template variables
    '{{global_hero_title}}': global_hero_title,
    '{{global_hero_message}}': global_hero_message,
    '{{global_signature_name}}': global_signature_name,
    '{{global_signature_title}}': global_signature_title,
    '{{global_signature_company}}': global_signature_company,
    '{{global_signature_location}}': global_signature_location,
    '{{global_event_title}}': global_event_title,
    '{{global_event_date}}': global_event_date,
    '{{global_event_time}}': global_event_time,
    '{{global_event_location}}': global_event_location,
    '{{global_event_cost}}': global_event_cost,
    '{{global_event_includes}}': global_event_includes,
  };

  let finalHTML = globalTemplate;
  
  // Apply replacements with proper regex escaping
  for (const [placeholder, value] of Object.entries(replacements)) {
    const escapedPlaceholder = placeholder.replace(/[{}]/g, '\\$&');
    finalHTML = finalHTML.replace(new RegExp(escapedPlaceholder, 'g'), value);
  }
  
  // Add tracking pixel
  finalHTML = finalHTML.replace('</body>', `${trackingPixel}</body>`);
  
  return finalHTML;
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
