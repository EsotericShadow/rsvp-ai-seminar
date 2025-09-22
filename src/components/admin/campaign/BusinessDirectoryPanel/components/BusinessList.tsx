import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LeadMineBusiness } from '@/lib/leadMine'
import { SplitButton } from '../../SplitButton'

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
  showUngroupedOnly?: boolean
  existingGroups?: Array<{
    id: string
    name: string
    description: string | null
    members: Array<{ businessId: string }>
    color: string | null
  }>
  onMemberMoved?: () => void
  currentGroupId?: string
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
  showUngroupedOnly = false,
  existingGroups = [],
  onMemberMoved,
  currentGroupId,
}: BusinessListProps) {
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
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
        {showUngroupedOnly 
          ? 'All businesses are already in groups!' 
          : 'No businesses found matching your criteria.'
        }
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* List Header */}
      {showUngroupedOnly && (
        <div className="bg-warning-500/10 border border-warning-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-warning-400">⚠️</span>
            <span className="text-sm font-medium text-warning-200">
              Showing {businesses.length} ungrouped businesses
            </span>
          </div>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {businesses
          .filter(business => !removingIds.has(business.id))
          .map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              isSelected={selectedIds.includes(business.id)}
              isExistingMember={existingMemberSet.has(business.id)}
              isInOtherGroup={Boolean(allExistingMemberIds?.has(business.id) && !existingMemberSet.has(business.id) && currentGroupId)}
              isUngrouped={Boolean(!allExistingMemberIds?.has(business.id))}
              showUngroupedOnly={showUngroupedOnly}
              onToggleSelection={onToggleSelection}
              onAddMember={onAddMember}
              existingGroups={existingGroups}
              onMemberMoved={onMemberMoved}
              currentGroupId={currentGroupId}
              isRemoving={removingIds.has(business.id)}
              onStartRemoving={(id) => {
                setRemovingIds(prev => {
                  const newSet = new Set(prev)
                  if (newSet.has(id)) {
                    newSet.delete(id)
                  } else {
                    newSet.add(id)
                  }
                  return newSet
                })
              }}
            />
          ))}
      </AnimatePresence>
      
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

function BusinessCard({
  business,
  isSelected,
  isExistingMember,
  isInOtherGroup,
  isUngrouped,
  showUngroupedOnly,
  onToggleSelection,
  onAddMember,
  existingGroups,
  onMemberMoved,
  currentGroupId,
  isRemoving,
  onStartRemoving,
}: {
  business: LeadMineBusiness
  isSelected: boolean
  isExistingMember: boolean
  isInOtherGroup: boolean
  isUngrouped: boolean
  showUngroupedOnly: boolean
  onToggleSelection: (id: string) => void
  onAddMember: (business: LeadMineBusiness) => void
  existingGroups: Array<{
    id: string
    name: string
    description: string | null
    members: Array<{ businessId: string }>
    color: string | null
  }>
  onMemberMoved?: () => void
  currentGroupId?: string
  isRemoving: boolean
  onStartRemoving: (id: string) => void
}) {
  const [isMoving, setIsMoving] = useState(false)
  const [showMoveDropdown, setShowMoveDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter out groups that already have this business
  const availableGroups = existingGroups.filter(group => {
    return !group.members.some(m => m.businessId === business.id)
  })

  // Find which group this business belongs to (if any)
  const currentGroup = existingGroups.find(group => 
    group.members.some(m => m.businessId === business.id)
  )

  const handleMoveToGroup = async (groupId: string) => {
    if (!onMemberMoved) return
    
    setIsMoving(true)
    setShowMoveDropdown(false)
    
    // Start the removal animation
    onStartRemoving(business.id)
    
    try {
      const response = await fetch('/api/admin/campaign/members/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: business.id,
          targetGroupId: groupId
        })
      })
      
      if (response.ok) {
        // Wait for animation to complete before refreshing
        setTimeout(() => {
          onMemberMoved()
        }, 300)
      } else {
        const error = await response.json()
        console.error('Error moving member:', error.error)
        // Reset removing state on error
        onStartRemoving(business.id)
      }
    } catch (error) {
      console.error('Error moving member:', error)
      // Reset removing state on error
      onStartRemoving(business.id)
    } finally {
      setIsMoving(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMoveDropdown(false)
      }
    }

    if (showMoveDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMoveDropdown])


  return (
    <motion.div
      layout
      initial={{ opacity: 1, scale: 1, y: 0 }}
      animate={isRemoving ? 
        { 
          opacity: 0, 
          scale: 0.8, 
          y: -20,
          transition: { duration: 0.3, ease: "easeInOut" }
        } : 
        { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          transition: { duration: 0.3, ease: "easeInOut" }
        }
      }
      exit={{ 
        opacity: 0, 
        scale: 0.8, 
        y: -20,
        transition: { duration: 0.3, ease: "easeInOut" }
      }}
      className={`p-4 border rounded-lg transition-all duration-200 ${
        isSelected ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 bg-black/40'
      } ${isExistingMember ? 'opacity-50' : ''} ${isInOtherGroup ? 'border-warning-500/50 bg-warning-500/5' : ''} ${
        isUngrouped && showUngroupedOnly ? 'border-warning-400/30 bg-warning-500/5' : ''
      } ${isRemoving ? 'pointer-events-none' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            disabled={isExistingMember || isInOtherGroup}
            onChange={() => onToggleSelection(business.id)}
            className="mt-1 rounded border-white/20 bg-black/60 text-primary-500 focus:border-primary-400 focus:ring-primary-400 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {currentGroup && (
                <div 
                  className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                  style={{ backgroundColor: (currentGroup as any).color || '#10b981' }}
                  title={`In group: ${currentGroup.name}`}
                />
              )}
              <h3 className="font-medium text-white">{business.name || 'Unnamed Business'}</h3>
              {isExistingMember && (
                <span className="px-2 py-1 text-xs bg-primary-500/20 text-primary-200 rounded border border-primary-500/30">
                  Already Added
                </span>
              )}
              {isInOtherGroup && (
                <span className="px-2 py-1 text-xs bg-warning-500/20 text-warning-200 rounded border border-warning-500/30">
                  In Another Group
                </span>
              )}
              {isUngrouped && showUngroupedOnly && (
                <span className="px-2 py-1 text-xs bg-warning-600/20 text-warning-100 rounded border border-warning-500/40">
                  Not in Any Group
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
        <div className="business-card-actions">
          {/* Move to Dropdown - only show if business is in another group */}
          {isInOtherGroup && availableGroups.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowMoveDropdown(!showMoveDropdown)}
                disabled={isMoving}
                className="business-card-button business-card-button-secondary"
              >
                {isMoving ? 'Moving...' : 'Move to'}
              </button>
              
              {showMoveDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-white/10 bg-neutral-800 py-1 shadow-lg z-10">
                  {availableGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => handleMoveToGroup(group.id)}
                      className="w-full px-3 py-2 text-left text-xs text-neutral-200 hover:bg-neutral-700"
                    >
                      {group.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Add/Add to Split Button */}
          <SplitButton
            mainAction={() => onAddMember(business)}
            dropdownActions={existingGroups
              .filter(group => group.id !== currentGroupId)
              .map(group => ({
                id: group.id,
                label: group.name,
                onClick: async () => {
                  try {
                    const response = await fetch('/api/admin/campaign/members/add-to-group', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        businessId: business.id,
                        groupId: group.id,
                        businessData: {
                          name: business.name,
                          primaryEmail: business.contact.primaryEmail,
                          alternateEmail: business.contact.alternateEmail,
                          tags: business.contact.tags || []
                        }
                      })
                    })
                    
                    if (response.ok) {
                      onMemberMoved?.()
                    } else {
                      const error = await response.json()
                      console.error('Error adding to group:', error.error)
                    }
                  } catch (error) {
                    console.error('Error adding to group:', error)
                  }
                }
              }))}
            mainLabel={isExistingMember ? 'Added' : 'Add'}
            mainIcon={
              isExistingMember ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )
            }
            dropdownIcon={
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            }
            disabled={isExistingMember}
            mainButtonClassName={isExistingMember ? 'business-card-button-secondary' : 'business-card-button-primary'}
            dropdownButtonClassName={isExistingMember ? 'business-card-button-secondary' : 'business-card-button-primary'}
          />
        </div>
      </div>
    </motion.div>
  )
}
