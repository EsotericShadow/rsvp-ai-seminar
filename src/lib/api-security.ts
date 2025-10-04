// src/lib/api-security.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { checkRateLimit } from '@/lib/rate-limiter';
import { logRateLimitViolation, logSuspiciousActivity } from '@/lib/security-logger';

export interface APISecurityConfig {
  rateLimit: {
    requests: number;
    window: number; // in milliseconds
  };
  maxRequestSize: number; // in bytes
  allowedMethods: string[];
  requireCSRF: boolean;
}

const defaultConfig: APISecurityConfig = {
  rateLimit: {
    requests: 100,
    window: 60 * 1000 // 1 minute
  },
  maxRequestSize: 1024 * 1024, // 1MB
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  requireCSRF: true
};

export function validateRequestSize(req: NextRequest, maxSize: number = defaultConfig.maxRequestSize): boolean {
  const contentLength = req.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    return size <= maxSize;
  }
  return true; // If no content-length header, assume it's ok
}

export function validateHTTPMethod(req: NextRequest, allowedMethods: string[] = defaultConfig.allowedMethods): boolean {
  return allowedMethods.includes(req.method);
}

export function validateCSRFHeaders(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://rsvp.evergreenwebsolutions.ca'
  ];
  
  // Allow requests from allowed origins or if both origin and referer are missing (direct API calls)
  const isValidOrigin = !origin || allowedOrigins.some(allowed => origin.startsWith(allowed));
  const isValidReferer = !referer || allowedOrigins.some(allowed => referer.startsWith(allowed));
  
  return isValidOrigin && isValidReferer;
}

export function validateUserAgent(req: NextRequest): boolean {
  const userAgent = req.headers.get('user-agent');
  
  // Block obviously suspicious user agents
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /^$/ // Empty user agent
  ];
  
  if (!userAgent) {
    return false;
  }
  
  return !suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

export function getClientFingerprint(req: NextRequest): {
  ip: string;
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
} {
  const headersList = headers();
  
  return {
    ip: headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
    userAgent: headersList.get('user-agent') || '',
    acceptLanguage: headersList.get('accept-language') || '',
    acceptEncoding: headersList.get('accept-encoding') || ''
  };
}

export function validateAPISecurity(
  req: NextRequest, 
  config: APISecurityConfig = defaultConfig,
  endpoint?: string
): { valid: boolean; response?: NextResponse } {
  const fingerprint = getClientFingerprint(req);
  
  // Check HTTP method
  if (!validateHTTPMethod(req, config.allowedMethods)) {
    logSuspiciousActivity(fingerprint.ip, `Invalid HTTP method: ${req.method}`, { 
      method: req.method,
      endpoint 
    });
    return {
      valid: false,
      response: NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
    };
  }
  
  // Check request size
  if (!validateRequestSize(req, config.maxRequestSize)) {
    logSuspiciousActivity(fingerprint.ip, 'Request too large', { 
      maxSize: config.maxRequestSize,
      endpoint 
    });
    return {
      valid: false,
      response: NextResponse.json({ message: 'Request too large' }, { status: 413 })
    };
  }
  
  // Check CSRF headers for POST/PUT/DELETE/PATCH requests
  if (config.requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    if (!validateCSRFHeaders(req)) {
      logSuspiciousActivity(fingerprint.ip, 'CSRF validation failed', { 
        origin: req.headers.get('origin'),
        referer: req.headers.get('referer'),
        endpoint 
      });
      return {
        valid: false,
        response: NextResponse.json({ message: 'Invalid request origin' }, { status: 403 })
      };
    }
  }
  
  // Check user agent
  if (!validateUserAgent(req)) {
    logSuspiciousActivity(fingerprint.ip, 'Suspicious user agent', { 
      userAgent: fingerprint.userAgent,
      endpoint 
    });
    return {
      valid: false,
      response: NextResponse.json({ message: 'Invalid request' }, { status: 400 })
    };
  }
  
  // Check rate limiting
  const rateLimitKey = endpoint ? `api:${endpoint}:${fingerprint.ip}` : `api:${fingerprint.ip}`;
  const rateLimitResult = checkRateLimit(
    rateLimitKey,
    fingerprint,
    config.rateLimit.requests,
    config.rateLimit.window
  );
  
  if (!rateLimitResult.allowed) {
    logRateLimitViolation(fingerprint.ip, endpoint || 'unknown', config.rateLimit.requests);
    return {
      valid: false,
      response: NextResponse.json(
        { 
          message: 'Too many requests. Please try again later.',
          remainingTime: rateLimitResult.remainingTime 
        }, 
        { status: 429 }
      )
    };
  }
  
  return { valid: true };
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/[<>\"'&]/g, (match) => {
        const escapeMap: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return escapeMap[match];
      })
      .trim()
      .slice(0, 1000); // Limit length
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}









