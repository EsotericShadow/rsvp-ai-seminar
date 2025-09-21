// Global email template with consistent styling
export function generateEmailHTML(content: {
  subject?: string;
  greeting?: string;
  body: string;
  ctaText?: string;
  ctaLink?: string;
  footer?: string;
  inviteToken?: string;
}) {
  const {
    subject = '',
    greeting = 'Hi there,',
    body,
    ctaText = 'View details & RSVP',
    ctaLink = '#',
    footer = 'Looking forward to seeing you,<br />Gabriel Lacroix<br />Evergreen Web Solutions',
    inviteToken
  } = content;

  // Add tracking pixel if inviteToken is provided
  const trackingPixel = inviteToken 
    ? `<img src="/api/__pixel?token=${inviteToken}&eid=biz_${inviteToken}" width="1" height="1" style="display:none;" />`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #374151;
      background-color: #f9fafb;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
      color: #111827;
    }
    .body {
      font-size: 15px;
      color: #374151;
      margin-bottom: 24px;
    }
    .body p {
      margin: 0 0 16px 0;
    }
    .body p:last-child {
      margin-bottom: 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 15px;
      text-align: center;
      margin: 16px 0;
      transition: all 0.2s ease;
    }
    .cta-button:hover {
      background: linear-gradient(135deg, #047857 0%, #065f46 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
    }
    .footer {
      padding: 24px;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
    .footer p {
      margin: 0;
    }
    .unsubscribe {
      margin-top: 16px;
      font-size: 12px;
    }
    .unsubscribe a {
      color: #6b7280;
      text-decoration: none;
    }
    .unsubscribe a:hover {
      color: #374151;
    }
    @media (max-width: 600px) {
      .email-container {
        margin: 0;
        border-radius: 0;
      }
      .header, .content, .footer {
        padding: 24px 16px;
      }
      .header h1 {
        font-size: 20px;
      }
      .cta-button {
        display: block;
        text-align: center;
        margin: 20px 0;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Evergreen AI Seminar</h1>
      <p>Practical AI Tools for Northern BC Businesses</p>
    </div>
    
    <div class="content">
      <div class="greeting">${greeting}</div>
      
      <div class="body">
        ${body}
      </div>
      
      ${ctaLink !== '#' ? `<a href="${ctaLink}" class="cta-button">${ctaText}</a>` : ''}
    </div>
    
    <div class="footer">
      <p>${footer}</p>
      <div class="unsubscribe">
        <a href="/unsubscribe">Unsubscribe</a> | 
        <a href="mailto:gabriel@evergreenwebsolutions.ca">Contact Us</a>
      </div>
    </div>
  </div>
  
  ${trackingPixel}
</body>
</html>`.trim();
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
