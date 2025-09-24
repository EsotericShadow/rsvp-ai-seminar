#!/usr/bin/env python3
"""
Generate comprehensive training data for RSVP system SLM
Creates 100+ diverse examples covering all scenarios
"""

import json
import random
from pathlib import Path

def generate_campaign_examples():
    """Generate 20+ campaign management examples"""
    examples = []
    
    # Campaign creation variations
    campaign_requests = [
        "Create a new email campaign",
        "I need to set up a campaign for our summer sale",
        "How do I create a campaign for the tech conference?",
        "Make a campaign for our newsletter subscribers",
        "I want to send a campaign to my VIP customers",
        "Create a campaign for the product launch",
        "Set up a campaign for the holiday promotion",
        "I need a campaign for our beta testers",
        "Create a campaign for the webinar announcement",
        "Make a campaign for our premium members"
    ]
    
    for request in campaign_requests:
        examples.append({
            "instruction": "Create a new email campaign",
            "input": request,
            "output": f"To create a new email campaign, I'll help you set this up. Here's what I need to know:\n\n1. **Campaign Name**: What should we call this campaign?\n2. **Audience Group**: Which audience group should receive this campaign?\n3. **Email Template**: Do you have an existing template or should I help create one?\n4. **Schedule**: When would you like to send this campaign?\n\n**API Method:**\n```\nPOST /api/admin/campaign/campaigns\n{{\n  \"name\": \"Campaign Name\",\n  \"audienceGroupId\": \"group-id\",\n  \"templateId\": \"template-id\",\n  \"scheduledAt\": \"2025-01-15T10:00:00Z\"\n}}\n```\n\n**Required fields:** name, audienceGroupId, templateId\n**Optional fields:** scheduledAt, meta (for additional configuration)\n\nWould you like me to help you with any of these details?"
        })
    
    # Campaign management variations
    management_requests = [
        "Show me all my campaigns",
        "What campaigns are currently running?",
        "Pause the summer sale campaign",
        "Resume the newsletter campaign",
        "Delete the old test campaign",
        "Schedule the product launch for tomorrow",
        "What's the status of my latest campaign?",
        "Show me campaign analytics",
        "How many campaigns do I have?",
        "Which campaign has the best open rate?"
    ]
    
    for request in management_requests:
        examples.append({
            "instruction": "Manage email campaigns",
            "input": request,
            "output": f"I'll help you manage your campaigns. Based on your request, here's what I can do:\n\n**Available Actions:**\n- **List Campaigns**: GET /api/admin/campaign/campaigns\n- **Pause Campaign**: POST /api/admin/campaign/campaigns/[id]/pause\n- **Resume Campaign**: POST /api/admin/campaign/campaigns/[id]/resume\n- **Delete Campaign**: DELETE /api/admin/campaign/campaigns/[id]\n- **Schedule Campaign**: POST /api/admin/campaign/campaigns/[id]/schedule\n- **View Analytics**: GET /api/admin/campaign/campaigns/[id]/overview\n\n**Campaign Status Types:**\n- `DRAFT` - Not yet sent\n- `SCHEDULED` - Scheduled for future send\n- `SENT` - Successfully sent\n- `PAUSED` - Temporarily paused\n- `COMPLETED` - Finished sending\n- `FAILED` - Encountered errors\n\nLet me execute the appropriate action for your request."
        })
    
    return examples

def generate_template_examples():
    """Generate 20+ template management examples"""
    examples = []
    
    # Template creation variations
    template_requests = [
        "Create a new email template",
        "I need a template for welcome emails",
        "Make a template for product announcements",
        "Create a template for event invitations",
        "I want a template for newsletters",
        "Make a template for promotional emails",
        "Create a template for follow-up emails",
        "I need a template for RSVP confirmations",
        "Make a template for thank you emails",
        "Create a template for survey requests"
    ]
    
    for request in template_requests:
        examples.append({
            "instruction": "Create email templates",
            "input": request,
            "output": f"I'll help you create a new email template. Here's what I need:\n\n**Template Details:**\n1. **Template Name**: What should we call this template?\n2. **Subject Line**: What's the email subject?\n3. **Content**: What should the email contain?\n4. **Style**: Any specific design preferences?\n\n**API Method:**\n```\nPOST /api/admin/campaign/templates\n{{\n  \"name\": \"Template Name\",\n  \"subject\": \"Email Subject\",\n  \"htmlBody\": \"<h1>Hello {{name}}</h1><p>Content here</p>\",\n  \"textBody\": \"Hello {{name}}\\n\\nContent here\",\n  \"meta\": {{\n    \"isActive\": true,\n    \"audienceGroup\": \"general\"\n  }}\n}}\n```\n\n**Available Variables:**\n- `{{name}}` - Recipient's name\n- `{{email}}` - Recipient's email\n- `{{firstName}}` - First name\n- `{{lastName}}` - Last name\n- `{{unsubscribeUrl}}` - Unsubscribe link\n\nWould you like me to create this template with some default content?"
        })
    
    # Template management variations
    template_mgmt_requests = [
        "Show me all templates",
        "Edit the welcome template",
        "Delete the old template",
        "What templates do I have?",
        "Update the newsletter template",
        "Test the promotional template",
        "Which template is most used?",
        "Show me template analytics",
        "Make the welcome template active",
        "Duplicate the event template"
    ]
    
    for request in template_mgmt_requests:
        examples.append({
            "instruction": "Manage email templates",
            "input": request,
            "output": f"I'll help you manage your email templates. Here are the available actions:\n\n**Template Management:**\n- **List Templates**: GET /api/admin/campaign/templates\n- **Edit Template**: PUT /api/admin/campaign/templates/[id]\n- **Delete Template**: DELETE /api/admin/campaign/templates/[id]\n- **Get Template**: GET /api/admin/campaign/templates/[id]\n- **Test Template**: Send test email to verify rendering\n\n**Template Properties:**\n- `name` - Template identifier\n- `subject` - Email subject line\n- `htmlBody` - Rich HTML content\n- `textBody` - Plain text version\n- `meta` - Additional configuration\n- `isActive` - Whether template is active\n\n**Best Practices:**\n- Always include both HTML and text versions\n- Use responsive design for mobile compatibility\n- Include unsubscribe links\n- Test templates before sending campaigns\n\nLet me execute the appropriate action for your request."
        })
    
    return examples

def generate_audience_examples():
    """Generate 20+ audience management examples"""
    examples = []
    
    # Audience group creation
    audience_requests = [
        "Create a new audience group",
        "I need a group for tech professionals",
        "Make a group for newsletter subscribers",
        "Create a group for VIP customers",
        "I want a group for beta testers",
        "Make a group for event attendees",
        "Create a group for premium members",
        "I need a group for inactive users",
        "Make a group for high-value customers",
        "Create a group for new subscribers"
    ]
    
    for request in audience_requests:
        examples.append({
            "instruction": "Create audience groups",
            "input": request,
            "output": f"I'll help you create a new audience group. Here's what I need:\n\n**Group Configuration:**\n1. **Group Name**: What should we call this group?\n2. **Description**: What does this group represent?\n3. **Criteria**: How should members be added to this group?\n4. **Rules**: Any specific conditions for membership?\n\n**API Method:**\n```\nPOST /api/admin/campaign/groups\n{{\n  \"name\": \"Group Name\",\n  \"description\": \"Description of the group\",\n  \"meta\": {{\n    \"rules\": {{\n      \"industry\": \"technology\",\n      \"engagement\": \"high\",\n      \"tags\": [\"vip\", \"premium\"]\n    }}\n  }}\n}}\n```\n\n**Member Status Types:**\n- `SUBSCRIBED` - Active member\n- `UNSUBSCRIBED` - Opted out\n- `BOUNCED` - Email bounced\n- `COMPLAINED` - Marked as spam\n\n**Segmentation Options:**\n- Industry type\n- Engagement level\n- Email domain\n- Geographic location\n- Behavioral patterns\n- Custom tags\n\nWould you like me to create this group with some default criteria?"
        })
    
    # Audience management
    audience_mgmt_requests = [
        "Show me all audience groups",
        "How many members are in each group?",
        "Add members to the VIP group",
        "Move members between groups",
        "Export audience data",
        "What's the engagement rate?",
        "Show me audience analytics",
        "Clean up bounced emails",
        "Which group is most active?",
        "Update member information"
    ]
    
    for request in audience_mgmt_requests:
        examples.append({
            "instruction": "Manage audience groups and members",
            "input": request,
            "output": f"I'll help you manage your audience. Here are the available actions:\n\n**Audience Management:**\n- **List Groups**: GET /api/admin/campaign/groups\n- **Add to Group**: POST /api/admin/campaign/members/add-to-group\n- **Move Members**: POST /api/admin/campaign/members/move\n- **Export Data**: POST /api/admin/export\n- **View Analytics**: GET /api/admin/analytics/audience\n\n**Member Operations:**\n- **Bulk Import**: Upload CSV file with member data\n- **Bulk Export**: Download member data in various formats\n- **Data Cleaning**: Remove bounced emails, update statuses\n- **Segmentation**: Automatically categorize members\n- **Engagement Tracking**: Monitor open rates, click rates\n\n**Database Fields:**\n- `email` (unique identifier)\n- `firstName`, `lastName`\n- `status` (enum: SUBSCRIBED, UNSUBSCRIBED, BOUNCED, COMPLAINED)\n- `meta` (custom fields, tags, preferences)\n- `createdAt`, `updatedAt`\n\nLet me execute the appropriate action for your request."
        })
    
    return examples

def generate_workflow_examples():
    """Generate 15+ workflow automation examples"""
    examples = []
    
    workflow_requests = [
        "Set up automation workflows",
        "Create a follow-up email sequence",
        "Automate welcome emails for new subscribers",
        "Set up abandoned cart emails",
        "Create birthday email automation",
        "Automate re-engagement campaigns",
        "Set up event reminder emails",
        "Create post-purchase follow-up",
        "Automate survey requests",
        "Set up newsletter automation",
        "Create win-back campaigns",
        "Automate thank you emails",
        "Set up milestone celebrations",
        "Create seasonal campaigns",
        "Automate feedback requests"
    ]
    
    for request in workflow_requests:
        examples.append({
            "instruction": "Set up automation workflows",
            "input": request,
            "output": f"I'll help you set up automation workflows. Here's what I need to know:\n\n**Workflow Configuration:**\n1. **Trigger**: When should this workflow activate?\n2. **Conditions**: What criteria must be met?\n3. **Actions**: What should happen when triggered?\n4. **Timing**: Any delays or scheduling?\n\n**API Method:**\n```\nPOST /api/admin/workflows\n{{\n  \"name\": \"Workflow Name\",\n  \"trigger\": \"CAMPAIGN_SENT\",\n  \"conditions\": {{\n    \"campaignId\": \"campaign-123\",\n    \"minOpenRate\": 0.2,\n    \"timeDelay\": \"24h\"\n  }},\n  \"actions\": {{\n    \"type\": \"SEND_EMAIL\",\n    \"templateId\": \"follow-up-template\",\n    \"audienceGroup\": \"engaged-users\"\n  }},\n  \"isEnabled\": true\n}}\n```\n\n**Available Triggers:**\n- `CAMPAIGN_SENT` - After campaign is sent\n- `RSVP_CONFIRMED` - When someone confirms RSVP\n- `EMAIL_OPENED` - When email is opened\n- `EMAIL_CLICKED` - When link is clicked\n- `USER_UNSUBSCRIBED` - When user unsubscribes\n- `NEW_SUBSCRIBER` - When someone subscribes\n\n**Available Actions:**\n- `SEND_EMAIL` - Send follow-up email\n- `ADD_TO_GROUP` - Add to audience group\n- `REMOVE_FROM_GROUP` - Remove from group\n- `UPDATE_MEMBER` - Update member data\n- `LOG_EVENT` - Log the event\n\nWould you like me to create this workflow with some default settings?"
        })
    
    return examples

def generate_analytics_examples():
    """Generate 15+ analytics and reporting examples"""
    examples = []
    
    analytics_requests = [
        "Show me campaign analytics",
        "What's my email open rate?",
        "Generate a monthly report",
        "Show me audience engagement",
        "What's the click-through rate?",
        "Show me bounce rates",
        "Generate a campaign report",
        "What's the unsubscribe rate?",
        "Show me performance trends",
        "Generate an audience report",
        "What's the conversion rate?",
        "Show me geographic distribution",
        "Generate a template report",
        "What's the best sending time?",
        "Show me ROI metrics"
    ]
    
    for request in analytics_requests:
        examples.append({
            "instruction": "View analytics and generate reports",
            "input": request,
            "output": f"I'll help you analyze your email performance. Here's what I can show you:\n\n**Key Metrics:**\n- **Open Rate**: Percentage of emails opened\n- **Click Rate**: Percentage of links clicked\n- **Bounce Rate**: Percentage of emails bounced\n- **Unsubscribe Rate**: Percentage who unsubscribed\n- **Conversion Rate**: Percentage who took desired action\n- **Engagement Score**: Overall engagement level\n\n**API Endpoints:**\n- `GET /api/admin/campaigns/analytics` - Overall campaign analytics\n- `GET /api/admin/analytics/visitors` - Website visitor analytics\n- `GET /api/admin/analytics/tracking-links` - Link performance\n- `GET /api/admin/campaign/campaigns/[id]/overview` - Campaign details\n\n**Sample Analytics Response:**\n```\n{{\n  \"campaignId\": \"campaign-123\",\n  \"sent\": 1000,\n  \"delivered\": 950,\n  \"opened\": 285,\n  \"clicked\": 95,\n  \"bounced\": 50,\n  \"unsubscribed\": 5,\n  \"openRate\": 0.30,\n  \"clickRate\": 0.10,\n  \"bounceRate\": 0.05,\n  \"unsubscribeRate\": 0.005\n}}\n```\n\n**Report Types:**\n- **Monthly Reports**: Automated monthly summaries\n- **Campaign Reports**: Individual campaign performance\n- **Audience Reports**: Member engagement and growth\n- **Template Reports**: Template performance comparison\n- **Export Options**: CSV, PDF, JSON formats\n\nLet me generate the appropriate report for your request."
        })
    
    return examples

def generate_troubleshooting_examples():
    """Generate 15+ troubleshooting examples"""
    examples = []
    
    troubleshooting_requests = [
        "My campaign isn't sending",
        "Emails are going to spam",
        "Low open rates",
        "High bounce rates",
        "Template not rendering",
        "Database connection error",
        "API authentication failed",
        "Email delivery issues",
        "AI assistant not responding",
        "Workflow not triggering",
        "Analytics not updating",
        "Import failed",
        "Export not working",
        "Performance issues",
        "System errors"
    ]
    
    for request in troubleshooting_requests:
        examples.append({
            "instruction": "Troubleshoot system issues",
            "input": request,
            "output": f"I'll help you troubleshoot this issue. Let me diagnose the problem:\n\n**Common Issues & Solutions:**\n\n**Campaign Issues:**\n- **Not sending**: Check status in database, verify audience group has members\n- **Low open rates**: Review subject lines, send times, audience targeting\n- **High bounce rates**: Check email list quality, verify email addresses\n- **Template not rendering**: Validate HTML, check for missing variables\n\n**Database Issues:**\n- **Connection errors**: Check DATABASE_URL environment variable\n- **Migration failures**: Run `npx prisma migrate reset` and `npx prisma migrate deploy`\n- **Schema mismatches**: Verify Prisma schema matches database\n\n**API Issues:**\n- **Authentication failures**: Check session cookies, verify admin login\n- **Rate limiting**: Implement proper throttling and retry logic\n- **CORS errors**: Verify allowed origins in API routes\n\n**Email Delivery Issues:**\n- **Resend API errors**: Check API key, verify sender domain\n- **Spam folder**: Improve email content, avoid spam triggers\n- **Deliverability**: Monitor bounce rates, maintain clean lists\n\n**Debugging Commands:**\n```\n# Check database connection\nnpx prisma db pull\n\n# View logs\nnpm run dev\n\n# Test email sending\ncurl -X POST /api/test-email\n\n# Check AI responses\ncurl -X POST /api/ai/chat\n```\n\nLet me run some diagnostics to identify the specific issue."
        })
    
    return examples

def generate_system_examples():
    """Generate 10+ system architecture and technical examples"""
    examples = []
    
    system_requests = [
        "What's the system architecture?",
        "How does the database work?",
        "Explain the API structure",
        "What technologies are used?",
        "How does authentication work?",
        "What's the deployment setup?",
        "How does the AI assistant work?",
        "What's the file structure?",
        "How does email delivery work?",
        "What are the environment variables?",
        "How does the vector database work?",
        "What's the security setup?"
    ]
    
    for request in system_requests:
        examples.append({
            "instruction": "Explain system architecture and technical details",
            "input": request,
            "output": f"I'll explain the technical architecture of the RSVP system:\n\n**System Architecture:**\n\n**Frontend:**\n- **Framework**: Next.js 14 with React\n- **Styling**: Tailwind CSS\n- **Animations**: Framer Motion\n- **State Management**: React hooks (useState, useEffect)\n- **Authentication**: Session-based with cookies\n\n**Backend:**\n- **Runtime**: Node.js\n- **Framework**: Next.js API routes\n- **Database**: PostgreSQL with Prisma ORM\n- **Email Service**: Resend API\n- **Vector Database**: Weaviate (for RAG)\n- **AI Integration**: Gemini 2.5 Flash\n\n**Database:**\n- **Primary**: PostgreSQL (Neon)\n- **ORM**: Prisma\n- **Migrations**: Prisma migrate\n- **Schema**: Defined in `prisma/schema.prisma`\n\n**Key Components:**\n- **Admin Panel**: `/admin/*` routes\n- **RSVP Forms**: Public-facing forms\n- **AI Assistant**: Juniper AI system\n- **Email Templates**: HTML/Text templates\n- **Audience Management**: Segmentation and grouping\n- **Workflow Automation**: Rule-based triggers\n\n**File Structure:**\n```\nrsvp-app/\n├── src/\n│   ├── app/           # Next.js app router\n│   ├── components/    # React components\n│   ├── lib/          # Utilities and services\n│   └── prisma/       # Database schema\n├── public/           # Static assets\n└── docs/            # Documentation\n```\n\n**Environment Variables:**\n- `DATABASE_URL` - PostgreSQL connection\n- `RESEND_API_KEY` - Email service\n- `GEMINI_API_KEY` - AI service\n- `WEAVIATE_URL` - Vector database\n- `WEAVIATE_API_KEY` - Vector database auth\n\n**Deployment:**\n- **Platform**: Vercel (frontend)\n- **Database**: Neon (PostgreSQL)\n- **AI Service**: Railway (planned)\n- **Vector DB**: Weaviate Cloud\n\n**Security:**\n- **Authentication**: Session-based with secure cookies\n- **Authorization**: Role-based access control\n- **Data Protection**: GDPR compliance\n- **API Security**: Rate limiting, CORS, input validation\n\n**Performance:**\n- **Caching**: Redis for session storage\n- **CDN**: Vercel Edge Network\n- **Database**: Connection pooling\n- **Email**: Async processing with queues\n\nThis architecture provides a scalable, secure, and maintainable system for RSVP management and email campaigns."
        })
    
    return examples

def generate_comprehensive_dataset():
    """Generate the complete training dataset"""
    print("🚀 Generating comprehensive RSVP training dataset...")
    
    all_examples = []
    
    # Generate examples from each category
    all_examples.extend(generate_campaign_examples())
    all_examples.extend(generate_template_examples())
    all_examples.extend(generate_audience_examples())
    all_examples.extend(generate_workflow_examples())
    all_examples.extend(generate_analytics_examples())
    all_examples.extend(generate_troubleshooting_examples())
    all_examples.extend(generate_system_examples())
    
    # Shuffle for better training
    random.shuffle(all_examples)
    
    # Save to JSONL format
    output_file = Path("training-data/comprehensive-rsvp-dataset.jsonl")
    with open(output_file, 'w') as f:
        for example in all_examples:
            f.write(json.dumps(example) + '\n')
    
    print(f"✅ Generated {len(all_examples)} comprehensive training examples")
    print(f"📁 Saved to: {output_file}")
    
    # Also save in MLX format
    mlx_file = Path("training-data/comprehensive-rsvp-mlx.json")
    with open(mlx_file, 'w') as f:
        json.dump(all_examples, f, indent=2)
    
    print(f"📁 MLX format saved to: {mlx_file}")
    
    return output_file, mlx_file

if __name__ == "__main__":
    generate_comprehensive_dataset()

