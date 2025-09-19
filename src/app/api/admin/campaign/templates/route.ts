import { NextRequest, NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/adminSession'
import { createTemplate, listTemplates, updateTemplate } from '@/lib/campaigns'

export async function GET() {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  const templates = await listTemplates()
  return NextResponse.json({ templates })
}

export async function POST(request: NextRequest) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  let body: any
  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body?.name || !body?.subject || !body?.htmlBody) {
    return NextResponse.json({ error: 'name, subject, and htmlBody are required' }, { status: 400 })
  }

  const template = await createTemplate({
    name: String(body.name),
    subject: String(body.subject),
    htmlBody: String(body.htmlBody),
    textBody: body.textBody ? String(body.textBody) : null,
  })

  return NextResponse.json({ template }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  let body: any
  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body?.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const template = await updateTemplate(String(body.id), {
    name: body.name !== undefined ? String(body.name) : undefined,
    subject: body.subject !== undefined ? String(body.subject) : undefined,
    htmlBody: body.htmlBody !== undefined ? String(body.htmlBody) : undefined,
    textBody: body.textBody !== undefined ? (body.textBody ? String(body.textBody) : null) : undefined,
  })

  return NextResponse.json({ template })
}
