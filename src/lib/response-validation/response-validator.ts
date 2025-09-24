/**
 * Response Validator - Validates AI responses against real codebase
 * Prevents hallucinated functions and APIs from being executed
 */

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  issues: ValidationIssue[];
  suggestions: string[];
  validatedAt: string;
}

export interface ValidationIssue {
  type: 'function_not_found' | 'api_not_found' | 'parameter_mismatch' | 'deprecated_function';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
  location?: string;
}

export interface CodebaseReference {
  type: 'function' | 'api' | 'model' | 'variable';
  name: string;
  file: string;
  exists: boolean;
  signature?: string;
  methods?: string[];
  parameters?: string[];
}

export class ResponseValidator {
  private realFunctions: Map<string, CodebaseReference>;
  private realAPIs: Map<string, CodebaseReference>;
  private realModels: Map<string, CodebaseReference>;

  constructor() {
    this.realFunctions = new Map();
    this.realAPIs = new Map();
    this.realModels = new Map();
    this.initializeCodebaseReferences();
  }

  private initializeCodebaseReferences(): void {
    // Initialize real functions from codebase
    const functions = [
      // Campaign functions
      { name: 'createCampaign', file: 'src/lib/campaigns.ts', signature: 'createCampaign(input: CampaignInput): Promise<Campaign>' },
      { name: 'updateCampaign', file: 'src/lib/campaigns.ts', signature: 'updateCampaign(id: string, input: CampaignInput): Promise<Campaign>' },
      { name: 'deleteCampaign', file: 'src/lib/campaigns.ts', signature: 'deleteCampaign(id: string): Promise<void>' },
      { name: 'listCampaigns', file: 'src/lib/campaigns.ts', signature: 'listCampaigns(): Promise<Campaign[]>' },
      { name: 'getCampaign', file: 'src/lib/campaigns.ts', signature: 'getCampaign(id: string): Promise<Campaign>' },
      
      // Template functions
      { name: 'createTemplate', file: 'src/lib/campaigns.ts', signature: 'createTemplate(input: TemplateInput): Promise<CampaignTemplate>' },
      { name: 'updateTemplate', file: 'src/lib/campaigns.ts', signature: 'updateTemplate(id: string, input: TemplateInput): Promise<CampaignTemplate>' },
      { name: 'deleteTemplate', file: 'src/lib/campaigns.ts', signature: 'deleteTemplate(id: string): Promise<void>' },
      { name: 'listTemplates', file: 'src/lib/campaigns.ts', signature: 'listTemplates(): Promise<CampaignTemplate[]>' },
      { name: 'renderTemplate', file: 'src/lib/campaigns.ts', signature: 'renderTemplate(template: CampaignTemplate, context: any): string' },
      
      // Audience functions
      { name: 'createAudienceGroup', file: 'src/lib/campaigns.ts', signature: 'createAudienceGroup(input: AudienceGroupInput): Promise<AudienceGroup>' },
      { name: 'updateAudienceGroup', file: 'src/lib/campaigns.ts', signature: 'updateAudienceGroup(id: string, input: AudienceGroupInput): Promise<AudienceGroup>' },
      { name: 'deleteAudienceGroup', file: 'src/lib/campaigns.ts', signature: 'deleteAudienceGroup(id: string): Promise<void>' },
      { name: 'listGroups', file: 'src/lib/campaigns.ts', signature: 'listGroups(): Promise<AudienceGroup[]>' },
      
      // Schedule functions
      { name: 'createSchedule', file: 'src/lib/campaigns.ts', signature: 'createSchedule(input: ScheduleInput): Promise<CampaignSchedule>' },
      { name: 'updateSchedule', file: 'src/lib/campaigns.ts', signature: 'updateSchedule(id: string, input: ScheduleInput): Promise<CampaignSchedule>' },
      { name: 'deleteSchedule', file: 'src/lib/campaigns.ts', signature: 'deleteSchedule(id: string): Promise<void>' },
      { name: 'runSchedule', file: 'src/lib/campaigns.ts', signature: 'runSchedule(scheduleId: string, options?: RunOptions): Promise<void>' },
      
      // Email functions
      { name: 'sendCampaignEmail', file: 'src/lib/email-sender.ts', signature: 'sendCampaignEmail(jobId: string): Promise<void>' },
      { name: 'recordSendEngagement', file: 'src/lib/campaigns.ts', signature: 'recordSendEngagement(event: EngagementEvent): Promise<void>' },
      
      // Utility functions
      { name: 'inviteLinkFromToken', file: 'src/lib/campaigns.ts', signature: 'inviteLinkFromToken(token: string): string' },
      { name: 'listCampaignData', file: 'src/lib/campaigns.ts', signature: 'listCampaignData(): Promise<CampaignData[]>' },
      { name: 'getSchedule', file: 'src/lib/campaigns.ts', signature: 'getSchedule(id: string): Promise<CampaignSchedule>' }
    ];

    functions.forEach(func => {
      this.realFunctions.set(func.name, {
        type: 'function',
        name: func.name,
        file: func.file,
        exists: true,
        signature: func.signature
      });
    });

    // Initialize real APIs
    const apis = [
      { name: '/api/admin/campaign/campaigns', methods: ['GET', 'POST', 'PUT'], file: 'src/app/api/admin/campaign/campaigns/route.ts' },
      { name: '/api/admin/campaign/campaigns/[id]', methods: ['GET', 'DELETE'], file: 'src/app/api/admin/campaign/campaigns/[id]/route.ts' },
      { name: '/api/admin/campaign/send', methods: ['POST'], file: 'src/app/api/admin/campaign/send/route.ts' },
      { name: '/api/admin/campaign/groups', methods: ['GET', 'POST', 'PUT'], file: 'src/app/api/admin/campaign/groups/route.ts' },
      { name: '/api/admin/campaign/groups/[id]', methods: ['GET', 'DELETE'], file: 'src/app/api/admin/campaign/groups/[id]/route.ts' },
      { name: '/api/admin/campaign/templates', methods: ['GET', 'POST', 'PUT'], file: 'src/app/api/admin/campaign/templates/route.ts' },
      { name: '/api/admin/campaign/templates/[id]', methods: ['GET', 'DELETE'], file: 'src/app/api/admin/campaign/templates/[id]/route.ts' },
      { name: '/api/admin/campaign/schedules', methods: ['GET', 'POST', 'PUT'], file: 'src/app/api/admin/campaign/schedules/route.ts' },
      { name: '/api/admin/campaign/schedules/[id]', methods: ['GET', 'DELETE'], file: 'src/app/api/admin/campaign/schedules/[id]/route.ts' },
      { name: '/api/admin/campaign/schedules/[id]/run', methods: ['POST'], file: 'src/app/api/admin/campaign/schedules/[id]/run/route.ts' },
      { name: '/api/admin/campaign/dashboard', methods: ['GET'], file: 'src/app/api/admin/campaign/dashboard/route.ts' },
      { name: '/api/admin/analytics/visitors', methods: ['GET'], file: 'src/app/api/admin/analytics/visitors/route.ts' },
      { name: '/api/admin/campaigns/analytics', methods: ['GET'], file: 'src/app/api/admin/campaigns/analytics/route.ts' },
      { name: '/api/rsvp', methods: ['POST'], file: 'src/app/api/rsvp/route.ts' },
      { name: '/api/webhooks/sendgrid', methods: ['POST'], file: 'src/app/api/webhooks/sendgrid/route.ts' },
      { name: '/api/webhooks/resend', methods: ['POST'], file: 'src/app/api/webhooks/resend/route.ts' },
      { name: '/api/ai-agent', methods: ['GET', 'POST'], file: 'src/app/api/ai-agent/route.ts' }
    ];

    apis.forEach(api => {
      this.realAPIs.set(api.name, {
        type: 'api',
        name: api.name,
        file: api.file,
        exists: true,
        methods: api.methods
      });
    });

    // Initialize real models
    const models = [
      { name: 'Campaign', file: 'prisma/schema.prisma' },
      { name: 'CampaignTemplate', file: 'prisma/schema.prisma' },
      { name: 'AudienceGroup', file: 'prisma/schema.prisma' },
      { name: 'AudienceMember', file: 'prisma/schema.prisma' },
      { name: 'CampaignSchedule', file: 'prisma/schema.prisma' },
      { name: 'CampaignSend', file: 'prisma/schema.prisma' },
      { name: 'EmailJob', file: 'prisma/schema.prisma' },
      { name: 'EmailEvent', file: 'prisma/schema.prisma' },
      { name: 'RSVP', file: 'prisma/schema.prisma' },
      { name: 'Visit', file: 'prisma/schema.prisma' },
      { name: 'GlobalHTMLTemplate', file: 'prisma/schema.prisma' },
      { name: 'CampaignSettings', file: 'prisma/schema.prisma' }
    ];

    models.forEach(model => {
      this.realModels.set(model.name, {
        type: 'model',
        name: model.name,
        file: model.file,
        exists: true
      });
    });
  }

  /**
   * Validate an AI response against the real codebase
   */
  validateResponse(response: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    let totalReferences = 0;
    let validReferences = 0;

    // Extract function references
    const functionReferences = this.extractFunctionReferences(response);
    totalReferences += functionReferences.length;

    for (const funcRef of functionReferences) {
      const validation = this.validateFunctionReference(funcRef);
      if (validation.isValid) {
        validReferences++;
      } else {
        issues.push(...validation.issues);
      }
    }

    // Extract API references
    const apiReferences = this.extractAPIReferences(response);
    totalReferences += apiReferences.length;

    for (const apiRef of apiReferences) {
      const validation = this.validateAPIReference(apiRef);
      if (validation.isValid) {
        validReferences++;
      } else {
        issues.push(...validation.issues);
      }
    }

    // Extract model references
    const modelReferences = this.extractModelReferences(response);
    totalReferences += modelReferences.length;

    for (const modelRef of modelReferences) {
      const validation = this.validateModelReference(modelRef);
      if (validation.isValid) {
        validReferences++;
      } else {
        issues.push(...validation.issues);
      }
    }

    // Calculate confidence
    const confidence = totalReferences > 0 ? validReferences / totalReferences : 1.0;
    const isValid = confidence >= 0.8 && issues.filter(i => i.severity === 'error').length === 0;

    // Generate suggestions
    const suggestions = this.generateSuggestions(issues, confidence);

    return {
      isValid,
      confidence,
      issues,
      suggestions,
      validatedAt: new Date().toISOString()
    };
  }

  /**
   * Extract function references from response
   */
  private extractFunctionReferences(response: string): string[] {
    const functionPattern = /(\w+)\s*\([^)]*\)/g;
    const matches = response.match(functionPattern) || [];
    return matches.map(match => match.split('(')[0].trim()).filter(name => name.length > 2);
  }

  /**
   * Extract API references from response
   */
  private extractAPIReferences(response: string): Array<{method: string, endpoint: string}> {
    const apiPattern = /(GET|POST|PUT|DELETE|PATCH)\s+(\/api\/[^\s\)]+)/g;
    const matches = response.match(apiPattern) || [];
    return matches.map(match => {
      const parts = match.split(/\s+/);
      return { method: parts[0], endpoint: parts[1] };
    });
  }

  /**
   * Extract model references from response
   */
  private extractModelReferences(response: string): string[] {
    const modelPattern = /\b(Campaign|AudienceGroup|EmailJob|RSVP|Visit|CampaignTemplate|GlobalHTMLTemplate)\w*\b/g;
    const matches = response.match(modelPattern) || [];
    return Array.from(new Set(matches)); // Remove duplicates
  }

  /**
   * Validate a function reference
   */
  private validateFunctionReference(functionName: string): {isValid: boolean, issues: ValidationIssue[]} {
    const issues: ValidationIssue[] = [];
    const reference = this.realFunctions.get(functionName);

    if (!reference) {
      issues.push({
        type: 'function_not_found',
        severity: 'error',
        message: `Function '${functionName}' does not exist in the codebase`,
        suggestion: `Use one of these real functions: ${Array.from(this.realFunctions.keys()).slice(0, 5).join(', ')}`
      });
      return { isValid: false, issues };
    }

    if (!reference.exists) {
      issues.push({
        type: 'deprecated_function',
        severity: 'warning',
        message: `Function '${functionName}' is deprecated`,
        suggestion: 'Consider using an alternative function'
      });
    }

    return { isValid: true, issues };
  }

  /**
   * Validate an API reference
   */
  private validateAPIReference(apiRef: {method: string, endpoint: string}): {isValid: boolean, issues: ValidationIssue[]} {
    const issues: ValidationIssue[] = [];
    const reference = this.realAPIs.get(apiRef.endpoint);

    if (!reference) {
      issues.push({
        type: 'api_not_found',
        severity: 'error',
        message: `API endpoint '${apiRef.endpoint}' does not exist in the codebase`,
        suggestion: `Use one of these real endpoints: ${Array.from(this.realAPIs.keys()).slice(0, 3).join(', ')}`
      });
      return { isValid: false, issues };
    }

    if (!reference.methods?.includes(apiRef.method)) {
      issues.push({
        type: 'api_not_found',
        severity: 'error',
        message: `API endpoint '${apiRef.endpoint}' does not support ${apiRef.method} method`,
        suggestion: `Supported methods: ${reference.methods?.join(', ')}`
      });
      return { isValid: false, issues };
    }

    return { isValid: true, issues };
  }

  /**
   * Validate a model reference
   */
  private validateModelReference(modelName: string): {isValid: boolean, issues: ValidationIssue[]} {
    const issues: ValidationIssue[] = [];
    const reference = this.realModels.get(modelName);

    if (!reference) {
      issues.push({
        type: 'function_not_found', // Reusing type for model
        severity: 'warning',
        message: `Model '${modelName}' is not a standard database model`,
        suggestion: `Use one of these real models: ${Array.from(this.realModels.keys()).slice(0, 5).join(', ')}`
      });
      return { isValid: false, issues };
    }

    return { isValid: true, issues };
  }

  /**
   * Generate suggestions based on validation issues
   */
  private generateSuggestions(issues: ValidationIssue[], confidence: number): string[] {
    const suggestions: string[] = [];

    if (confidence < 0.8) {
      suggestions.push('Response has low confidence - consider using more specific queries');
    }

    const errorIssues = issues.filter(i => i.severity === 'error');
    if (errorIssues.length > 0) {
      suggestions.push('Response contains invalid references - execution should be blocked');
    }

    const warningIssues = issues.filter(i => i.severity === 'warning');
    if (warningIssues.length > 0) {
      suggestions.push('Response contains warnings - review before execution');
    }

    if (issues.length === 0) {
      suggestions.push('Response is valid and safe to execute');
    }

    return suggestions;
  }

  /**
   * Get all available functions
   */
  getAvailableFunctions(): string[] {
    return Array.from(this.realFunctions.keys());
  }

  /**
   * Get all available APIs
   */
  getAvailableAPIs(): Array<{endpoint: string, methods: string[]}> {
    return Array.from(this.realAPIs.entries()).map(([endpoint, ref]) => ({
      endpoint,
      methods: ref.methods || []
    }));
  }

  /**
   * Get all available models
   */
  getAvailableModels(): string[] {
    return Array.from(this.realModels.keys());
  }

  /**
   * Check if a function exists
   */
  functionExists(functionName: string): boolean {
    return this.realFunctions.has(functionName);
  }

  /**
   * Check if an API endpoint exists and supports a method
   */
  apiExists(endpoint: string, method?: string): boolean {
    const reference = this.realAPIs.get(endpoint);
    if (!reference) return false;
    if (method && !reference.methods?.includes(method)) return false;
    return true;
  }

  /**
   * Check if a model exists
   */
  modelExists(modelName: string): boolean {
    return this.realModels.has(modelName);
  }
}

// Export singleton instance
export const responseValidator = new ResponseValidator();
