// Simple in-memory rate limiter for high-volume traffic
// In production, this should use Redis or similar distributed cache

interface RateLimitEntry {
  count: number;
  resetTime: number;
  fingerprint: string; // Store fingerprint to detect spoofing attempts
}

interface RequestFingerprint {
  ip: string;
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private readonly defaultLimit = 10; // requests per minute
  private readonly defaultWindow = 60 * 1000; // 1 minute in milliseconds

  // Create a fingerprint from request headers to detect spoofing
  private createFingerprint(fingerprint: RequestFingerprint): string {
    const crypto = require('crypto');
    const data = `${fingerprint.ip}|${fingerprint.userAgent}|${fingerprint.acceptLanguage}|${fingerprint.acceptEncoding}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  isAllowed(key: string, fingerprint: RequestFingerprint, limit?: number, window?: number): boolean {
    const now = Date.now();
    const limitValue = limit || this.defaultLimit;
    const windowValue = window || this.defaultWindow;
    const fp = this.createFingerprint(fingerprint);
    
    const entry = this.limits.get(key);
    
    if (!entry || now > entry.resetTime) {
      // No entry or window expired, create new entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowValue,
        fingerprint: fp
      });
      return true;
    }
    
    // Check if fingerprint matches (detect spoofing attempts)
    if (entry.fingerprint !== fp) {
      // Different fingerprint detected - this could be spoofing
      // Reset the rate limit to be more restrictive
      this.limits.set(key, {
        count: limitValue, // Set to limit to block immediately
        resetTime: now + windowValue,
        fingerprint: fp
      });
      return false;
    }
    
    if (entry.count >= limitValue) {
      return false; // Rate limit exceeded
    }
    
    // Increment counter
    entry.count++;
    return true;
  }

  getRemainingTime(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;
    
    const now = Date.now();
    return Math.max(0, entry.resetTime - now);
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.limits.entries())) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// Clean up expired entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);

export function checkRateLimit(
  identifier: string,
  fingerprint: RequestFingerprint,
  limit: number = 10, 
  window: number = 60 * 1000
): { allowed: boolean; remainingTime?: number } {
  const allowed = rateLimiter.isAllowed(identifier, fingerprint, limit, window);
  const remainingTime = allowed ? 0 : rateLimiter.getRemainingTime(identifier);
  
  return { allowed, remainingTime };
}

// RSVP-specific rate limiting (more restrictive)
export function checkRSVPRateLimit(
  ip: string, 
  userAgent: string = '', 
  acceptLanguage: string = '', 
  acceptEncoding: string = ''
): { allowed: boolean; remainingTime?: number } {
  const fingerprint: RequestFingerprint = {
    ip,
    userAgent: userAgent.substring(0, 100), // Limit length
    acceptLanguage: acceptLanguage.substring(0, 50),
    acceptEncoding: acceptEncoding.substring(0, 50)
  };
  
  // Allow 10 RSVP submissions per fingerprint per hour (increased for testing)
  return checkRateLimit(`rsvp:${ip}`, fingerprint, 10, 60 * 60 * 1000);
}

// General API rate limiting
export function checkAPIRateLimit(
  ip: string,
  userAgent: string = '',
  acceptLanguage: string = '',
  acceptEncoding: string = ''
): { allowed: boolean; remainingTime?: number } {
  const fingerprint: RequestFingerprint = {
    ip,
    userAgent: userAgent.substring(0, 100),
    acceptLanguage: acceptLanguage.substring(0, 50),
    acceptEncoding: acceptEncoding.substring(0, 50)
  };
  
  // Allow 100 requests per fingerprint per minute
  return checkRateLimit(`api:${ip}`, fingerprint, 100, 60 * 1000);
}
