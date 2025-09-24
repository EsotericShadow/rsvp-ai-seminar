# Render Deployment Guide for Juniper AI Service

## Setup Instructions

### 1. Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `EsotericShadow/rsvp-ai-seminar`

### 2. Configure the Service

**Basic Settings:**
- **Name**: `juniper-ai-service`
- **Environment**: `Node`
- **Branch**: `main`
- **Root Directory**: `ai-service`
- **Region**: `Oregon (US West)` (or your preferred region)

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- **Free** (for testing) or **Starter** ($7/month) for production

### 3. Environment Variables

Add these environment variables in Render:

```
PORT=3001
MAIN_APP_URL=https://rsvp.evergreenwebsolutions.ca
```

### 4. Update Main App

Add this environment variable to your Vercel deployment:

```
NEXT_PUBLIC_AI_SERVICE_URL=https://juniper-ai-service.onrender.com
```

## Architecture

```
User → Vercel App (rsvp.evergreenwebsolutions.ca) → Render AI Service → Vercel APIs
```

## Testing

1. **Health Check**: `https://juniper-ai-service.onrender.com/health`
2. **Chat Endpoint**: `POST https://juniper-ai-service.onrender.com/api/chat`

## Local Development

To test locally:

```bash
cd ai-service
npm install
npm start
```

The service will run on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /health
```

### Chat
```
POST /api/chat
Content-Type: application/json

{
  "message": "create a template named test"
}
```

### Create Template
```
POST /api/create-template
Content-Type: application/json

{
  "name": "test",
  "subject": "Test Subject",
  "htmlBody": "<h1>Test</h1>",
  "textBody": "Test"
}
```

### Create Campaign
```
POST /api/create-campaign
Content-Type: application/json

{
  "name": "test campaign",
  "description": "Test campaign",
  "steps": [{"type": "email", "templateId": 1, "delay": 0}],
  "audienceGroupId": 1
}
```

## Troubleshooting

1. **Service not starting**: Check build logs in Render dashboard
2. **CORS errors**: Ensure CORS is enabled in the AI service
3. **API calls failing**: Check environment variables and URLs
4. **Template extraction not working**: Check the regex patterns in `ServerSideAIAgent.js`

## Next Steps

1. Deploy the AI service to Render
2. Update the main app's environment variables
3. Test the integration
4. Monitor logs and performance

