import { NextRequest, NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/adminSession'
import { runSchedule } from '@/lib/campaigns'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  let body: any = {}
  try {
    body = await request.json()
  } catch (error) {
    // allow empty body
  }

  const previewOnly = Boolean(body?.previewOnly)
  const limit = body?.limit ? Number(body.limit) : undefined

  const result = await runSchedule(params.id, { previewOnly, limit })
  return NextResponse.json({ result })
}
