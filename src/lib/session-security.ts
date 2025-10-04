// src/lib/session-security.ts
import { cookies } from 'next/headers';
import * as crypto from 'crypto';

export interface SecureSessionConfig {
  sessionSecret: string;
  cookieName: string;
  maxAge: number; // in seconds
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

const defaultConfig: SecureSessionConfig = {
  sessionSecret: process.env.ADMIN_SESSION_SECRET || 'fallback-secret-key',
  cookieName: 'admin-session',
  maxAge: 24 * 60 * 60, // 24 hours
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
};

export function createSecureSession(userId: string, config: SecureSessionConfig = defaultConfig): string {
  const sessionData = {
    userId,
    timestamp: Date.now(),
    random: crypto.randomBytes(16).toString('hex')
  };
  
  const sessionString = JSON.stringify(sessionData);
  const signature = crypto
    .createHmac('sha256', config.sessionSecret)
    .update(sessionString)
    .digest('hex');
  
  return Buffer.from(`${sessionString}.${signature}`).toString('base64');
}

export function validateSecureSession(sessionToken: string, config: SecureSessionConfig = defaultConfig): { valid: boolean; userId?: string } {
  try {
    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
    const [sessionString, signature] = decoded.split('.');
    
    if (!sessionString || !signature) {
      return { valid: false };
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', config.sessionSecret)
      .update(sessionString)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return { valid: false };
    }
    
    const sessionData = JSON.parse(sessionString);
    const now = Date.now();
    const sessionAge = now - sessionData.timestamp;
    
    // Check if session is expired
    if (sessionAge > config.maxAge * 1000) {
      return { valid: false };
    }
    
    return { valid: true, userId: sessionData.userId };
  } catch (error) {
    return { valid: false };
  }
}

export function setSecureCookie(name: string, value: string, config: SecureSessionConfig = defaultConfig): void {
  const cookieStore = cookies();
  cookieStore.set(name, value, {
    maxAge: config.maxAge,
    httpOnly: config.httpOnly,
    secure: config.secure,
    sameSite: config.sameSite,
    path: '/'
  });
}

export function deleteSecureCookie(name: string): void {
  const cookieStore = cookies();
  cookieStore.delete(name);
}

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, expectedToken: string): boolean {
  return token === expectedToken && token.length === 64;
}

export function createSecureResponseWithSession(data: any, status: number = 200, sessionToken?: string): Response {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
  
  if (sessionToken) {
    response.headers.set('Set-Cookie', `admin-session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${defaultConfig.maxAge}; Path=/`);
  }
  
  return response;
}









