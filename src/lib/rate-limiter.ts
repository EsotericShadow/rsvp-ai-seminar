// Simple in-memory rate limiter for high-volume traffic
// In production, this should use Redis or similar distributed cache

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private readonly defaultLimit = 10; // requests per minute
  private readonly defaultWindow = 60 * 1000; // 1 minute in milliseconds

  isAllowed(key: string, limit?: number, window?: number): boolean {
    const now = Date.now();
    const limitValue = limit || this.defaultLimit;
    const windowValue = window || this.defaultWindow;
    
    const entry = this.limits.get(key);
    
    if (!entry || now > entry.resetTime) {
      // No entry or window expired, create new entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowValue
      });
      return true;
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
    for (const [key, entry] of this.limits.entries()) {
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
  limit: number = 10, 
  window: number = 60 * 1000
): { allowed: boolean; remainingTime?: number } {
  const allowed = rateLimiter.isAllowed(identifier, limit, window);
  const remainingTime = allowed ? 0 : rateLimiter.getRemainingTime(identifier);
  
  return { allowed, remainingTime };
}

// RSVP-specific rate limiting (more restrictive)
export function checkRSVPRateLimit(ip: string): { allowed: boolean; remainingTime?: number } {
  // Allow 3 RSVP submissions per IP per hour
  return checkRateLimit(`rsvp:${ip}`, 3, 60 * 60 * 1000);
}

// General API rate limiting
export function checkAPIRateLimit(ip: string): { allowed: boolean; remainingTime?: number } {
  // Allow 100 requests per IP per minute
  return checkRateLimit(`api:${ip}`, 100, 60 * 1000);
}
