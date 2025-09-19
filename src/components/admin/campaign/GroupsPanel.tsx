'use client'

import { useState } from 'react'
import { AudienceGroup } from '@prisma/client'

// FAKE TYPES FOR NOW
type Group = AudienceGroup & { members: any[] }
type BusinessResult = any
type MemberDraft = any

export function GroupsPanel({
  draft,
  setDraft,
  members,
  onRemoveMember,
  searchQuery,
  onSearch,
  isSearching,
  results,
  onAddMember,
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
  searchQuery: string
  onSearch: (query: string) => Promise<void>
  isSearching: boolean
  results: BusinessResult[]
  onAddMember: (biz: BusinessResult) => void
  onSubmit: () => Promise<void>
  isSaving: boolean
  onReset: () => void
  existingGroups: Group[]
  onSelectGroup: (group: Group) => void
  onDeleteGroup: (id: string) => void
}) {
  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Audience groups</h2>
          <p className="text-sm text-neutral-400">Organize Lead Mine businesses into targeted cohorts.</p>
        </div>
        {draft.id ? (
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">Editing {draft.name}</span>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-4">
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
            <label className="text-xs uppercase tracking-wide text-neutral-400">Search Lead Mine businesses</label>
            <input
              value={searchQuery}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search by business name, contact, or tag"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
            {isSearching ? <p className="mt-2 text-xs text-neutral-500">Searching…</p> : null}
            <div className="mt-3 max-h-48 overflow-y-auto space-y-2">
              {results.map((biz) => (
                <div key={biz.id} className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-black/30 p-3 text-sm">
                  <div>
                    <p className="font-semibold text-white">{biz.name ?? 'Unknown business'}</p>
                    <p className="text-xs text-neutral-400">{biz.contact.primaryEmail || biz.contact.alternateEmail || 'No email'}</p>
                    {biz.contact.tags.length ? (
                      <p className="mt-1 text-xs text-neutral-500">Tags: {biz.contact.tags.join(', ')}</p>
                    ) : null}
                  </div>
                  <button
                    onClick={() => onAddMember(biz)}
                    className="rounded-full border border-emerald-400 px-3 py-1 text-xs text-emerald-200 hover:bg-emerald-500/10"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-200">Selected members ({members.length})</h3>
            <div className="mt-2 max-h-40 space-y-2 overflow-y-auto text-xs text-neutral-300">
              {members.length === 0 ? <p className="text-neutral-500">No members selected.</p> : null}
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
        </div>

        <div className="space-y-3">
          {existingGroups.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/20 bg-black/30 p-4 text-sm text-neutral-400">
              No audience groups yet.
            </div>
          ) : (
            existingGroups.map((group) => (
              <article key={group.id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{group.name}</h3>
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
                {group.description ? (
                  <p className="mt-2 text-xs text-neutral-400">{group.description}</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
