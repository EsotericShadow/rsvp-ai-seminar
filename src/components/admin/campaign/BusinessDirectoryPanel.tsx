'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LeadMineBusiness } from '@/lib/leadMine'

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

type ExplorerFilters = {
  hasWebsite: boolean
  hasInviteActivity: boolean
  statuses: string[]
  tags: string[]
}

type SortOption =
  | 'recent_activity'
  | 'name_asc'
  | 'name_desc'
  | 'emails_sent_desc'
  | 'visits_desc'
  | 'rsvps_desc'

type ApiPayload = {
  businesses: LeadMineBusiness[]
  pagination: { limit: number; nextCursor: string | null; hasMore: boolean }
  facets: FacetResponse
  meta?: {
    totalBusinesses?: number
    totalAfterFilters?: number
  }
}

const INITIAL_FACETS: FacetResponse = {
  statuses: [],
  tags: [],
  websites: { withWebsite: 0, withoutWebsite: 0 },
  inviteActivity: { withActivity: 0, withoutActivity: 0 },
}

const DEFAULT_LIMIT = 200

function formatDate(input?: string | null) {
  if (!input) return '—'
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function latestActivity(invite: LeadMineBusiness['invite']) {
  if (!invite) return null
  const stamps = [invite.lastEmailSent, invite.lastVisitedAt, invite.lastRsvpAt]
    .filter(Boolean)
    .map((value) => new Date(value as string).getTime())
    .filter((value) => Number.isFinite(value))

  if (stamps.length === 0) return null
  return new Date(Math.max(...stamps)).toISOString()
}

type BusinessDirectoryPanelProps = {
  onAddMember: (business: LeadMineBusiness) => void
  onAddMany: (businesses: LeadMineBusiness[]) => void
  existingMemberIds: string[]
}

export function BusinessDirectoryPanel({ onAddMember, onAddMany, existingMemberIds }: BusinessDirectoryPanelProps) {
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
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [summary, setSummary] = useState<{ total: number; filtered: number } | null>(null)
  const [selectAllResults, setSelectAllResults] = useState(false)

  const existingMemberSet = useMemo(() => new Set(existingMemberIds), [existingMemberIds])

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim())
    }, 300)
    return () => clearTimeout(handle)
  }, [searchInput])

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => !existingMemberSet.has(id)))
  }, [existingMemberSet])

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
          setSelectedIds([])
          setSelectAllResults(false)
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

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((value) => value !== id)
        if (!next.length) setSelectAllResults(false)
        return next
      }
      return [...prev, id]
    })
  }

  const selectableBusinessIds = useMemo(
    () => businesses.filter((biz) => !existingMemberSet.has(biz.id)).map((biz) => biz.id),
    [businesses, existingMemberSet],
  )

  const handleAddSelected = () => {
    if (!selectedIds.length) return
    const candidates = businesses.filter((biz) => selectedIds.includes(biz.id) && !existingMemberSet.has(biz.id))
    if (!candidates.length) {
      setSelectedIds([])
      setSelectAllResults(false)
      return
    }
    onAddMany(candidates)
    setSelectedIds([])
    setSelectAllResults(false)
  }

  const handleSelectVisible = () => {
    if (!selectableBusinessIds.length) return
    setSelectedIds(selectableBusinessIds)
    setSelectAllResults(false)
  }

  const handleSelectAll = () => {
    if (!selectableBusinessIds.length) return
    setSelectedIds(selectableBusinessIds)
    setSelectAllResults(true)
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.hasWebsite) count += 1
    if (filters.hasInviteActivity) count += 1
    count += filters.statuses.length
    count += filters.tags.length
    return count
  }, [filters])

  const clearFilters = () => {
    setFilters({ hasWebsite: false, hasInviteActivity: false, statuses: [], tags: [] })
  }

  const handleStatusChange = (value: string) => {
    setFilters((prev) => {
      const newStatuses = prev.statuses.includes(value)
        ? prev.statuses.filter((s) => s !== value)
        : [...prev.statuses, value]
      return { ...prev, statuses: newStatuses }
    })
  }

  const handleTagChange = (value: string) => {
    setFilters((prev) => {
      const newTags = prev.tags.includes(value) ? prev.tags.filter((t) => t !== value) : [...prev.tags, value]
      return { ...prev, tags: newTags }
    })
  }

  const isBusy = isLoading || isLoadingMore

  return (
    <section className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-4">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold text-white">Lead Mine directory</h3>
          <p className="text-sm text-neutral-400">
            Browse verified licence holders, filter by attributes, and add them to your audience. Start with the most recent invite activity or refine using tags and statuses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddSelected}
            disabled={!selectedIds.length}
            className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add selected ({selectedIds.length})
          </button>
          <button
            onClick={handleSelectVisible}
            disabled={!selectableBusinessIds.length}
            className="rounded-full border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Select all visible
          </button>
          <button
            onClick={handleSelectAll}
            disabled={!selectableBusinessIds.length}
            className="rounded-full border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Select all results
          </button>
          <button
            onClick={() => {
              setSelectedIds([])
              setSelectAllResults(false)
            }}
            disabled={!selectedIds.length}
            className="rounded-full border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear selection
          </button>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),220px]">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by business, contact, or tag"
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
            {isBusy ? (
              <span className="absolute inset-y-0 right-3 flex items-center text-xs text-neutral-500">Loading…</span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, hasWebsite: !prev.hasWebsite }))}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                filters.hasWebsite ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200' : 'border-white/10 text-neutral-300 hover:border-white/30'
              }`}
            >
              Has website ({facets.websites.withWebsite})
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, hasInviteActivity: !prev.hasInviteActivity }))}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                filters.hasInviteActivity
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                  : 'border-white/10 text-neutral-300 hover:border-white/30'
              }`}
            >
              Recent invite activity ({facets.inviteActivity.withActivity})
            </button>
            {activeFilterCount > 0 ? (
              <button
                onClick={clearFilters}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300 hover:border-white/30"
              >
                Clear filters ({activeFilterCount})
              </button>
            ) : null}
            {summary ? (
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-400">
                Showing {businesses.length} of {summary.filtered} matches ({summary.total} total)
              </span>
            ) : null}
          </div>
        </div>
        <div className="grid gap-2 text-xs text-neutral-200">
          <div className="space-y-1">
            <span className="text-neutral-400">Lead status</span>
            <div className="-mx-1 flex flex-wrap gap-1.5">
              {facets.statuses.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`rounded-full border px-2 py-0.5 text-[11px] transition ${
                    filters.statuses.includes(option.value)
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                      : 'border-white/10 text-neutral-300 hover:border-white/30'
                  }`}
                >
                  {option.value} ({option.count})
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-400">Tag</span>
            <div className="-mx-1 flex flex-wrap gap-1.5">
              {facets.tags.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTagChange(option.value)}
                  className={`rounded-full border px-2 py-0.5 text-[11px] transition ${
                    filters.tags.includes(option.value)
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                      : 'border-white/10 text-neutral-300 hover:border-white/30'
                  }`}
                >
                  {option.value} ({option.count})
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-400">Sort by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="rounded-md border border-white/10 bg-black/60 px-2 py-1 text-white focus:border-emerald-400 focus:outline-none"
            >
              <option value="recent_activity">Most recent activity</option>
              <option value="name_asc">Name (A–Z)</option>
              <option value="name_desc">Name (Z–A)</option>
              <option value="emails_sent_desc">Emails sent (high → low)</option>
              <option value="visits_desc">Visits (high → low)</option>
              <option value="rsvps_desc">RSVPs (high → low)</option>
            </select>
          </label>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-white/10">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[960px] divide-y divide-white/10 text-sm text-neutral-200">
          <thead className="bg-white/5 text-xs uppercase text-neutral-400">
            <tr>
              <th className="px-3 py-2 text-left">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-400"
                    checked={selectAllResults && selectedIds.length > 0}
                    onChange={(event) => {
                      const checked = event.target.checked
                      if (checked) {
                        const eligible = businesses
                          .filter((biz) => !existingMemberSet.has(biz.id))
                          .map((biz) => biz.id)
                        setSelectedIds(eligible)
                        setSelectAllResults(true)
                      } else {
                        setSelectedIds([])
                        setSelectAllResults(false)
                      }
                    }}
                  />
                  <span>Select</span>
                </div>
              </th>
              <th className="px-3 py-2 text-left">Business</th>
              <th className="px-3 py-2 text-left">Contact</th>
              <th className="px-3 py-2 text-left">Status & Tags</th>
              <th className="px-3 py-2 text-left">Invite activity</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-black/30">
            {businesses.map((biz) => {
              const alreadyMember = existingMemberSet.has(biz.id)
              const selected = selectedIds.includes(biz.id)
              const invite = biz.invite
              const lastActivity = latestActivity(invite)
              return (
                <tr key={biz.id} className={alreadyMember ? 'opacity-60' : ''}>
                  <td className="px-3 py-3 align-top">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-400"
                      checked={selected}
                      disabled={alreadyMember}
                      onChange={() => toggleSelection(biz.id)}
                    />
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="font-medium text-white">{biz.name ?? 'Unknown business'}</div>
                    {biz.website ? (
                      <a
                        href={biz.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-300 hover:text-emerald-200"
                      >
                        {biz.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <p className="text-xs text-neutral-500">No website on file</p>
                    )}
                    {biz.address ? <p className="text-xs text-neutral-500">{biz.address}</p> : null}
                  </td>
                  <td className="px-3 py-3 align-top text-xs">
                    <p className="text-white">{biz.contact.primaryEmail || biz.contact.alternateEmail || 'No email'}</p>
                    {biz.contact.alternateEmail ? (
                      <p className="text-neutral-500">Alt: {biz.contact.alternateEmail}</p>
                    ) : null}
                    {biz.contact.contactPerson ? (
                      <p className="text-neutral-500">Contact: {biz.contact.contactPerson}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 align-top text-xs">
                    <div>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] uppercase tracking-wide text-neutral-300">
                        {biz.lead?.status ?? 'UNASSIGNED'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(biz.contact.tags ?? []).slice(0, 4).map((tag) => (
                        <span key={tag} className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-neutral-300">
                          {tag}
                        </span>
                      ))}
                      {(biz.contact.tags?.length ?? 0) > 4 ? (
                        <span className="text-[11px] text-neutral-500">+{(biz.contact.tags?.length ?? 0) - 4} more</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top text-xs">
                    {invite ? (
                      <div className="space-y-1">
                        <p className="text-neutral-300">Emails sent: {invite.emailsSent}</p>
                        <p className="text-neutral-300">Visits: {invite.visitsCount}</p>
                        <p className="text-neutral-300">RSVPs: {invite.rsvpsCount}</p>
                        <p className="text-neutral-500">Last touch: {formatDate(lastActivity)}</p>
                      </div>
                    ) : (
                      <p className="text-neutral-500">No invite activity yet</p>
                    )}
                  </td>
                  <td className="px-3 py-3 align-top text-xs">
                    <button
                      onClick={() => onAddMember(biz)}
                      disabled={alreadyMember}
                      className="rounded-full border border-emerald-400 px-3 py-1 text-xs text-emerald-200 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-neutral-500"
                    >
                      {alreadyMember ? 'Added' : 'Add to group'}
                    </button>
                  </td>
                </tr>
              )
            })}
            {!businesses.length && !isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-neutral-400">
                  No businesses found. Try adjusting filters or search terms.
                </td>
              </tr>
            ) : null}
          </tbody>
          </table>
        </div>
      </div>

      {hasMore ? (
        <div className="text-center">
          <button
            onClick={() => fetchBusinesses({ cursorOverride: cursor })}
            disabled={isLoadingMore}
            className="rounded-full bg-white/10 px-4 py-2 text-sm text-neutral-200 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      ) : null}
    </section>
  )
}
