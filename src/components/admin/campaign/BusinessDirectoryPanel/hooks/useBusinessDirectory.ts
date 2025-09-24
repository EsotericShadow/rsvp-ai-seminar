import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LeadMineBusiness } from '@/lib/leadMine'
import type { ApiPayload, ExplorerFilters, SortOption, FacetResponse } from '../types'
import { INITIAL_FACETS, DEFAULT_LIMIT } from '../types'

export function useBusinessDirectory(existingMemberIds: string[]) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ExplorerFilters>({
    hasWebsite: false,
    hasInviteActivity: false,
    statuses: [],
    tags: [],
  })
  const [sort, setSort] = useState<SortOption>('recent_activity')
  const [businesses, setBusinesses] = useState<LeadMineBusiness[]>([])
  const [facets, setFacets] = useState<FacetResponse>(INITIAL_FACETS)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<{ total: number; filtered: number } | null>(null)

  const existingMemberSet = useMemo(() => new Set(existingMemberIds), [existingMemberIds])

  // Debounce search input
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim())
    }, 300)
    return () => clearTimeout(handle)
  }, [searchInput])

  const fetchBusinesses = useCallback(
    async ({ reset = false, cursorOverride }: { reset?: boolean; cursorOverride?: string | null } = {}) => {
      const params = new URLSearchParams()
      params.set('limit', String(DEFAULT_LIMIT))
      if (search) params.set('q', search)

      const filterPayload: Partial<ExplorerFilters> = {}
      if (filters.hasWebsite) filterPayload.hasWebsite = true
      if (filters.hasInviteActivity) filterPayload.hasInviteActivity = true
      if (filters.statuses.length) filterPayload.statuses = filters.statuses
      if (filters.tags.length) filterPayload.tags = filters.tags
      if (Object.keys(filterPayload).length) params.set('filters', JSON.stringify(filterPayload))

      if (sort) params.set('sort', sort)

      const cursorToUse = reset ? null : cursorOverride ?? cursor
      if (cursorToUse) params.set('cursor', cursorToUse)

      setError(null)
      setIsLoading(reset)
      setIsLoadingMore(!reset && Boolean(cursorToUse))
      
      try {
        const res = await fetch(`/api/admin/campaign/businesses?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}))
          throw new Error(payload.error || 'Failed to load Lead Mine businesses')
        }
        const data: ApiPayload = await res.json()

        setFacets(data.facets ?? INITIAL_FACETS)
        const total = data.meta?.totalBusinesses ?? data.businesses.length
        const filteredTotal = data.meta?.totalAfterFilters ?? data.businesses.length
        setSummary({ total, filtered: filteredTotal })
        setHasMore(Boolean(data.pagination?.hasMore))
        setCursor(data.pagination?.nextCursor ?? null)

        if (reset) {
          setBusinesses(data.businesses)
        } else {
          setBusinesses((prev) => [...prev, ...data.businesses])
        }
      } catch (err: any) {
        setError(err?.message || 'Unable to load businesses right now')
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [cursor, filters.hasInviteActivity, filters.hasWebsite, filters.statuses, filters.tags, search, sort],
  )

  useEffect(() => {
    fetchBusinesses({ reset: true })
  }, [fetchBusinesses])

  return {
    searchInput,
    setSearchInput,
    search,
    filters,
    setFilters,
    sort,
    setSort,
    businesses,
    facets,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    summary,
    existingMemberSet,
    fetchBusinesses,
  }
}






