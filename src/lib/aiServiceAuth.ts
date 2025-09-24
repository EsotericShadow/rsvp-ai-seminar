import { NextRequest, NextResponse } from 'next/server'

/**
 * Authenticates requests from the AI service using X-AI-API-Key header
 */
export function authenticateAIRequest(request: NextRequest): NextResponse | null {
  const aiApiKey = request.headers.get('X-AI-API-Key')
  const expectedApiKey = process.env.AI_SERVICE_API_KEY
  
  if (!expectedApiKey) {
    console.error('AI_SERVICE_API_KEY environment variable not set')
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
  }
  
  if (!aiApiKey || aiApiKey !== expectedApiKey) {
    console.warn('Unauthorized AI service request from:', request.headers.get('x-forwarded-for') || 'unknown')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return null // Authentication successful
}

/**
 * Legacy function name for backward compatibility
 */
export function requireAIServiceKey() {
  // This is a placeholder - in practice, this would be used in middleware
  // For now, we'll use authenticateAIRequest in the route handlers
  return { response: null }
}
