# SendGrid Environment Setup

You need to add these environment variables to your `.env` file:

## Required Environment Variables

```bash
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=gabriel@evergreenwebsolutions.ca
SENDGRID_DOMAIN=evergreenwebsolutions.ca

# Optional: Campaign Configuration
CAMPAIGN_FROM_EMAIL=Gabriel Lacroix <gabriel@evergreenwebsolutions.ca>
CAMPAIGN_LINK_BASE=https://rsvp.evergreenwebsolutions.ca
```

## How to Get Your SendGrid API Key

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access** and give it **Mail Send** permissions
5. Copy the API key (it starts with `SG.`)

## Domain Setup

Since you've already configured your domain `evergreenwebsolutions.ca` with SendGrid:

- **FROM_EMAIL**: Use `gabriel@evergreenwebsolutions.ca` (or any email from your domain)
- **SENDGRID_DOMAIN**: Use `evergreenwebsolutions.ca`

## Test Your Setup

After adding the environment variables:

1. Restart your development server: `npm run dev`
2. Test SendGrid configuration: `curl http://localhost:3000/api/test-sendgrid`
3. Test email sending: Send a POST request to `/api/test-sendgrid` with your email

## Example Test

```bash
curl -X POST http://localhost:3000/api/test-sendgrid \
  -H "Content-Type: application/json" \
  -d '{"email": "gabriel.lacroix94@icloud.com", "name": "Gabriel Test"}'
```

## Campaign System

Once SendGrid is configured, your campaign system will:

1. ✅ Use verified emails from your spreadsheet (1,174 businesses)
2. ✅ Send emails through SendGrid with proper authentication
3. ✅ Track opens, clicks, and bounces
4. ✅ Respect smart windows and throttling
5. ✅ Handle bounce management automatically

## Next Steps

1. Add the environment variables to your `.env` file
2. Restart the development server
3. Test the email system
4. Create a campaign using the "Verified Business Emails - Spreadsheet" group
5. Send test emails to your test addresses
