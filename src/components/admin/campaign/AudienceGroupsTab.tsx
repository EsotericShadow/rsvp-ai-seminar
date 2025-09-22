'use client'

import { useState, useMemo } from 'react'
import type { AudienceGroup } from '@prisma/client'
import type { LeadMineBusiness } from '@/lib/leadMine'

import { BusinessDirectoryPanel } from './BusinessDirectoryPanel'
import { GroupEditor } from './GroupEditor'
import { GroupMembersList } from './GroupMembersList'
import { ExistingGroupsList } from './ExistingGroupsList'

export type MemberDraft = {
  businessId: string
  businessName?: string | null
  primaryEmail: string
  secondaryEmail?: string | null
  inviteToken?: string | null
  tags?: string[]
  meta?: Record<string, unknown>
}

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

type TabKey = 'browse' | 'members' | 'groups'

export function AudienceGroupsTab({
  draft,
  setDraft,
  members,
  onRemoveMember,
  onAddMember,
  onAddMany,
  onAddManual,
  onSubmit,
  isSaving,
  onReset,
  existingGroups,
  onSelectGroup,
  onDeleteGroup,
}: {
  draft: { id?: string; name: string; description?: string }
  setDraft: (value: { id?: string; name: string; description?: string }) => void
  members: MemberDraft[]
  onRemoveMember: (businessId: string) => void
  onAddMember: (business: LeadMineBusiness) => void
  onAddMany: (businesses: LeadMineBusiness[]) => void
  onAddManual: (member: MemberDraft) => void
  onSubmit: () => Promise<void>
  isSaving: boolean
  onReset: () => void
  existingGroups: Group[]
  onSelectGroup: (group: Group) => void
  onDeleteGroup: (id: string) => void
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('browse')
  const [isManualOpen, setManualOpen] = useState(false)

  const memberIds = useMemo(() => members.map((member) => member.businessId), [members])

  // Get all business IDs that are already in other groups
  const allExistingMemberIds = useMemo(() => {
    const ids = new Set<string>()
    existingGroups.forEach(group => {
      group.members.forEach(member => {
        if (member.businessId !== draft.id) { // Don't include current group being edited
          ids.add(member.businessId)
        }
      })
    })
    return ids
  }, [existingGroups, draft.id])

  const tabs = [
    { id: 'browse' as const, label: 'Browse Businesses', icon: '🔍' },
    { id: 'members' as const, label: `Selected Members (${members.length})`, icon: '👥' },
    { id: 'groups' as const, label: 'Existing Groups', icon: '📁' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Audience Groups</h2>
          <p className="text-sm text-neutral-400">
            Create and manage audience groups for your email campaigns
          </p>
        </div>
        {draft.id && (
          <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs font-medium text-primary-200">
            Editing {draft.name}
          </span>
        )}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Sidebar - Group Editor */}
        <div className="lg:col-span-1">
          <GroupEditor
            draft={draft}
            setDraft={setDraft}
            members={members}
            onRemoveMember={onRemoveMember}
            onSubmit={onSubmit}
            onReset={onReset}
            isSaving={isSaving}
            onAddManual={() => setManualOpen(true)}
          />
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-1 rounded-lg bg-neutral-900/50 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-primary-950'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {activeTab === 'browse' && (
              <BusinessDirectoryPanel
                onAddMember={onAddMember}
                onAddMany={onAddMany}
                existingMemberIds={memberIds}
                allExistingMemberIds={allExistingMemberIds}
              />
            )}

            {activeTab === 'members' && (
              <GroupMembersList
                members={members}
                onRemoveMember={onRemoveMember}
                onAddManual={() => setManualOpen(true)}
              />
            )}

            {activeTab === 'groups' && (
              <ExistingGroupsList
                groups={existingGroups}
                onSelectGroup={onSelectGroup}
                onDeleteGroup={onDeleteGroup}
              />
            )}
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {isManualOpen && (
        <ManualEntryModal
          onClose={() => setManualOpen(false)}
          onAddManual={onAddManual}
        />
      )}
    </div>
  )
}

// Manual Entry Modal Component
function ManualEntryModal({
  onClose,
  onAddManual,
}: {
  onClose: () => void
  onAddManual: (member: MemberDraft) => void
}) {
  const [manualDraft, setManualDraft] = useState({
    businessName: '',
    primaryEmail: '',
    secondaryEmail: '',
    contactPerson: '',
    tags: '',
    notes: '',
    website: '',
    phone: '',
  })
  const [error, setError] = useState<string | null>(null)

  const generateManualId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `manual-${crypto.randomUUID()}`
    }
    return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  const handleSubmit = () => {
    const businessName = manualDraft.businessName.trim()
    const primaryEmail = manualDraft.primaryEmail.trim()
    
    if (!businessName) {
      setError('Business name is required')
      return
    }
    if (!primaryEmail) {
      setError('Primary email is required')
      return
    }

    const secondaryEmail = manualDraft.secondaryEmail.trim()
    const contactPerson = manualDraft.contactPerson.trim()
    const notes = manualDraft.notes.trim()
    const website = manualDraft.website.trim()
    const phone = manualDraft.phone.trim()
    const tags = manualDraft.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    const manualId = generateManualId()

    const manualMember: MemberDraft = {
      businessId: manualId,
      businessName,
      primaryEmail,
      secondaryEmail: secondaryEmail || undefined,
      inviteToken: null,
      tags,
      meta: {
        manual: true,
        contactPerson: contactPerson || undefined,
        notes: notes || undefined,
        website: website || undefined,
        phone: phone || undefined,
      },
    }

    onAddManual(manualMember)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl space-y-6 rounded-2xl border border-white/10 bg-neutral-900 p-6">
        <header className="space-y-2">
          <h3 className="text-xl font-semibold text-white">Add Manual Entry</h3>
          <p className="text-sm text-neutral-400">
            Add a business that's not in Lead Mine. This entry will be local to this audience group.
          </p>
        </header>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Business Name *
            </label>
            <input
              value={manualDraft.businessName}
              onChange={(e) => setManualDraft(prev => ({ ...prev, businessName: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
              placeholder="Enter business name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Primary Email *
            </label>
            <input
              type="email"
              value={manualDraft.primaryEmail}
              onChange={(e) => setManualDraft(prev => ({ ...prev, primaryEmail: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
              placeholder="business@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Secondary Email
            </label>
            <input
              type="email"
              value={manualDraft.secondaryEmail}
              onChange={(e) => setManualDraft(prev => ({ ...prev, secondaryEmail: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
              placeholder="Optional secondary email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Contact Person
            </label>
            <input
              value={manualDraft.contactPerson}
              onChange={(e) => setManualDraft(prev => ({ ...prev, contactPerson: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
              placeholder="Contact person name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Website
            </label>
            <input
              value={manualDraft.website}
              onChange={(e) => setManualDraft(prev => ({ ...prev, website: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Phone
            </label>
            <input
              value={manualDraft.phone}
              onChange={(e) => setManualDraft(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
              placeholder="Phone number"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            value={manualDraft.tags}
            onChange={(e) => setManualDraft(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
            placeholder="e.g., manual, high-priority, local"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            Notes
          </label>
          <textarea
            value={manualDraft.notes}
            onChange={(e) => setManualDraft(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
            placeholder="Additional notes about this business"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-300 hover:border-white/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-primary-950 hover:bg-primary-400"
          >
            Add Entry
          </button>
        </div>
      </div>
    </div>
  )
}
