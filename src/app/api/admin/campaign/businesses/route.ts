import { NextRequest, NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/adminSession'
import { fetchLeadMineBusinesses, LeadMineBusiness } from '@/lib/leadMine'

const MIN_PAGE_SIZE = 200
const MAX_AGGREGATED_RECORDS = 1200
const MAX_EXTRA_PAGES = 6

type FilterPayload = {
  hasWebsite?: boolean
  hasInviteActivity?: boolean
  statuses?: string[]
  tags?: string[]
}

type FacetOption = {
  value: string
  count: number
}

type FacetResponse = {
  statuses: FacetOption[]
  tags: FacetOption[]
  websites: { withWebsite: number; withoutWebsite: number }
  inviteActivity: { withActivity: number; withoutActivity: number }
}

type SortKey = 'name_asc' | 'recent_activity' | 'emails_sent_desc'

function parseFilters(raw: string | null): FilterPayload {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      return parsed
    }
  } catch (error) {
    console.warn('Failed to parse business filters', error)
  }
  return {}
}

function buildFacets(list: LeadMineBusiness[]): FacetResponse {
  const statusCounts = new Map<string, number>()
  const tagCounts = new Map<string, number>()
  let withWebsite = 0
  let withoutWebsite = 0
  let withActivity = 0
  let withoutActivity = 0

  for (const biz of list) {
    if (biz.lead?.status) {
      statusCounts.set(biz.lead.status, (statusCounts.get(biz.lead.status) ?? 0) + 1)
    }

    const tags = biz.contact?.tags ?? []
    for (const tag of tags) {
      if (!tag) continue
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }

    if (biz.website) {
      withWebsite += 1
    } else {
      withoutWebsite += 1
    }

    const invite = biz.invite
    const hasActivity = Boolean(
      invite && ((invite.lastEmailSent && invite.emailsSent) || invite.visitsCount || invite.rsvpsCount),
    )
    if (hasActivity) {
      withActivity += 1
    } else {
      withoutActivity += 1
    }
  }

  const serialize = (input: Map<string, number>): FacetOption[] =>
    Array.from(input.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))

  return {
    statuses: serialize(statusCounts),
    tags: serialize(tagCounts),
    websites: { withWebsite, withoutWebsite },
    inviteActivity: { withActivity, withoutActivity },
  }
}

function filterBusinesses(list: LeadMineBusiness[], filters: FilterPayload): LeadMineBusiness[] {
  if (!filters || Object.keys(filters).length === 0) return list

  return list.filter((biz) => {
    if (filters.hasWebsite && !biz.website) return false

    if (filters.hasInviteActivity) {
      const invite = biz.invite
      const hasActivity = Boolean(
        invite && ((invite.lastEmailSent && invite.emailsSent) || invite.visitsCount || invite.rsvpsCount),
      )
      if (!hasActivity) return false
    }

    if (filters.statuses?.length) {
      const status = biz.lead?.status ?? null
      if (!status || !filters.statuses.includes(status)) return false
    }

    if (filters.tags?.length) {
      const tags = biz.contact?.tags ?? []
      const matchesTag = filters.tags.some((tag) => tags.includes(tag))
      if (!matchesTag) return false
    }

    return true
  })
}

function sortBusinesses(list: LeadMineBusiness[], sortKey: SortKey): LeadMineBusiness[] {
  if (sortKey === 'name_asc') {
    return [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }

  if (sortKey === 'emails_sent_desc') {
    return [...list].sort((a, b) => {
      const aEmails = a.invite?.emailsSent ?? 0
      const bEmails = b.invite?.emailsSent ?? 0
      return bEmails - aEmails || (a.name || '').localeCompare(b.name || '')
    })
  }

  // recent_activity
  return [...list].sort((a, b) => {
    const aInvite = a.invite
    const bInvite = b.invite
    const aTimes = [aInvite?.lastEmailSent, aInvite?.lastVisitedAt, aInvite?.lastRsvpAt]
      .map((value) => (value ? new Date(value).getTime() : 0))
    const bTimes = [bInvite?.lastEmailSent, bInvite?.lastVisitedAt, bInvite?.lastRsvpAt]
      .map((value) => (value ? new Date(value).getTime() : 0))

    const aLatest = Math.max(...aTimes)
    const bLatest = Math.max(...bTimes)

    if (bLatest === aLatest) {
      return (a.name || '').localeCompare(b.name || '')
    }
    return bLatest - aLatest
  })
}

export async function GET(request: NextRequest) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('q') || undefined
  const idsParam = searchParams.get('ids') || undefined
  const limitParam = searchParams.get('limit') ? Number(searchParams.get('limit')) : 25
  const pageSize = Number.isFinite(limitParam) ? Math.max(limitParam, MIN_PAGE_SIZE) : MIN_PAGE_SIZE
  const sortParam = (searchParams.get('sort') as SortKey | null) ?? 'recent_activity'
  const filtersParam = searchParams.get('filters')
  const filters = parseFilters(filtersParam)

  try {
    const initialResponse = await fetchLeadMineBusinesses({
      search,
      ids: idsParam ? idsParam.split(',').map((id) => id.trim()).filter(Boolean) : undefined,
      limit: pageSize,
      cursor: searchParams.get('cursor') || undefined,
      hasEmail: true,
      createMissing: true,
    })

    const aggregated = new Map<string, LeadMineBusiness>()
    const mergeBusinesses = (list: LeadMineBusiness[]) => {
      for (const biz of list) {
        aggregated.set(biz.id, biz)
      }
    }

    mergeBusinesses(initialResponse.data)

    let nextCursor = initialResponse.pagination.nextCursor || undefined
    let pagesFetched = 1

    while (nextCursor && aggregated.size < MAX_AGGREGATED_RECORDS && pagesFetched < MAX_EXTRA_PAGES) {
      const nextPage = await fetchLeadMineBusinesses({
        search,
        ids: idsParam ? idsParam.split(',').map((id) => id.trim()).filter(Boolean) : undefined,
        limit: pageSize,
        cursor: nextCursor,
        hasEmail: true,
        createMissing: false,
      })

      mergeBusinesses(nextPage.data)
      nextCursor = nextPage.pagination.nextCursor || undefined
      pagesFetched += 1
    }

    const aggregatedList = Array.from(aggregated.values())
    const facets = buildFacets(aggregatedList)
    const filtered = filterBusinesses(aggregatedList, filters)
    const sorted = sortBusinesses(filtered, sortParam)

    return NextResponse.json({
      businesses: sorted,
      pagination: {
        limit: sorted.length,
        nextCursor: null,
        hasMore: false,
      },
      facets,
      meta: {
        totalBusinesses: aggregatedList.length,
        totalAfterFilters: sorted.length,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'LeadMine request failed' }, { status: 502 })
  }
}
