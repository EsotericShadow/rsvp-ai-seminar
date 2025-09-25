import { NextRequest, NextResponse } from 'next/server'
import { listGroups, createAudienceGroup } from '@/lib/campaigns'

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

export async function GET(req: NextRequest) {
  const authError = authenticateAIRequest(req)
  if (authError) return authError

  try {
    const groups = await listGroups()
    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Error listing audience groups:', error)
    return NextResponse.json({ error: 'Failed to list audience groups' }, { status: 500 })
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
    return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
  }

  try {
    const group = await createAudienceGroup({
      name: String(body.name),
      description: body.description ? String(body.description) : undefined,
    })

    return NextResponse.json({ group }, { status: 201 })
  } catch (error) {
    console.error('Error creating audience group:', error)
    return NextResponse.json({ error: 'Failed to create audience group' }, { status: 500 })
  }
}
