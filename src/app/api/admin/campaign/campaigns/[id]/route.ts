import { NextRequest, NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/adminSession'
import { deleteCampaign, getCampaign } from '@/lib/campaigns'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  const campaign = await getCampaign(params.id)
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  return NextResponse.json({ campaign })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  const { searchParams } = new URL(request.url)
  const keepSchedules = searchParams.get('keepSchedules') === '1'

  await deleteCampaign(params.id, { deleteSchedules: !keepSchedules })
  return NextResponse.json({ ok: true })
}
