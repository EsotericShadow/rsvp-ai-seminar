import { NextRequest, NextResponse } from 'next/server'
import { createTemplate, listTemplates } from '@/lib/campaigns'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Internal API for AI service - requires AI service API key
function authenticateAIRequest(req: NextRequest) {
  const aiApiKey = process.env.AI_SERVICE_API_KEY
  if (!aiApiKey) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
  }

  const providedKey = req.headers.get('x-ai-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')
  if (!providedKey || providedKey !== aiApiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}

export async function GET(req: NextRequest) {
  const authError = authenticateAIRequest(req)
  if (authError) return authError

  try {
    const templates = await listTemplates()
    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error listing templates:', error)
    return NextResponse.json({ error: 'Failed to list templates' }, { status: 500 })
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

  if (!body?.name || !body?.subject || !body?.htmlBody) {
    return NextResponse.json({ error: 'name, subject, and htmlBody are required' }, { status: 400 })
  }

  try {
    const template = await createTemplate({
      name: String(body.name),
      subject: String(body.subject),
      htmlBody: String(body.htmlBody),
      textBody: body.textBody ? String(body.textBody) : null,
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
