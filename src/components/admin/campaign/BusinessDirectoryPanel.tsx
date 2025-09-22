'use client'

import { useState } from 'react'
import { BusinessFilters } from './BusinessDirectoryPanel/components/BusinessFilters'
import { BusinessList } from './BusinessDirectoryPanel/components/BusinessList'
import { useBusinessDirectory } from './BusinessDirectoryPanel/hooks/useBusinessDirectory'
import { useSelection } from './BusinessDirectoryPanel/hooks/useSelection'
import type { BusinessDirectoryPanelProps } from './BusinessDirectoryPanel/types'

export function BusinessDirectoryPanel({ 
  onAddMember, 
  onAddMany, 
  existingMemberIds, 
  allExistingMemberIds,
  existingGroups = [],
  onMemberMoved
}: BusinessDirectoryPanelProps) {
  const [showUngroupedOnly, setShowUngroupedOnly] = useState(false)
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

  // Filter businesses based on ungrouped filter
  const filteredBusinesses = showUngroupedOnly 
    ? businesses.filter(business => !allExistingMemberIds?.has(business.id))
    : businesses

  // Calculate statistics
  const totalBusinesses = businesses.length
  const ungroupedCount = businesses.filter(business => !allExistingMemberIds?.has(business.id)).length
  const groupedCount = totalBusinesses - ungroupedCount
  const selectedUngroupedCount = selectedBusinesses.filter(business => !allExistingMemberIds?.has(business.id)).length

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Business Directory</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-300">
              {selectedBusinesses.length} selected
            </span>
            <button
              onClick={handleAddSelected}
              disabled={!hasSelection}
              className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Selected ({selectedBusinesses.length})
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
            <div className="text-sm text-neutral-400">Total Businesses</div>
            <div className="text-lg font-semibold text-white">{totalBusinesses}</div>
          </div>
          <div className="bg-warning-500/10 rounded-lg p-3 border border-warning-500/20">
            <div className="text-sm text-warning-300">Ungrouped</div>
            <div className="text-lg font-semibold text-warning-200">{ungroupedCount}</div>
          </div>
          <div className="bg-success-500/10 rounded-lg p-3 border border-success-500/20">
            <div className="text-sm text-success-300">In Groups</div>
            <div className="text-lg font-semibold text-success-200">{groupedCount}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 bg-black/60 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-primary-400 focus:ring-primary-400"
            />
          </div>
          <button
            onClick={() => setShowUngroupedOnly(!showUngroupedOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showUngroupedOnly
                ? 'bg-warning-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            {showUngroupedOnly ? 'Show All' : `Show Ungrouped (${ungroupedCount})`}
          </button>
        </div>

        {/* Quick Actions */}
        {showUngroupedOnly && ungroupedCount > 0 && (
          <div className="bg-warning-500/10 border border-warning-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-warning-200">
                  {ungroupedCount} businesses are not in any group
                </h3>
                <p className="text-xs text-warning-300 mt-1">
                  Consider adding them to groups for better organization
                </p>
              </div>
              <button
                onClick={() => {
                  const ungroupedBusinesses = businesses.filter(business => !allExistingMemberIds?.has(business.id))
                  onAddMany(ungroupedBusinesses)
                }}
                className="px-3 py-1 bg-warning-600 text-white text-sm rounded-lg hover:bg-warning-700 transition-colors"
              >
                Add All Ungrouped
              </button>
            </div>
          </div>
        )}
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
            businesses={filteredBusinesses}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            selectedIds={selectedIds}
            existingMemberSet={existingMemberSet}
            allExistingMemberIds={allExistingMemberIds}
            onToggleSelection={toggleSelection}
            onAddMember={onAddMember}
            onLoadMore={handleLoadMore}
            showUngroupedOnly={showUngroupedOnly}
            existingGroups={existingGroups}
            onMemberMoved={onMemberMoved}
          />
        </div>
      </div>
    </div>
  )
}