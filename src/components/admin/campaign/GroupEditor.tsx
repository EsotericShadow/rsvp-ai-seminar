'use client'

import type { MemberDraft } from './AudienceGroupsTab'

interface GroupEditorProps {
  draft: { id?: string; name: string; description?: string }
  setDraft: (value: { id?: string; name: string; description?: string }) => void
  members: MemberDraft[]
  onRemoveMember: (businessId: string) => void
  onSubmit: () => Promise<void>
  onReset: () => void
  isSaving: boolean
  onAddManual: () => void
}

export function GroupEditor({
  draft,
  setDraft,
  members,
  onRemoveMember,
  onSubmit,
  onReset,
  isSaving,
  onAddManual,
}: GroupEditorProps) {
  return (
    <div className="space-y-6">
      {/* Group Form */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/70 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Group Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Group Name *
            </label>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              placeholder="e.g., Northern BC Construction"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              value={draft.description ?? ''}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              placeholder="Optional description of this group"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSaving || !draft.name.trim()}
            className="w-full rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-primary-950 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : draft.id ? 'Update Group' : 'Create Group'}
          </button>
          
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-300 hover:border-white/30"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/70 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Total Members</span>
            <span className="text-lg font-semibold text-white">{members.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Manual Entries</span>
            <span className="text-sm text-white">
              {members.filter(m => m.meta?.manual).length}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">LeadMine Entries</span>
            <span className="text-sm text-white">
              {members.filter(m => !m.meta?.manual).length}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/70 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        
        <div className="space-y-3">
          <button
            type="button"
            onClick={onAddManual}
            className="w-full rounded-lg border border-primary-400 px-4 py-2 text-sm text-primary-200 hover:bg-primary-500/10"
          >
            + Add Manual Entry
          </button>
          
          {members.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Remove all members from this group?')) {
                  members.forEach(member => onRemoveMember(member.businessId))
                }
              }}
              className="w-full rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-200 hover:bg-red-500/10"
            >
              Clear All Members
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
