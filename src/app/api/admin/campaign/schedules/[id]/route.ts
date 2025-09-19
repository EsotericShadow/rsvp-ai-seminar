import { NextRequest, NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/adminSession'
import { deleteSchedule, getSchedule } from '@/lib/campaigns'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  const schedule = await getSchedule(params.id)
  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
  }

  return NextResponse.json({ schedule })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  await deleteSchedule(params.id)
  return NextResponse.json({ ok: true })
}
