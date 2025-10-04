# RSVP AI System

A production-ready RSVP management system with integrated AI assistant powered by Small Language Model (SLM) technology.

## 🚀 Features

### Core RSVP System
- **Event Management** - Create and manage professional events
- **RSVP Collection** - Streamlined RSVP forms with validation
- **Email Campaigns** - Automated email marketing campaigns
- **Analytics** - Comprehensive tracking and reporting
- **Admin Dashboard** - Full administrative control panel

### AI Assistant (Juniper)
- **Conversational Interface** - Natural language interaction
- **Real Database Operations** - Create templates, campaigns, schedules
- **Context Awareness** - Maintains conversation history
- **RAG Integration** - Uses Weaviate knowledge base
- **Production Ready** - All operations use real database APIs

## 🏗️ Architecture

```
User → Vercel App → AI Service (Render) → Database APIs → Real Operations
```

### Components
- **Main App** (Vercel) - Next.js application with admin dashboard
- **AI Service** (Render) - SLM-powered AI assistant
- **Database** (Neon PostgreSQL) - Production database
- **RAG System** (Weaviate) - Knowledge base for AI
- **Email Services** - SendGrid for transactional, Resend for campaigns

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **AI**: Custom SLM system with RAG integration
- **Vector DB**: Weaviate
- **Email**: SendGrid, Resend
- **Deployment**: Vercel (main app), Render (AI service)

## 📁 Project Structure

```
rsvp-app/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   └── lib/                 # Utilities and services
├── ai-service/              # AI service (deployed to Render)
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
└── archive/                 # Archived files and old implementations
```

## 🔧 Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Weaviate instance
- SendGrid API key
- Resend API key

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."

# AI Service
NEXT_PUBLIC_AI_SERVICE_URL="https://juniper-ai-service.onrender.com"
NEXT_PUBLIC_AI_SERVICE_API_KEY="your-api-key"

# Weaviate
WEAVIATE_URL="your-weaviate-url"
WEAVIATE_API_KEY="your-weaviate-key"

# Email Services
SENDGRID_API_KEY="your-sendgrid-key"
RESEND_API_KEY="your-resend-key"

# Admin
ADMIN_USER="your-username"
ADMIN_PASSWORD_HASH="your-bcrypt-hash"
ADMIN_SESSION_SECRET="your-session-secret"
```

### Installation
```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run build
npm start
```

## 🤖 AI Assistant

The AI assistant (Juniper) can:
- Create email templates
- Set up campaigns
- Manage audience groups
- Schedule email sends
- Provide analytics insights
- Answer questions about the system

### Usage
1. Access the admin dashboard
2. Use the floating chat bar to interact with Juniper
3. Ask natural language questions or requests
4. Juniper will perform real database operations

## 📊 Database Schema

Key models:
- `AudienceMember` - Business contacts
- `AudienceGroup` - Segmented audiences
- `Campaign` - Email campaigns
- `CampaignTemplate` - Email templates
- `CampaignSchedule` - Scheduled sends
- `RSVP` - Event RSVPs
- `Visit` - Website analytics

## 🔒 Security

- API key authentication for AI service
- Admin session management
- Rate limiting
- Input validation
- Security headers
- Audit logging

## 📈 Monitoring

- Real-time analytics
- Campaign performance tracking
- Email delivery monitoring
- System health checks
- Error logging

## 🚀 Deployment

### Main App (Vercel)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### AI Service (Render)
1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Set root directory: `ai-service`
5. Add environment variables

## 📝 License

Private project - All rights reserved.

## 🤝 Support

For support, contact the development team.



