# Juniper AI Service

This is the AI service for Juniper, the RSVP system AI assistant. It runs on Render and handles AI conversations and actions.

## Setup

1. **Deploy to Render:**
   - Connect your GitHub repo
   - Set root directory to `ai-service`
   - Use Node.js environment
   - Set build command: `npm install`
   - Set start command: `npm start`

2. **Environment Variables:**
   - `PORT` - Server port (default: 3001)
   - `MAIN_APP_URL` - Your main RSVP app URL

## API Endpoints

- `GET /health` - Health check
- `POST /api/chat` - Main AI chat endpoint
- `POST /api/create-template` - Create email template
- `POST /api/create-campaign` - Create email campaign

## Usage

The AI service processes messages and can:
- Extract template/campaign details from natural language
- Create templates and campaigns via API calls
- Provide helpful responses about the RSVP system
- Handle conversational flow and context

## Architecture

```
User → Vercel App → Render AI Service → Main App APIs
```

The AI service runs independently on Render and communicates with your main Vercel app via API calls.
