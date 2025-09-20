# iCloud Deliverability Guide

## Why iCloud is Challenging

iCloud (Apple Mail) has one of the strictest spam filters among major email providers. New domains face significant challenges.

## Immediate Actions for Better Deliverability

### 1. Add to Contacts
- Add `gabriel@evergreenwebsolutions.ca` to your iCloud contacts
- This is the #1 most important step for iCloud deliverability

### 2. Mark as Not Junk
- Move emails from junk to inbox
- Mark as "Not Junk" when prompted
- This teaches iCloud's AI that your emails are legitimate

### 3. Consistent Sending
- Send emails regularly (not just test emails)
- Build a sending pattern that iCloud recognizes
- Start with small volumes and gradually increase

## Email Content Best Practices for iCloud

### ✅ DO:
- Use personal, simple language
- Include your real name and business name
- Keep HTML simple and clean
- Use a professional signature
- Include clear unsubscribe links

### ❌ DON'T:
- Use excessive capitalization
- Include too many links or images
- Use spam trigger words
- Send from generic email addresses
- Use complex HTML layouts

## Domain Reputation Building

### Week 1-2: Foundation
- Send 10-20 emails per day maximum
- Focus on personal, transactional emails
- Monitor bounce rates closely

### Week 3-4: Growth
- Gradually increase to 50-100 emails per day
- Introduce more marketing content
- Continue monitoring performance

### Month 2+: Scale
- Increase to full volume
- Implement advanced features
- Maintain consistent sending patterns

## Monitoring Tools

### SendGrid Dashboard
- Monitor delivery rates
- Track bounce rates
- Watch for spam complaints

### Key Metrics to Watch:
- **Delivery Rate**: Should be >95%
- **Bounce Rate**: Should be <2%
- **Spam Complaint Rate**: Should be <0.1%

## Alternative Strategies

### 1. Email Authentication
- Ensure SPF, DKIM, DMARC are properly configured
- Consider implementing BIMI for brand authentication

### 2. List Hygiene
- Regularly clean your email list
- Remove bounced emails immediately
- Honor unsubscribe requests quickly

### 3. Warming Up
- Start with your most engaged subscribers
- Gradually expand to less engaged users
- Focus on quality over quantity

## Testing Your Deliverability

### Regular Testing:
```bash
# Test email sending
curl -X POST http://localhost:3000/api/test-sendgrid \
  -H "Content-Type: application/json" \
  -d '{"email": "gabriel.lacroix94@icloud.com", "name": "Gabriel"}'
```

### Check Results:
- Monitor inbox placement
- Track engagement rates
- Adjust strategy based on results

## Emergency Actions

If emails are still going to junk after following this guide:

1. **Contact Apple**: Report false positives
2. **Use Alternative Domains**: Consider using a subdomain for testing
3. **Partner with Established Senders**: Use a service with good iCloud reputation
4. **Focus on Other Providers**: Gmail, Outlook, Yahoo may be easier to reach

## Success Metrics

You'll know your iCloud deliverability is improving when:
- Emails land in inbox consistently
- Engagement rates increase
- Spam complaints decrease
- Bounce rates remain low

Remember: Building email reputation takes time, especially with iCloud. Be patient and consistent!
