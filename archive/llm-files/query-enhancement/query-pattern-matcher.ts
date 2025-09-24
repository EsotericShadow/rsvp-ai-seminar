/**
 * Query Pattern Matcher - Identifies query types and patterns
 * Part of the accuracy improvement system to enhance generic queries
 */

export interface QueryPattern {
  id: string;
  name: string;
  pattern: RegExp;
  category: string;
  confidence: number;
  description: string;
}

export interface QueryAnalysis {
  originalQuery: string;
  matchedPatterns: QueryPattern[];
  category: string;
  intent: string;
  confidence: number;
  isGeneric: boolean;
  enhancementNeeded: boolean;
}

export class QueryPatternMatcher {
  private patterns: QueryPattern[];

  constructor() {
    this.patterns = this.initializePatterns();
  }

  private initializePatterns(): QueryPattern[] {
    return [
      // Campaign Management Patterns
      {
        id: 'create_campaign_generic',
        name: 'Create Campaign - Generic',
        pattern: /create.*campaign|new.*campaign|add.*campaign/i,
        category: 'campaign_management',
        confidence: 0.9,
        description: 'User wants to create a new campaign'
      },
      {
        id: 'create_campaign_specific',
        name: 'Create Campaign - Specific',
        pattern: /createCampaign|POST.*campaign.*campaigns|new.*campaign.*function/i,
        category: 'campaign_management',
        confidence: 0.95,
        description: 'User references specific campaign creation functions'
      },
      {
        id: 'update_campaign',
        name: 'Update Campaign',
        pattern: /update.*campaign|modify.*campaign|edit.*campaign|change.*campaign/i,
        category: 'campaign_management',
        confidence: 0.9,
        description: 'User wants to update an existing campaign'
      },
      {
        id: 'delete_campaign',
        name: 'Delete Campaign',
        pattern: /delete.*campaign|remove.*campaign|destroy.*campaign/i,
        category: 'campaign_management',
        confidence: 0.9,
        description: 'User wants to delete a campaign'
      },
      {
        id: 'list_campaigns',
        name: 'List Campaigns',
        pattern: /list.*campaign|show.*campaign|get.*campaign|view.*campaign/i,
        category: 'campaign_management',
        confidence: 0.9,
        description: 'User wants to list or view campaigns'
      },

      // Email Sending Patterns
      {
        id: 'send_email_generic',
        name: 'Send Email - Generic',
        pattern: /send.*email|email.*send|send.*message|dispatch.*email/i,
        category: 'email_sending',
        confidence: 0.9,
        description: 'User wants to send emails'
      },
      {
        id: 'send_email_specific',
        name: 'Send Email - Specific',
        pattern: /sendCampaignEmail|POST.*campaign.*send|email.*batch/i,
        category: 'email_sending',
        confidence: 0.95,
        description: 'User references specific email sending functions'
      },
      {
        id: 'email_template',
        name: 'Email Template',
        pattern: /template|email.*template|message.*template/i,
        category: 'email_templates',
        confidence: 0.9,
        description: 'User wants to work with email templates'
      },

      // Analytics Patterns
      {
        id: 'analytics_generic',
        name: 'Analytics - Generic',
        pattern: /analytics|report|metrics|stats|statistics|dashboard/i,
        category: 'analytics',
        confidence: 0.9,
        description: 'User wants analytics or reporting'
      },
      {
        id: 'analytics_specific',
        name: 'Analytics - Specific',
        pattern: /GET.*analytics|dashboard.*api|metrics.*endpoint/i,
        category: 'analytics',
        confidence: 0.95,
        description: 'User references specific analytics APIs'
      },

      // Audience Management Patterns
      {
        id: 'audience_management',
        name: 'Audience Management',
        pattern: /audience|group|member|contact|list/i,
        category: 'audience_management',
        confidence: 0.8,
        description: 'User wants to work with audience groups'
      },
      {
        id: 'audience_specific',
        name: 'Audience - Specific',
        pattern: /AudienceGroup|createAudienceGroup|POST.*groups/i,
        category: 'audience_management',
        confidence: 0.95,
        description: 'User references specific audience functions'
      },

      // Scheduling Patterns
      {
        id: 'schedule_management',
        name: 'Schedule Management',
        pattern: /schedule|timing|send.*time|when.*send/i,
        category: 'scheduling',
        confidence: 0.9,
        description: 'User wants to work with scheduling'
      },

      // RSVP Patterns
      {
        id: 'rsvp_management',
        name: 'RSVP Management',
        pattern: /rsvp|response|confirmation|attend|event/i,
        category: 'rsvp_management',
        confidence: 0.9,
        description: 'User wants to work with RSVPs'
      },

      // Technical Patterns
      {
        id: 'function_query',
        name: 'Function Query',
        pattern: /function|method|call|execute|run/i,
        category: 'technical',
        confidence: 0.8,
        description: 'User is asking about functions or methods'
      },
      {
        id: 'api_query',
        name: 'API Query',
        pattern: /api|endpoint|route|GET|POST|PUT|DELETE/i,
        category: 'technical',
        confidence: 0.8,
        description: 'User is asking about APIs or endpoints'
      },

      // Help and Documentation
      {
        id: 'help_query',
        name: 'Help Query',
        pattern: /help|how.*to|what.*is|explain|show.*me/i,
        category: 'help',
        confidence: 0.9,
        description: 'User is asking for help or documentation'
      }
    ];
  }

  /**
   * Analyze a query and identify patterns
   */
  analyzeQuery(query: string): QueryAnalysis {
    const matchedPatterns: QueryPattern[] = [];
    let maxConfidence = 0;
    let primaryCategory = 'general';
    let intent = 'unknown';

    // Find all matching patterns
    for (const pattern of this.patterns) {
      if (pattern.pattern.test(query)) {
        matchedPatterns.push(pattern);
        if (pattern.confidence > maxConfidence) {
          maxConfidence = pattern.confidence;
          primaryCategory = pattern.category;
        }
      }
    }

    // Determine if query is generic
    const isGeneric = this.isGenericQuery(query, matchedPatterns);
    
    // Determine intent
    intent = this.determineIntent(query, matchedPatterns);

    // Determine if enhancement is needed
    const enhancementNeeded = this.needsEnhancement(query, matchedPatterns);

    return {
      originalQuery: query,
      matchedPatterns,
      category: primaryCategory,
      intent,
      confidence: maxConfidence,
      isGeneric,
      enhancementNeeded
    };
  }

  /**
   * Check if a query is generic (needs enhancement)
   */
  private isGenericQuery(query: string, patterns: QueryPattern[]): boolean {
    // Very short queries are likely generic
    if (query.length < 10) return true;

    // Queries with generic patterns are likely generic
    const genericPatterns = patterns.filter(p => p.name.includes('Generic'));
    if (genericPatterns.length > 0) return true;

    // Queries without specific technical terms are likely generic
    const technicalTerms = ['function', 'api', 'endpoint', 'POST', 'GET', 'PUT', 'DELETE'];
    const hasTechnicalTerms = technicalTerms.some(term => 
      query.toLowerCase().includes(term.toLowerCase())
    );
    
    if (!hasTechnicalTerms && patterns.length > 0) return true;

    return false;
  }

  /**
   * Determine user intent from query and patterns
   */
  private determineIntent(query: string, patterns: QueryPattern[]): string {
    if (patterns.length === 0) return 'unknown';

    const primaryPattern = patterns.reduce((prev, current) => 
      prev.confidence > current.confidence ? prev : current
    );

    // Map patterns to intents
    const intentMap: { [key: string]: string } = {
      'create_campaign_generic': 'create_campaign',
      'create_campaign_specific': 'create_campaign',
      'update_campaign': 'update_campaign',
      'delete_campaign': 'delete_campaign',
      'list_campaigns': 'list_campaigns',
      'send_email_generic': 'send_email',
      'send_email_specific': 'send_email',
      'email_template': 'manage_templates',
      'analytics_generic': 'view_analytics',
      'analytics_specific': 'view_analytics',
      'audience_management': 'manage_audience',
      'audience_specific': 'manage_audience',
      'schedule_management': 'manage_schedule',
      'rsvp_management': 'manage_rsvp',
      'function_query': 'technical_help',
      'api_query': 'technical_help',
      'help_query': 'general_help'
    };

    return intentMap[primaryPattern.id] || 'unknown';
  }

  /**
   * Determine if query needs enhancement
   */
  private needsEnhancement(query: string, patterns: QueryPattern[]): boolean {
    // Always enhance if query is generic
    if (this.isGenericQuery(query, patterns)) return true;

    // Enhance if confidence is low
    if (patterns.length > 0) {
      const maxConfidence = Math.max(...patterns.map(p => p.confidence));
      if (maxConfidence < 0.8) return true;
    }

    // Enhance if no patterns matched
    if (patterns.length === 0) return true;

    // Enhance if query lacks specific technical details
    const specificPatterns = patterns.filter(p => p.name.includes('Specific'));
    if (specificPatterns.length === 0 && patterns.length > 0) return true;

    return false;
  }

  /**
   * Get all patterns for a specific category
   */
  getPatternsByCategory(category: string): QueryPattern[] {
    return this.patterns.filter(pattern => pattern.category === category);
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    const categories = new Set(this.patterns.map(pattern => pattern.category));
    return Array.from(categories);
  }

  /**
   * Add a new pattern
   */
  addPattern(pattern: QueryPattern): void {
    this.patterns.push(pattern);
  }

  /**
   * Remove a pattern by ID
   */
  removePattern(patternId: string): boolean {
    const index = this.patterns.findIndex(p => p.id === patternId);
    if (index !== -1) {
      this.patterns.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Export singleton instance
export const queryPatternMatcher = new QueryPatternMatcher();

