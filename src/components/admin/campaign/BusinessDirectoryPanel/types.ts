import type { LeadMineBusiness } from '@/lib/leadMine'

export type FacetOption = {
  value: string
  count: number
}

export type FacetResponse = {
  statuses: FacetOption[]
  tags: FacetOption[]
  websites: { withWebsite: number; withoutWebsite: number }
  inviteActivity: { withActivity: number; withoutActivity: number }
}

export type ExplorerFilters = {
  hasWebsite: boolean
  hasInviteActivity: boolean
  statuses: string[]
  tags: string[]
}

export type SortOption =
  | 'recent_activity'
  | 'name_asc'
  | 'name_desc'
  | 'emails_sent_desc'
  | 'visits_desc'
  | 'rsvps_desc'

export type ApiPayload = {
  businesses: LeadMineBusiness[]
  pagination: { limit: number; nextCursor: string | null; hasMore: boolean }
  facets: FacetResponse
  meta?: {
    totalBusinesses?: number
    totalAfterFilters?: number
  }
}

export type BusinessDirectoryPanelProps = {
  onAddMember: (business: LeadMineBusiness) => void
  onAddMany: (businesses: LeadMineBusiness[]) => void
  existingMemberIds: string[]
  allExistingMemberIds?: Set<string>
  existingGroups?: Array<{
    id: string
    name: string
    description: string | null
    members: Array<{ businessId: string }>
  }>
  onMemberMoved?: () => void
}

export const INITIAL_FACETS: FacetResponse = {
  statuses: [],
  tags: [],
  websites: { withWebsite: 0, withoutWebsite: 0 },
  inviteActivity: { withActivity: 0, withoutActivity: 0 },
}

export const DEFAULT_LIMIT = 200
