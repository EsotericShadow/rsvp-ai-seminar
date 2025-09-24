/**
 * AI Enhancement System - Simplified version for deployment
 * Combines query enhancement and response validation in a single module
 */

// Simple query enhancement function
export function enhanceQuery(query: string): { enhancedQuery: string; enhancementApplied: boolean } {
  const queryLower = query.toLowerCase();
  
  // Simple enhancement rules
  if (queryLower.includes('create') && queryLower.includes('campaign')) {
    return {
      enhancedQuery: `Show me the exact steps to create a new campaign in the RSVP system using the specific functions (createCampaign, updateCampaign) and API endpoints (POST /api/admin/campaign/campaigns, GET /api/admin/campaign/campaigns). Include the complete process from initial setup to campaign activation, with real examples from the training data.`,
      enhancementApplied: true
    };
  }
  
  if (queryLower.includes('send') && queryLower.includes('email')) {
    return {
      enhancedQuery: `Explain the complete email sending process in the RSVP system using the specific functions (sendCampaignEmail, runSchedule, recordSendEngagement) and API endpoints (POST /api/admin/campaign/send, POST /api/admin/campaign/schedules/[id]/run). Include batch processing, error handling, delivery tracking, and performance optimization.`,
      enhancementApplied: true
    };
  }
  
  if (queryLower.includes('analytics') || queryLower.includes('dashboard')) {
    return {
      enhancedQuery: `Show me how to access and display analytics in the RSVP system using the specific API endpoints (GET /api/admin/analytics/visitors, GET /api/admin/campaigns/analytics, GET /api/admin/campaign/dashboard). Include visitor tracking, conversion metrics, email performance, and campaign analytics with real examples from the training data.`,
      enhancementApplied: true
    };
  }
  
  if (queryLower.includes('audience') || queryLower.includes('group')) {
    return {
      enhancedQuery: `Explain how to manage audience groups in the RSVP system using the specific functions (createAudienceGroup, updateAudienceGroup, deleteAudienceGroup, listGroups) and API endpoints (POST /api/admin/campaign/groups, GET /api/admin/campaign/groups, PUT /api/admin/campaign/groups). Include creation, updating, member management, and segmentation with real examples.`,
      enhancementApplied: true
    };
  }
  
  if (queryLower.includes('template')) {
    return {
      enhancedQuery: `Show me how to manage email templates in the RSVP system using the specific functions (createTemplate, updateTemplate, deleteTemplate, listTemplates, renderTemplate) and API endpoints (POST /api/admin/campaign/templates, GET /api/admin/campaign/templates, PUT /api/admin/campaign/templates). Include template creation, editing, variables, and rendering with examples.`,
      enhancementApplied: true
    };
  }
  
  if (queryLower.includes('schedule')) {
    return {
      enhancedQuery: `Explain how to manage campaign scheduling in the RSVP system using the specific functions (createSchedule, updateSchedule, deleteSchedule, runSchedule) and API endpoints (POST /api/admin/campaign/schedules, GET /api/admin/campaign/schedules, PUT /api/admin/campaign/schedules). Include smart windows, timing optimization, and batch processing.`,
      enhancementApplied: true
    };
  }
  
  // No enhancement needed
  return {
    enhancedQuery: query,
    enhancementApplied: false
  };
}

// Simple response validation function
export function validateResponse(response: string): { isValid: boolean; confidence: number; issues: string[] } {
  const issues: string[] = [];
  let validReferences = 0;
  let totalReferences = 0;
  
  // Real functions from the codebase
  const realFunctions = [
    'createCampaign', 'updateCampaign', 'deleteCampaign', 'listCampaigns', 'getCampaign',
    'createTemplate', 'updateTemplate', 'deleteTemplate', 'listTemplates', 'renderTemplate',
    'createAudienceGroup', 'updateAudienceGroup', 'deleteAudienceGroup', 'listGroups',
    'createSchedule', 'updateSchedule', 'deleteSchedule', 'runSchedule',
    'sendCampaignEmail', 'recordSendEngagement', 'inviteLinkFromToken', 'listCampaignData', 'getSchedule'
  ];
  
  // Real APIs from the codebase
  const realAPIs = [
    '/api/admin/campaign/campaigns', '/api/admin/campaign/send', '/api/admin/campaign/groups',
    '/api/admin/campaign/templates', '/api/admin/campaign/schedules', '/api/admin/campaign/dashboard',
    '/api/admin/analytics/visitors', '/api/admin/campaigns/analytics', '/api/rsvp'
  ];
  
  // Check for function references
  const functionPattern = /(\w+)\s*\(/g;
  const functionMatches = response.match(functionPattern) || [];
  
  for (const match of functionMatches) {
    const functionName = match.replace(/\s*\(/, '');
    totalReferences++;
    
    if (realFunctions.includes(functionName)) {
      validReferences++;
    } else if (functionName.length > 3) {
      issues.push(`Function '${functionName}' not found in codebase`);
    }
  }
  
  // Check for API references
  const apiPattern = /(GET|POST|PUT|DELETE|PATCH)\s+(\/api\/[^\s\)]+)/g;
  const apiMatches = response.match(apiPattern) || [];
  
  for (const match of apiMatches) {
    const parts = match.split(/\s+/);
    const endpoint = parts[1];
    totalReferences++;
    
    if (realAPIs.some(api => endpoint.includes(api.replace(/\[.*?\]/g, '')))) {
      validReferences++;
    } else {
      issues.push(`API endpoint '${endpoint}' not found in codebase`);
    }
  }
  
  const confidence = totalReferences > 0 ? validReferences / totalReferences : 1.0;
  const isValid = confidence >= 0.8 && issues.length === 0;
  
  return {
    isValid,
    confidence,
    issues
  };
}

// Fallback knowledge base when Weaviate is not available
export function getFallbackKnowledge(query: string): string {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('create') && queryLower.includes('campaign')) {
    return `To create a campaign in the RSVP system:

1. Use the createCampaign() function in src/lib/campaigns.ts
2. Call POST /api/admin/campaign/campaigns endpoint
3. Required fields: name, status, description
4. Optional fields: audienceGroupId, templateId, scheduleId
5. Returns a Campaign object with generated ID

Example:
\`\`\`typescript
const campaign = await createCampaign({
  name: "Tech Meetup Invitation",
  status: "DRAFT",
  description: "Invitation to local tech companies",
  audienceGroupId: "group-123"
});
\`\`\`

The campaign will be created in the database and can be scheduled for sending.`;
  }
  
  if (queryLower.includes('send') && queryLower.includes('email')) {
    return `To send emails in the RSVP system:

1. Use sendCampaignEmail() function in src/lib/email-sender.ts
2. Call POST /api/admin/campaign/send endpoint
3. Emails are sent using Resend API
4. Batch processing with rate limiting
5. Tracking pixels and engagement recording

Process:
- Fetch campaign and audience data
- Generate HTML using renderTemplate()
- Send via Resend API
- Record send events in database
- Track opens and clicks

The system handles bounces, unsubscribes, and delivery failures automatically.`;
  }
  
  if (queryLower.includes('analytics') || queryLower.includes('dashboard')) {
    return `Analytics in the RSVP system:

Available endpoints:
- GET /api/admin/analytics/visitors - Visitor tracking data
- GET /api/admin/campaigns/analytics - Campaign performance
- GET /api/admin/campaign/dashboard - Campaign overview

Metrics tracked:
- Total visits and unique visitors
- RSVP conversion rates
- Email open and click rates
- Campaign performance by audience
- Geographic and device analytics

Data is stored in Visit and RSVP models with detailed tracking.`;
  }
  
  if (queryLower.includes('audience') || queryLower.includes('group')) {
    return `Audience management in the RSVP system:

Functions:
- createAudienceGroup() - Create new audience group
- updateAudienceGroup() - Update existing group
- deleteAudienceGroup() - Remove group
- listGroups() - Get all groups

APIs:
- POST /api/admin/campaign/groups - Create group
- GET /api/admin/campaign/groups - List groups
- PUT /api/admin/campaign/groups - Update group

Groups contain AudienceMember records with business data from LeadMine integration.`;
  }
  
  if (queryLower.includes('template')) {
    return `Email template management:

Functions:
- createTemplate() - Create new template
- updateTemplate() - Update existing template
- renderTemplate() - Generate final HTML
- listTemplates() - Get all templates

Templates support:
- Variable substitution ({{name}}, {{company}})
- Global HTML template integration
- Responsive design
- Tracking pixels
- Unsubscribe links

Templates are rendered with campaign and member context.`;
  }
  
  return `I can help you with RSVP system operations. The system includes:
- Campaign management (create, update, send)
- Email templates with variable substitution
- Audience groups and member management
- Analytics and visitor tracking
- Automated scheduling and batch processing

What specific operation would you like help with?`;
}

// Main enhancement service
export class AIEnhancementService {
  static async processQuery(query: string) {
    const enhancement = enhanceQuery(query);
    return {
      originalQuery: query,
      enhancedQuery: enhancement.enhancedQuery,
      enhancementApplied: enhancement.enhancementApplied,
      reasoning: enhancement.enhancementApplied ? 'Query enhanced for better accuracy' : 'Query already specific'
    };
  }
  
  static validateResponse(response: string) {
    return validateResponse(response);
  }
}
