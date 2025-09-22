'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MemberDraft } from './AudienceGroupsTab'
import { SplitButton } from './SplitButton'

interface GroupMembersListProps {
  members: MemberDraft[]
  onRemoveMember: (businessId: string) => void
  onAddManual: () => void
  existingGroups: Array<{
    id: string
    name: string
    description: string | null
    color?: string | null
    members: Array<{ businessId: string }>
  }>
  currentGroupId?: string
  onMemberMoved?: () => void
}

export function GroupMembersList({
  members,
  onRemoveMember,
  onAddManual,
  existingGroups,
  currentGroupId,
  onMemberMoved,
}: GroupMembersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'manual' | 'leadmine'>('all')
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.primaryEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.secondaryEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'manual' && member.meta?.manual) ||
      (filterType === 'leadmine' && !member.meta?.manual)
    
    return matchesSearch && matchesFilter
  })

  const manualCount = members.filter(m => m.meta?.manual).length
  const leadmineCount = members.filter(m => !m.meta?.manual).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Selected Members</h3>
          <p className="text-sm text-neutral-400">
            {members.length} member{members.length !== 1 ? 's' : ''} selected
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAddManual}
            className="rounded-lg border border-primary-400 px-4 py-2 text-sm text-primary-200 hover:bg-primary-500/10"
          >
            + Add Manual Entry
          </button>
          {members.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Remove all ${members.length} members from this group?`)) {
                  members.forEach(member => onRemoveMember(member.businessId))
                }
              }}
              className="rounded-lg border border-error-500/40 px-4 py-2 text-sm text-error-200 hover:bg-error-500/10"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input admin-button-sm w-full rounded-lg"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
              filterType === 'all'
                ? 'bg-primary-500 text-primary-950'
                : 'border border-white/10 text-neutral-300 hover:border-white/30'
            }`}
          >
            All ({members.length})
          </button>
          <button
            onClick={() => setFilterType('manual')}
            className={`rounded-lg px-3 py-2 text-sm ${
              filterType === 'manual'
                ? 'bg-primary-500 text-primary-950'
                : 'border border-white/10 text-neutral-300 hover:border-white/30'
            }`}
          >
            Manual ({manualCount})
          </button>
          <button
            onClick={() => setFilterType('leadmine')}
            className={`rounded-lg px-3 py-2 text-sm ${
              filterType === 'leadmine'
                ? 'bg-primary-500 text-primary-950'
                : 'border border-white/10 text-neutral-300 hover:border-white/30'
            }`}
          >
            LeadMine ({leadmineCount})
          </button>
        </div>
      </div>

      {/* Search Results Counter */}
      {searchTerm && (
        <div className="text-sm text-neutral-400">
          {filteredMembers.length} of {members.length} members match &quot;{searchTerm}&quot;
        </div>
      )}

      {/* Members List */}
      <div className="space-y-3">
        {filteredMembers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/20 bg-black/30 p-8 text-center">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-sm text-neutral-400 mb-2">
              {members.length === 0 
                ? 'No members selected yet' 
                : searchTerm
                ? 'No members match your search'
                : filterType !== 'all'
                ? `No ${filterType} members found`
                : 'No members found'
              }
            </p>
            {members.length === 0 && (
              <p className="text-xs text-neutral-500">
                Browse businesses or add manual entries to get started
              </p>
            )}
            {searchTerm && members.length > 0 && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-primary-400 hover:text-primary-300 underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredMembers
              .filter(member => !removingIds.has(member.businessId))
              .map((member) => (
                <MemberCard
                  key={member.businessId}
                  member={member}
                  onRemove={() => {
                    setRemovingIds(prev => new Set([...prev, member.businessId]))
                    setTimeout(() => {
                      onRemoveMember(member.businessId)
                      setRemovingIds(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(member.businessId)
                        return newSet
                      })
                    }, 300)
                  }}
                  existingGroups={existingGroups}
                  currentGroupId={currentGroupId}
                  onMemberMoved={onMemberMoved}
                  isRemoving={removingIds.has(member.businessId)}
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
        )}
      </div>
    </div>
  )
}

function MemberCard({
  member,
  onRemove,
  existingGroups,
  currentGroupId,
  onMemberMoved,
  isRemoving,
  onStartRemoving,
}: {
  member: MemberDraft
  onRemove: () => void
  existingGroups: Array<{
    id: string
    name: string
    description: string | null
    color?: string | null
    members: Array<{ businessId: string }>
  }>
  currentGroupId?: string
  onMemberMoved?: () => void
  isRemoving: boolean
  onStartRemoving: (id: string) => void
}) {
  const [isMoving, setIsMoving] = useState(false)
  const [showMoveDropdown, setShowMoveDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const isManual = member.meta && typeof member.meta === 'object' && 'manual' in member.meta
  const tags = member.tags || []
  const contactPerson = member.meta && typeof member.meta === 'object' && 'contactPerson' in member.meta 
    ? (member.meta as any).contactPerson as string | undefined 
    : undefined
  const website = member.meta && typeof member.meta === 'object' && 'website' in member.meta 
    ? (member.meta as any).website as string | undefined 
    : undefined
  const phone = member.meta && typeof member.meta === 'object' && 'phone' in member.meta 
    ? (member.meta as any).phone as string | undefined 
    : undefined

  // Filter out current group and groups that already have this business
  const availableGroups = existingGroups.filter(group => {
    if (group.id === currentGroupId) return false
    return !group.members.some(m => m.businessId === member.businessId)
  })

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

  const handleMoveToGroup = async (targetGroupId: string) => {
    if (!member.businessId || isMoving) return
    
    setIsMoving(true)
    setShowMoveDropdown(false)
    
    // Start the removal animation
    onStartRemoving(member.businessId)
    
    try {
      const response = await fetch('/api/admin/campaign/members/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: member.businessId, // Using businessId as memberId for now
          targetGroupId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to move member')
      }

      const result = await response.json()
      
      // Wait a bit for the animation to complete before refreshing
      setTimeout(() => {
        // Call the callback to refresh the data
        if (onMemberMoved) {
          onMemberMoved()
        }
      }, 300) // Match the animation duration
      
    } catch (error) {
      console.error('Error moving member:', error)
      alert(error instanceof Error ? error.message : 'Failed to move member')
      // Reset the removing state on error
      onStartRemoving(member.businessId) // This will toggle it back off
    } finally {
      setIsMoving(false)
    }
  }

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
      className={`rounded-lg border border-white/10 bg-black/40 p-4 ${isRemoving ? 'pointer-events-none' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white truncate">
              {member.businessName || member.businessId}
            </h4>
            {isManual && (
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-200">
                Manual
              </span>
            )}
          </div>
          
          <div className="space-y-1 text-sm text-neutral-400">
            <p className="flex items-center gap-2">
              <span>📧</span>
              <span>{member.primaryEmail}</span>
            </p>
            
            {member.secondaryEmail && (
              <p className="flex items-center gap-2">
                <span>📧</span>
                <span>{member.secondaryEmail}</span>
              </p>
            )}
            
            {contactPerson && (
              <p className="flex items-center gap-2">
                <span>👤</span>
                <span>{contactPerson}</span>
              </p>
            )}
            
            {website && (
              <p className="flex items-center gap-2">
                <span>🌐</span>
                <a 
                  href={website.startsWith('http') ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 truncate"
                >
                  {website}
                </a>
              </p>
            )}
            
            {phone && (
              <p className="flex items-center gap-2">
                <span>📞</span>
                <span>{phone}</span>
              </p>
            )}
          </div>
          
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-neutral-700 px-2 py-0.5 text-xs text-neutral-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="business-card-actions">
          {/* Move to Split Button */}
          {availableGroups.length > 0 && (
            <SplitButton
              mainAction={() => {
                if (currentGroupId) {
                  handleMoveToGroup(currentGroupId)
                }
              }}
              dropdownActions={availableGroups
                .filter(group => group.id !== currentGroupId)
                .map(group => ({
                  id: group.id,
                  label: group.name,
                  onClick: () => handleMoveToGroup(group.id)
                }))}
              mainLabel="Move"
              mainIcon={
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
              dropdownIcon={
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              }
              disabled={isMoving || !currentGroupId}
              loading={isMoving}
              mainButtonClassName="business-card-button-secondary"
              dropdownButtonClassName="business-card-button-secondary"
            />
          )}
          
          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="business-card-button business-card-button-danger"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  )
}
