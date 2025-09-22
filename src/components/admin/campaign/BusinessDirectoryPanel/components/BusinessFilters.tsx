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
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      {/* Summary */}
      {summary && (
        <div className="text-sm text-gray-600">
          Showing {summary.filtered.toLocaleString()} of {summary.total.toLocaleString()} businesses
        </div>
      )}

      {/* Website Filter */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.hasWebsite}
            onChange={(e) => updateFilter('hasWebsite', e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Has Website ({facets.websites.withWebsite})</span>
        </label>
      </div>

      {/* Invite Activity Filter */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.hasInviteActivity}
            onChange={(e) => updateFilter('hasInviteActivity', e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Has Invite Activity ({facets.inviteActivity.withActivity})</span>
        </label>
      </div>

      {/* Status Filters */}
      {facets.statuses.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
          <div className="space-y-1">
            {facets.statuses.map((status) => (
              <label key={status.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.statuses.includes(status.value)}
                  onChange={() => toggleArrayFilter('statuses', status.value)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">
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
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
          <div className="space-y-1">
            {facets.tags.map((tag) => (
              <label key={tag.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.tags.includes(tag.value)}
                  onChange={() => toggleArrayFilter('tags', tag.value)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">
                  {tag.value} ({tag.count})
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Sort By</h4>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
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
  )
}

