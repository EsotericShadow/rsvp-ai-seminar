/**
 * Query Enhancer - Transforms generic queries into specific, detailed ones
 * Part of the accuracy improvement system
 */

import { QueryAnalysis } from './query-pattern-matcher';

export interface EnhancedQuery {
  originalQuery: string;
  enhancedQuery: string;
  enhancementType: string;
  confidence: number;
  reasoning: string;
  context: EnhancementContext;
}

export interface EnhancementContext {
  category: string;
  intent: string;
  specificFunctions: string[];
  specificAPIs: string[];
  businessContext: string;
  examples: string[];
}

export class QueryEnhancer {
  private enhancementRules: Map<string, EnhancementRule>;
  private contextData: ContextData;

  constructor() {
    this.enhancementRules = this.initializeEnhancementRules();
    this.contextData = this.initializeContextData();
  }

  private initializeEnhancementRules(): Map<string, EnhancementRule> {
    const rules = new Map<string, EnhancementRule>();

    // Campaign Management Rules
    rules.set('create_campaign', {
      pattern: /create.*campaign|new.*campaign|add.*campaign/i,
      enhancement: (query: string, context: EnhancementContext) => {
        const functions = context.specificFunctions.join(', ');
        const apis = context.specificAPIs.join(', ');
        return `Show me the exact steps to create a new campaign in the RSVP system using the specific functions (${functions}) and API endpoints (${apis}). Include the complete process from initial setup to campaign activation, with real examples from the training data.`;
      },
      confidence: 0.9,
      category: 'campaign_management'
    });

    rules.set('update_campaign', {
      pattern: /update.*campaign|modify.*campaign|edit.*campaign/i,
      enhancement: (query: string, context: EnhancementContext) => {
        const functions = context.specificFunctions.join(', ');
        const apis = context.specificAPIs.join(', ');
        return `Explain how to update an existing campaign in the RSVP system using the specific functions (${functions}) and API endpoints (${apis}). Show me the complete update process with validation steps and error handling.`;
      },
      confidence: 0.9,
      category: 'campaign_management'
    });

    rules.set('delete_campaign', {
      pattern: /delete.*campaign|remove.*campaign/i,
      enhancement: (query: string, context: EnhancementContext) => {
        const functions = context.specificFunctions.join(', ');
        const apis = context.specificAPIs.join(', ');
        return `Show me how to safely delete a campaign in the RSVP system using the specific functions (${functions}) and API endpoints (${apis}). Include safety checks, confirmation steps, and cleanup procedures.`;
      },
      confidence: 0.9,
      category: 'campaign_management'
    });

    rules.set('list_campaigns', {
      pattern: /list.*campaign|show.*campaign|get.*campaign/i,
      enhancement: (query: string, context: EnhancementContext) => {
        const functions = context.specificFunctions.join(', ');
        const apis = context.specificAPIs.join(', ');
        return `Show me how to retrieve and list campaigns in the RSVP system using the specific functions (${functions}) and API endpoints (${apis}). Include filtering options, pagination, and data formatting.`;
      },
      confidence: 0.9,
      category: 'campaign_management'
    });

    // Email Sending Rules
    rules.set('send_email', {
      pattern: /send.*email|email.*send|send.*message/i,
      enhancement: (query: string, context: EnhancementContext) => {
        const functions = context.specificFunctions.join(', ');
        const apis = context.specificAPIs.join(', ');
        return `Explain the complete email sending process in the RSVP system using the specific functions (${functions}) and API endpoints (${apis}). Include batch processing, error handling, delivery tracking, and performance optimization.`;
      },
      confidence: 0.9,
      category: 'email_sending'
    });

    // Analytics Rules
    rules.set('view_analytics', {
      pattern: /analytics|report|metrics|dashboard/i,
      enhancement: (query: string, context: EnhancementContext) => {
        const apis = context.specificAPIs.join(', ');
        return `Show me how to access and display analytics in the RSVP system using the specific API endpoints (${apis}). Include visitor tracking, conversion metrics, email performance, and campaign analytics with real examples from the training data.`;
      },
      confidence: 0.9,
      category: 'analytics'
    });

    // Audience Management Rules
    rules.set('manage_audience', {
      pattern: /audience|group|member|contact/i,
      enhancement: (query: string, context: EnhancementContext) => {
        const functions = context.specificFunctions.join(', ');
        const apis = context.specificAPIs.join(', ');
        return `Explain how to manage audience groups in the RSVP system using the specific functions (${functions}) and API endpoints (${apis}). Include creation, updating, member management, and segmentation with real examples.`;
      },
      confidence: 0.9,
      category: 'audience_management'
    });

    // Template Management Rules
    rules.set('manage_templates', {
      pattern: /template|email.*template|message.*template/i,
      enhancement: (query: string, context: EnhancementContext) => {
        const functions = context.specificFunctions.join(', ');
        const apis = context.specificAPIs.join(', ');
        return `Show me how to manage email templates in the RSVP system using the specific functions (${functions}) and API endpoints (${apis}). Include template creation, editing, variables, and rendering with examples.`;
      },
      confidence: 0.9,
      category: 'email_templates'
    });

    // Scheduling Rules
    rules.set('manage_schedule', {
      pattern: /schedule|timing|send.*time/i,
      enhancement: (query: string, context: EnhancementContext) => {
        const functions = context.specificFunctions.join(', ');
        const apis = context.specificAPIs.join(', ');
        return `Explain how to manage campaign scheduling in the RSVP system using the specific functions (${functions}) and API endpoints (${apis}). Include smart windows, timing optimization, and batch processing.`;
      },
      confidence: 0.9,
      category: 'scheduling'
    });

    // RSVP Management Rules
    rules.set('manage_rsvp', {
      pattern: /rsvp|response|confirmation/i,
      enhancement: (query: string, context: EnhancementContext) => {
        const functions = context.specificFunctions.join(', ');
        const apis = context.specificAPIs.join(', ');
        return `Show me how to manage RSVP responses in the RSVP system using the specific functions (${functions}) and API endpoints (${apis}). Include form processing, confirmation emails, and data management.`;
      },
      confidence: 0.9,
      category: 'rsvp_management'
    });

    return rules;
  }

  private initializeContextData(): ContextData {
    return {
      campaign_management: {
        functions: ['createCampaign', 'updateCampaign', 'deleteCampaign', 'listCampaigns', 'getCampaign'],
        apis: ['POST /api/admin/campaign/campaigns', 'GET /api/admin/campaign/campaigns', 'PUT /api/admin/campaign/campaigns', 'DELETE /api/admin/campaign/campaigns/[id]'],
        businessContext: 'Evergreen Web Solutions email marketing campaigns for Northern BC businesses'
      },
      email_sending: {
        functions: ['sendCampaignEmail', 'runSchedule', 'recordSendEngagement'],
        apis: ['POST /api/admin/campaign/send', 'POST /api/admin/campaign/schedules/[id]/run'],
        businessContext: 'Professional email delivery using Resend API for campaign emails'
      },
      analytics: {
        functions: [],
        apis: ['GET /api/admin/analytics/visitors', 'GET /api/admin/campaigns/analytics', 'GET /api/admin/campaign/dashboard'],
        businessContext: 'Comprehensive analytics for email marketing performance and website visitor tracking'
      },
      audience_management: {
        functions: ['createAudienceGroup', 'updateAudienceGroup', 'deleteAudienceGroup', 'listGroups'],
        apis: ['POST /api/admin/campaign/groups', 'GET /api/admin/campaign/groups', 'PUT /api/admin/campaign/groups'],
        businessContext: 'Business audience segmentation for targeted email marketing campaigns'
      },
      email_templates: {
        functions: ['createTemplate', 'updateTemplate', 'deleteTemplate', 'listTemplates', 'renderTemplate'],
        apis: ['POST /api/admin/campaign/templates', 'GET /api/admin/campaign/templates', 'PUT /api/admin/campaign/templates'],
        businessContext: 'Professional email templates with Evergreen branding and personalization'
      },
      scheduling: {
        functions: ['createSchedule', 'updateSchedule', 'deleteSchedule', 'runSchedule'],
        apis: ['POST /api/admin/campaign/schedules', 'GET /api/admin/campaign/schedules', 'PUT /api/admin/campaign/schedules'],
        businessContext: 'Smart campaign scheduling with optimal send times for Northern BC businesses'
      },
      rsvp_management: {
        functions: [],
        apis: ['POST /api/rsvp'],
        businessContext: 'RSVP form processing and confirmation for Evergreen Web Solutions events'
      }
    };
  }

  /**
   * Enhance a query based on analysis
   */
  enhanceQuery(analysis: QueryAnalysis): EnhancedQuery {
    const { originalQuery, category, intent } = analysis;

    // Find matching enhancement rule
    const rule = this.findEnhancementRule(originalQuery, intent);
    
    if (!rule) {
      return this.createGenericEnhancement(originalQuery, analysis);
    }

    // Get context for the category
    const context = this.buildEnhancementContext(category, intent);

    // Apply enhancement rule
    const enhancedQuery = rule.enhancement(originalQuery, context);

    return {
      originalQuery,
      enhancedQuery,
      enhancementType: rule.category,
      confidence: rule.confidence,
      reasoning: this.generateReasoning(originalQuery, enhancedQuery, context),
      context
    };
  }

  /**
   * Find the best enhancement rule for a query
   */
  private findEnhancementRule(query: string, intent: string): EnhancementRule | null {
    for (const [key, rule] of Array.from(this.enhancementRules.entries())) {
      if (rule.pattern.test(query)) {
        return rule;
      }
    }

    // Try to match by intent
    for (const [key, rule] of Array.from(this.enhancementRules.entries())) {
      if (key === intent) {
        return rule;
      }
    }

    return null;
  }

  /**
   * Build enhancement context for a category
   */
  private buildEnhancementContext(category: string, intent: string): EnhancementContext {
    const categoryData = this.contextData[category as keyof ContextData] || this.contextData.campaign_management;

    return {
      category,
      intent,
      specificFunctions: categoryData.functions,
      specificAPIs: categoryData.apis,
      businessContext: categoryData.businessContext,
      examples: this.getExamplesForCategory(category)
    };
  }

  /**
   * Get examples for a specific category
   */
  private getExamplesForCategory(category: string): string[] {
    const examples: { [key: string]: string[] } = {
      campaign_management: [
        'Creating a workshop invitation campaign',
        'Setting up a tech meetup campaign',
        'Managing campaign schedules and timing'
      ],
      email_sending: [
        'Sending batch emails to tech companies',
        'Processing email delivery and tracking',
        'Handling email bounces and failures'
      ],
      analytics: [
        'Viewing campaign performance metrics',
        'Analyzing visitor conversion rates',
        'Monitoring email open and click rates'
      ],
      audience_management: [
        'Creating audience groups for tech companies',
        'Segmenting businesses by location',
        'Managing contact lists and groups'
      ],
      email_templates: [
        'Creating professional email templates',
        'Adding personalization variables',
        'Managing template versions and updates'
      ]
    };

    return examples[category] || ['General RSVP system operation'];
  }

  /**
   * Create generic enhancement when no specific rule matches
   */
  private createGenericEnhancement(originalQuery: string, analysis: QueryAnalysis): EnhancedQuery {
    const context = this.buildEnhancementContext(analysis.category, analysis.intent);
    
    const enhancedQuery = `Provide detailed information about "${originalQuery}" in the RSVP system. Include specific functions, API endpoints, implementation steps, and real examples from the training data. Focus on the ${analysis.category} category and provide actionable guidance.`;

    return {
      originalQuery,
      enhancedQuery,
      enhancementType: 'generic',
      confidence: 0.7,
      reasoning: 'Applied generic enhancement due to no specific rule match',
      context
    };
  }

  /**
   * Generate reasoning for the enhancement
   */
  private generateReasoning(originalQuery: string, enhancedQuery: string, context: EnhancementContext): string {
    return `Enhanced generic query "${originalQuery}" to specific query with context: ${context.category} category, ${context.specificFunctions.length} functions, ${context.specificAPIs.length} APIs, business context: ${context.businessContext}`;
  }

  /**
   * Get enhancement statistics
   */
  getEnhancementStats(): EnhancementStats {
    return {
      totalRules: this.enhancementRules.size,
      categories: Object.keys(this.contextData),
      averageConfidence: this.calculateAverageConfidence()
    };
  }

  private calculateAverageConfidence(): number {
    const confidences = Array.from(this.enhancementRules.values()).map(rule => rule.confidence);
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }
}

// Type definitions
interface EnhancementRule {
  pattern: RegExp;
  enhancement: (query: string, context: EnhancementContext) => string;
  confidence: number;
  category: string;
}

interface ContextData {
  [category: string]: {
    functions: string[];
    apis: string[];
    businessContext: string;
  };
}

interface EnhancementStats {
  totalRules: number;
  categories: string[];
  averageConfidence: number;
}

// Export singleton instance
export const queryEnhancer = new QueryEnhancer();
