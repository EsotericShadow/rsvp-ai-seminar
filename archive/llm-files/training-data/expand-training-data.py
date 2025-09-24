#!/usr/bin/env python3
"""
Expand training data with comprehensive examples
Adds to existing dataset without replacing
"""

import json
import random
from pathlib import Path

def load_existing_data():
    """Load existing training data"""
    existing_file = Path("training-data/accurate-rsvp-dataset.jsonl")
    if existing_file.exists():
        with open(existing_file, 'r') as f:
            existing_data = [json.loads(line) for line in f]
        print(f"📊 Loaded {len(existing_data)} existing examples")
        return existing_data
    return []

def generate_detailed_campaign_examples():
    """Generate detailed campaign examples with specific scenarios"""
    examples = []
    
    # Specific campaign creation scenarios
    campaign_scenarios = [
        {
            "request": "Create a welcome email campaign for new subscribers",
            "details": "Welcome new subscribers with a 3-step email sequence: welcome email, getting started guide, and first newsletter"
        },
        {
            "request": "Set up a product launch campaign for our new software",
            "details": "Multi-step campaign: announcement, early access, launch day, and follow-up"
        },
        {
            "request": "Create a re-engagement campaign for inactive users",
            "details": "Target users who haven't opened emails in 30+ days with special offers"
        },
        {
            "request": "Make a holiday promotion campaign",
            "details": "Black Friday sale with limited-time offers and urgency messaging"
        },
        {
            "request": "Set up a webinar announcement campaign",
            "details": "3-step sequence: save the date, reminder, and final reminder with agenda"
        },
        {
            "request": "Create a customer onboarding campaign",
            "details": "5-step onboarding sequence to help new customers get started"
        },
        {
            "request": "Make a survey request campaign",
            "details": "Request feedback from customers with incentives for participation"
        },
        {
            "request": "Set up a birthday/anniversary campaign",
            "details": "Personalized messages for customer milestones with special offers"
        },
        {
            "request": "Create a seasonal newsletter campaign",
            "details": "Quarterly newsletter with industry updates and company news"
        },
        {
            "request": "Make a referral program campaign",
            "details": "Encourage existing customers to refer friends with rewards"
        }
    ]
    
    for scenario in campaign_scenarios:
        examples.append({
            "instruction": "Create a detailed email campaign",
            "input": scenario["request"],
            "output": f"I'll help you create a comprehensive campaign for: {scenario['request']}\n\n**Campaign Overview:**\n{scenario['details']}\n\n**Required Information:**\n1. **Campaign Name**: What should we call this campaign?\n2. **Target Audience**: Which audience group should receive this?\n3. **Email Templates**: Do you have existing templates or need new ones?\n4. **Timing**: When should this campaign start?\n5. **Frequency**: How often should emails be sent?\n\n**API Endpoint:**\n```\nPOST /api/admin/campaign/campaigns\n```\n\n**Campaign Structure:**\n```json\n{{\n  \"name\": \"Campaign Name\",\n  \"description\": \"Detailed description\",\n  \"status\": \"DRAFT\",\n  \"steps\": [\n    {{\n      \"templateId\": \"welcome-template-id\",\n      \"groupId\": \"new-subscribers-id\",\n      \"sendAt\": \"2025-01-15T10:00:00Z\",\n      \"stepOrder\": 1,\n      \"throttlePerMinute\": 60\n    }},\n    {{\n      \"templateId\": \"follow-up-template-id\",\n      \"groupId\": \"new-subscribers-id\",\n      \"sendAt\": \"2025-01-16T10:00:00Z\",\n      \"stepOrder\": 2,\n      \"throttlePerMinute\": 60\n    }}\n  ]\n}}\n```\n\n**Campaign Best Practices:**\n- Start with DRAFT status for testing\n- Use appropriate throttle rates (60 emails/minute recommended)\n- Set clear step orders for multi-step campaigns\n- Include timezone considerations\n- Test with small audience first\n\n**Next Steps:**\n1. Create or select email templates\n2. Define target audience groups\n3. Set up campaign steps with proper timing\n4. Test the campaign flow\n5. Schedule for production\n\nWould you like me to help you set up any specific part of this campaign?"
        })
    
    return examples

def generate_template_variations():
    """Generate template creation examples with different use cases"""
    examples = []
    
    template_types = [
        {
            "type": "Welcome Email",
            "subject": "Welcome to {{company}}!",
            "content": "Thank you for joining us. Here's what to expect next...",
            "variables": ["{{name}}", "{{company}}", "{{unsubscribeUrl}}"]
        },
        {
            "type": "Product Announcement",
            "subject": "Introducing {{productName}} - Available Now!",
            "content": "We're excited to announce our latest product. Learn more and get early access...",
            "variables": ["{{name}}", "{{productName}}", "{{productUrl}}", "{{unsubscribeUrl}}"]
        },
        {
            "type": "Event Invitation",
            "subject": "You're Invited: {{eventName}} on {{eventDate}}",
            "content": "Join us for an exclusive event. RSVP now to secure your spot...",
            "variables": ["{{name}}", "{{eventName}}", "{{eventDate}}", "{{eventLocation}}", "{{rsvpUrl}}"]
        },
        {
            "type": "Newsletter",
            "subject": "{{newsletterTitle}} - {{month}} {{year}}",
            "content": "This month's highlights, industry news, and company updates...",
            "variables": ["{{name}}", "{{newsletterTitle}}", "{{month}}", "{{year}}", "{{unsubscribeUrl}}"]
        },
        {
            "type": "Survey Request",
            "subject": "Quick Survey: Help us improve {{service}}",
            "content": "Your feedback is valuable. Take our 2-minute survey and get a special offer...",
            "variables": ["{{name}}", "{{service}}", "{{surveyUrl}}", "{{incentive}}"]
        },
        {
            "type": "Re-engagement",
            "subject": "We miss you, {{name}}!",
            "content": "It's been a while since we've heard from you. Here's what you've been missing...",
            "variables": ["{{name}}", "{{lastActivity}}", "{{specialOffer}}", "{{unsubscribeUrl}}"]
        },
        {
            "type": "Thank You",
            "subject": "Thank you for {{action}}, {{name}}!",
            "content": "We appreciate your support. Here's what happens next...",
            "variables": ["{{name}}", "{{action}}", "{{nextSteps}}", "{{contactInfo}}"]
        },
        {
            "type": "Promotional",
            "subject": "{{discount}}% Off {{product}} - Limited Time!",
            "content": "Don't miss this exclusive offer. Valid until {{expiryDate}}...",
            "variables": ["{{name}}", "{{discount}}", "{{product}}", "{{expiryDate}}", "{{promoCode}}"]
        }
    ]
    
    for template in template_types:
        examples.append({
            "instruction": "Create a specific email template",
            "input": f"Create a {template['type'].lower()} template",
            "output": f"I'll help you create a {template['type']} template. Here's a comprehensive setup:\n\n**Template Type:** {template['type']}\n\n**Suggested Structure:**\n\n**Subject Line:**\n```\n{template['subject']}\n```\n\n**HTML Body Template:**\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>{template['type']}</title>\n</head>\n<body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;\">\n    <div style=\"background: #f8f9fa; padding: 20px; border-radius: 8px;\">\n        <h1 style=\"color: #2c3e50; margin-bottom: 20px;\">{{greeting_title}}</h1>\n        <p style=\"font-size: 16px; margin-bottom: 20px;\">{{greeting_message}}</p>\n        \n        <div style=\"background: white; padding: 20px; border-radius: 6px; margin: 20px 0;\">\n            <h2 style=\"color: #34495e; margin-bottom: 15px;\">{{main_content_title}}</h2>\n            <p style=\"margin-bottom: 15px;\">{template['content']}</p>\n            \n            <div style=\"text-align: center; margin: 30px 0;\">\n                <a href=\"#\" style=\"background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;\">{{button_text}}</a>\n            </div>\n        </div>\n        \n        <div style=\"margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;\">\n            <h3 style=\"color: #2c3e50; margin-bottom: 10px;\">{{additional_info_title}}</h3>\n            <p style=\"font-size: 14px; color: #666;\">{{additional_info_body}}</p>\n        </div>\n        \n        <div style=\"margin-top: 20px; text-align: center;\">\n            <p style=\"font-size: 14px; color: #666;\">{{closing_title}}</p>\n            <p style=\"font-size: 14px; color: #666;\">{{closing_message}}</p>\n        </div>\n        \n        <div style=\"margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;\">\n            <p style=\"font-size: 12px; color: #999;\">\n                <strong>{{signature_name}}</strong><br>\n                {{signature_title}}<br>\n                {{signature_company}}<br>\n                {{signature_location}}\n            </p>\n            <p style=\"font-size: 12px; color: #999; margin-top: 10px;\">\n                <a href=\"{{unsubscribeUrl}}\" style=\"color: #999;\">Unsubscribe</a> | \n                <a href=\"#\" style=\"color: #999;\">Update Preferences</a>\n            </p>\n        </div>\n    </div>\n</body>\n</html>\n```\n\n**Text Body Template:**\n```\n{{greeting_title}}\n\n{{greeting_message}}\n\n{{main_content_title}}\n{template['content']}\n\n{{button_text}}: [Link]\n\n{{additional_info_title}}\n{{additional_info_body}}\n\n{{closing_title}}\n{{closing_message}}\n\n---\n{{signature_name}}\n{{signature_title}}\n{{signature_company}}\n{{signature_location}}\n\nUnsubscribe: {{unsubscribeUrl}}\n```\n\n**Template Variables:**\n{', '.join(template['variables'])}\n\n**API Request:**\n```json\n{{\n  \"name\": \"{template['type']} Template\",\n  \"subject\": \"{template['subject']}\",\n  \"htmlBody\": \"[HTML content above]\",\n  \"textBody\": \"[Text content above]\",\n  \"meta\": {{}},\n  \"greeting_title\": \"Welcome!\",\n  \"greeting_message\": \"Thank you for your interest\",\n  \"signature_name\": \"Your Name\",\n  \"signature_title\": \"Your Title\",\n  \"signature_company\": \"Your Company\",\n  \"signature_location\": \"Your Location\",\n  \"main_content_title\": \"{template['type']}\",\n  \"main_content_body\": \"{template['content']}\",\n  \"button_text\": \"Learn More\",\n  \"additional_info_title\": \"Additional Information\",\n  \"additional_info_body\": \"For more details, visit our website\",\n  \"closing_title\": \"Thank You\",\n  \"closing_message\": \"Best regards\"\n}}\n```\n\n**Best Practices for {template['type']}:**\n- Keep subject line under 50 characters\n- Use clear, actionable language\n- Include unsubscribe link\n- Test on mobile devices\n- Personalize with recipient data\n- A/B test different versions\n\nWould you like me to customize this template for your specific needs?"
        })
    
    return examples

def generate_audience_segmentation_examples():
    """Generate detailed audience segmentation examples"""
    examples = []
    
    segmentation_scenarios = [
        {
            "name": "Geographic Segmentation",
            "description": "Segment by location, timezone, or region",
            "criteria": {
                "country": "Canada",
                "region": "BC",
                "city": "Vancouver",
                "timezone": "America/Vancouver"
            }
        },
        {
            "name": "Behavioral Segmentation",
            "description": "Segment by engagement level and activity",
            "criteria": {
                "engagement": "high",
                "lastActivity": "30_days",
                "emailOpens": "frequent",
                "clickRate": "above_average"
            }
        },
        {
            "name": "Demographic Segmentation",
            "description": "Segment by business type and industry",
            "criteria": {
                "industry": "technology",
                "companySize": "startup",
                "businessType": "SaaS",
                "tags": ["tech", "startup", "saas"]
            }
        },
        {
            "name": "Lifecycle Segmentation",
            "description": "Segment by customer lifecycle stage",
            "criteria": {
                "stage": "new_customer",
                "onboardingComplete": False,
                "firstPurchase": "recent",
                "supportTickets": 0
            }
        },
        {
            "name": "Value-Based Segmentation",
            "description": "Segment by customer value and spending",
            "criteria": {
                "customerValue": "high",
                "lifetimeValue": "above_1000",
                "purchaseFrequency": "monthly",
                "tags": ["vip", "premium"]
            }
        },
        {
            "name": "Engagement Segmentation",
            "description": "Segment by email engagement patterns",
            "criteria": {
                "openRate": "high",
                "clickRate": "high",
                "unsubscribeRate": "low",
                "lastEmailOpen": "7_days"
            }
        },
        {
            "name": "Product Interest Segmentation",
            "description": "Segment by product interests and preferences",
            "criteria": {
                "productInterest": "enterprise",
                "featureInterest": "analytics",
                "useCase": "business_intelligence",
                "tags": ["enterprise", "analytics"]
            }
        },
        {
            "name": "Event-Based Segmentation",
            "description": "Segment by event attendance and participation",
            "criteria": {
                "eventAttendance": "frequent",
                "lastEvent": "recent",
                "eventType": "webinar",
                "rsvpStatus": "confirmed"
            }
        }
    ]
    
    for scenario in segmentation_scenarios:
        examples.append({
            "instruction": "Create audience segmentation strategy",
            "input": f"Create a {scenario['name'].lower()} group",
            "output": f"I'll help you create a {scenario['name']} audience group. Here's a comprehensive setup:\n\n**Segmentation Strategy:** {scenario['name']}\n**Description:** {scenario['description']}\n\n**Segmentation Criteria:**\n```json\n{{\n  \"name\": \"{scenario['name']} Group\",\n  \"description\": \"{scenario['description']}\",\n  \"color\": \"#10b981\",\n  \"criteria\": {json.dumps(scenario['criteria'], indent=2)},\n  \"meta\": {{\n    \"createdBy\": \"AI Assistant\",\n    \"purpose\": \"{scenario['description']}\",\n    \"lastUpdated\": \"2025-01-15T10:00:00Z\",\n    \"memberCount\": 0,\n    \"autoUpdate\": true\n  }}\n}}\n```\n\n**API Endpoint:**\n```\nPOST /api/admin/campaign/groups\n```\n\n**Implementation Steps:**\n1. **Define Criteria**: Set up the segmentation rules\n2. **Create Group**: Use the API to create the audience group\n3. **Populate Members**: Add existing members or import new ones\n4. **Test Segmentation**: Verify the criteria work correctly\n5. **Monitor Performance**: Track engagement and adjust as needed\n\n**Member Addition:**\n```json\n{{\n  \"groupId\": \"group-id\",\n  \"businessId\": \"business-id\",\n  \"businessName\": \"Business Name\",\n  \"primaryEmail\": \"email@example.com\",\n  \"secondaryEmail\": \"secondary@example.com\",\n  \"tagsSnapshot\": [\"tag1\", \"tag2\"],\n  \"meta\": {{\n    \"source\": \"import\",\n    \"addedBy\": \"AI Assistant\",\n    \"addedAt\": \"2025-01-15T10:00:00Z\"\n  }}\n}}\n```\n\n**Best Practices:**\n- Use clear, measurable criteria\n- Test with small groups first\n- Monitor engagement rates\n- Update criteria regularly\n- Document segmentation logic\n- Use consistent naming conventions\n\n**Performance Metrics:**\n- Open rates by segment\n- Click-through rates\n- Unsubscribe rates\n- Conversion rates\n- Engagement scores\n\n**Automation Opportunities:**\n- Auto-add new members based on criteria\n- Remove inactive members\n- Update tags based on behavior\n- Trigger campaigns based on segment changes\n\nWould you like me to help you implement this segmentation strategy?"
        })
    
    return examples

def generate_automation_workflow_examples():
    """Generate automation workflow examples"""
    examples = []
    
    workflow_scenarios = [
        {
            "name": "Welcome Series",
            "trigger": "NEW_SUBSCRIBER",
            "description": "Automated welcome email sequence for new subscribers",
            "steps": [
                {"delay": "immediate", "action": "send_welcome_email"},
                {"delay": "1_day", "action": "send_getting_started_guide"},
                {"delay": "3_days", "action": "send_first_newsletter"}
            ]
        },
        {
            "name": "Abandoned Cart Recovery",
            "trigger": "CART_ABANDONED",
            "description": "Recover abandoned carts with targeted emails",
            "steps": [
                {"delay": "1_hour", "action": "send_cart_reminder"},
                {"delay": "24_hours", "action": "send_discount_offer"},
                {"delay": "72_hours", "action": "send_final_reminder"}
            ]
        },
        {
            "name": "Re-engagement Campaign",
            "trigger": "INACTIVE_USER",
            "description": "Re-engage users who haven't opened emails in 30+ days",
            "steps": [
                {"delay": "immediate", "action": "send_we_miss_you_email"},
                {"delay": "7_days", "action": "send_special_offer"},
                {"delay": "14_days", "action": "send_final_chance_email"}
            ]
        },
        {
            "name": "Event Follow-up",
            "trigger": "EVENT_ATTENDED",
            "description": "Follow up with event attendees",
            "steps": [
                {"delay": "immediate", "action": "send_thank_you_email"},
                {"delay": "1_day", "action": "send_event_resources"},
                {"delay": "7_days", "action": "send_feedback_survey"}
            ]
        },
        {
            "name": "Birthday Campaign",
            "trigger": "BIRTHDAY",
            "description": "Send birthday wishes and special offers",
            "steps": [
                {"delay": "immediate", "action": "send_birthday_wishes"},
                {"delay": "1_day", "action": "send_birthday_offer"}
            ]
        },
        {
            "name": "Purchase Follow-up",
            "trigger": "PURCHASE_COMPLETED",
            "description": "Follow up after purchase with support and upsells",
            "steps": [
                {"delay": "immediate", "action": "send_purchase_confirmation"},
                {"delay": "1_day", "action": "send_setup_guide"},
                {"delay": "7_days", "action": "send_support_check"},
                {"delay": "30_days", "action": "send_upsell_offer"}
            ]
        }
    ]
    
    for workflow in workflow_scenarios:
        examples.append({
            "instruction": "Set up automation workflow",
            "input": f"Create a {workflow['name'].lower()} automation",
            "output": f"I'll help you set up a {workflow['name']} automation workflow. Here's a comprehensive setup:\n\n**Workflow:** {workflow['name']}\n**Trigger:** {workflow['trigger']}\n**Description:** {workflow['description']}\n\n**Workflow Steps:**\n"
        })
    
    return examples

def generate_analytics_reporting_examples():
    """Generate detailed analytics and reporting examples"""
    examples = []
    
    report_types = [
        {
            "name": "Campaign Performance Report",
            "metrics": ["open_rate", "click_rate", "bounce_rate", "unsubscribe_rate"],
            "timeframe": "last_30_days",
            "breakdown": ["by_campaign", "by_template", "by_audience"]
        },
        {
            "name": "Audience Engagement Report",
            "metrics": ["engagement_score", "activity_level", "growth_rate"],
            "timeframe": "last_90_days",
            "breakdown": ["by_segment", "by_industry", "by_geography"]
        },
        {
            "name": "Email Deliverability Report",
            "metrics": ["delivery_rate", "bounce_rate", "spam_rate", "reputation_score"],
            "timeframe": "last_7_days",
            "breakdown": ["by_domain", "by_provider", "by_campaign"]
        },
        {
            "name": "Revenue Attribution Report",
            "metrics": ["revenue_generated", "conversion_rate", "roi", "lifetime_value"],
            "timeframe": "last_quarter",
            "breakdown": ["by_campaign", "by_segment", "by_channel"]
        },
        {
            "name": "RSVP Analytics Report",
            "metrics": ["rsvp_rate", "attendance_rate", "cancellation_rate"],
            "timeframe": "last_6_months",
            "breakdown": ["by_event", "by_source", "by_demographics"]
        }
    ]
    
    for report in report_types:
        examples.append({
            "instruction": "Generate analytics report",
            "input": f"Generate a {report['name'].lower()}",
            "output": f"I'll help you generate a {report['name']}. Here's a comprehensive analysis:\n\n**Report Type:** {report['name']}\n**Timeframe:** {report['timeframe']}\n**Key Metrics:** {', '.join(report['metrics'])}\n**Breakdown:** {', '.join(report['breakdown'])}\n\n**Data Collection:**\n```json\n{{\n  \"reportType\": \"{report['name']}\",\n  \"timeframe\": \"{report['timeframe']}\",\n  \"metrics\": {json.dumps(report['metrics'])},\n  \"breakdown\": {json.dumps(report['breakdown'])},\n  \"filters\": {{\n    \"campaignStatus\": [\"SENT\", \"COMPLETED\"],\n    \"audienceGroups\": [\"all\"],\n    \"excludeTest\": true\n  }}\n}}\n```\n\n**API Endpoints:**\n- `GET /api/admin/campaign/dashboard` - Dashboard data\n- `GET /api/admin/export` - Export raw data\n- `GET /api/admin/analytics/visitors` - Visitor analytics\n- `GET /api/admin/analytics/tracking-links` - Link performance\n\n**Key Performance Indicators:**\n"
        })
    
    return examples

def generate_troubleshooting_examples():
    """Generate troubleshooting and problem-solving examples"""
    examples = []
    
    common_issues = [
        {
            "problem": "Low email open rates",
            "symptoms": ["Open rates below 20%", "Declining engagement", "Poor deliverability"],
            "solutions": ["Improve subject lines", "Optimize send times", "Clean email list", "A/B test content"]
        },
        {
            "problem": "High bounce rates",
            "symptoms": ["Bounce rate above 5%", "Delivery failures", "Spam complaints"],
            "solutions": ["Validate email addresses", "Remove inactive subscribers", "Improve sender reputation", "Use double opt-in"]
        },
        {
            "problem": "Campaign not sending",
            "symptoms": ["Campaign stuck in DRAFT", "No emails sent", "Error messages"],
            "solutions": ["Check campaign status", "Verify audience groups", "Test email templates", "Check API limits"]
        },
        {
            "problem": "Poor audience segmentation",
            "symptoms": ["Low engagement", "Irrelevant content", "High unsubscribe rates"],
            "solutions": ["Refine segmentation criteria", "Collect more data", "Use behavioral triggers", "Test different segments"]
        },
        {
            "problem": "RSVP form issues",
            "symptoms": ["Form not submitting", "Validation errors", "Missing data"],
            "solutions": ["Check form validation", "Test form submission", "Verify database connection", "Review error logs"]
        }
    ]
    
    for issue in common_issues:
        examples.append({
            "instruction": "Troubleshoot system issues",
            "input": f"Help me fix {issue['problem']}",
            "output": f"I'll help you troubleshoot {issue['problem']}. Here's a comprehensive solution:\n\n**Problem:** {issue['problem']}\n\n**Common Symptoms:**\n{chr(10).join([f'- {symptom}' for symptom in issue['symptoms']])}\n\n**Diagnostic Steps:**\n1. **Check System Status**: Verify all services are running\n2. **Review Logs**: Check error logs for specific issues\n3. **Test Components**: Test individual system components\n4. **Monitor Metrics**: Check relevant performance metrics\n5. **Validate Data**: Ensure data integrity\n\n**Recommended Solutions:**\n{chr(10).join([f'- {solution}' for solution in issue['solutions']])}\n\n**Implementation Steps:**\n"
        })
    
    return examples

def generate_advanced_features_examples():
    """Generate examples for advanced features and integrations"""
    examples = []
    
    advanced_features = [
        {
            "feature": "A/B Testing",
            "description": "Test different email versions to optimize performance",
            "implementation": "Create multiple template variants and test with different audience segments"
        },
        {
            "feature": "Dynamic Content",
            "description": "Personalize email content based on recipient data",
            "implementation": "Use template variables and conditional content blocks"
        },
        {
            "feature": "Smart Sending",
            "description": "Send emails at optimal times for each recipient",
            "implementation": "Use smart sending windows and timezone optimization"
        },
        {
            "feature": "Behavioral Triggers",
            "description": "Trigger emails based on user behavior and actions",
            "implementation": "Set up automation workflows with behavioral conditions"
        },
        {
            "feature": "Advanced Segmentation",
            "description": "Create complex audience segments with multiple criteria",
            "implementation": "Use nested criteria and boolean logic for segmentation"
        },
        {
            "feature": "Integration APIs",
            "description": "Connect with external services and platforms",
            "implementation": "Use webhooks and API integrations for data sync"
        }
    ]
    
    for feature in advanced_features:
        examples.append({
            "instruction": "Implement advanced features",
            "input": f"Set up {feature['feature'].lower()}",
            "output": f"I'll help you implement {feature['feature']}. Here's a comprehensive guide:\n\n**Feature:** {feature['feature']}\n**Description:** {feature['description']}\n**Implementation:** {feature['implementation']}\n\n**Setup Requirements:**\n"
        })
    
    return examples

def generate_comprehensive_expansion():
    """Generate comprehensive expansion of training data"""
    print("🚀 Generating comprehensive training data expansion...")
    
    # Load existing data
    existing_data = load_existing_data()
    
    # Generate new examples
    new_examples = []
    new_examples.extend(generate_detailed_campaign_examples())
    new_examples.extend(generate_template_variations())
    new_examples.extend(generate_audience_segmentation_examples())
    new_examples.extend(generate_automation_workflow_examples())
    new_examples.extend(generate_analytics_reporting_examples())
    new_examples.extend(generate_troubleshooting_examples())
    new_examples.extend(generate_advanced_features_examples())
    
    # Combine with existing data
    all_examples = existing_data + new_examples
    
    # Shuffle for better training
    random.shuffle(all_examples)
    
    # Save expanded dataset
    output_file = Path("training-data/comprehensive-rsvp-dataset.jsonl")
    with open(output_file, 'w') as f:
        for example in all_examples:
            f.write(json.dumps(example) + '\n')
    
    print(f"✅ Generated {len(new_examples)} new examples")
    print(f"📊 Total examples: {len(all_examples)}")
    print(f"📁 Saved to: {output_file}")
    
    # Also save in MLX format
    mlx_file = Path("training-data/comprehensive-rsvp-mlx.json")
    with open(mlx_file, 'w') as f:
        json.dump(all_examples, f, indent=2)
    
    print(f"📁 MLX format saved to: {mlx_file}")
    
    return output_file, mlx_file

if __name__ == "__main__":
    generate_comprehensive_expansion()
