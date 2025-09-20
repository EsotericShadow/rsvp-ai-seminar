'use client'

import { useMemo, useState } from 'react'
import type { AudienceGroup } from '@prisma/client'
import type { LeadMineBusiness } from '@/lib/leadMine'

import { BusinessDirectoryPanel } from './BusinessDirectoryPanel'

export type MemberDraft = {
  businessId: string
  businessName?: string | null
  primaryEmail: string
  secondaryEmail?: string | null
  inviteToken?: string | null
  tags?: string[]
  meta?: Record<string, unknown>
}

type Group = AudienceGroup & {
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

const generateManualId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `manual-${crypto.randomUUID()}`
  }
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function GroupsPanel({
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
  const memberIds = useMemo(() => members.map((member) => member.businessId), [members])
  const [isManualOpen, setManualOpen] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)
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

  const resetManualDraft = () => {
    setManualDraft({
      businessName: '',
      primaryEmail: '',
      secondaryEmail: '',
      contactPerson: '',
      tags: '',
      notes: '',
      website: '',
      phone: '',
    })
    setManualError(null)
  }

  const openManual = () => {
    resetManualDraft()
    setManualOpen(true)
  }

  const closeManual = () => {
    setManualOpen(false)
  }

  const handleManualSubmit = () => {
    const businessName = manualDraft.businessName.trim()
    const primaryEmail = manualDraft.primaryEmail.trim()
    if (!businessName) {
      setManualError('Business name is required')
      return
    }
    if (!primaryEmail) {
      setManualError('Primary email is required')
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
      inviteToken: undefined, // Will be generated when saved to database
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
    closeManual()
  }

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Audience groups</h2>
          <p className="text-sm text-neutral-400">
            Create reusable cohorts by browsing Lead Mine businesses, applying filters, and adding them to your list.
          </p>
        </div>
        {draft.id ? (
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">Editing {draft.name}</span>
        ) : null}
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-neutral-900/70 p-4 shadow-sm lg:max-w-sm lg:flex-none">
          <div>
            <label className="text-xs uppercase tracking-wide text-neutral-400">Group name</label>
            <input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              placeholder="Northern BC invitees"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-neutral-400">Notes (optional)</label>
            <textarea
              value={draft.description ?? ''}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-200">Selected members ({members.length})</h3>
              <button
                type="button"
                onClick={openManual}
                className="rounded-full border border-emerald-400 px-3 py-1 text-[11px] text-emerald-200 hover:bg-emerald-500/10"
              >
                + Manual entry
              </button>
            </div>
            <div className="mt-2 max-h-48 space-y-2 overflow-y-auto text-xs text-neutral-300">
              {members.length === 0 ? <p className="text-neutral-500">No members selected yet.</p> : null}
              {members.map((member) => (
                <div key={member.businessId} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 p-2">
                  <div>
                    <p className="font-medium text-white">{member.businessName ?? member.businessId}</p>
                    <p className="text-[11px] text-neutral-400">{member.primaryEmail}</p>
                  </div>
                  <button
                    onClick={() => onRemoveMember(member.businessId)}
                    className="rounded-full border border-red-500/40 px-2 py-1 text-[11px] text-red-200 hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
        </div>
      </div>

      {isManualOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-neutral-900 p-6 text-sm text-neutral-200">
            <header className="space-y-1">
              <h3 className="text-lg font-semibold text-white">Add manual entry</h3>
              <p className="text-xs text-neutral-400">Use for contacts that are not in Lead Mine. These entries stay local to this audience group.</p>
            </header>

            {manualError ? (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">{manualError}</div>
            ) : null}

            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-neutral-400">Business name</span>
                  <input
                    value={manualDraft.businessName}
                    onChange={(e) => setManualDraft((prev) => ({ ...prev, businessName: e.target.value }))}
                    className="rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-neutral-400">Primary email</span>
                  <input
                    type="email"
                    value={manualDraft.primaryEmail}
                    onChange={(e) => setManualDraft((prev) => ({ ...prev, primaryEmail: e.target.value }))}
                    className="rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-neutral-400">Secondary email</span>
                  <input
                    type="email"
                    value={manualDraft.secondaryEmail}
                    onChange={(e) => setManualDraft((prev) => ({ ...prev, secondaryEmail: e.target.value }))}
                    className="rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-neutral-400">Contact person</span>
                  <input
                    value={manualDraft.contactPerson}
                    onChange={(e) => setManualDraft((prev) => ({ ...prev, contactPerson: e.target.value }))}
                    className="rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-neutral-400">Website</span>
                  <input
                    value={manualDraft.website}
                    onChange={(e) => setManualDraft((prev) => ({ ...prev, website: e.target.value }))}
                    className="rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    placeholder="https://"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-neutral-400">Phone</span>
                  <input
                    value={manualDraft.phone}
                    onChange={(e) => setManualDraft((prev) => ({ ...prev, phone: e.target.value }))}
                    className="rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-neutral-400">Tags (comma separated)</span>
                <input
                  value={manualDraft.tags}
                  onChange={(e) => setManualDraft((prev) => ({ ...prev, tags: e.target.value }))}
                  className="rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  placeholder="e.g., manual, high-priority"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-neutral-400">Notes</span>
                <textarea
                  value={manualDraft.notes}
                  onChange={(e) => setManualDraft((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeManual}
                className="rounded-full border border-white/10 px-4 py-2 text-xs text-neutral-300 hover:border-white/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualSubmit}
                className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
              >
                Add manual entry
              </button>
            </div>
          </div>
        </div>
      ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onReset}
              className="rounded-full border border-white/10 px-4 py-2 text-xs text-neutral-300 hover:border-white/30"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSaving}
              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : draft.id ? 'Update group' : 'Create group'}
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-200">Existing groups</h3>
            {existingGroups.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/20 bg-black/30 p-4 text-sm text-neutral-400">
                No audience groups yet.
              </div>
            ) : (
              existingGroups.map((group) => (
                <article key={group.id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <header className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{group.name}</h4>
                      <p className="text-xs text-neutral-400">{group.members.length} members</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectGroup(group)}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200 hover:border-emerald-400 hover:text-emerald-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteGroup(group.id)}
                        className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-200 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </header>
                  {group.description ? <p className="mt-2 text-xs text-neutral-400">{group.description}</p> : null}
                </article>
              ))
            )}
          </div>
        </div>

        <div className="flex-1">
          <BusinessDirectoryPanel
            onAddMember={onAddMember}
            onAddMany={onAddMany}
            existingMemberIds={memberIds}
          />
        </div>
      </div>
    </section>
  )
}
