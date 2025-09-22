// src/lib/security-logger.ts
import { headers } from 'next/headers';

export interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'RATE_LIMIT' | 'CSRF_VIOLATION' | 'XSS_ATTEMPT' | 'INVALID_INPUT' | 'SUSPICIOUS_ACTIVITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory

  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    // Add to in-memory store
    this.events.unshift(fullEvent);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Log to console in development, could be extended to external service in production
    const logLevel = this.getLogLevel(event.severity);
    console[logLevel](`[SECURITY ${event.severity}] ${event.type}: ${event.message}`, {
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      metadata: event.metadata
    });
  }

  private getLogLevel(severity: SecurityEvent['severity']): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'LOW': return 'log';
      case 'MEDIUM': return 'warn';
      case 'HIGH': return 'error';
      case 'CRITICAL': return 'error';
      default: return 'log';
    }
  }

  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.events.slice(0, limit);
  }

  getEventsByType(type: SecurityEvent['type'], limit: number = 50): SecurityEvent[] {
    return this.events.filter(event => event.type === type).slice(0, limit);
  }

  getEventsBySeverity(severity: SecurityEvent['severity'], limit: number = 50): SecurityEvent[] {
    return this.events.filter(event => event.severity === severity).slice(0, limit);
  }

  getEventStats(): {
    total: number;
    byType: Record<SecurityEvent['type'], number>;
    bySeverity: Record<SecurityEvent['severity'], number>;
    recentActivity: number; // events in last hour
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const byType: Record<SecurityEvent['type'], number> = {
      AUTH_FAILURE: 0,
      RATE_LIMIT: 0,
      CSRF_VIOLATION: 0,
      XSS_ATTEMPT: 0,
      INVALID_INPUT: 0,
      SUSPICIOUS_ACTIVITY: 0
    };

    const bySeverity: Record<SecurityEvent['severity'], number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0
    };

    let recentActivity = 0;

    this.events.forEach(event => {
      byType[event.type]++;
      bySeverity[event.severity]++;
      
      if (event.timestamp > oneHourAgo) {
        recentActivity++;
      }
    });

    return {
      total: this.events.length,
      byType,
      bySeverity,
      recentActivity
    };
  }
}

export const securityLogger = new SecurityLogger();

// Helper functions for common security events
export function logAuthFailure(userId?: string, reason?: string): void {
  const headersList = headers();
  securityLogger.log({
    type: 'AUTH_FAILURE',
    severity: 'MEDIUM',
    message: `Authentication failed${reason ? `: ${reason}` : ''}`,
    userId,
    ip: headersList.get('x-forwarded-for')?.split(',')[0]?.trim(),
    userAgent: headersList.get('user-agent') || undefined,
    metadata: { reason }
  });
}

export function logRateLimitViolation(ip: string, endpoint: string, limit: number): void {
  const headersList = headers();
  securityLogger.log({
    type: 'RATE_LIMIT',
    severity: 'HIGH',
    message: `Rate limit exceeded for endpoint ${endpoint}`,
    ip,
    userAgent: headersList.get('user-agent') || undefined,
    metadata: { endpoint, limit }
  });
}

export function logCSRFViolation(ip: string, endpoint: string): void {
  const headersList = headers();
  securityLogger.log({
    type: 'CSRF_VIOLATION',
    severity: 'HIGH',
    message: `CSRF violation detected on ${endpoint}`,
    ip,
    userAgent: headersList.get('user-agent') || undefined,
    metadata: { endpoint }
  });
}

export function logXSSAttempt(ip: string, input: string, sanitized: string): void {
  const headersList = headers();
  securityLogger.log({
    type: 'XSS_ATTEMPT',
    severity: 'CRITICAL',
    message: 'Potential XSS attack detected and sanitized',
    ip,
    userAgent: headersList.get('user-agent') || undefined,
    metadata: { 
      originalInput: input.substring(0, 100), // Truncate for security
      sanitizedInput: sanitized.substring(0, 100)
    }
  });
}

export function logInvalidInput(ip: string, input: any, validationErrors: string[]): void {
  const headersList = headers();
  securityLogger.log({
    type: 'INVALID_INPUT',
    severity: 'LOW',
    message: 'Invalid input validation failed',
    ip,
    userAgent: headersList.get('user-agent') || undefined,
    metadata: { 
      inputType: typeof input,
      validationErrors
    }
  });
}

export function logSuspiciousActivity(ip: string, activity: string, details?: any): void {
  const headersList = headers();
  securityLogger.log({
    type: 'SUSPICIOUS_ACTIVITY',
    severity: 'MEDIUM',
    message: `Suspicious activity detected: ${activity}`,
    ip,
    userAgent: headersList.get('user-agent') || undefined,
    metadata: details
  });
}
