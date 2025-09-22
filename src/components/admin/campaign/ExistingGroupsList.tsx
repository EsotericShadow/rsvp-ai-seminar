'use client'

import { useState } from 'react'

type Group = {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  criteria: any
  members: Array<{
    id: string
    groupId: string
    businessId: string
    businessName: string | null
    primaryEmail: string
    secondaryEmail: string | null
    inviteToken: string | null
    tagsSnapshot: string[]
    meta: unknown
  }>
}

interface ExistingGroupsListProps {
  groups: Group[]
  onSelectGroup: (group: Group) => void
  onDeleteGroup: (id: string) => void
}

export function ExistingGroupsList({
  groups,
  onSelectGroup,
  onDeleteGroup,
}: ExistingGroupsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'created'>('name')

  const filteredAndSortedGroups = groups
    .filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'members':
          return b.members.length - a.members.length
        case 'created':
          // Assuming groups have createdAt, fallback to name
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Existing Groups</h3>
          <p className="text-sm text-neutral-400">
            {groups.length} group{groups.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'members' | 'created')}
            className="rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
          >
            <option value="name">Sort by Name</option>
            <option value="members">Sort by Members</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-4">
        {filteredAndSortedGroups.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/20 bg-black/30 p-8 text-center">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-sm text-neutral-400 mb-2">
              {groups.length === 0 
                ? 'No groups created yet' 
                : 'No groups match your search'
              }
            </p>
            {groups.length === 0 && (
              <p className="text-xs text-neutral-500">
                Create your first audience group to get started
              </p>
            )}
          </div>
        ) : (
          filteredAndSortedGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onSelect={() => onSelectGroup(group)}
              onDelete={() => onDeleteGroup(group.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function GroupCard({
  group,
  onSelect,
  onDelete,
}: {
  group: Group
  onSelect: () => void
  onDelete: () => void
}) {
  const manualCount = group.members.filter(m => m.meta && typeof m.meta === 'object' && 'manual' in m.meta).length
  const leadmineCount = group.members.length - manualCount

  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-white mb-2">{group.name}</h4>
          
          {group.description && (
            <p className="text-sm text-neutral-400 mb-4">{group.description}</p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>{group.members.length} member{group.members.length !== 1 ? 's' : ''}</span>
            </div>
            
            {manualCount > 0 && (
              <div className="flex items-center gap-2">
                <span>✋</span>
                <span>{manualCount} manual</span>
              </div>
            )}
            
            {leadmineCount > 0 && (
              <div className="flex items-center gap-2">
                <span>🔍</span>
                <span>{leadmineCount} from LeadMine</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onSelect}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-200 hover:border-emerald-400 hover:text-emerald-200"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete group "${group.name}"? This action cannot be undone.`)) {
                onDelete()
              }
            }}
            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-200 hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
