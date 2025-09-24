/**
 * Enhanced Response Validation System
 * Comprehensive validation for AI responses with improved accuracy
 */

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
  warnings: string[];
  suggestions: string[];
}

export class EnhancedValidator {
  private static readonly VALID_FUNCTIONS = [
    'createCampaign', 'updateCampaign', 'deleteCampaign', 'sendEmail', 'getAudienceGroups',
    'createTemplate', 'updateTemplate', 'deleteTemplate', 'getTemplates', 'createSchedule',
    'updateSchedule', 'deleteSchedule', 'runSchedule', 'createAudienceGroup', 'updateAudienceGroup',
    'deleteAudienceGroup', 'listGroups', 'renderTemplate', 'sendCampaignEmail', 'recordSendEngagement',
    'listCampaigns', 'getCampaign', 'getSchedule', 'listSchedules', 'parseSteps', 'inviteLinkFromToken',
    'listCampaignData', 'fetchLeadMineBusinesses', 'postLeadMineEvent', 'generateEmailHTML',
    'generateEmailText', 'getPrivacyPolicy', 'requireAdminSession', 'validateRSVP', 'createRSVP',
    'updateRSVP', 'getRSVP', 'listRSVPs', 'deleteRSVP', 'sendConfirmationEmail', 'generateICS',
    'trackVisit', 'getVisitAnalytics', 'getCampaignAnalytics', 'getDashboardData'
  ];

  private static readonly VALID_APIS = [
    '/api/admin/campaign/campaigns',
    '/api/admin/campaign/templates',
    '/api/admin/campaign/groups',
    '/api/admin/campaign/schedules',
    '/api/admin/campaign/send',
    '/api/admin/campaign/dashboard',
    '/api/admin/campaign/schedules/[id]/run',
    '/api/admin/campaign/campaigns/[id]',
    '/api/rsvp',
    '/api/ai-agent',
    '/api/admin/analytics/visitors',
    '/api/admin/campaigns/analytics',
    '/api/admin/analytics/dashboard',
    '/api/admin/analytics/performance'
  ];

  private static readonly VALID_MODELS = [
    'Campaign', 'CampaignTemplate', 'AudienceMember', 'AudienceGroup', 'RSVP',
    'CampaignSchedule', 'CampaignSend', 'EmailJob', 'EmailEvent', 'CampaignSettings',
    'GlobalTemplateSettings', 'GlobalHTMLTemplate', 'WorkflowRule', 'WorkflowExecution', 'Visit'
  ];

  private static readonly VALID_ENV_VARS = [
    'RESEND_API_KEY', 'SENDGRID_API_KEY', 'DATABASE_URL', 'LEADMINE_API_KEY',
    'CAMPAIGN_FROM_EMAIL', 'CAMPAIGN_LINK_BASE', 'WEAVIATE_URL', 'WEAVIATE_API_KEY',
    'ADMIN_USER', 'ADMIN_PASSWORD_HASH', 'ADMIN_SESSION_SECRET', 'CAMPAIGN_CRON_SECRET',
    'CAMPAIGN_EMAIL_BATCH_SIZE', 'CAMPAIGN_MIN_HOURS_BETWEEN_EMAILS', 'PRIVACY_POLICY_URL',
    'FROM_EMAIL', 'SENDGRID_DOMAIN'
  ];

  private static readonly DANGEROUS_PATTERNS = [
    { pattern: /rm\s+-rf/gi, severity: 'critical', message: 'Dangerous file deletion command' },
    { pattern: /delete\s+from\s+.*where/gi, severity: 'high', message: 'Database deletion without proper conditions' },
    { pattern: /drop\s+table/gi, severity: 'critical', message: 'Table deletion command' },
    { pattern: /format\s+c:/gi, severity: 'critical', message: 'Disk formatting command' },
    { pattern: /shutdown/gi, severity: 'high', message: 'System shutdown command' },
    { pattern: /reboot/gi, severity: 'high', message: 'System reboot command' },
    { pattern: /kill\s+-9/gi, severity: 'high', message: 'Force kill process command' },
    { pattern: /sudo\s+rm/gi, severity: 'critical', message: 'Privileged file deletion' },
    { pattern: /chmod\s+777/gi, severity: 'medium', message: 'Dangerous file permissions' }
  ];

  private static readonly SENSITIVE_PATTERNS = [
    { pattern: /password\s*[:=]\s*['"][^'"]+['"]/gi, severity: 'critical', message: 'Password exposure' },
    { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, severity: 'critical', message: 'API key exposure' },
    { pattern: /secret\s*[:=]\s*['"][^'"]+['"]/gi, severity: 'critical', message: 'Secret exposure' },
    { pattern: /token\s*[:=]\s*['"][^'"]+['"]/gi, severity: 'high', message: 'Token exposure' },
    { pattern: /sk-[a-zA-Z0-9]{20,}/gi, severity: 'critical', message: 'OpenAI API key format' },
    { pattern: /pk_[a-zA-Z0-9]{20,}/gi, severity: 'critical', message: 'Stripe API key format' },
    { pattern: /postgresql:\/\/[^'"]+/gi, severity: 'critical', message: 'Database connection string' },
    { pattern: /mysql:\/\/[^'"]+/gi, severity: 'critical', message: 'Database connection string' },
    { pattern: /mongodb:\/\/[^'"]+/gi, severity: 'critical', message: 'Database connection string' }
  ];

  static validateResponse(response: string, context?: any): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let confidence = 100;

    // Validate functions
    const functionValidation = this.validateFunctions(response);
    issues.push(...functionValidation.issues);
    warnings.push(...functionValidation.warnings);
    confidence -= functionValidation.confidencePenalty;

    // Validate API endpoints
    const apiValidation = this.validateAPIs(response);
    issues.push(...apiValidation.issues);
    warnings.push(...apiValidation.warnings);
    confidence -= apiValidation.confidencePenalty;

    // Validate database models
    const modelValidation = this.validateModels(response);
    issues.push(...modelValidation.issues);
    warnings.push(...modelValidation.warnings);
    confidence -= modelValidation.confidencePenalty;

    // Validate environment variables
    const envValidation = this.validateEnvVars(response);
    issues.push(...envValidation.issues);
    warnings.push(...envValidation.warnings);
    confidence -= envValidation.confidencePenalty;

    // Check for dangerous patterns
    const dangerValidation = this.checkDangerousPatterns(response);
    issues.push(...dangerValidation.issues);
    warnings.push(...dangerValidation.warnings);
    confidence -= dangerValidation.confidencePenalty;

    // Check for sensitive data
    const sensitiveValidation = this.checkSensitiveData(response);
    issues.push(...sensitiveValidation.issues);
    warnings.push(...sensitiveValidation.warnings);
    confidence -= sensitiveValidation.confidencePenalty;

    // Generate suggestions
    if (issues.length > 0) {
      suggestions.push('Review the identified issues and correct them');
    }
    if (warnings.length > 0) {
      suggestions.push('Consider addressing the warnings for better accuracy');
    }
    if (confidence < 80) {
      suggestions.push('Response confidence is low - consider providing more specific information');
    }

    return {
      isValid: issues.length === 0 && confidence >= 80,
      confidence: Math.max(0, confidence),
      issues,
      warnings,
      suggestions
    };
  }

  private static validateFunctions(response: string): { issues: string[]; warnings: string[]; confidencePenalty: number } {
    const issues: string[] = [];
    const warnings: string[] = [];
    let confidencePenalty = 0;

    const functionPattern = /\b([a-zA-Z][a-zA-Z0-9]*)\s*\(/g;
    const matches = response.match(functionPattern);

    if (matches) {
      for (const match of matches) {
        const functionName = match.replace(/\s*\(/, '');
        if (!this.VALID_FUNCTIONS.includes(functionName)) {
          // Check if it's a common function that might be valid
          if (this.isCommonFunction(functionName)) {
            warnings.push(`Function '${functionName}' is not in the known function list`);
            confidencePenalty += 2;
          } else {
            issues.push(`Function '${functionName}' not found in codebase`);
            confidencePenalty += 10;
          }
        }
      }
    }

    return { issues, warnings, confidencePenalty };
  }

  private static validateAPIs(response: string): { issues: string[]; warnings: string[]; confidencePenalty: number } {
    const issues: string[] = [];
    const warnings: string[] = [];
    let confidencePenalty = 0;

    const apiPattern = /(GET|POST|PUT|DELETE|PATCH)\s+\/api\/[a-zA-Z0-9\/\-_\[\]]+/g;
    const matches = response.match(apiPattern);

    if (matches) {
      for (const match of matches) {
        const parts = match.split(/\s+/);
        const endpoint = parts[1];
        
        if (!this.VALID_APIS.some(api => endpoint.includes(api.replace(/\[.*?\]/g, '')))) {
          issues.push(`API endpoint '${endpoint}' not found in codebase`);
          confidencePenalty += 15;
        }
      }
    }

    return { issues, warnings, confidencePenalty };
  }

  private static validateModels(response: string): { issues: string[]; warnings: string[]; confidencePenalty: number } {
    const issues: string[] = [];
    const warnings: string[] = [];
    let confidencePenalty = 0;

    const modelPattern = /\b([A-Z][a-zA-Z0-9]*)\b/g;
    const matches = response.match(modelPattern);

    if (matches) {
      for (const match of matches) {
        if (!this.VALID_MODELS.includes(match) && this.looksLikeModel(match)) {
          warnings.push(`Model '${match}' is not in the known model list`);
          confidencePenalty += 3;
        }
      }
    }

    return { issues, warnings, confidencePenalty };
  }

  private static validateEnvVars(response: string): { issues: string[]; warnings: string[]; confidencePenalty: number } {
    const issues: string[] = [];
    const warnings: string[] = [];
    let confidencePenalty = 0;

    const envPattern = /\b([A-Z_][A-Z0-9_]*)\b/g;
    const matches = response.match(envPattern);

    if (matches) {
      for (const match of matches) {
        if (!this.VALID_ENV_VARS.includes(match) && this.looksLikeEnvVar(match)) {
          warnings.push(`Environment variable '${match}' is not in the known list`);
          confidencePenalty += 2;
        }
      }
    }

    return { issues, warnings, confidencePenalty };
  }

  private static checkDangerousPatterns(response: string): { issues: string[]; warnings: string[]; confidencePenalty: number } {
    const issues: string[] = [];
    const warnings: string[] = [];
    let confidencePenalty = 0;

    for (const { pattern, severity, message } of this.DANGEROUS_PATTERNS) {
      if (pattern.test(response)) {
        if (severity === 'critical') {
          issues.push(`${message}: ${pattern.source}`);
          confidencePenalty += 30;
        } else if (severity === 'high') {
          issues.push(`${message}: ${pattern.source}`);
          confidencePenalty += 20;
        } else {
          warnings.push(`${message}: ${pattern.source}`);
          confidencePenalty += 10;
        }
      }
    }

    return { issues, warnings, confidencePenalty };
  }

  private static checkSensitiveData(response: string): { issues: string[]; warnings: string[]; confidencePenalty: number } {
    const issues: string[] = [];
    const warnings: string[] = [];
    let confidencePenalty = 0;

    for (const { pattern, severity, message } of this.SENSITIVE_PATTERNS) {
      if (pattern.test(response)) {
        if (severity === 'critical') {
          issues.push(`${message}: ${pattern.source}`);
          confidencePenalty += 25;
        } else {
          warnings.push(`${message}: ${pattern.source}`);
          confidencePenalty += 15;
        }
      }
    }

    return { issues, warnings, confidencePenalty };
  }

  private static isCommonFunction(name: string): boolean {
    const commonFunctions = ['console.log', 'JSON.parse', 'JSON.stringify', 'Array.from', 'Object.keys', 'Object.values'];
    return commonFunctions.includes(name) || name.startsWith('console.') || name.startsWith('Array.') || name.startsWith('Object.');
  }

  private static looksLikeModel(name: string): boolean {
    return name.length > 3 && /^[A-Z][a-zA-Z0-9]*$/.test(name) && !this.isCommonFunction(name);
  }

  private static looksLikeEnvVar(name: string): boolean {
    return name.length > 5 && /^[A-Z_][A-Z0-9_]*$/.test(name) && name.includes('_');
  }
}

// Export the main validation function
export function validateResponse(response: string, context?: any): ValidationResult {
  return EnhancedValidator.validateResponse(response, context);
}
