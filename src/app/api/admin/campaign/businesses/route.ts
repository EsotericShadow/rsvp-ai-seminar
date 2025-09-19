import { NextRequest, NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/adminSession'
import { fetchLeadMineBusinesses } from '@/lib/leadMine'

export async function GET(request: NextRequest) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('q') || undefined
  const idsParam = searchParams.get('ids') || undefined
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 25
  const cursor = searchParams.get('cursor') || undefined

  try {
    const response = await fetchLeadMineBusinesses({
      search,
      ids: idsParam ? idsParam.split(',').map((id) => id.trim()).filter(Boolean) : undefined,
      limit,
      cursor,
      hasEmail: true,
      createMissing: true,
    })

    return NextResponse.json({ businesses: response.data, pagination: response.pagination })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'LeadMine request failed' }, { status: 502 })
  }
}
