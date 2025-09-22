'use client'

import { BusinessFilters } from './BusinessDirectoryPanel/components/BusinessFilters'
import { BusinessList } from './BusinessDirectoryPanel/components/BusinessList'
import { useBusinessDirectory } from './BusinessDirectoryPanel/hooks/useBusinessDirectory'
import { useSelection } from './BusinessDirectoryPanel/hooks/useSelection'
import type { BusinessDirectoryPanelProps } from './BusinessDirectoryPanel/types'

export function BusinessDirectoryPanel({ onAddMember, onAddMany, existingMemberIds }: BusinessDirectoryPanelProps) {
  const {
    searchInput,
    setSearchInput,
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
  } = useBusinessDirectory(existingMemberIds)

  const {
    selectedIds,
    selectAllResults,
    toggleSelection,
    toggleSelectAll,
    selectedBusinesses,
    isAllSelected,
    hasSelection,
  } = useSelection(businesses, existingMemberSet)

  const handleAddSelected = () => {
    if (selectedBusinesses.length > 0) {
      onAddMany(selectedBusinesses)
    }
  }

  const handleLoadMore = () => {
    fetchBusinesses({ reset: false })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Business Directory</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-300">
            {selectedBusinesses.length} selected
          </span>
          <button
            onClick={handleAddSelected}
            disabled={!hasSelection}
            className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Selected ({selectedBusinesses.length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search businesses..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full px-3 py-2 border border-white/10 bg-black/60 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-emerald-400 focus:ring-emerald-400"
        />
      </div>

      {/* Filters and Business List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <BusinessFilters
            filters={filters}
            setFilters={setFilters}
            sort={sort}
            setSort={setSort}
            facets={facets}
            summary={summary}
          />
        </div>

        {/* Business List */}
        <div className="lg:col-span-3">
          {/* Select All */}
          {businesses.length > 0 && (
            <div className="mb-4 flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="rounded border-white/20 bg-black/60 text-emerald-500 focus:border-emerald-400 focus:ring-emerald-400"
              />
              <span className="text-sm text-neutral-300">
                Select all visible businesses
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-4 mb-4">
              <div className="text-red-200 text-sm">{error}</div>
            </div>
          )}

          {/* Business List */}
          <BusinessList
            businesses={businesses}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            selectedIds={selectedIds}
            existingMemberSet={existingMemberSet}
            onToggleSelection={toggleSelection}
            onAddMember={onAddMember}
            onLoadMore={handleLoadMore}
          />
        </div>
      </div>
    </div>
  )
}