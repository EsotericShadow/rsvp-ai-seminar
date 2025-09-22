import type { LeadMineBusiness } from '@/lib/leadMine'

type BusinessListProps = {
  businesses: LeadMineBusiness[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  selectedIds: string[]
  existingMemberSet: Set<string>
  allExistingMemberIds?: Set<string>
  onToggleSelection: (id: string) => void
  onAddMember: (business: LeadMineBusiness) => void
  onLoadMore: () => void
}

export function BusinessList({
  businesses,
  isLoading,
  isLoadingMore,
  hasMore,
  selectedIds,
  existingMemberSet,
  allExistingMemberIds,
  onToggleSelection,
  onAddMember,
  onLoadMore,
}: BusinessListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-neutral-400">Loading businesses...</div>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400">
        No businesses found matching your criteria.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {businesses.map((business) => {
        const isSelected = selectedIds.includes(business.id)
        const isExistingMember = existingMemberSet.has(business.id)
        const isInOtherGroup = allExistingMemberIds?.has(business.id) && !isExistingMember
        
        return (
          <div
            key={business.id}
            className={`p-4 border rounded-lg ${
              isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-black/40'
            } ${isExistingMember ? 'opacity-50' : ''} ${isInOtherGroup ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isExistingMember || isInOtherGroup}
                  onChange={() => onToggleSelection(business.id)}
                  className="mt-1 rounded border-white/20 bg-black/60 text-emerald-500 focus:border-emerald-400 focus:ring-emerald-400"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-white">{business.name || 'Unnamed Business'}</h3>
                    {isExistingMember && (
                      <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-200 rounded border border-emerald-500/30">
                        Already Added
                      </span>
                    )}
                    {isInOtherGroup && (
                      <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-200 rounded border border-yellow-500/30">
                        In Another Group
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-neutral-300">
                    {business.contact.primaryEmail && (
                      <div>Email: {business.contact.primaryEmail}</div>
                    )}
                    {business.contact.contactPerson && (
                      <div>Contact: {business.contact.contactPerson}</div>
                    )}
                    {business.address && (
                      <div>Address: {business.address}</div>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {business.contact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-white/10 text-neutral-200 rounded border border-white/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {business.invite && (
                    <div className="mt-2 text-xs text-neutral-400">
                      Emails: {business.invite.emailsSent} | 
                      Visits: {business.invite.visitsCount} | 
                      RSVPs: {business.invite.rsvpsCount}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onAddMember(business)}
                  disabled={isExistingMember}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    isExistingMember
                      ? 'bg-white/10 text-neutral-400 cursor-not-allowed border border-white/20'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-500'
                  }`}
                >
                  {isExistingMember ? 'Added' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
      
      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-4 py-2 bg-secondary-700/50 text-white rounded-lg hover:bg-secondary-600/50 disabled:opacity-50 transition-colors border border-secondary-600/50"
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}
