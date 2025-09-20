# SendGrid Setup Guide

## 🎯 **Current SendGrid Setup**

Based on your SendGrid setup page, here are the **recommended settings**:

### ✅ **Recommended Configuration:**
- **Domain**: `evergreenwebsolutions.ca` ✅
- **Brand the link**: **YES** ✅ (Better deliverability)
- **Automated security**: **YES** ✅ (Auto-rotating DKIM keys)
- **Custom return path**: **NO** (Leave unchecked)
- **Custom link subdomain**: **NO** (Use default)
- **Custom DKIM selector**: **NO** (Use default "s")

## 🔧 **Next Steps After Setup**

### 1. DNS Records (SendGrid will provide these)
```dns
# SPF Record
TXT "v=spf1 include:sendgrid.net ~all"

# DKIM Record (SendGrid provides the key)
TXT "s1._domainkey.evergreenwebsolutions.ca" "v=DKIM1; k=rsa; p=..."

# DMARC Record
TXT "_dmarc.evergreenwebsolutions.ca" "v=DMARC1; p=quarantine; rua=mailto:dmarc@evergreenwebsolutions.ca"

# CNAME for link branding (if you enabled it)
TXT "emXXXX.evergreenwebsolutions.ca" "sendgrid.net"
```

### 2. Environment Variables
```bash
# Add to your .env file
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxx"
SENDGRID_DOMAIN="evergreenwebsolutions.ca"
FROM_EMAIL="AI Events <events@evergreenwebsolutions.ca>"
REPLY_TO_EMAIL="gabriel@evergreenwebsolutions.ca"
```

### 3. Test Your Setup
```bash
# Test SendGrid configuration
curl -X GET http://localhost:3000/api/test-sendgrid

# Send test email
curl -X POST http://localhost:3000/api/test-sendgrid \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test@email.com", "name": "Test User"}'
```

## 💰 **SendGrid Pricing**
- **Free Plan**: 100 emails/day forever
- **Essentials**: $19.95/month for 50,000 emails
- **Perfect for RSVP system**: Free plan covers most events!

## 🚀 **Why SendGrid is Great**
- ✅ **Excellent deliverability** (better than most providers)
- ✅ **Free tier** (100 emails/day)
- ✅ **Professional reputation** (used by major companies)
- ✅ **Comprehensive analytics** (opens, clicks, bounces)
- ✅ **Easy setup** (automatic DKIM rotation)
- ✅ **Webhook support** (track email events)

## 📧 **Email Forwarding Setup**
Since you need to receive emails too, set up forwarding:

### ImprovMX (Free)
1. Go to [improvmx.com](https://improvmx.com)
2. Add domain: `evergreenwebsolutions.ca`
3. Create forwards:
   - `events@evergreenwebsolutions.ca` → your-gmail@gmail.com
   - `gabriel@evergreenwebsolutions.ca` → your-gmail@gmail.com
4. Add MX records:
```dns
MX 10 mx1.improvmx.com
MX 20 mx2.improvmx.com
```

## ✅ **Complete Setup Checklist**
- [ ] SendGrid domain configured
- [ ] DNS records added
- [ ] Domain verified in SendGrid
- [ ] API key generated
- [ ] Environment variables set
- [ ] Test email sent successfully
- [ ] Email forwarding configured (ImprovMX)
- [ ] Test receiving emails

## 🎯 **Result**
You'll have:
- **Professional sending**: `events@evergreenwebsolutions.ca`
- **Professional receiving**: Emails forwarded to your Gmail
- **Excellent deliverability**: SendGrid's reputation
- **Cost effective**: Free for most events
- **Full tracking**: Opens, clicks, bounces

This gives you enterprise-level email capabilities for free!
