import { NextRequest, NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/adminSession'
import { deleteTemplate, listTemplates } from '@/lib/campaigns'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  const templates = await listTemplates()
  const template = templates.find((item) => item.id === params.id)
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  return NextResponse.json({ template })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  await deleteTemplate(params.id)
  return NextResponse.json({ ok: true })
}
