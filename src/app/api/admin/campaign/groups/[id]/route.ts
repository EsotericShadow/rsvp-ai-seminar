import { NextRequest, NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/adminSession'
import { deleteAudienceGroup, listGroups } from '@/lib/campaigns'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  const groups = await listGroups()
  const group = groups.find((item) => item.id === params.id)
  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  return NextResponse.json({ group })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  await deleteAudienceGroup(params.id)
  return NextResponse.json({ ok: true })
}
