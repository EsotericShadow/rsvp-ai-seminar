'use client'

import { useEffect, useMemo, useState } from 'react'
import { CampaignSchedule, CampaignSendStatus, CampaignStatus, CampaignTemplate, AudienceGroup } from '@prisma/client'

type Template = CampaignTemplate

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

type ScheduleWithCounts = CampaignSchedule & {
  template: Template
  group: { id: string; name: string }
  _count: { sends: number }
  counts?: Record<CampaignSendStatus, number>
}

type DashboardData = {
  templates: Template[]
  groups: Group[]
  schedules: ScheduleWithCounts[]
}

type AdminDefaults = {
  batchSize: number
  minHoursBetween: number
  linkBase: string
  fromEmail: string
  cronSecretConfigured: boolean
  resendConfigured: boolean
  leadMineConfigured: boolean
}

type BusinessResult = {
  id: string
  name: string | null
  address: string | null
  invite: {
    token: string
    emailsSent: number
    visitsCount: number
    rsvpsCount: number
    lastEmailMeta?: Record<string, unknown> | null
  } | null
  contact: {
    primaryEmail: string | null
    alternateEmail: string | null
    contactPerson: string | null
    tags: string[]
  }
}

type MemberDraft = {
  businessId: string
  businessName?: string | null
  primaryEmail: string
  secondaryEmail?: string | null
  inviteToken?: string | null
  tags?: string[]
  meta?: Record<string, unknown>
}

const tabs = [
  { id: 'templates', label: 'Templates' },
  { id: 'groups', label: 'Audience Groups' },
  { id: 'schedules', label: 'Journeys & Sends' },
  { id: 'activity', label: 'Engagement' },
] as const

type TabKey = typeof tabs[number]['id']

export default function CampaignControls({ initialData, defaults }: { initialData: DashboardData; defaults: AdminDefaults }) {
  const [activeTab, setActiveTab] = useState<TabKey>('schedules')
  const [templates, setTemplates] = useState<Template[]>(initialData.templates)
  const [groups, setGroups] = useState<Group[]>(initialData.groups)
  const [schedules, setSchedules] = useState<ScheduleWithCounts[]>(initialData.schedules)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [businessResults, setBusinessResults] = useState<BusinessResult[]>([])
  const [businessSearch, setBusinessSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<MemberDraft[]>([])
  const [groupDraft, setGroupDraft] = useState<{ id?: string; name: string; description?: string }>(() => ({ name: '' }))
  const [templateDraft, setTemplateDraft] = useState<{ id?: string; name: string; subject: string; htmlBody: string; textBody: string }>(() => ({
    name: '',
    subject: '',
    htmlBody: defaultHtml,
    textBody: defaultText,
  }))
  const [scheduleDraft, setScheduleDraft] = useState<{ id?: string; name: string; templateId: string; groupId: string; sendAt: string; throttlePerMinute?: number; previewOnly?: boolean }>(() => ({
    name: '',
    templateId: '',
    groupId: '',
    sendAt: '',
  }))
  const [runOutput, setRunOutput] = useState<any>(null)

  useEffect(() => {
    setTemplates(initialData.templates)
    setGroups(initialData.groups)
    setSchedules(initialData.schedules)
  }, [initialData])

  async function refreshDashboard() {
    try {
      const res = await fetch('/api/admin/campaign/dashboard', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to refresh dashboard')
      const data: DashboardData = await res.json()
      setTemplates(data.templates)
      setGroups(data.groups as Group[])
      setSchedules(data.schedules as ScheduleWithCounts[])
    } catch (err: any) {
      setError(err?.message || 'Failed to refresh dashboard')
    }
  }

  async function upsertTemplate() {
    setIsSaving(true)
    setError(null)
    try {
      const method = templateDraft.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/campaign/templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateDraft),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to save template')
      }
      setTemplateDraft({ id: undefined, name: '', subject: '', htmlBody: defaultHtml, textBody: defaultText })
      await refreshDashboard()
      setActiveTab('templates')
    } catch (err: any) {
      setError(err?.message || 'Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  async function removeTemplate(id: string) {
    if (!confirm('Delete template? This cannot be undone.')) return
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/campaign/templates/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to delete template')
      }
      await refreshDashboard()
    } catch (err: any) {
      setError(err?.message || 'Failed to delete template')
    } finally {
      setIsSaving(false)
    }
  }

  async function searchBusinesses(query: string) {
    setBusinessSearch(query)
    if (!query || query.length < 2) {
      setBusinessResults([])
      return
    }
    setIsSearching(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/campaign/businesses?q=${encodeURIComponent(query)}&limit=25`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Search failed')
      }
      const data = await res.json()
      setBusinessResults(data.businesses as BusinessResult[])
    } catch (err: any) {
      setError(err?.message || 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  function addMember(business: BusinessResult) {
    if (!business.contact.primaryEmail && !business.contact.alternateEmail) return
    setSelectedMembers((prev) => {
      if (prev.some((member) => member.businessId === business.id)) return prev
      return [
        ...prev,
        {
          businessId: business.id,
          businessName: business.name ?? undefined,
          primaryEmail: business.contact.primaryEmail || business.contact.alternateEmail || '',
          secondaryEmail: business.contact.alternateEmail || undefined,
          inviteToken: business.invite?.token || undefined,
          tags: business.contact.tags,
          meta: {
            contactPerson: business.contact.contactPerson,
            lastEmailMeta: business.invite?.lastEmailMeta,
          },
        },
      ]
    })
  }

  function removeMember(businessId: string) {
    setSelectedMembers((prev) => prev.filter((member) => member.businessId !== businessId))
  }

  function loadGroup(group: Group) {
    setGroupDraft({ id: group.id, name: group.name, description: group.description ?? undefined })
    setSelectedMembers(
      group.members.map((member) => ({
        businessId: member.businessId,
        businessName: member.businessName ?? undefined,
        primaryEmail: member.primaryEmail,
        secondaryEmail: member.secondaryEmail ?? undefined,
        inviteToken: member.inviteToken ?? undefined,
        tags: member.tagsSnapshot,
        meta: (member.meta as Record<string, unknown> | undefined) ?? undefined,
      })),
    )
    setActiveTab('groups')
  }

  async function saveGroup() {
    if (!groupDraft.name || selectedMembers.length === 0) {
      setError('Provide a group name and at least one member')
      return
    }
    setIsSaving(true)
    setError(null)

    const payload = {
      id: groupDraft.id,
      name: groupDraft.name,
      description: groupDraft.description,
      members: selectedMembers,
    }

    try {
      const res = await fetch('/api/admin/campaign/groups', {
        method: groupDraft.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save group')
      }
      setGroupDraft({ id: undefined, name: '' })
      setSelectedMembers([])
      await refreshDashboard()
      setActiveTab('groups')
    } catch (err: any) {
      setError(err?.message || 'Failed to save group')
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteGroup(id: string) {
    if (!confirm('Delete this audience group?')) return
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/campaign/groups/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to delete group')
      }
      if (groupDraft.id === id) {
        setGroupDraft({ id: undefined, name: '' })
        setSelectedMembers([])
      }
      await refreshDashboard()
    } catch (err: any) {
      setError(err?.message || 'Failed to delete group')
    } finally {
      setIsSaving(false)
    }
  }

  async function saveSchedule() {
    if (!scheduleDraft.templateId || !scheduleDraft.groupId) {
      setError('Select template and audience group')
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      const payload: any = {
        id: scheduleDraft.id,
        name: scheduleDraft.name,
        templateId: scheduleDraft.templateId,
        groupId: scheduleDraft.groupId,
        sendAt: scheduleDraft.sendAt || null,
        throttlePerMinute: scheduleDraft.throttlePerMinute ?? undefined,
      }
      const res = await fetch('/api/admin/campaign/schedules', {
        method: scheduleDraft.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save schedule')
      }
      setScheduleDraft({ id: undefined, name: '', templateId: '', groupId: '', sendAt: '' })
      await refreshDashboard()
      setActiveTab('schedules')
    } catch (err: any) {
      setError(err?.message || 'Failed to save schedule')
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteSchedule(id: string) {
    if (!confirm('Delete this schedule?')) return
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/campaign/schedules/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to delete schedule')
      }
      await refreshDashboard()
    } catch (err: any) {
      setError(err?.message || 'Failed to delete schedule')
    } finally {
      setIsSaving(false)
    }
  }

  async function runScheduleAction(id: string, previewOnly: boolean) {
    setIsSaving(true)
    setError(null)
    setRunOutput(null)
    try {
      const res = await fetch(`/api/admin/campaign/schedules/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previewOnly }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to run schedule')
      }
      const data = await res.json()
      setRunOutput(data.result)
      await refreshDashboard()
    } catch (err: any) {
      setError(err?.message || 'Failed to run schedule')
    } finally {
      setIsSaving(false)
    }
  }

  const summary = useMemo(() => {
    const totals: Record<CampaignSendStatus, number> = {
      [CampaignSendStatus.PENDING]: 0,
      [CampaignSendStatus.SENDING]: 0,
      [CampaignSendStatus.SENT]: 0,
      [CampaignSendStatus.FAILED]: 0,
      [CampaignSendStatus.SKIPPED]: 0,
    }
    schedules.forEach((schedule) => {
      if (!schedule.counts) return
      Object.entries(schedule.counts).forEach(([status, count]) => {
        totals[status as CampaignSendStatus] += count as number
      })
    })
    return totals
  }, [schedules])

  return (
    <div className="space-y-8">
      <TopBanner defaults={defaults} />

      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <nav className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-emerald-950 shadow'
                : 'bg-white/5 text-neutral-300 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'templates' ? (
        <TemplatesPanel
          templates={templates}
          draft={templateDraft}
          setDraft={setTemplateDraft}
          onEdit={(template) => setTemplateDraft({
            id: template.id,
            name: template.name,
            subject: template.subject,
            htmlBody: template.htmlBody,
            textBody: template.textBody ?? '',
          })}
          onRemove={removeTemplate}
          onSubmit={upsertTemplate}
          isSaving={isSaving}
        />
      ) : null}

      {activeTab === 'groups' ? (
        <GroupsPanel
          draft={groupDraft}
          setDraft={setGroupDraft}
          members={selectedMembers}
          onRemoveMember={removeMember}
          searchQuery={businessSearch}
          onSearch={searchBusinesses}
          isSearching={isSearching}
          results={businessResults}
          onAddMember={addMember}
          onSubmit={saveGroup}
          onReset={() => {
            setGroupDraft({ id: undefined, name: '' })
            setSelectedMembers([])
          }}
          isSaving={isSaving}
          existingGroups={groups}
          onSelectGroup={loadGroup}
          onDeleteGroup={deleteGroup}
        />
      ) : null}

      {activeTab === 'schedules' ? (
        <SchedulesPanel
          templates={templates}
          groups={groups}
          schedules={schedules}
          draft={scheduleDraft}
          setDraft={setScheduleDraft}
          onSubmit={saveSchedule}
          onDelete={deleteSchedule}
          onRun={runScheduleAction}
          isSaving={isSaving}
          runOutput={runOutput}
        />
      ) : null}

      {activeTab === 'activity' ? (
        <ActivityPanel schedules={schedules} totals={summary} />
      ) : null}
    </div>
  )
}

function TopBanner({ defaults }: { defaults: AdminDefaults }) {
  const warnings: string[] = []
  if (!defaults.leadMineConfigured) warnings.push('Lead Mine integration is not configured (LEADMINE_API_BASE/KEY).')
  if (!defaults.resendConfigured) warnings.push('Resend is not configured (RESEND_API_KEY). Email sends will fail.')
  if (!defaults.cronSecretConfigured) warnings.push('CAMPAIGN_CRON_SECRET is missing. Cron triggers are disabled.')

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold text-white">Campaign environment</h2>
      <div className="mt-4 grid gap-3 text-sm text-neutral-300 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-black/40 p-3">
          <p className="text-xs uppercase text-neutral-500">Default batch size</p>
          <p className="text-lg font-semibold text-white">{defaults.batchSize}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/40 p-3">
          <p className="text-xs uppercase text-neutral-500">Throttle interval</p>
          <p className="text-lg font-semibold text-white">{defaults.minHoursBetween} hours</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/40 p-3">
          <p className="text-xs uppercase text-neutral-500">Invite link base</p>
          <p className="text-sm text-neutral-200">{defaults.linkBase}</p>
        </div>
      </div>
      {warnings.length ? (
        <div className="mt-4 space-y-2">
          {warnings.map((warning) => (
            <div key={warning} className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {warning}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function TemplatesPanel({
  templates,
  draft,
  setDraft,
  onEdit,
  onRemove,
  onSubmit,
  isSaving,
}: {
  templates: Template[]
  draft: { id?: string; name: string; subject: string; htmlBody: string; textBody: string }
  setDraft: (draft: { id?: string; name: string; subject: string; htmlBody: string; textBody: string }) => void
  onEdit: (template: Template) => void
  onRemove: (id: string) => void
  onSubmit: () => Promise<void>
  isSaving: boolean
}) {
  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Templates</h2>
          <p className="text-sm text-neutral-400">Define reusable email copy with personalization tokens.</p>
        </div>
        {draft.id ? (
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">Editing {draft.name}</span>
        ) : null}
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
          className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-4"
        >
          <div>
            <label className="text-xs uppercase tracking-wide text-neutral-400">Template name</label>
            <input
              required
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              placeholder="AI Seminar Invite"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-neutral-400">Subject</label>
            <input
              required
              value={draft.subject}
              onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              placeholder="Invitation: Evergreen AI Seminar"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-neutral-400">HTML content</label>
            <textarea
              required
              value={draft.htmlBody}
              onChange={(event) => setDraft({ ...draft, htmlBody: event.target.value })}
              rows={10}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-neutral-400">Plain text (optional)</label>
            <textarea
              value={draft.textBody}
              onChange={(event) => setDraft({ ...draft, textBody: event.target.value })}
              rows={5}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Tokens: <code className="text-emerald-300">{'{{business_name}}'}</code>, <code className="text-emerald-300">{'{{invite_link}}'}</code>
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : draft.id ? 'Update template' : 'Create template'}
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {templates.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/20 bg-black/30 p-4 text-sm text-neutral-400">
              No templates yet. Create one to get started.
            </div>
          ) : (
            templates.map((template) => (
              <article key={template.id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{template.name}</h3>
                    <p className="text-xs text-neutral-400">Subject: {template.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(template)}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200 hover:border-emerald-400 hover:text-emerald-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onRemove(template.id)}
                      className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-200 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </header>
                <details className="mt-3 text-xs text-neutral-300">
                  <summary className="cursor-pointer text-neutral-400">Preview HTML</summary>
                  <div className="prose prose-invert mt-2 max-w-none" dangerouslySetInnerHTML={{ __html: template.htmlBody }} />
                </details>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function GroupsPanel({
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

function SchedulesPanel({
  templates,
  groups,
  schedules,
  draft,
  setDraft,
  onSubmit,
  onDelete,
  onRun,
  isSaving,
  runOutput,
}: {
  templates: Template[]
  groups: Group[]
  schedules: ScheduleWithCounts[]
  draft: { id?: string; name: string; templateId: string; groupId: string; sendAt: string; throttlePerMinute?: number }
  setDraft: (value: { id?: string; name: string; templateId: string; groupId: string; sendAt: string; throttlePerMinute?: number }) => void
  onSubmit: () => Promise<void>
  onDelete: (id: string) => Promise<void>
  onRun: (id: string, preview: boolean) => Promise<void>
  isSaving: boolean
  runOutput: any
}) {
  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Journeys & sends</h2>
          <p className="text-sm text-neutral-400">Schedule campaigns and trigger previews or live sends.</p>
        </div>
        {draft.id ? (
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">Editing {draft.name || 'schedule'}</span>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
          className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-4"
        >
          <div>
            <label className="text-xs uppercase tracking-wide text-neutral-400">Journey name</label>
            <input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              placeholder="Invite reminder"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wide text-neutral-400">Template</label>
              <select
                value={draft.templateId}
                onChange={(event) => setDraft({ ...draft, templateId: event.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="">Select template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-neutral-400">Audience group</label>
              <select
                value={draft.groupId}
                onChange={(event) => setDraft({ ...draft, groupId: event.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="">Select group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.members.length})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wide text-neutral-400">Send at</label>
              <input
                type="datetime-local"
                value={draft.sendAt}
                onChange={(event) => setDraft({ ...draft, sendAt: event.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-neutral-400">Throttle per minute</label>
              <input
                type="number"
                min={1}
                value={draft.throttlePerMinute ?? ''}
                onChange={(event) => setDraft({ ...draft, throttlePerMinute: event.target.value ? Number(event.target.value) : undefined })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                placeholder="60"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDraft({ id: undefined, name: '', templateId: '', groupId: '', sendAt: '' })}
              className="rounded-full border border-white/10 px-4 py-2 text-xs text-neutral-300 hover:border-white/30"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : draft.id ? 'Update' : 'Create schedule'}
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {schedules.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/20 bg-black/30 p-4 text-sm text-neutral-400">
              No schedules yet.
            </div>
          ) : (
            schedules.map((schedule) => (
              <article key={schedule.id} className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{schedule.name}</h3>
                    <p className="text-xs text-neutral-400">
                      {schedule.template.name} → {schedule.group.name}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Status: {schedule.status} · Next run: {schedule.nextRunAt ? new Date(schedule.nextRunAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDraft({
                        id: schedule.id,
                        name: schedule.name,
                        templateId: schedule.templateId,
                        groupId: schedule.groupId,
                        sendAt: schedule.sendAt ? new Date(schedule.sendAt).toISOString().slice(0, 16) : '',
                        throttlePerMinute: schedule.throttlePerMinute ?? undefined,
                      })}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200 hover:border-emerald-400 hover:text-emerald-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(schedule.id)}
                      className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-200 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </header>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                  <span className="rounded-full border border-white/10 px-2 py-1">SENT {schedule.counts?.[CampaignSendStatus.SENT] ?? 0}</span>
                  <span className="rounded-full border border-white/10 px-2 py-1">FAILED {schedule.counts?.[CampaignSendStatus.FAILED] ?? 0}</span>
                  <span className="rounded-full border border-white/10 px-2 py-1">PENDING {schedule.counts?.[CampaignSendStatus.PENDING] ?? 0}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onRun(schedule.id, true)}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200 hover:border-emerald-400 hover:text-emerald-200"
                  >
                    Preview batch
                  </button>
                  <button
                    onClick={() => onRun(schedule.id, false)}
                    className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
                  >
                    Send now
                  </button>
                </div>
              </article>
            ))
          )}
          {runOutput ? (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-100">
              <p className="font-semibold">Last run</p>
              <pre className="mt-2 whitespace-pre-wrap text-[11px]">{JSON.stringify(runOutput, null, 2)}</pre>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function ActivityPanel({ schedules, totals }: { schedules: ScheduleWithCounts[]; totals: Record<CampaignSendStatus, number> }) {
  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
      <header>
        <h2 className="text-xl font-semibold text-white">Engagement</h2>
        <p className="text-sm text-neutral-400">Overview of send throughput and customer actions.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            { key: CampaignSendStatus.SENT, label: 'Emails sent' },
            { key: CampaignSendStatus.PENDING, label: 'Queued / pending' },
            { key: CampaignSendStatus.FAILED, label: 'Failures' },
            { key: CampaignSendStatus.SKIPPED, label: 'Previewed / skipped' },
          ] as const
        ).map((item) => (
          <div key={item.key} className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase text-neutral-500">{item.label}</p>
            <p className="text-2xl font-semibold text-white">{totals[item.key]}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="text-neutral-300">
            <tr>
              <th className="py-3 pr-4">Journey</th>
              <th className="py-3 pr-4">Template</th>
              <th className="py-3 pr-4">Audience</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Counts</th>
              <th className="py-3 pr-4">Last run</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-neutral-300">
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td className="py-3 pr-4 text-white">{schedule.name}</td>
                <td className="py-3 pr-4">{schedule.template.name}</td>
                <td className="py-3 pr-4">{schedule.group.name}</td>
                <td className="py-3 pr-4">{schedule.status}</td>
                <td className="py-3 pr-4">
                  SENT {schedule.counts?.[CampaignSendStatus.SENT] ?? 0} / PENDING {schedule.counts?.[CampaignSendStatus.PENDING] ?? 0}
                </td>
                <td className="py-3 pr-4">{schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const defaultHtml = `<p>Hi {{business_name}},</p>
<p>We’re hosting Evergreen AI’s private seminar in Terrace and reserved a seat for your team. The agenda covers practical AI workflows for Northern BC businesses.</p>
<p><a href="{{invite_link}}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#22c55e;color:#0f172a;font-weight:600;text-decoration:none;">View details & RSVP</a></p>
<p>Looking forward to seeing you,<br />Evergreen AI Partnerships Team</p>`

const defaultText = `Hi {{business_name}},

We’re hosting Evergreen AI’s private seminar in Terrace and would love to see you there. Review the agenda and RSVP: {{invite_link}}

Looking forward to seeing you,
Evergreen AI Partnerships Team`