'use client'

import { useState } from 'react'
import type { MemberDraft } from './AudienceGroupsTab'

interface GroupMembersListProps {
  members: MemberDraft[]
  onRemoveMember: (businessId: string) => void
  onAddManual: () => void
}

export function GroupMembersList({
  members,
  onRemoveMember,
  onAddManual,
}: GroupMembersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'manual' | 'leadmine'>('all')

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
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
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
          {filteredMembers.length} of {members.length} members match "{searchTerm}"
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
          filteredMembers.map((member) => (
            <MemberCard
              key={member.businessId}
              member={member}
              onRemove={() => onRemoveMember(member.businessId)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function MemberCard({
  member,
  onRemove,
}: {
  member: MemberDraft
  onRemove: () => void
}) {
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

  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-4">
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
        
        <button
          onClick={onRemove}
          className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-200 hover:bg-red-500/10 flex-shrink-0"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
