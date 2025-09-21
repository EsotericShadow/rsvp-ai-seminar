import type { LeadMineBusiness } from '@/lib/leadMine'

type BusinessListProps = {
  businesses: LeadMineBusiness[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  selectedIds: string[]
  existingMemberSet: Set<string>
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
  onToggleSelection,
  onAddMember,
  onLoadMore,
}: BusinessListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading businesses...</div>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No businesses found matching your criteria.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {businesses.map((business) => {
        const isSelected = selectedIds.includes(business.id)
        const isExistingMember = existingMemberSet.has(business.id)
        
        return (
          <div
            key={business.id}
            className={`p-4 border rounded-lg ${
              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            } ${isExistingMember ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isExistingMember}
                  onChange={() => onToggleSelection(business.id)}
                  className="mt-1 rounded border-gray-300"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{business.name || 'Unnamed Business'}</h3>
                    {isExistingMember && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Already Added
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
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
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {business.invite && (
                    <div className="mt-2 text-xs text-gray-500">
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
                  className={`px-3 py-1 text-sm rounded ${
                    isExistingMember
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
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
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}
