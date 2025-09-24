// src/lib/security-headers.ts
import { NextResponse } from 'next/server';

export interface SecurityHeadersConfig {
  csp?: {
    'default-src'?: string[];
    'script-src'?: string[];
    'style-src'?: string[];
    'img-src'?: string[];
    'connect-src'?: string[];
    'font-src'?: string[];
    'object-src'?: string[];
    'media-src'?: string[];
    'frame-src'?: string[];
    'base-uri'?: string[];
    'form-action'?: string[];
    'frame-ancestors'?: string[];
  };
  hsts?: boolean;
  xFrameOptions?: 'DENY' | 'SAMEORIGIN' | string;
  xContentTypeOptions?: boolean;
  xXSSProtection?: boolean;
  referrerPolicy?: string;
  permissionsPolicy?: Record<string, string[]>;
}

const defaultSecurityHeaders: SecurityHeadersConfig = {
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'img-src': ["'self'", "data:", "https:", "blob:"],
    'connect-src': ["'self'", "https://api.lead-mine.vercel.app", "https://api.resend.com", "https://api.sendgrid.com"],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'object-src': ["'none'"],
    'media-src': ["'self'"],
    'frame-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"]
  },
  hsts: true,
  xFrameOptions: 'DENY',
  xContentTypeOptions: true,
  xXSSProtection: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: []
  }
};

export function generateCSPHeader(csp: SecurityHeadersConfig['csp']): string {
  if (!csp) return '';
  
  const directives: string[] = [];
  
  Object.entries(csp).forEach(([directive, sources]) => {
    if (sources && sources.length > 0) {
      directives.push(`${directive} ${sources.join(' ')}`);
    }
  });
  
  return directives.join('; ');
}

export function generatePermissionsPolicyHeader(permissionsPolicy?: Record<string, string[]>): string {
  if (!permissionsPolicy) return '';
  
  return Object.entries(permissionsPolicy)
    .map(([feature, allowlist]) => {
      if (allowlist.length === 0) {
        return `${feature}=()`;
      }
      return `${feature}=(${allowlist.join(' ')})`;
    })
    .join(', ');
}

export function addSecurityHeaders(response: NextResponse, config: SecurityHeadersConfig = defaultSecurityHeaders): NextResponse {
  // Content Security Policy
  if (config.csp) {
    const cspHeader = generateCSPHeader(config.csp);
    if (cspHeader) {
      response.headers.set('Content-Security-Policy', cspHeader);
    }
  }
  
  // HTTP Strict Transport Security
  if (config.hsts) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // X-Frame-Options
  if (config.xFrameOptions) {
    response.headers.set('X-Frame-Options', config.xFrameOptions);
  }
  
  // X-Content-Type-Options
  if (config.xContentTypeOptions) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }
  
  // X-XSS-Protection
  if (config.xXSSProtection) {
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }
  
  // Referrer Policy
  if (config.referrerPolicy) {
    response.headers.set('Referrer-Policy', config.referrerPolicy);
  }
  
  // Permissions Policy
  if (config.permissionsPolicy) {
    const permissionsHeader = generatePermissionsPolicyHeader(config.permissionsPolicy);
    if (permissionsHeader) {
      response.headers.set('Permissions-Policy', permissionsHeader);
    }
  }
  
  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  return response;
}

export function createSecureResponse(data: any, status: number = 200, config?: SecurityHeadersConfig): NextResponse {
  const response = NextResponse.json(data, { status });
  return addSecurityHeaders(response, config);
}

