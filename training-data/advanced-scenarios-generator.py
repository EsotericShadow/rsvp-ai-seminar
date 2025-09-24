#!/usr/bin/env python3
"""
Generate advanced scenarios and edge cases for comprehensive training
Adds even more examples to the existing dataset
"""

import json
import random
from pathlib import Path

def load_existing_data():
    """Load existing comprehensive training data"""
    existing_file = Path("training-data/comprehensive-rsvp-dataset.jsonl")
    if existing_file.exists():
        with open(existing_file, 'r') as f:
            existing_data = [json.loads(line) for line in f]
        print(f"📊 Loaded {len(existing_data)} existing examples")
        return existing_data
    return []

def generate_edge_case_examples():
    """Generate edge cases and error handling examples"""
    examples = []
    
    edge_cases = [
        {
            "scenario": "Invalid email address in campaign",
            "input": "Create a campaign with invalid email addresses",
            "response": "I'll help you handle invalid email addresses in your campaign. Here's how to manage this:\n\n**Problem:** Invalid email addresses can cause bounces and hurt deliverability\n\n**Prevention Strategies:**\n1. **Email Validation**: Use proper email validation before adding to audience\n2. **Double Opt-in**: Require email confirmation before adding to lists\n3. **Regular Cleaning**: Periodically clean your email lists\n\n**API Validation:**\n```json\n{\n  \"email\": \"user@example.com\",\n  \"validation\": {\n    \"syntax\": true,\n    \"domain\": true,\n    \"mx_record\": true,\n    \"disposable\": false\n  }\n}\n```\n\n**Error Handling:**\n- Validate emails before campaign creation\n- Remove invalid addresses automatically\n- Log validation errors for review\n- Provide user feedback for corrections\n\n**Database Constraints:**\n- `email` field is unique in RSVP model\n- `primaryEmail` field is required in AudienceMember\n- Use proper validation schemas\n\n**Best Practices:**\n- Use email validation libraries\n- Implement soft bounces handling\n- Monitor bounce rates regularly\n- Maintain clean email lists\n\nWould you like me to help you set up email validation for your campaigns?"
        },
        {
            "scenario": "Campaign with no audience members",
            "input": "What happens if I create a campaign with an empty audience group?",
            "response": "I'll explain what happens when you create a campaign with an empty audience group:\n\n**Empty Audience Group Behavior:**\n\n**Campaign Creation:**\n- Campaign can be created successfully\n- Status will be DRAFT\n- No emails will be sent initially\n\n**Scheduling:**\n- Schedule can be set up normally\n- `sendAt` time can be configured\n- Campaign will remain in SCHEDULED status\n\n**Execution:**\n- When send time arrives, system will check audience\n- If no members found, campaign status becomes COMPLETED\n- No emails sent, no errors generated\n\n**API Response:**\n```json\n{\n  \"result\": {\n    \"totalMembers\": 0,\n    \"emailsSent\": 0,\n    \"status\": \"COMPLETED\",\n    \"message\": \"No members found in audience group\"\n  }\n}\n```\n\n**Monitoring:**\n- Check audience group member count before sending\n- Use dashboard to monitor campaign status\n- Set up alerts for empty audiences\n\n**Prevention:**\n- Validate audience groups before campaign creation\n- Use audience group member count in UI\n- Provide warnings for empty groups\n\n**Database Queries:**\n```sql\nSELECT COUNT(*) FROM \"AudienceMember\" WHERE \"groupId\" = 'group-id';\n```\n\n**Best Practices:**\n- Always check audience size before campaigns\n- Use audience group descriptions\n- Implement member count validation\n- Provide clear feedback to users\n\nWould you like me to help you set up audience validation for your campaigns?"
        },
        {
            "scenario": "Template with missing variables",
            "input": "What happens if my email template has variables that don't exist?",
            "response": "I'll explain how to handle missing variables in email templates:\n\n**Missing Variable Behavior:**\n\n**Template Processing:**\n- Missing variables will be left as-is in the email\n- No automatic replacement or error handling\n- Variables like `{{missingVar}}` will appear literally\n\n**Example:**\n```html\n<h1>Hello {{name}}</h1>\n<p>Your order {{orderNumber}} is ready</p>\n```\n\nIf `orderNumber` is missing, email will show:\n```html\n<h1>Hello John</h1>\n<p>Your order {{orderNumber}} is ready</p>\n```\n\n**Prevention Strategies:**\n1. **Template Validation**: Check all variables before sending\n2. **Default Values**: Provide fallback values for missing data\n3. **Variable Documentation**: Document all available variables\n\n**Template Variables Available:**\n- `{{name}}` - Recipient's full name\n- `{{firstName}}` - First name\n- `{{lastName}}` - Last name\n- `{{email}}` - Email address\n- `{{unsubscribeUrl}}` - Unsubscribe link\n- `{{company}}` - Company name\n- `{{greeting_title}}` - Greeting title\n- `{{greeting_message}}` - Greeting message\n- `{{signature_name}}` - Signature name\n- `{{signature_title}}` - Signature title\n- `{{signature_company}}` - Signature company\n- `{{signature_location}}` - Signature location\n- `{{main_content_title}}` - Main content title\n- `{{main_content_body}}` - Main content body\n- `{{button_text}}` - Button text\n- `{{additional_info_title}}` - Additional info title\n- `{{additional_info_body}}` - Additional info body\n- `{{closing_title}}` - Closing title\n- `{{closing_message}}` - Closing message\n\n**Template Validation:**\n```json\n{\n  \"templateId\": \"template-id\",\n  \"variables\": [\n    \"{{name}}\",\n    \"{{email}}\",\n    \"{{unsubscribeUrl}}\"\n  ],\n  \"validation\": {\n    \"allVariablesPresent\": true,\n    \"missingVariables\": [],\n    \"extraVariables\": []\n  }\n}\n```\n\n**Best Practices:**\n- Use only documented variables\n- Test templates with sample data\n- Provide fallback values\n- Document custom variables\n- Validate before sending\n\nWould you like me to help you validate your email templates?"
        }
    ]
    
    for case in edge_cases:
        examples.append({
            "instruction": "Handle edge cases and errors",
            "input": case["input"],
            "output": case["response"]
        })
    
    return examples

def generate_integration_examples():
    """Generate integration and API examples"""
    examples = []
    
    integrations = [
        {
            "service": "Resend API",
            "description": "Email delivery service integration",
            "endpoints": ["/api/admin/campaign/send", "/api/rsvp"],
            "features": ["Email sending", "Delivery tracking", "Bounce handling"]
        },
        {
            "service": "Weaviate Vector Database",
            "description": "RAG system for AI context",
            "endpoints": ["/api/ai/rag"],
            "features": ["Knowledge retrieval", "Context enhancement", "Semantic search"]
        },
        {
            "service": "LeadMine API",
            "description": "Business data enrichment",
            "endpoints": ["/api/rsvp"],
            "features": ["Business data", "Industry classification", "Contact enrichment"]
        },
        {
            "service": "Google Analytics",
            "description": "Website analytics integration",
            "endpoints": ["/api/analytics/visitors"],
            "features": ["Visitor tracking", "Page analytics", "Conversion tracking"]
        }
    ]
    
    for integration in integrations:
        examples.append({
            "instruction": "Integrate with external services",
            "input": f"How do I integrate with {integration['service']}?",
            "output": f"I'll help you integrate with {integration['service']}. Here's a comprehensive guide:\n\n**Service:** {integration['service']}\n**Description:** {integration['description']}\n\n**Integration Points:**\n{chr(10).join([f'- {endpoint}' for endpoint in integration['endpoints']])}\n\n**Features:**\n{chr(10).join([f'- {feature}' for feature in integration['features']])}\n\n**API Configuration:**\n```json\n{{\n  \"service\": \"{integration['service']}\",\n  \"endpoints\": {json.dumps(integration['endpoints'])},\n  \"features\": {json.dumps(integration['features'])},\n  \"authentication\": {{\n    \"type\": \"api_key\",\n    \"header\": \"Authorization\",\n    \"value\": \"Bearer YOUR_API_KEY\"\n  }},\n  \"rateLimits\": {{\n    \"requestsPerMinute\": 100,\n    \"requestsPerHour\": 1000\n  }}\n}}\n```\n\n**Implementation Steps:**\n1. **Get API Credentials**: Obtain API key or authentication token\n2. **Configure Environment**: Set up environment variables\n3. **Test Connection**: Verify API connectivity\n4. **Implement Endpoints**: Create API route handlers\n5. **Error Handling**: Implement proper error handling\n6. **Monitoring**: Set up logging and monitoring\n\n**Environment Variables:**\n```bash\n# {integration['service']} Configuration\n{integration['service'].upper().replace(' ', '_')}_API_KEY=your_api_key_here\n{integration['service'].upper().replace(' ', '_')}_URL=https://api.service.com\n{integration['service'].upper().replace(' ', '_')}_TIMEOUT=30000\n```\n\n**Error Handling:**\n```javascript\ntry {{\n  const response = await fetch(apiUrl, {{\n    method: 'POST',\n    headers: {{\n      'Authorization': `Bearer ${{apiKey}}`,\n      'Content-Type': 'application/json'\n    }},\n    body: JSON.stringify(data)\n  }});\n  \n  if (!response.ok) {{\n    throw new Error(`API Error: ${{response.status}}`);\n  }}\n  \n  return await response.json();\n}} catch (error) {{\n  console.error('Integration error:', error);\n  // Handle error appropriately\n}}\n```\n\n**Best Practices:**\n- Use environment variables for credentials\n- Implement proper error handling\n- Set up rate limiting\n- Monitor API usage\n- Cache responses when appropriate\n- Use retry logic for failed requests\n\n**Testing:**\n- Test with sandbox/test environment first\n- Verify all endpoints work correctly\n- Test error scenarios\n- Monitor performance and reliability\n\nWould you like me to help you implement this integration?"
        })
    
    return examples

def generate_performance_optimization_examples():
    """Generate performance optimization examples"""
    examples = []
    
    optimizations = [
        {
            "area": "Database Performance",
            "issues": ["Slow queries", "High memory usage", "Connection timeouts"],
            "solutions": ["Add indexes", "Optimize queries", "Use connection pooling", "Implement caching"]
        },
        {
            "area": "Email Delivery",
            "issues": ["Slow sending", "High bounce rates", "Poor deliverability"],
            "solutions": ["Optimize throttle rates", "Clean email lists", "Improve sender reputation", "Use smart sending"]
        },
        {
            "area": "API Performance",
            "issues": ["Slow responses", "High latency", "Rate limiting"],
            "solutions": ["Implement caching", "Optimize queries", "Use pagination", "Add rate limiting"]
        },
        {
            "area": "Frontend Performance",
            "issues": ["Slow page loads", "High bundle size", "Poor user experience"],
            "solutions": ["Code splitting", "Image optimization", "Lazy loading", "CDN usage"]
        }
    ]
    
    for optimization in optimizations:
        issues_list = "\n".join([f"- {issue}" for issue in optimization['issues']])
        solutions_list = "\n".join([f"- {solution}" for solution in optimization['solutions']])
        
        examples.append({
            "instruction": "Optimize system performance",
            "input": f"How do I optimize {optimization['area'].lower()}?",
            "output": f"I'll help you optimize {optimization['area']}. Here's a comprehensive optimization guide:\n\n**Area:** {optimization['area']}\n\n**Common Issues:**\n{issues_list}\n\n**Optimization Solutions:**\n{solutions_list}\n\n**Performance Monitoring:**\n```json\n{{\n  \"area\": \"{optimization['area']}\",\n  \"metrics\": {{\n    \"responseTime\": \"< 200ms\",\n    \"throughput\": \"> 1000 req/min\",\n    \"errorRate\": \"< 1%\",\n    \"uptime\": \"> 99.9%\"\n  }},\n  \"alerts\": [\n    \"High response time\",\n    \"Error rate spike\",\n    \"Resource usage high\"\n  ]\n}}\n```\n\n**Implementation Steps:**\n1. **Baseline Measurement**: Measure current performance\n2. **Identify Bottlenecks**: Find performance issues\n3. **Implement Solutions**: Apply optimization techniques\n4. **Test Performance**: Verify improvements\n5. **Monitor Continuously**: Set up ongoing monitoring\n\n**Tools and Techniques:**\n- Performance profiling\n- Database query analysis\n- API response time monitoring\n- Error rate tracking\n- Resource usage monitoring\n\n**Best Practices:**\n- Regular performance audits\n- Proactive monitoring\n- Gradual optimization\n- A/B testing improvements\n- Documentation of changes\n\nWould you like me to help you implement specific optimizations?"
        })
    
    return examples

def generate_security_examples():
    """Generate security and compliance examples"""
    examples = []
    
    security_topics = [
        {
            "topic": "Data Protection",
            "description": "Protect user data and ensure privacy compliance",
            "measures": ["Encryption", "Access controls", "Data anonymization", "Audit logging"]
        },
        {
            "topic": "Email Security",
            "description": "Secure email delivery and prevent abuse",
            "measures": ["SPF records", "DKIM signing", "DMARC policy", "Rate limiting"]
        },
        {
            "topic": "API Security",
            "description": "Secure API endpoints and prevent attacks",
            "measures": ["Authentication", "Authorization", "Rate limiting", "Input validation"]
        },
        {
            "topic": "Compliance",
            "description": "Meet regulatory requirements and standards",
            "measures": ["GDPR compliance", "CAN-SPAM compliance", "Data retention", "User consent"]
        }
    ]
    
    for topic in security_topics:
        measures_list = "\n".join([f"- {measure}" for measure in topic['measures']])
        
        examples.append({
            "instruction": "Implement security measures",
            "input": f"How do I secure {topic['topic'].lower()}?",
            "output": f"I'll help you implement security measures for {topic['topic']}. Here's a comprehensive security guide:\n\n**Topic:** {topic['topic']}\n**Description:** {topic['description']}\n\n**Security Measures:**\n{measures_list}\n\n**Implementation:**\n```json\n{{\n  \"security\": {{\n    \"topic\": \"{topic['topic']}\",\n    \"measures\": {json.dumps(topic['measures'])},\n    \"implementation\": {{\n      \"encryption\": \"AES-256\",\n      \"authentication\": \"JWT tokens\",\n      \"rateLimiting\": \"100 req/min per IP\",\n      \"validation\": \"Zod schemas\"\n    }}\n  }}\n}}\n```\n\n**Security Headers:**\n```javascript\nconst securityHeaders = {{\n  'Content-Security-Policy': \"default-src 'self'\",\n  'X-Frame-Options': 'DENY',\n  'X-Content-Type-Options': 'nosniff',\n  'Referrer-Policy': 'strict-origin-when-cross-origin',\n  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'\n}};\n```\n\n**Best Practices:**\n- Regular security audits\n- Keep dependencies updated\n- Use secure coding practices\n- Implement proper logging\n- Monitor for security issues\n- Train team on security\n\n**Compliance Requirements:**\n- GDPR: User consent, data portability, right to deletion\n- CAN-SPAM: Unsubscribe links, sender identification, truthful content\n- Industry standards: SOC 2, ISO 27001\n\n**Monitoring and Alerting:**\n- Failed login attempts\n- Unusual API usage\n- Data access patterns\n- Security event logging\n\nWould you like me to help you implement specific security measures?"
        })
    
    return examples

def generate_advanced_scenarios():
    """Generate all advanced scenarios"""
    print("🚀 Generating advanced scenarios and edge cases...")
    
    # Load existing data
    existing_data = load_existing_data()
    
    # Generate new examples
    new_examples = []
    new_examples.extend(generate_edge_case_examples())
    new_examples.extend(generate_integration_examples())
    new_examples.extend(generate_performance_optimization_examples())
    new_examples.extend(generate_security_examples())
    
    # Combine with existing data
    all_examples = existing_data + new_examples
    
    # Shuffle for better training
    random.shuffle(all_examples)
    
    # Save expanded dataset
    output_file = Path("training-data/advanced-rsvp-dataset.jsonl")
    with open(output_file, 'w') as f:
        for example in all_examples:
            f.write(json.dumps(example) + '\n')
    
    print(f"✅ Generated {len(new_examples)} new advanced examples")
    print(f"📊 Total examples: {len(all_examples)}")
    print(f"📁 Saved to: {output_file}")
    
    # Also save in MLX format
    mlx_file = Path("training-data/advanced-rsvp-mlx.json")
    with open(mlx_file, 'w') as f:
        json.dump(all_examples, f, indent=2)
    
    print(f"📁 MLX format saved to: {mlx_file}")
    
    return output_file, mlx_file

if __name__ == "__main__":
    generate_advanced_scenarios()
