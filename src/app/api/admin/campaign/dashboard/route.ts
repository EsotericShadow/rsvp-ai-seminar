import { NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/adminSession'
import { listCampaignData } from '@/lib/campaigns'

export async function GET() {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  const data = await listCampaignData()
  return NextResponse.json(data)
}
