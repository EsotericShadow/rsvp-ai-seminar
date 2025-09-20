# Email Setup Script

## Environment Variables Needed

Add these to your `.env` file:

```bash
# Email Configuration (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxx"
RESEND_DOMAIN="evergreenwebsolutions.ca"
FROM_EMAIL="AI Events <events@evergreenwebsolutions.ca>"
REPLY_TO_EMAIL="gabriel@evergreenwebsolutions.ca"
BOUNCE_EMAIL="bounces@evergreenwebsolutions.ca"

# Email Webhook (Optional - for tracking)
RESEND_WEBHOOK_SECRET="your_webhook_secret_here"

# Campaign Configuration
CAMPAIGN_LINK_BASE="https://rsvp.evergreenwebsolutions.ca"
CAMPAIGN_FROM_EMAIL="AI Events <events@evergreenwebsolutions.ca>"
```

## DNS Records to Add

### For Zoho Mail (Receiving Emails)
```dns
# MX Records
MX 10 mx.zoho.com
MX 20 mx2.zoho.com

# TXT Record (Zoho will provide the verification string)
TXT "zoho-verification=xxxxxxxxxxxxxxxx"

# CNAME Records
mail CNAME mail.zoho.com
mailmx CNAME mailmx.zoho.com
```

### For Resend (Sending Emails)
```dns
# SPF Record
TXT "v=spf1 include:_spf.resend.com ~all"

# DKIM Record (Resend will provide the actual key)
TXT "resend._domainkey.evergreenwebsolutions.ca" "v=DKIM1; k=rsa; p=..."

# DMARC Record
TXT "_dmarc.evergreenwebsolutions.ca" "v=DMARC1; p=quarantine; rua=mailto:dmarc@evergreenwebsolutions.ca"
```

## Setup Steps

### 1. Zoho Mail Setup
1. Go to [Zoho Mail Custom Domain](https://www.zoho.com/mail/custom-domain-email.html)
2. Sign up with `evergreenwebsolutions.ca`
3. Add the DNS records above
4. Create email addresses:
   - `events@evergreenwebsolutions.ca`
   - `gabriel@evergreenwebsolutions.ca`
   - `noreply@evergreenwebsolutions.ca`
   - `bounces@evergreenwebsolutions.ca`
   - `dmarc@evergreenwebsolutions.ca`

### 2. Resend Setup
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add `evergreenwebsolutions.ca` as a domain
3. Add the DNS records above
4. Verify domain ownership
5. Get your API key from Settings > API Keys

### 3. Test Email Sending
```bash
# Test the email configuration
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test@email.com", "name": "Test User"}'
```

## Email Addresses to Create

### Primary Addresses
- `events@evergreenwebsolutions.ca` - Main event communications
- `gabriel@evergreenwebsolutions.ca` - Personal business email

### System Addresses
- `noreply@evergreenwebsolutions.ca` - System-generated emails
- `bounces@evergreenwebsolutions.ca` - Bounce handling
- `dmarc@evergreenwebsolutions.ca` - DMARC reports
- `unsubscribe@evergreenwebsolutions.ca` - Unsubscribe requests

## Testing Checklist

- [ ] Zoho Mail domain verified
- [ ] Email addresses created in Zoho
- [ ] Resend domain verified
- [ ] DNS records added and propagated
- [ ] Test email sent successfully
- [ ] Email lands in inbox (not spam)
- [ ] Reply functionality works
- [ ] Unsubscribe link works

## Troubleshooting

### Emails Going to Spam
1. Check SPF, DKIM, DMARC records
2. Verify domain reputation
3. Test with [Mail Tester](https://www.mail-tester.com/)
4. Check sender reputation with [SendForensics](https://sendforensics.com/)

### DNS Issues
1. Use [DNS Checker](https://dnschecker.org/) to verify propagation
2. Wait up to 24 hours for full propagation
3. Check with your domain registrar

### Authentication Issues
1. Verify API keys are correct
2. Check domain verification status
3. Ensure DNS records match exactly
