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
        <h2 className="text-lg font-semibold text-gray-900">Business Directory</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {selectedBusinesses.length} selected
          </span>
          <button
            onClick={handleAddSelected}
            disabled={!hasSelection}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                Select all visible businesses
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="text-red-800 text-sm">{error}</div>
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