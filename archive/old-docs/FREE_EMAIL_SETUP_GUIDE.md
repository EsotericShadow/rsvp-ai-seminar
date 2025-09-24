# Free Custom Domain Email Setup Guide

## 🎯 Best Free Options for Custom Domain Email

### 1. **Zoho Mail (RECOMMENDED)**
**Free Plan**: Up to 5 users, 5GB storage each
- ✅ **Full custom domain support** (events@evergreenwebsolutions.ca)
- ✅ **Professional webmail interface**
- ✅ **Mobile apps available**
- ✅ **IMAP/POP3 support** (for email clients)
- ✅ **Spam protection built-in**
- ✅ **Calendar and contacts included**

**Setup Steps**:
1. Go to [Zoho Mail](https://www.zoho.com/mail/)
2. Sign up with your domain
3. Verify domain ownership
4. Create email addresses: `events@evergreenwebsolutions.ca`, `gabriel@evergreenwebsolutions.ca`
5. Configure DNS records (they provide instructions)

### 2. **Yandex Mail (Alternative)**
**Free Plan**: Up to 1,000 mailboxes, 10GB each
- ✅ **More storage per mailbox**
- ✅ **Full custom domain support**
- ❌ **Interface mostly in Russian**
- ❌ **May have privacy concerns**

### 3. **Your Hosting Provider (If Applicable)**
If you have web hosting, check if they include email:
- Most hosting providers offer 5-50 free email accounts
- Usually includes webmail interface
- May have better integration with your website

## 🚀 **Recommended Setup: Zoho Mail + Resend**

### Why This Combination Works Best:
1. **Zoho Mail**: For receiving emails and professional communication
2. **Resend**: For sending transactional emails (RSVP confirmations, etc.)
3. **Best of both worlds**: Professional receiving + high deliverability sending

### Email Addresses to Create:
```
events@evergreenwebsolutions.ca     # Main event communications
gabriel@evergreenwebsolutions.ca    # Personal business email
noreply@evergreenwebsolutions.ca    # System emails
bounces@evergreenwebsolutions.ca    # Bounce handling
dmarc@evergreenwebsolutions.ca      # DMARC reports
```

## 📧 **Step-by-Step Setup Process**

### Phase 1: Zoho Mail Setup

#### Step 1: Sign Up
1. Visit [Zoho Mail Custom Domain](https://www.zoho.com/mail/custom-domain-email.html)
2. Click "Get Started Free"
3. Enter your domain: `evergreenwebsolutions.ca`
4. Choose "I own this domain"

#### Step 2: Domain Verification
1. Zoho will provide DNS records to add:
```dns
# MX Records (for receiving email)
MX 10 mx.zoho.com
MX 20 mx2.zoho.com

# TXT Record (for verification)
TXT "zoho-verification=xxxxxxxxxxxxxxxx"

# CNAME Records (for mail server)
CNAME mail.zoho.com
CNAME mailmx.zoho.com
```

#### Step 3: Create Email Accounts
1. After verification, create your email accounts
2. Set up passwords and security settings
3. Configure email clients (optional)

### Phase 2: Resend Integration

#### Step 1: Add Domain to Resend
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add `evergreenwebsolutions.ca` as sending domain
3. Resend will provide DNS records:

```dns
# SPF Record
TXT "v=spf1 include:_spf.resend.com ~all"

# DKIM Record (Resend will provide the actual key)
TXT "resend._domainkey.evergreenwebsolutions.ca" "v=DKIM1; k=rsa; p=..."

# DMARC Record
TXT "_dmarc.evergreenwebsolutions.ca" "v=DMARC1; p=quarantine; rua=mailto:dmarc@evergreenwebsolutions.ca"
```

#### Step 2: Update Environment Variables
```bash
# .env file
RESEND_API_KEY=re_xxxxxxxxx
RESEND_DOMAIN=evergreenwebsolutions.ca
FROM_EMAIL=AI Events <events@evergreenwebsolutions.ca>
REPLY_TO_EMAIL=gabriel@evergreenwebsolutions.ca
BOUNCE_EMAIL=bounces@evergreenwebsolutions.ca
```

## 🔧 **Technical Implementation**

### Email Service Setup
```typescript
// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEventConfirmation({
  to,
  name,
  eventDetails
}: {
  to: string;
  name: string;
  eventDetails: any;
}) {
  try {
    const response = await resend.emails.send({
      from: 'AI Events <events@evergreenwebsolutions.ca>',
      to: [to],
      replyTo: 'gabriel@evergreenwebsolutions.ca',
      subject: `RSVP Confirmed: AI in Northern BC - ${eventDetails.date}`,
      html: generateConfirmationEmail(name, eventDetails),
      text: generateConfirmationEmailText(name, eventDetails),
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@evergreenwebsolutions.ca>',
        'X-Campaign-ID': 'ai-event-2025',
      },
      tags: [
        { name: 'type', value: 'rsvp-confirmation' },
        { name: 'event', value: 'ai-northern-bc-2025' }
      ]
    });

    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error: error.message };
  }
}
```

### Email Templates
```typescript
// src/lib/email-templates.ts
export function generateConfirmationEmail(name: string, eventDetails: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RSVP Confirmed - AI in Northern BC</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
        <h1 style="color: #10b981;">RSVP Confirmed!</h1>
        <p>Hi ${name},</p>
        <p>Your RSVP for the AI in Northern BC information session has been confirmed.</p>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Event Details</h3>
          <p><strong>Date:</strong> ${eventDetails.date}</p>
          <p><strong>Time:</strong> ${eventDetails.time}</p>
          <p><strong>Location:</strong> ${eventDetails.location}</p>
        </div>
        
        <p>We look forward to seeing you there!</p>
        <p>Best regards,<br>Gabriel Lacroix<br>Evergreen Web Solutions</p>
        
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          Evergreen Web Solutions<br>
          Terrace, BC, Canada<br>
          <a href="mailto:gabriel@evergreenwebsolutions.ca">gabriel@evergreenwebsolutions.ca</a>
        </p>
        <p style="font-size: 12px; color: #666;">
          <a href="mailto:unsubscribe@evergreenwebsolutions.ca">Unsubscribe</a> | 
          <a href="https://evergreenwebsolutions.ca/privacy">Privacy Policy</a>
        </p>
      </div>
    </body>
    </html>
  `;
}
```

## 💰 **Cost Breakdown**

### Free Option (Zoho Mail)
- **Cost**: $0/month
- **Storage**: 5GB per user (5 users max)
- **Features**: Full email, calendar, contacts
- **Limitations**: Basic support, ads in webmail

### Paid Option (If Needed Later)
- **Zoho Mail Professional**: $1/user/month
- **Google Workspace**: $6/user/month
- **Microsoft 365**: $6/user/month

## 🎯 **Action Plan**

### This Week:
1. ✅ Sign up for Zoho Mail with your domain
2. ✅ Add DNS records for domain verification
3. ✅ Create email addresses (events@, gabriel@, etc.)
4. ✅ Set up Resend domain for sending
5. ✅ Test email sending and receiving

### Next Week:
1. ✅ Implement email templates
2. ✅ Add email sending to RSVP flow
3. ✅ Set up bounce handling
4. ✅ Test with different email providers (Gmail, Outlook, etc.)

## 🔍 **Testing Your Setup**

### Email Deliverability Tests:
1. **Send test emails** to Gmail, Outlook, Yahoo
2. **Check spam folders** to ensure emails land in inbox
3. **Use tools like**:
   - [Mail Tester](https://www.mail-tester.com/)
   - [SendForensics](https://sendforensics.com/)
   - [MXToolbox](https://mxtoolbox.com/)

### DNS Verification:
```bash
# Check your DNS records
nslookup -type=MX evergreenwebsolutions.ca
nslookup -type=TXT evergreenwebsolutions.ca
```

This setup gives you professional custom domain email for free while maintaining excellent deliverability for your RSVP system!
