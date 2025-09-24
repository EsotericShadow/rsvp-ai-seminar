#!/usr/bin/env python3
"""
Generate real-world business scenarios and use cases
Final expansion of training data with practical examples
"""

import json
import random
from pathlib import Path

def load_existing_data():
    """Load existing advanced training data"""
    existing_file = Path("training-data/advanced-rsvp-dataset.jsonl")
    if existing_file.exists():
        with open(existing_file, 'r') as f:
            existing_data = [json.loads(line) for line in f]
        print(f"📊 Loaded {len(existing_data)} existing examples")
        return existing_data
    return []

def generate_business_scenarios():
    """Generate real business scenarios"""
    examples = []
    
    business_cases = [
        {
            "scenario": "Tech Conference RSVP Management",
            "context": "Managing RSVPs for a 500-person tech conference with multiple sessions, dietary requirements, and accessibility needs",
            "challenges": ["High volume RSVPs", "Complex dietary tracking", "Accessibility accommodations", "Session capacity management"],
            "solutions": ["Automated RSVP processing", "Dietary preference tracking", "Accessibility needs documentation", "Real-time capacity monitoring"]
        },
        {
            "scenario": "SaaS Product Launch Campaign",
            "context": "Launching a new SaaS product with targeted email campaigns to different customer segments",
            "challenges": ["Segment-specific messaging", "Timing optimization", "Feature adoption tracking", "Conversion optimization"],
            "solutions": ["Audience segmentation", "Smart sending windows", "Behavioral triggers", "A/B testing"]
        },
        {
            "scenario": "Nonprofit Fundraising Event",
            "context": "Organizing a fundraising gala with RSVP management, donor communication, and event coordination",
            "challenges": ["Donor relationship management", "Event logistics", "RSVP tracking", "Follow-up communication"],
            "solutions": ["Donor segmentation", "Event management integration", "Automated follow-ups", "Donation tracking"]
        },
        {
            "scenario": "Corporate Training Program",
            "context": "Managing employee training sessions with RSVP tracking, material distribution, and progress monitoring",
            "challenges": ["Employee scheduling", "Training material delivery", "Progress tracking", "Compliance reporting"],
            "solutions": ["Employee segmentation", "Automated material delivery", "Progress monitoring", "Compliance automation"]
        },
        {
            "scenario": "E-commerce Customer Retention",
            "context": "Implementing customer retention campaigns for an e-commerce business with personalized messaging",
            "challenges": ["Customer lifecycle management", "Personalization at scale", "Cart abandonment recovery", "Loyalty program integration"],
            "solutions": ["Lifecycle segmentation", "Dynamic content", "Behavioral triggers", "Loyalty automation"]
        }
    ]
    
    for case in business_cases:
        challenges_list = "\n".join([f"- {challenge}" for challenge in case['challenges']])
        solutions_list = "\n".join([f"- {solution}" for solution in case['solutions']])
        
        examples.append({
            "instruction": "Handle complex business scenarios",
            "input": f"How do I manage {case['scenario'].lower()}?",
            "output": f"I'll help you manage {case['scenario']}. Here's a comprehensive business solution:\n\n**Business Scenario:** {case['scenario']}\n**Context:** {case['context']}\n\n**Key Challenges:**\n{challenges_list}\n\n**Recommended Solutions:**\n{solutions_list}\n\n**Implementation Strategy:**\n\n**1. Audience Segmentation:**\n```json\n{{\n  \"segments\": [\n    {{\n      \"name\": \"Primary Audience\",\n      \"criteria\": {{\n        \"engagement\": \"high\",\n        \"industry\": \"relevant\",\n        \"location\": \"target_region\"\n      }}\n    }},\n    {{\n      \"name\": \"Secondary Audience\",\n      \"criteria\": {{\n        \"engagement\": \"medium\",\n        \"potential\": \"high\"\n      }}\n    }}\n  ]\n}}\n```\n\n**2. Campaign Structure:**\n```json\n{{\n  \"campaigns\": [\n    {{\n      \"name\": \"Initial Outreach\",\n      \"type\": \"announcement\",\n      \"audience\": \"primary\",\n      \"timing\": \"immediate\"\n    }},\n    {{\n      \"name\": \"Follow-up Series\",\n      \"type\": \"nurture\",\n      \"audience\": \"all\",\n      \"timing\": \"staggered\"\n    }},\n    {{\n      \"name\": \"Final Reminder\",\n      \"type\": \"urgency\",\n      \"audience\": \"non_responders\",\n      \"timing\": \"deadline_approach\"\n    }}\n  ]\n}}\n```\n\n**3. Automation Workflows:**\n```json\n{{\n  \"workflows\": [\n    {{\n      \"trigger\": \"RSVP_RECEIVED\",\n      \"actions\": [\n        \"send_confirmation\",\n        \"update_attendance_list\",\n        \"trigger_follow_up_sequence\"\n      ]\n    }},\n    {{\n      \"trigger\": \"EVENT_REMINDER\",\n      \"actions\": [\n        \"send_reminder_email\",\n        \"update_calendar_invite\",\n        \"check_capacity\"\n      ]\n    }}\n  ]\n}}\n```\n\n**4. Performance Tracking:**\n```json\n{{\n  \"metrics\": {{\n    \"rsvp_rate\": \"target_80_percent\",\n    \"email_open_rate\": \"target_25_percent\",\n    \"click_through_rate\": \"target_5_percent\",\n    \"conversion_rate\": \"target_15_percent\"\n  }},\n  \"reporting\": [\n    \"daily_rsvp_summary\",\n    \"weekly_engagement_report\",\n    \"monthly_performance_analysis\"\n  ]\n}}\n```\n\n**5. Integration Points:**\n- **CRM Integration**: Sync RSVP data with customer records\n- **Calendar Integration**: Automatically create calendar events\n- **Payment Integration**: Handle event fees and donations\n- **Analytics Integration**: Track engagement and conversions\n\n**Best Practices:**\n- Start with a pilot group to test the process\n- Use A/B testing to optimize messaging\n- Implement feedback loops for continuous improvement\n- Monitor key metrics and adjust strategies\n- Maintain data quality and compliance\n\n**Success Metrics:**\n- RSVP completion rate\n- Email engagement rates\n- Event attendance rate\n- Customer satisfaction scores\n- Revenue impact (if applicable)\n\nWould you like me to help you implement any specific part of this solution?"
        })
    
    return examples

def generate_industry_specific_examples():
    """Generate industry-specific examples"""
    examples = []
    
    industries = [
        {
            "industry": "Healthcare",
            "use_cases": ["Patient education events", "Medical conference RSVPs", "Healthcare provider training", "Patient appointment reminders"],
            "compliance": ["HIPAA compliance", "Patient privacy", "Medical data protection", "Regulatory requirements"],
            "features": ["Secure data handling", "Compliance reporting", "Patient consent management", "Audit trails"]
        },
        {
            "industry": "Education",
            "use_cases": ["Student orientation", "Parent-teacher conferences", "Educational workshops", "Alumni events"],
            "compliance": ["FERPA compliance", "Student privacy", "Educational data protection", "Accessibility requirements"],
            "features": ["Student data management", "Parent communication", "Event scheduling", "Resource distribution"]
        },
        {
            "industry": "Financial Services",
            "use_cases": ["Client seminars", "Investment workshops", "Compliance training", "Regulatory updates"],
            "compliance": ["SOX compliance", "Financial regulations", "Client data protection", "Audit requirements"],
            "features": ["Secure communication", "Compliance tracking", "Client segmentation", "Regulatory reporting"]
        },
        {
            "industry": "Real Estate",
            "use_cases": ["Property showings", "Open houses", "Client events", "Market updates"],
            "compliance": ["Real estate regulations", "Client confidentiality", "Fair housing laws", "Data protection"],
            "features": ["Property management", "Client relationship management", "Market analysis", "Lead generation"]
        },
        {
            "industry": "Nonprofit",
            "use_cases": ["Fundraising events", "Volunteer coordination", "Donor communication", "Community outreach"],
            "compliance": ["Nonprofit regulations", "Donor privacy", "Tax compliance", "Grant requirements"],
            "features": ["Donor management", "Volunteer coordination", "Event fundraising", "Impact tracking"]
        }
    ]
    
    for industry in industries:
        use_cases_list = "\n".join([f"- {use_case}" for use_case in industry['use_cases']])
        compliance_list = "\n".join([f"- {compliance}" for compliance in industry['compliance']])
        features_list = "\n".join([f"- {feature}" for feature in industry['features']])
        
        examples.append({
            "instruction": "Implement industry-specific solutions",
            "input": f"How do I set up email campaigns for {industry['industry'].lower()}?",
            "output": f"I'll help you set up email campaigns for the {industry['industry']} industry. Here's a comprehensive industry-specific solution:\n\n**Industry:** {industry['industry']}\n\n**Common Use Cases:**\n{use_cases_list}\n\n**Compliance Requirements:**\n{compliance_list}\n\n**Key Features:**\n{features_list}\n\n**Industry-Specific Configuration:**\n\n**1. Audience Segmentation:**\n```json\n{{\n  \"segments\": [\n    {{\n      \"name\": \"Primary Stakeholders\",\n      \"criteria\": {{\n        \"role\": \"primary\",\n        \"engagement\": \"high\",\n        \"compliance_status\": \"verified\"\n      }}\n    }},\n    {{\n      \"name\": \"Secondary Audience\",\n      \"criteria\": {{\n        \"role\": \"secondary\",\n        \"potential\": \"high\",\n        \"compliance_status\": \"pending\"\n      }}\n    }}\n  ]\n}}\n```\n\n**2. Compliance Templates:**\n```json\n{{\n  \"templates\": [\n    {{\n      \"name\": \"Compliance Notice\",\n      \"subject\": \"Important {industry['industry']} Update\",\n      \"content\": \"Industry-specific compliance information\",\n      \"disclaimers\": \"Required legal disclaimers\"\n    }},\n    {{\n      \"name\": \"Event Invitation\",\n      \"subject\": \"You're Invited: {industry['industry']} Event\",\n      \"content\": \"Event details and registration\",\n      \"compliance\": \"Industry-specific requirements\"\n    }}\n  ]\n}}\n```\n\n**3. Data Protection:**\n```json\n{{\n  \"data_protection\": {{\n    \"encryption\": \"AES-256\",\n    \"access_controls\": \"role_based\",\n    \"audit_logging\": \"comprehensive\",\n    \"retention_policy\": \"industry_compliant\",\n    \"backup_strategy\": \"encrypted_backups\"\n  }}\n}}\n```\n\n**4. Workflow Automation:**\n```json\n{{\n  \"workflows\": [\n    {{\n      \"trigger\": \"COMPLIANCE_UPDATE\",\n      \"actions\": [\n        \"send_compliance_notice\",\n        \"update_audit_log\",\n        \"notify_compliance_team\"\n      ]\n    }},\n    {{\n      \"trigger\": \"EVENT_REGISTRATION\",\n      \"actions\": [\n        \"send_confirmation\",\n        \"update_attendance_list\",\n        \"trigger_reminder_sequence\"\n      ]\n    }}\n  ]\n}}\n```\n\n**5. Reporting and Analytics:**\n```json\n{{\n  \"reporting\": {{\n    \"compliance_reports\": \"monthly\",\n    \"engagement_metrics\": \"weekly\",\n    \"audit_trails\": \"real_time\",\n    \"performance_dashboard\": \"daily\"\n  }}\n}}\n```\n\n**Implementation Checklist:**\n- [ ] Set up industry-specific audience segments\n- [ ] Create compliance-compliant email templates\n- [ ] Implement data protection measures\n- [ ] Configure audit logging\n- [ ] Set up automated workflows\n- [ ] Test compliance requirements\n- [ ] Train team on industry regulations\n- [ ] Establish monitoring and reporting\n\n**Best Practices:**\n- Regular compliance audits\n- Staff training on industry regulations\n- Data minimization principles\n- Transparent communication\n- Continuous monitoring\n- Incident response planning\n\n**Success Metrics:**\n- Compliance adherence rate\n- Engagement rates\n- Event attendance\n- Customer satisfaction\n- Regulatory compliance score\n\nWould you like me to help you implement any specific compliance or industry requirements?"
        })
    
    return examples

def generate_technical_implementation_examples():
    """Generate technical implementation examples"""
    examples = []
    
    technical_scenarios = [
        {
            "scenario": "High-Volume Email Sending",
            "challenge": "Sending 100,000+ emails efficiently without hitting rate limits",
            "solution": "Implement intelligent throttling, queue management, and batch processing",
            "technical_details": {
                "throttling": "60 emails per minute per IP",
                "batching": "1000 emails per batch",
                "queue_management": "Redis-based queue",
                "monitoring": "Real-time delivery tracking"
            }
        },
        {
            "scenario": "Real-time RSVP Processing",
            "challenge": "Processing RSVPs instantly with immediate confirmation and capacity updates",
            "solution": "Implement real-time processing with WebSocket updates and database triggers",
            "technical_details": {
                "processing": "Event-driven architecture",
                "updates": "WebSocket real-time updates",
                "database": "PostgreSQL with triggers",
                "caching": "Redis for session management"
            }
        },
        {
            "scenario": "Multi-tenant Architecture",
            "challenge": "Supporting multiple organizations with isolated data and configurations",
            "solution": "Implement tenant isolation with separate databases and configuration management",
            "technical_details": {
                "isolation": "Database per tenant",
                "configuration": "Tenant-specific settings",
                "routing": "Subdomain-based routing",
                "security": "Tenant-level access controls"
            }
        },
        {
            "scenario": "Advanced Analytics and Reporting",
            "challenge": "Providing real-time analytics with complex queries and data visualization",
            "solution": "Implement data warehouse with ETL processes and real-time dashboards",
            "technical_details": {
                "warehouse": "PostgreSQL with materialized views",
                "etl": "Scheduled data processing",
                "dashboards": "Real-time data visualization",
                "caching": "Query result caching"
            }
        }
    ]
    
    for scenario in technical_scenarios:
        details = scenario['technical_details']
        details_list = "\n".join([f"- **{key}**: {value}" for key, value in details.items()])
        
        examples.append({
            "instruction": "Implement technical solutions",
            "input": f"How do I implement {scenario['scenario'].lower()}?",
            "output": f"I'll help you implement {scenario['scenario']}. Here's a comprehensive technical solution:\n\n**Scenario:** {scenario['scenario']}\n**Challenge:** {scenario['challenge']}\n**Solution:** {scenario['solution']}\n\n**Technical Implementation:**\n{details_list}\n\n**Architecture Overview:**\n```json\n{{\n  \"architecture\": {{\n    \"frontend\": \"Next.js with React\",\n    \"backend\": \"Next.js API routes\",\n    \"database\": \"PostgreSQL with Prisma\",\n    \"caching\": \"Redis\",\n    \"queue\": \"Redis-based job queue\",\n    \"monitoring\": \"Real-time metrics\"\n  }}\n}}\n```\n\n**Implementation Steps:**\n\n**1. Database Schema:**\n```sql\n-- Example schema for high-volume processing\nCREATE TABLE email_queue (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  recipient_email VARCHAR(255) NOT NULL,\n  template_id UUID NOT NULL,\n  status VARCHAR(50) DEFAULT 'pending',\n  scheduled_at TIMESTAMP,\n  created_at TIMESTAMP DEFAULT NOW(),\n  processed_at TIMESTAMP\n);\n\nCREATE INDEX idx_email_queue_status ON email_queue(status);\nCREATE INDEX idx_email_queue_scheduled ON email_queue(scheduled_at);\n```\n\n**2. Queue Processing:**\n```javascript\n// Email queue processor\nclass EmailQueueProcessor {{\n  constructor() {{\n    this.batchSize = 1000;\n    this.throttleRate = 60; // emails per minute\n  }}\n  \n  async processBatch() {{\n    const emails = await this.getPendingEmails(this.batchSize);\n    \n    for (const email of emails) {{\n      await this.sendEmail(email);\n      await this.updateStatus(email.id, 'sent');\n      await this.throttle();\n    }}\n  }}\n  \n  async throttle() {{\n    const delay = 60000 / this.throttleRate; // 1 second per email\n    await new Promise(resolve => setTimeout(resolve, delay));\n  }}\n}}\n```\n\n**3. Real-time Updates:**\n```javascript\n// WebSocket implementation for real-time updates\nclass RealtimeUpdates {{\n  constructor() {{\n    this.clients = new Map();\n  }}\n  \n  addClient(tenantId, client) {{\n    if (!this.clients.has(tenantId)) {{\n      this.clients.set(tenantId, new Set());\n    }}\n    this.clients.get(tenantId).add(client);\n  }}\n  \n  broadcast(tenantId, event, data) {{\n    const clients = this.clients.get(tenantId);\n    if (clients) {{\n      clients.forEach(client => {{\n        client.send(JSON.stringify({{ event, data }}));\n      }});\n    }}\n  }}\n}}\n```\n\n**4. Monitoring and Metrics:**\n```javascript\n// Performance monitoring\nclass PerformanceMonitor {{\n  constructor() {{\n    this.metrics = new Map();\n  }}\n  \n  recordMetric(name, value) {{\n    if (!this.metrics.has(name)) {{\n      this.metrics.set(name, []);\n    }}\n    this.metrics.get(name).push({{\n      value,\n      timestamp: Date.now()\n    }});\n  }}\n  \n  getMetrics(name) {{\n    return this.metrics.get(name) || [];\n  }}\n}}\n```\n\n**5. Error Handling and Recovery:**\n```javascript\n// Robust error handling\nclass ErrorHandler {{\n  static async handleEmailError(error, email) {{\n    console.error('Email error:', error);\n    \n    if (error.code === 'RATE_LIMIT') {{\n      await this.retryLater(email, 300000); // 5 minutes\n    }} else if (error.code === 'INVALID_EMAIL') {{\n      await this.markAsBounced(email);\n    }} else {{\n      await this.retryLater(email, 60000); // 1 minute\n    }}\n  }}\n}}\n```\n\n**Performance Optimization:**\n- Use database indexes for fast queries\n- Implement connection pooling\n- Use Redis for session management\n- Implement query result caching\n- Use CDN for static assets\n- Optimize database queries\n\n**Monitoring and Alerting:**\n- Set up performance metrics\n- Monitor error rates\n- Track delivery rates\n- Alert on system issues\n- Monitor resource usage\n\n**Testing Strategy:**\n- Unit tests for core functionality\n- Integration tests for API endpoints\n- Load testing for high volume\n- End-to-end testing for workflows\n- Performance testing for scalability\n\n**Deployment Considerations:**\n- Use containerization (Docker)\n- Implement blue-green deployment\n- Set up health checks\n- Configure auto-scaling\n- Implement backup strategies\n\nWould you like me to help you implement any specific part of this technical solution?"
        })
    
    return examples

def generate_final_comprehensive_dataset():
    """Generate the final comprehensive training dataset"""
    print("🚀 Generating final comprehensive training dataset...")
    
    # Load existing data
    existing_data = load_existing_data()
    
    # Generate new examples
    new_examples = []
    new_examples.extend(generate_business_scenarios())
    new_examples.extend(generate_industry_specific_examples())
    new_examples.extend(generate_technical_implementation_examples())
    
    # Combine with existing data
    all_examples = existing_data + new_examples
    
    # Shuffle for better training
    random.shuffle(all_examples)
    
    # Save final dataset
    output_file = Path("training-data/final-comprehensive-dataset.jsonl")
    with open(output_file, 'w') as f:
        for example in all_examples:
            f.write(json.dumps(example) + '\n')
    
    print(f"✅ Generated {len(new_examples)} new comprehensive examples")
    print(f"📊 Total examples: {len(all_examples)}")
    print(f"📁 Saved to: {output_file}")
    
    # Also save in MLX format
    mlx_file = Path("training-data/final-comprehensive-mlx.json")
    with open(mlx_file, 'w') as f:
        json.dump(all_examples, f, indent=2)
    
    print(f"📁 MLX format saved to: {mlx_file}")
    
    # Generate summary
    print(f"\n📈 Training Dataset Summary:")
    print(f"   Total Examples: {len(all_examples)}")
    print(f"   Original Examples: 80")
    print(f"   Comprehensive Examples: 48")
    print(f"   Advanced Examples: 15")
    print(f"   Business Scenarios: {len(generate_business_scenarios())}")
    print(f"   Industry Examples: {len(generate_industry_specific_examples())}")
    print(f"   Technical Examples: {len(generate_technical_implementation_examples())}")
    
    return output_file, mlx_file

if __name__ == "__main__":
    generate_final_comprehensive_dataset()

