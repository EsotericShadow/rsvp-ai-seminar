#!/usr/bin/env python3
"""
Generate accurate training data that perfectly matches the actual RSVP system
Based on real codebase analysis - no made up endpoints or fields
"""

import json
import random
from pathlib import Path

def generate_campaign_examples():
    """Generate campaign examples based on actual API structure"""
    examples = []
    
    # Campaign creation - based on actual POST /api/admin/campaign/campaigns
    campaign_requests = [
        "Create a new campaign",
        "I need to create a campaign for our summer sale",
        "Make a campaign for the tech conference",
        "Create a campaign for newsletter subscribers",
        "I want to create a campaign for VIP customers",
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
            "output": f"I'll help you create a new campaign. Based on your request, here's what I need:\n\n**Required Information:**\n1. **Campaign Name**: What should we call this campaign?\n2. **Steps**: Campaign steps with templateId, groupId, and scheduling\n\n**API Endpoint:**\n```\nPOST /api/admin/campaign/campaigns\n```\n\n**Request Body:**\n```json\n{{\n  \"name\": \"Campaign Name\",\n  \"description\": \"Optional description\",\n  \"status\": \"DRAFT\",\n  \"steps\": [\n    {{\n      \"templateId\": \"template-id\",\n      \"groupId\": \"audience-group-id\",\n      \"sendAt\": \"2025-01-15T10:00:00Z\",\n      \"stepOrder\": 1\n    }}\n  ]\n}}\n```\n\n**Campaign Status Options:**\n- `DRAFT` - Not yet ready to send\n- `SCHEDULED` - Scheduled for future send\n- `SENDING` - Currently being sent\n- `PAUSED` - Temporarily paused\n- `COMPLETED` - Finished sending\n- `CANCELLED` - Cancelled\n\n**Required Fields:**\n- `name` (string) - Campaign name\n- `steps` (array) - Array of campaign steps\n\n**Step Object Required Fields:**\n- `templateId` (string) - Email template ID\n- `groupId` (string) - Audience group ID\n- `stepOrder` (number) - Order of execution\n\n**Optional Step Fields:**\n- `sendAt` (ISO date string) - When to send\n- `throttlePerMinute` (number) - Email sending rate\n- `timeZone` (string) - Timezone for scheduling\n\nWould you like me to help you set up the campaign steps?"
        })
    
    # Campaign management - based on actual GET /api/admin/campaign/campaigns
    management_requests = [
        "Show me all campaigns",
        "What campaigns do I have?",
        "List my campaigns",
        "Get campaign details",
        "Show campaign status",
        "What's the status of my campaigns?",
        "Delete a campaign",
        "Update campaign status",
        "Pause a campaign",
        "Resume a campaign"
    ]
    
    for request in management_requests:
        examples.append({
            "instruction": "Manage email campaigns",
            "input": request,
            "output": f"I'll help you manage your campaigns. Here are the available actions:\n\n**List Campaigns:**\n```\nGET /api/admin/campaign/campaigns\n```\n\n**Response:**\n```json\n{{\n  \"campaigns\": [\n    {{\n      \"id\": \"campaign-id\",\n      \"name\": \"Campaign Name\",\n      \"description\": \"Description\",\n      \"status\": \"DRAFT\",\n      \"meta\": {{}},\n      \"createdAt\": \"2025-01-15T10:00:00Z\",\n      \"updatedAt\": \"2025-01-15T10:00:00Z\",\n      \"schedules\": []\n    }}\n  ]\n}}\n```\n\n**Get Campaign Details:**\n```\nGET /api/admin/campaign/campaigns/[id]\n```\n\n**Update Campaign:**\n```\nPUT /api/admin/campaign/campaigns\n```\n\n**Request Body:**\n```json\n{{\n  \"id\": \"campaign-id\",\n  \"name\": \"Updated Name\",\n  \"description\": \"Updated description\",\n  \"status\": \"SCHEDULED\",\n  \"steps\": []\n}}\n```\n\n**Delete Campaign:**\n```\nDELETE /api/admin/campaign/campaigns/[id]\n```\n\n**Campaign Status Values:**\n- `DRAFT` - Not yet ready\n- `SCHEDULED` - Scheduled to send\n- `SENDING` - Currently sending\n- `PAUSED` - Paused\n- `COMPLETED` - Finished\n- `CANCELLED` - Cancelled\n\nLet me execute the appropriate action for your request."
        })
    
    return examples

def generate_schedule_examples():
    """Generate schedule examples based on actual CampaignSchedule API"""
    examples = []
    
    schedule_requests = [
        "Create a new schedule",
        "Schedule a campaign to send",
        "Set up email scheduling",
        "Create a recurring schedule",
        "Schedule for tomorrow",
        "Set up smart sending window",
        "Create a throttled schedule",
        "Schedule with timezone",
        "Set up multi-step campaign",
        "Create immediate send schedule"
    ]
    
    for request in schedule_requests:
        examples.append({
            "instruction": "Create and manage campaign schedules",
            "input": request,
            "output": f"I'll help you create a campaign schedule. Here's what I need:\n\n**Required Information:**\n1. **Schedule Name**: What should we call this schedule?\n2. **Template ID**: Which email template to use?\n3. **Group ID**: Which audience group to target?\n\n**API Endpoint:**\n```\nPOST /api/admin/campaign/schedules\n```\n\n**Request Body:**\n```json\n{{\n  \"name\": \"Schedule Name\",\n  \"templateId\": \"template-id\",\n  \"groupId\": \"audience-group-id\",\n  \"campaignId\": \"campaign-id\",\n  \"sendAt\": \"2025-01-15T10:00:00Z\",\n  \"throttlePerMinute\": 60,\n  \"repeatIntervalMins\": null,\n  \"stepOrder\": 1,\n  \"smartWindowStart\": \"2025-01-15T09:00:00Z\",\n  \"smartWindowEnd\": \"2025-01-15T17:00:00Z\",\n  \"timeZone\": \"America/Vancouver\",\n  \"status\": \"DRAFT\"\n}}\n```\n\n**Required Fields:**\n- `name` (string) - Schedule name\n- `templateId` (string) - Email template ID\n- `groupId` (string) - Audience group ID\n\n**Optional Fields:**\n- `campaignId` (string) - Associated campaign ID\n- `sendAt` (ISO date string) - When to send (null for immediate)\n- `throttlePerMinute` (number) - Email sending rate (default: 60)\n- `repeatIntervalMins` (number) - Recurring interval in minutes\n- `stepOrder` (number) - Order in multi-step campaign (default: 1)\n- `smartWindowStart` (ISO date string) - Smart sending window start\n- `smartWindowEnd` (ISO date string) - Smart sending window end\n- `timeZone` (string) - Timezone (default: \"America/Vancouver\")\n- `status` (string) - Schedule status\n\n**Schedule Status Options:**\n- `DRAFT` - Not yet ready\n- `SCHEDULED` - Scheduled to send\n- `SENDING` - Currently sending\n- `PAUSED` - Paused\n- `COMPLETED` - Finished\n- `CANCELLED` - Cancelled\n\n**Response:**\n```json\n{{\n  \"schedule\": {{\n    \"id\": \"schedule-id\",\n    \"name\": \"Schedule Name\",\n    \"templateId\": \"template-id\",\n    \"groupId\": \"audience-group-id\",\n    \"status\": \"DRAFT\",\n    \"sendAt\": \"2025-01-15T10:00:00Z\",\n    \"timeZone\": \"America/Vancouver\",\n    \"throttlePerMinute\": 60,\n    \"createdAt\": \"2025-01-15T10:00:00Z\",\n    \"updatedAt\": \"2025-01-15T10:00:00Z\"\n  }}\n}}\n```\n\nWould you like me to help you set up the schedule details?"
        })
    
    return examples

def generate_template_examples():
    """Generate template examples based on actual CampaignTemplate API"""
    examples = []
    
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
            "instruction": "Create and manage email templates",
            "input": request,
            "output": f"I'll help you create a new email template. Here's what I need:\n\n**Required Information:**\n1. **Template Name**: What should we call this template?\n2. **Subject**: Email subject line\n3. **HTML Body**: Rich HTML content\n4. **Text Body**: Plain text version (optional)\n\n**API Endpoint:**\n```\nPOST /api/admin/campaign/templates\n```\n\n**Request Body:**\n```json\n{{\n  \"name\": \"Template Name\",\n  \"subject\": \"Email Subject\",\n  \"htmlBody\": \"<h1>Hello {{name}}</h1><p>Content here</p>\",\n  \"textBody\": \"Hello {{name}}\\n\\nContent here\",\n  \"meta\": {{}},\n  \"greeting_title\": \"Welcome!\",\n  \"greeting_message\": \"Thank you for joining us\",\n  \"signature_name\": \"Your Name\",\n  \"signature_title\": \"Your Title\",\n  \"signature_company\": \"Your Company\",\n  \"signature_location\": \"Your Location\",\n  \"main_content_title\": \"Main Title\",\n  \"main_content_body\": \"Main content here\",\n  \"button_text\": \"Click Here\",\n  \"additional_info_title\": \"Additional Info\",\n  \"additional_info_body\": \"Additional details\",\n  \"closing_title\": \"Thank You\",\n  \"closing_message\": \"Best regards\"\n}}\n```\n\n**Required Fields:**\n- `name` (string) - Template name\n- `subject` (string) - Email subject\n- `htmlBody` (string) - HTML content\n- `meta` (object) - Template metadata\n\n**Optional Fields:**\n- `textBody` (string) - Plain text version\n- `greeting_title` (string) - Greeting title\n- `greeting_message` (string) - Greeting message\n- `signature_name` (string) - Signature name\n- `signature_title` (string) - Signature title\n- `signature_company` (string) - Signature company\n- `signature_location` (string) - Signature location\n- `main_content_title` (string) - Main content title\n- `main_content_body` (string) - Main content body\n- `button_text` (string) - Button text\n- `additional_info_title` (string) - Additional info title\n- `additional_info_body` (string) - Additional info body\n- `closing_title` (string) - Closing title\n- `closing_message` (string) - Closing message\n\n**Template Variables:**\n- `{{name}}` - Recipient's name\n- `{{email}}` - Recipient's email\n- `{{firstName}}` - First name\n- `{{lastName}}` - Last name\n- `{{unsubscribeUrl}}` - Unsubscribe link\n\n**Response:**\n```json\n{{\n  \"template\": {{\n    \"id\": \"template-id\",\n    \"name\": \"Template Name\",\n    \"subject\": \"Email Subject\",\n    \"htmlBody\": \"<h1>Hello {{name}}</h1>\",\n    \"textBody\": \"Hello {{name}}\",\n    \"meta\": {{}},\n    \"createdAt\": \"2025-01-15T10:00:00Z\",\n    \"updatedAt\": \"2025-01-15T10:00:00Z\"\n  }}\n}}\n```\n\nWould you like me to help you create this template with some default content?"
        })
    
    return examples

def generate_audience_examples():
    """Generate audience examples based on actual AudienceGroup and AudienceMember models"""
    examples = []
    
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
            "instruction": "Create and manage audience groups",
            "input": request,
            "output": f"I'll help you create a new audience group. Here's what I need:\n\n**Required Information:**\n1. **Group Name**: What should we call this group?\n2. **Description**: What does this group represent?\n\n**API Endpoint:**\n```\nPOST /api/admin/campaign/groups\n```\n\n**Request Body:**\n```json\n{{\n  \"name\": \"Group Name\",\n  \"description\": \"Description of the group\",\n  \"color\": \"#10b981\",\n  \"criteria\": {{\n    \"industry\": \"technology\",\n    \"engagement\": \"high\",\n    \"tags\": [\"vip\", \"premium\"]\n  }},\n  \"meta\": {{}}\n}}\n```\n\n**Required Fields:**\n- `name` (string) - Group name\n- `description` (string) - Group description\n- `criteria` (object) - Group criteria\n- `meta` (object) - Group metadata\n\n**Optional Fields:**\n- `color` (string) - Group color (default: \"#10b981\")\n\n**Response:**\n```json\n{{\n  \"group\": {{\n    \"id\": \"group-id\",\n    \"name\": \"Group Name\",\n    \"description\": \"Description\",\n    \"color\": \"#10b981\",\n    \"criteria\": {{}},\n    \"meta\": {{}},\n    \"createdAt\": \"2025-01-15T10:00:00Z\",\n    \"updatedAt\": \"2025-01-15T10:00:00Z\",\n    \"members\": []\n  }}\n}}\n```\n\n**Audience Member Structure:**\n```json\n{{\n  \"id\": \"member-id\",\n  \"groupId\": \"group-id\",\n  \"businessId\": \"business-id\",\n  \"businessName\": \"Business Name\",\n  \"primaryEmail\": \"email@example.com\",\n  \"secondaryEmail\": \"secondary@example.com\",\n  \"tagsSnapshot\": [\"tag1\", \"tag2\"],\n  \"inviteToken\": \"token\",\n  \"meta\": {{}},\n  \"createdAt\": \"2025-01-15T10:00:00Z\",\n  \"unsubscribed\": false\n}}\n```\n\n**Member Status:**\n- `unsubscribed` (boolean) - Whether member has unsubscribed\n\n**Database Constraints:**\n- Unique constraint on `[groupId, businessId]`\n- Indexes on `groupId` and `businessId`\n\nWould you like me to help you set up the group criteria?"
        })
    
    return examples

def generate_rsvp_examples():
    """Generate RSVP examples based on actual RSVP model"""
    examples = []
    
    rsvp_requests = [
        "Show me RSVP data",
        "What RSVPs do I have?",
        "List all RSVPs",
        "Show RSVP analytics",
        "Export RSVP data",
        "What's the attendance status?",
        "Show dietary preferences",
        "List accessibility needs",
        "Show referral sources",
        "Export RSVP to CSV"
    ]
    
    for request in rsvp_requests:
        examples.append({
            "instruction": "View and manage RSVP data",
            "input": request,
            "output": f"I'll help you view RSVP data. Here's what I can show you:\n\n**RSVP Data Structure:**\n```json\n{{\n  \"id\": \"rsvp-id\",\n  \"fullName\": \"John Doe\",\n  \"organization\": \"Company Name\",\n  \"email\": \"john@example.com\",\n  \"phone\": \"+1234567890\",\n  \"attendanceStatus\": \"CONFIRMED\",\n  \"attendeeCount\": 2,\n  \"dietaryPreference\": \"VEGETARIAN\",\n  \"dietaryOther\": \"No nuts\",\n  \"accessibilityNeeds\": \"Wheelchair access\",\n  \"referralSource\": \"WEBSITE\",\n  \"referralOther\": \"Google search\",\n  \"wantsResources\": true,\n  \"wantsAudit\": false,\n  \"learningGoal\": \"Learn about new technologies\",\n  \"createdAt\": \"2025-01-15T10:00:00Z\",\n  \"visitorId\": \"visitor-id\",\n  \"sessionId\": \"session-id\",\n  \"referrer\": \"https://example.com\",\n  \"eid\": \"event-id\",\n  \"utmSource\": \"google\",\n  \"utmMedium\": \"cpc\",\n  \"utmCampaign\": \"summer-event\",\n  \"utmTerm\": \"tech conference\",\n  \"utmContent\": \"banner-ad\",\n  \"userAgent\": \"Mozilla/5.0...\",\n  \"language\": \"en-US\",\n  \"tz\": \"America/Vancouver\",\n  \"country\": \"Canada\",\n  \"region\": \"BC\",\n  \"city\": \"Vancouver\",\n  \"ipHash\": \"hashed-ip\",\n  \"screenW\": 1920,\n  \"screenH\": 1080,\n  \"dpr\": 2.0,\n  \"platform\": \"MacIntel\",\n  \"device\": \"desktop\",\n  \"browser\": \"Chrome\",\n  \"meta\": \"additional data\"\n}}\n```\n\n**Key Fields:**\n- `attendanceStatus` (string) - CONFIRMED, CANCELLED, etc.\n- `attendeeCount` (number) - Number of attendees\n- `dietaryPreference` (string) - Dietary requirements\n- `accessibilityNeeds` (string) - Accessibility requirements\n- `referralSource` (string) - How they found the event\n- `wantsResources` (boolean) - Wants additional resources\n- `wantsAudit` (boolean) - Wants audit information\n- `learningGoal` (string) - What they want to learn\n\n**Tracking Data:**\n- `visitorId` - Unique visitor identifier\n- `sessionId` - Session identifier\n- `referrer` - Referring URL\n- `utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent` - UTM tracking\n- `userAgent` - Browser information\n- `language` - User language\n- `tz` - Timezone\n- `country`, `region`, `city` - Geographic data\n- `ipHash` - Hashed IP address\n- `screenW`, `screenH`, `dpr` - Screen information\n- `platform`, `device`, `browser` - Device information\n\n**Database Constraints:**\n- `email` field is unique\n- `id` is primary key (cuid)\n\n**API Endpoint:**\n```\nPOST /api/rsvp\n```\n\n**Security Features:**\n- CSRF protection\n- Rate limiting\n- Input validation\n- Test detection\n- Security logging\n\nLet me show you the RSVP data based on your request."
        })
    
    return examples

def generate_analytics_examples():
    """Generate analytics examples based on actual system capabilities"""
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
        "Generate an audience report"
    ]
    
    for request in analytics_requests:
        examples.append({
            "instruction": "View analytics and generate reports",
            "input": request,
            "output": f"I'll help you analyze your email performance. Here's what I can show you:\n\n**Campaign Analytics:**\n\n**CampaignSend Status Tracking:**\n```json\n{{\n  \"id\": \"send-id\",\n  \"scheduleId\": \"schedule-id\",\n  \"groupId\": \"group-id\",\n  \"templateId\": \"template-id\",\n  \"businessId\": \"business-id\",\n  \"businessName\": \"Business Name\",\n  \"email\": \"email@example.com\",\n  \"inviteToken\": \"token\",\n  \"inviteLink\": \"https://example.com/l/token\",\n  \"resendMessageId\": \"resend-message-id\",\n  \"status\": \"SENT\",\n  \"error\": null,\n  \"meta\": {{}},\n  \"sentAt\": \"2025-01-15T10:00:00Z\",\n  \"openedAt\": \"2025-01-15T10:05:00Z\",\n  \"visitedAt\": \"2025-01-15T10:10:00Z\"\n}}\n```\n\n**CampaignSend Status Values:**\n- `PENDING` - Not yet sent\n- `SENDING` - Currently being sent\n- `SENT` - Successfully sent\n- `FAILED` - Failed to send\n- `SKIPPED` - Skipped (e.g., unsubscribed)\n\n**Key Metrics:**\n- **Sent Count**: Total emails sent\n- **Open Rate**: Percentage of emails opened (openedAt not null)\n- **Click Rate**: Percentage of emails clicked (visitedAt not null)\n- **Bounce Rate**: Percentage of failed sends\n- **Unsubscribe Rate**: Percentage of unsubscribed members\n\n**Visit Tracking:**\n```json\n{{\n  \"id\": \"visit-id\",\n  \"createdAt\": \"2025-01-15T10:00:00Z\",\n  \"visitorId\": \"visitor-id\",\n  \"sessionId\": \"session-id\",\n  \"path\": \"/event-page\",\n  \"query\": \"?utm_source=email\",\n  \"referrer\": \"https://example.com\",\n  \"eid\": \"event-id\",\n  \"utmSource\": \"email\",\n  \"utmMedium\": \"newsletter\",\n  \"utmCampaign\": \"summer-event\",\n  \"userAgent\": \"Mozilla/5.0...\",\n  \"language\": \"en-US\",\n  \"country\": \"Canada\",\n  \"region\": \"BC\",\n  \"city\": \"Vancouver\",\n  \"timeOnPageMs\": 30000,\n  \"scrollDepth\": 75\n}}\n```\n\n**Analytics Endpoints:**\n- `GET /api/admin/campaign/dashboard` - Dashboard overview\n- `GET /api/admin/export` - Export data\n- `GET /api/l/[token]` - Track link clicks\n- `GET /api/__pixel` - Track email opens\n\n**Export Options:**\n- CSV format for RSVP data\n- JSON format for campaign data\n- Filtered by date range\n- Filtered by campaign/group\n\n**Performance Tracking:**\n- Email delivery rates\n- Open and click tracking\n- Geographic distribution\n- Device and browser analytics\n- Time-based performance\n- A/B testing results\n\nLet me generate the appropriate analytics report for your request."
        })
    
    return examples

def generate_system_examples():
    """Generate system architecture examples based on actual codebase"""
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
        "What are the environment variables?"
    ]
    
    for request in system_requests:
        examples.append({
            "instruction": "Explain system architecture and technical details",
            "input": request,
            "output": f"I'll explain the technical architecture of the RSVP system:\n\n**System Architecture:**\n\n**Frontend:**\n- **Framework**: Next.js 14 with React\n- **Styling**: Tailwind CSS\n- **Animations**: Framer Motion\n- **State Management**: React hooks (useState, useEffect)\n- **Authentication**: Session-based with cookies\n\n**Backend:**\n- **Runtime**: Node.js\n- **Framework**: Next.js API routes\n- **Database**: PostgreSQL with Prisma ORM\n- **Email Service**: Resend API\n- **Vector Database**: Weaviate (for RAG)\n- **AI Integration**: Gemini 2.5 Flash\n\n**Database Models:**\n- `RSVP` - Event RSVP submissions\n- `Visit` - Website visit tracking\n- `CampaignTemplate` - Email templates\n- `Campaign` - Email campaigns\n- `AudienceGroup` - Audience segmentation\n- `AudienceMember` - Individual audience members\n- `CampaignSchedule` - Campaign scheduling\n- `CampaignSend` - Individual email sends\n\n**API Structure:**\n- `/api/rsvp` - RSVP form submission\n- `/api/admin/campaign/campaigns` - Campaign management\n- `/api/admin/campaign/schedules` - Schedule management\n- `/api/admin/campaign/templates` - Template management\n- `/api/admin/campaign/groups` - Audience group management\n- `/api/admin/campaign/send` - Email sending\n- `/api/admin/export` - Data export\n- `/api/unsubscribe` - Unsubscribe handling\n- `/api/l/[token]` - Link tracking\n- `/api/__pixel` - Email open tracking\n\n**Security Features:**\n- CSRF protection with origin/referer validation\n- Rate limiting with IP fingerprinting\n- Input validation with Zod schemas\n- Test detection to prevent spam\n- Security logging for monitoring\n- Secure headers with CSP\n\n**Environment Variables:**\n- `DATABASE_URL` - PostgreSQL connection\n- `RESEND_API_KEY` - Email service\n- `GEMINI_API_KEY` - AI service\n- `WEAVIATE_URL` - Vector database\n- `WEAVIATE_API_KEY` - Vector database auth\n- `CRON_SECRET` - Cron job authentication\n\n**File Structure:**\n```\nrsvp-app/\n├── src/\n│   ├── app/           # Next.js app router\n│   │   ├── api/       # API routes\n│   │   ├── admin/     # Admin panel\n│   │   └── (public)/  # Public pages\n│   ├── components/    # React components\n│   ├── lib/          # Utilities and services\n│   └── prisma/       # Database schema\n├── public/           # Static assets\n└── docs/            # Documentation\n```\n\n**Deployment:**\n- **Platform**: Vercel (frontend)\n- **Database**: Neon (PostgreSQL)\n- **AI Service**: Railway (planned)\n- **Vector DB**: Weaviate Cloud\n\n**Email Delivery:**\n- Resend API for email sending\n- Throttling support (emails per minute)\n- Smart sending windows\n- Timezone support\n- Recurring campaigns\n- Link and open tracking\n\n**AI Assistant (Juniper):**\n- Conversational interface\n- Real-time execution display\n- Tool integration for database operations\n- Context awareness\n- Error handling and recovery\n- Pattern-matching system (to be replaced with fine-tuned SLM)\n\nThis architecture provides a scalable, secure, and maintainable system for RSVP management and email campaigns."
        })
    
    return examples

def generate_comprehensive_dataset():
    """Generate the complete accurate training dataset"""
    print("🚀 Generating accurate RSVP training dataset based on real codebase...")
    
    all_examples = []
    
    # Generate examples from each category
    all_examples.extend(generate_campaign_examples())
    all_examples.extend(generate_schedule_examples())
    all_examples.extend(generate_template_examples())
    all_examples.extend(generate_audience_examples())
    all_examples.extend(generate_rsvp_examples())
    all_examples.extend(generate_analytics_examples())
    all_examples.extend(generate_system_examples())
    
    # Shuffle for better training
    random.shuffle(all_examples)
    
    # Save to JSONL format
    output_file = Path("training-data/accurate-rsvp-dataset.jsonl")
    with open(output_file, 'w') as f:
        for example in all_examples:
            f.write(json.dumps(example) + '\n')
    
    print(f"✅ Generated {len(all_examples)} accurate training examples")
    print(f"📁 Saved to: {output_file}")
    
    # Also save in MLX format
    mlx_file = Path("training-data/accurate-rsvp-mlx.json")
    with open(mlx_file, 'w') as f:
        json.dump(all_examples, f, indent=2)
    
    print(f"📁 MLX format saved to: {mlx_file}")
    
    return output_file, mlx_file

if __name__ == "__main__":
    generate_comprehensive_dataset()

