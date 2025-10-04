// Test data detection utilities

export interface TestDetectionConfig {
  blockTestEmails: boolean;
  blockTestNames: boolean;
  blockAPIUserAgents: boolean;
  requireVisitorTracking: boolean;
}

const defaultConfig: TestDetectionConfig = {
  blockTestEmails: true,
  blockTestNames: true,
  blockAPIUserAgents: true,
  requireVisitorTracking: false, // Set to true in production
};

// Test email patterns
const testEmailPatterns = [
  /test/i,
  /example\.com$/,
  /demo/i,
  /sample/i,
  /fake/i,
  /dummy/i,
  /temp/i,
  /temporary/i,
];

// Test name patterns
const testNamePatterns = [
  /test/i,
  /demo/i,
  /sample/i,
  /fake/i,
  /dummy/i,
  /temp/i,
  /analytics test/i,
  /rate test/i,
  /final test/i,
];

// API/Test user agents
const apiUserAgents = [
  /curl/i,
  /wget/i,
  /postman/i,
  /insomnia/i,
  /httpie/i,
  /node/i,
  /python-requests/i,
  /go-http-client/i,
];

export interface TestDetectionResult {
  isTest: boolean;
  reasons: string[];
  confidence: number; // 0-100
}

export function detectTestSubmission(
  data: {
    email?: string;
    fullName?: string;
    userAgent?: string;
    visitorId?: string;
    sessionId?: string;
    referrer?: string;
  },
  config: TestDetectionConfig = defaultConfig
): TestDetectionResult {
  const reasons: string[] = [];
  let confidence = 0;

  // Check email patterns
  if (data.email && config.blockTestEmails) {
    const isTestEmail = testEmailPatterns.some(pattern => pattern.test(data.email!));
    if (isTestEmail) {
      reasons.push('Test email pattern detected');
      confidence += 40;
    }
  }

  // Check name patterns
  if (data.fullName && config.blockTestNames) {
    const isTestName = testNamePatterns.some(pattern => pattern.test(data.fullName!));
    if (isTestName) {
      reasons.push('Test name pattern detected');
      confidence += 30;
    }
  }

  // Check user agent
  if (data.userAgent && config.blockAPIUserAgents) {
    const isAPIUserAgent = apiUserAgents.some(pattern => pattern.test(data.userAgent!));
    if (isAPIUserAgent) {
      reasons.push('API/Test user agent detected');
      confidence += 50;
    }
  }

  // Check tracking data
  if (config.requireVisitorTracking) {
    if (!data.visitorId || !data.sessionId) {
      reasons.push('Missing visitor tracking data');
      confidence += 20;
    }
    
    if (!data.referrer) {
      reasons.push('Missing referrer data');
      confidence += 10;
    }
  }

  // High confidence if multiple indicators
  if (reasons.length >= 2) {
    confidence += 20;
  }

  // Very high confidence if API user agent + test patterns
  if (reasons.includes('API/Test user agent detected') && 
      (reasons.includes('Test email pattern detected') || reasons.includes('Test name pattern detected'))) {
    confidence = Math.max(confidence, 90);
  }

  return {
    isTest: confidence >= 50,
    reasons,
    confidence: Math.min(confidence, 100),
  };
}

// Validation function for RSVP submissions
export function validateRSVPSubmission(data: {
  email: string;
  fullName: string;
  userAgent?: string;
  visitorId?: string;
  sessionId?: string;
  referrer?: string;
}, config: TestDetectionConfig = defaultConfig): {
  isValid: boolean;
  isTest: boolean;
  testDetection: TestDetectionResult;
  message?: string;
} {
  const testDetection = detectTestSubmission(data, config);
  
  if (testDetection.isTest) {
    return {
      isValid: false,
      isTest: true,
      testDetection,
      message: `Test submission detected (${testDetection.confidence}% confidence): ${testDetection.reasons.join(', ')}`,
    };
  }

  return {
    isValid: true,
    isTest: false,
    testDetection,
  };
}

// Environment-specific configurations
export const getTestDetectionConfig = (): TestDetectionConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  if (isDevelopment) {
    return {
      blockTestEmails: false, // Allow test emails in development
      blockTestNames: false,  // Allow test names in development
      blockAPIUserAgents: true, // Still block API calls
      requireVisitorTracking: false,
    };
  }

  if (isProduction) {
    return {
      blockTestEmails: true,
      blockTestNames: true,
      blockAPIUserAgents: true,
      requireVisitorTracking: false, // Set to true if you want strict tracking
    };
  }

  // Default for other environments
  return defaultConfig;
};









