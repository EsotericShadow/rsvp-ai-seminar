import { useState } from 'react'
import type { ExplorerFilters, FacetResponse, SortOption } from '../types'

type BusinessFiltersProps = {
  filters: ExplorerFilters
  setFilters: (filters: ExplorerFilters) => void
  sort: SortOption
  setSort: (sort: SortOption) => void
  facets: FacetResponse
  summary: { total: number; filtered: number } | null
}

export function BusinessFilters({ 
  filters, 
  setFilters, 
  sort, 
  setSort, 
  facets, 
  summary 
}: BusinessFiltersProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const updateFilter = (key: keyof ExplorerFilters, value: any) => {
    setFilters({ ...filters, [key]: value })
  }

  const toggleArrayFilter = (key: 'statuses' | 'tags', value: string) => {
    const current = filters[key]
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    updateFilter(key, newValue)
  }

  return (
    <div className="bg-black/40 rounded-lg border border-white/10">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div>
            <h3 className="text-sm font-medium text-white">Filters</h3>
            {summary && (
              <div className="text-xs text-neutral-400">
                {summary.filtered.toLocaleString()} of {summary.total.toLocaleString()} businesses
              </div>
            )}
          </div>
          <svg 
            className={`w-5 h-5 text-neutral-400 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block p-4 pb-0">
        <h3 className="text-sm font-medium text-white mb-2">Filters</h3>
        {summary && (
          <div className="text-sm text-neutral-300">
            Showing {summary.filtered.toLocaleString()} of {summary.total.toLocaleString()} businesses
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`space-y-4 p-4 ${isCollapsed ? 'hidden lg:block' : ''}`}>

      {/* Website Filter */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.hasWebsite}
            onChange={(e) => updateFilter('hasWebsite', e.target.checked)}
            className="rounded border-white/20 bg-black/60 text-emerald-500 focus:ring-emerald-500"
          />
          <span className="text-sm text-neutral-300">Has Website ({facets.websites.withWebsite})</span>
        </label>
      </div>

      {/* Invite Activity Filter */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.hasInviteActivity}
            onChange={(e) => updateFilter('hasInviteActivity', e.target.checked)}
            className="rounded border-white/20 bg-black/60 text-emerald-500 focus:ring-emerald-500"
          />
          <span className="text-sm text-neutral-300">Has Invite Activity ({facets.inviteActivity.withActivity})</span>
        </label>
      </div>

      {/* Status Filters */}
      {facets.statuses.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white mb-2">Status</h4>
          <div className="space-y-1">
            {facets.statuses.map((status) => (
              <label key={status.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.statuses.includes(status.value)}
                  onChange={() => toggleArrayFilter('statuses', status.value)}
                  className="rounded border-white/20 bg-black/60 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-neutral-300">
                  {status.value} ({status.count})
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Tag Filters */}
      {facets.tags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white mb-2">Tags</h4>
          <div className="space-y-1">
            {facets.tags.map((tag) => (
              <label key={tag.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.tags.includes(tag.value)}
                  onChange={() => toggleArrayFilter('tags', tag.value)}
                  className="rounded border-white/20 bg-black/60 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-neutral-300">
                  {tag.value} ({tag.count})
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div>
        <h4 className="text-sm font-medium text-white mb-2">Sort By</h4>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="w-full text-sm border border-white/20 bg-black/60 text-white rounded px-2 py-1 focus:border-emerald-400 focus:outline-none"
        >
          <option value="recent_activity">Recent Activity</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="emails_sent_desc">Most Emails Sent</option>
          <option value="visits_desc">Most Visits</option>
          <option value="rsvps_desc">Most RSVPs</option>
        </select>
      </div>
      </div>
    </div>
  )
}


