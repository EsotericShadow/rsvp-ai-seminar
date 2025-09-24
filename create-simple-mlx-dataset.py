#!/usr/bin/env python3
"""
Create a simple MLX-compatible dataset
"""

import json
from pathlib import Path

def create_simple_dataset():
    """Create a simple dataset that MLX can understand"""
    print("🔄 Creating simple MLX dataset...")
    
    # Simple examples in the format MLX expects
    examples = [
        {
            "text": "### Instruction:\nCreate a new email campaign\n\n### Input:\nI want to create a campaign for our summer sale\n\n### Response:\nI'll help you create a summer sale campaign. Here's what I need:\n\n**Required Information:**\n1. **Campaign Name**: What should we call this campaign?\n2. **Target Audience**: Which audience group should receive this?\n3. **Email Template**: Do you have an existing template or need a new one?\n4. **Timing**: When should this campaign start?\n\n**API Endpoint:**\n```\nPOST /api/admin/campaign/campaigns\n```\n\n**Request Body:**\n```json\n{\n  \"name\": \"Summer Sale Campaign\",\n  \"description\": \"Promotional campaign for summer sale\",\n  \"status\": \"DRAFT\",\n  \"steps\": [\n    {\n      \"templateId\": \"template-id\",\n      \"groupId\": \"audience-group-id\",\n      \"sendAt\": \"2025-01-15T10:00:00Z\",\n      \"stepOrder\": 1\n    }\n  ]\n}\n```\n\nWould you like me to help you set up the campaign details?"
        },
        {
            "text": "### Instruction:\nShow me all campaigns\n\n### Input:\nWhat campaigns do I have?\n\n### Response:\nI'll show you all your campaigns. Here's how to retrieve them:\n\n**API Endpoint:**\n```\nGET /api/admin/campaign/campaigns\n```\n\n**Response:**\n```json\n{\n  \"campaigns\": [\n    {\n      \"id\": \"campaign-id\",\n      \"name\": \"Campaign Name\",\n      \"description\": \"Description\",\n      \"status\": \"DRAFT\",\n      \"meta\": {},\n      \"createdAt\": \"2025-01-15T10:00:00Z\",\n      \"updatedAt\": \"2025-01-15T10:00:00Z\",\n      \"schedules\": []\n    }\n  ]\n}\n```\n\n**Campaign Status Options:**\n- `DRAFT` - Not yet ready to send\n- `SCHEDULED` - Scheduled for future send\n- `SENDING` - Currently being sent\n- `PAUSED` - Temporarily paused\n- `COMPLETED` - Finished sending\n- `CANCELLED` - Cancelled\n\nLet me retrieve your campaigns now."
        },
        {
            "text": "### Instruction:\nCreate an email template\n\n### Input:\nI need a welcome email template\n\n### Response:\nI'll help you create a welcome email template. Here's a comprehensive setup:\n\n**Template Type:** Welcome Email\n\n**API Endpoint:**\n```\nPOST /api/admin/campaign/templates\n```\n\n**Request Body:**\n```json\n{\n  \"name\": \"Welcome Email Template\",\n  \"subject\": \"Welcome to {{company}}!\",\n  \"htmlBody\": \"<h1>Hello {{name}}</h1><p>Thank you for joining us!</p>\",\n  \"textBody\": \"Hello {{name}}\\n\\nThank you for joining us!\",\n  \"meta\": {},\n  \"greeting_title\": \"Welcome!\",\n  \"greeting_message\": \"Thank you for your interest\",\n  \"signature_name\": \"Your Name\",\n  \"signature_title\": \"Your Title\",\n  \"signature_company\": \"Your Company\"\n}\n```\n\n**Template Variables:**\n- `{{name}}` - Recipient's full name\n- `{{email}}` - Email address\n- `{{company}}` - Company name\n- `{{unsubscribeUrl}}` - Unsubscribe link\n\nWould you like me to customize this template for your needs?"
        },
        {
            "text": "### Instruction:\nCreate an audience group\n\n### Input:\nI need a group for tech professionals\n\n### Response:\nI'll help you create an audience group for tech professionals. Here's the setup:\n\n**API Endpoint:**\n```\nPOST /api/admin/campaign/groups\n```\n\n**Request Body:**\n```json\n{\n  \"name\": \"Tech Professionals\",\n  \"description\": \"Technology industry professionals\",\n  \"color\": \"#10b981\",\n  \"criteria\": {\n    \"industry\": \"technology\",\n    \"companySize\": \"startup\",\n    \"tags\": [\"tech\", \"startup\", \"saas\"]\n  },\n  \"meta\": {}\n}\n```\n\n**Response:**\n```json\n{\n  \"group\": {\n    \"id\": \"group-id\",\n    \"name\": \"Tech Professionals\",\n    \"description\": \"Technology industry professionals\",\n    \"color\": \"#10b981\",\n    \"criteria\": {},\n    \"meta\": {},\n    \"createdAt\": \"2025-01-15T10:00:00Z\",\n    \"updatedAt\": \"2025-01-15T10:00:00Z\",\n    \"members\": []\n  }\n}\n```\n\nWould you like me to help you set up the group criteria?"
        },
        {
            "text": "### Instruction:\nShow me RSVP data\n\n### Input:\nWhat RSVPs do I have?\n\n### Response:\nI'll show you your RSVP data. Here's what I can display:\n\n**RSVP Data Structure:**\n```json\n{\n  \"id\": \"rsvp-id\",\n  \"fullName\": \"John Doe\",\n  \"organization\": \"Company Name\",\n  \"email\": \"john@example.com\",\n  \"phone\": \"+1234567890\",\n  \"attendanceStatus\": \"CONFIRMED\",\n  \"attendeeCount\": 2,\n  \"dietaryPreference\": \"VEGETARIAN\",\n  \"accessibilityNeeds\": \"Wheelchair access\",\n  \"referralSource\": \"WEBSITE\",\n  \"wantsResources\": true,\n  \"createdAt\": \"2025-01-15T10:00:00Z\"\n}\n```\n\n**Key Fields:**\n- `attendanceStatus` - CONFIRMED, CANCELLED, etc.\n- `attendeeCount` - Number of attendees\n- `dietaryPreference` - Dietary requirements\n- `accessibilityNeeds` - Accessibility requirements\n- `referralSource` - How they found the event\n\nLet me retrieve your RSVP data now."
        }
    ]
    
    # Save the dataset
    output_file = Path("training-data/simple-mlx-dataset.json")
    with open(output_file, 'w') as f:
        json.dump(examples, f, indent=2)
    
    print(f"✅ Created {len(examples)} simple examples")
    print(f"📁 Saved to: {output_file}")
    
    return output_file

if __name__ == "__main__":
    create_simple_dataset()

