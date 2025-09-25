import { NextRequest, NextResponse } from 'next/server'
import { createCampaign, listCampaigns } from '@/lib/campaigns'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Internal API for AI service - requires AI service API key
function authenticateAIRequest(req: NextRequest) {
  const aiApiKey = process.env.AI_SERVICE_API_KEY
  if (!aiApiKey) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
  }

  const providedKey = req.headers.get('X-AI-API-Key') || req.headers.get('x-ai-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')
  if (!providedKey || providedKey !== aiApiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}

function parseSteps(rawSteps: unknown, allowPartial = false) {
  if (!rawSteps) return []
  if (!Array.isArray(rawSteps)) throw new Error('Steps must be an array')
  
  return rawSteps.map((step: any, index: number) => {
    if (!step || typeof step !== 'object') {
      throw new Error(`Step ${index} must be an object`)
    }
    
    if (!step.type) {
      throw new Error(`Step ${index} missing required field: type`)
    }
    
    if (!allowPartial && step.type === 'email' && !step.templateId) {
      throw new Error(`Step ${index} missing required field: templateId`)
    }
    
    return {
      type: String(step.type),
      templateId: step.templateId ? String(step.templateId) : undefined,
      delay: step.delay ? Number(step.delay) : undefined,
      order: step.order ? Number(step.order) : undefined,
    }
  })
}

export async function GET(req: NextRequest) {
  const authError = authenticateAIRequest(req)
  if (authError) return authError

  try {
    const campaigns = await listCampaigns()
    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Error listing campaigns:', error)
    return NextResponse.json({ error: 'Failed to list campaigns' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authError = authenticateAIRequest(req)
  if (authError) return authError

  let body: any
  try {
    body = await req.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body?.name) {
    return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 })
  }

  let steps
  try {
    steps = parseSteps(body.steps)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Invalid steps payload' }, { status: 400 })
  }

  try {
    const campaign = await createCampaign({
      name: String(body.name),
      description: body.description ? String(body.description) : undefined,
      status: body.status ? (String(body.status) as any) : undefined,
      steps,
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}
