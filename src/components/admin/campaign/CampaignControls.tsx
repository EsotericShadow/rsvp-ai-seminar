'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Campaign, CampaignSchedule, CampaignSendStatus, CampaignStatus, CampaignTemplate, AudienceGroup } from '@prisma/client'
import type { LeadMineBusiness } from '@/lib/leadMine'
import { GroupsPanel } from './GroupsPanel'
import type { MemberDraft } from './GroupsPanel'
import { TemplatesPanel } from './TemplatesPanel'
import { BusinessDirectoryPanel } from './BusinessDirectoryPanel'

// ### TYPES ###

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
  campaign: { id: string; name: string; status: CampaignStatus } | null
  _count: { sends: number }
  counts: Record<CampaignSendStatus, number>
}

type CampaignWithCounts = Campaign & {
  schedules: ScheduleWithCounts[]
  counts: Record<CampaignSendStatus, number>
}

type DashboardData = {
  templates: Template[]
  groups: Group[]
  schedules: ScheduleWithCounts[]
  campaigns: CampaignWithCounts[]
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

type BusinessResult = LeadMineBusiness

type StepDraft = {
  id?: string
  name: string
  templateId: string
  groupId: string
  sendAt: Date | null
  throttlePerMinute?: number | null
  stepOrder: number
  smartWindowStart?: Date | null
  smartWindowEnd?: Date | null
  status: CampaignStatus
}

const newStep = (order: number): StepDraft => ({
  id: undefined,
  name: '',
  templateId: '',
  groupId: '',
  sendAt: null,
  stepOrder: order,
  status: CampaignStatus.DRAFT,
})

const tabs = [
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'groups', label: 'Audience Groups' },
  { id: 'templates', label: 'Templates' },
  { id: 'directory', label: 'Business Directory' },
] as const

type TabKey = typeof tabs[number]['id']

// ### COMPONENT ###

export default function CampaignControls({ initialData, defaults }: { initialData: DashboardData; defaults: AdminDefaults }) {
  // Core state
  const [activeTab, setActiveTab] = useState<TabKey>('campaigns')
  const [templates, setTemplates] = useState<Template[]>(initialData.templates)
  const [groups, setGroups] = useState<Group[]>(initialData.groups)
  const [schedules, setSchedules] = useState<ScheduleWithCounts[]>(initialData.schedules)
  const [campaigns, setCampaigns] = useState<CampaignWithCounts[]>(initialData.campaigns)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Drafts
  const [campaignDraft, setCampaignDraft] = useState<Partial<CampaignWithCounts>>({})
  const [groupDraft, setGroupDraft] = useState<{ id?: string; name: string; description?: string }>(() => ({ name: '' }))
  const [templateDraft, setTemplateDraft] = useState<{ id?: string; name: string; subject: string; htmlBody: string; textBody: string }>(() => ({
    name: '',
    subject: '',
    htmlBody: defaultHtml,
    textBody: defaultText,
  }))

  // Group builder state
  const [selectedMembers, setSelectedMembers] = useState<MemberDraft[]>([])

  // Side effects
  useEffect(() => {
    setTemplates(initialData.templates)
    setGroups(initialData.groups)
    setSchedules(initialData.schedules)
    setCampaigns(initialData.campaigns)
  }, [initialData])

  // ### API INTERACTIONS ###

  const refreshDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/campaign/dashboard', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to refresh dashboard')
      const data: DashboardData = await res.json()
      setTemplates(data.templates)
      setGroups(data.groups as Group[])
      setSchedules(data.schedules)
      setCampaigns(data.campaigns)
    } catch (err: any) {
      setError(err?.message || 'Failed to refresh dashboard')
    }
  }, [])

  const runApi = useCallback(
    async <T,>(
      logic: () => Promise<{ res: Response; data: any }>,
      {
        onSuccess,
        onError,
      }: {
        onSuccess?: (payload: T) => void
        onError?: (message: string) => void
      } = {},
    ) => {
      setIsSaving(true)
      setError(null)
      try {
        const { res, data } = await logic()
        if (!res.ok) {
          throw new Error(data.error || 'An API error occurred')
        }
        onSuccess?.(data)
      } catch (err: any) {
        const message = err?.message || 'An unknown error occurred'
        setError(message)
        onError?.(message)
      } finally {
        setIsSaving(false)
      }
    },
    [],
  )

  // Campaigns
  const saveCampaign = useCallback(async () => {
    const isUpdate = !!campaignDraft.id
    await runApi<{ campaign: CampaignWithCounts }>(
      async () => {
        const res = await fetch('/api/admin/campaign/campaigns', {
          method: isUpdate ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(campaignDraft),
        })
        const data = await res.json()
        return { res, data }
      },
      {
        onSuccess: ({ campaign }) => {
          setCampaignDraft({})
          refreshDashboard()
        },
      },
    )
  }, [campaignDraft, runApi, refreshDashboard])

  const deleteCampaign = useCallback(
    async (id: string) => {
      if (!confirm('Delete this campaign and all its scheduled steps?')) return
      await runApi(
        async () => {
          const res = await fetch(`/api/admin/campaign/campaigns/${id}`, { method: 'DELETE' })
          const data = await res.json()
          return { res, data }
        },
        {
          onSuccess: () => {
            if (campaignDraft.id === id) setCampaignDraft({})
            refreshDashboard()
          },
        },
      )
    },
    [campaignDraft.id, runApi, refreshDashboard],
  )

  // Groups
  const saveGroup = useCallback(async () => {
    if (!groupDraft.name || selectedMembers.length === 0) {
      setError('Provide a group name and at least one member')
      return
    }
    const payload = {
      ...groupDraft,
      members: selectedMembers,
    }
    await runApi(
      async () => {
        const res = await fetch('/api/admin/campaign/groups', {
          method: groupDraft.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        return { res, data }
      },
      {
        onSuccess: () => {
          setGroupDraft({ name: '' })
          setSelectedMembers([])
          refreshDashboard()
        },
      },
    )
  }, [groupDraft, selectedMembers, runApi, refreshDashboard])

  const deleteGroup = useCallback(
    async (id: string) => {
      if (!confirm('Delete this audience group?')) return
      await runApi(
        async () => {
          const res = await fetch(`/api/admin/campaign/groups/${id}`, { method: 'DELETE' })
          const data = await res.json()
          return { res, data }
        },
        {
          onSuccess: () => {
            if (groupDraft.id === id) {
              setGroupDraft({ name: '' })
              setSelectedMembers([])
            }
            refreshDashboard()
          },
        },
      )
    },
    [groupDraft.id, runApi, refreshDashboard],
  )

  // Templates
  const saveTemplate = useCallback(async () => {
    await runApi(
      async () => {
        const res = await fetch('/api/admin/campaign/templates', {
          method: templateDraft.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateDraft),
        })
        const data = await res.json()
        return { res, data }
      },
      {
        onSuccess: () => {
          setTemplateDraft({ name: '', subject: '', htmlBody: defaultHtml, textBody: defaultText })
          refreshDashboard()
        },
      },
    )
  }, [templateDraft, runApi, refreshDashboard])

  const deleteTemplate = useCallback(
    async (id: string) => {
      if (!confirm('Delete this template?')) return
      await runApi(
        async () => {
          const res = await fetch(`/api/admin/campaign/templates/${id}`, { method: 'DELETE' })
          const data = await res.json()
          return { res, data }
        },
        {
          onSuccess: () => {
            if (templateDraft.id === id) {
              setTemplateDraft({ name: '', subject: '', htmlBody: defaultHtml, textBody: defaultText })
            }
            refreshDashboard()
          },
        },
      )
    },
    [templateDraft.id, runApi, refreshDashboard],
  )

  const addMember = useCallback((business: BusinessResult) => {
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
  }, [])

  const addMembers = useCallback(
    (businessList: BusinessResult[]) => {
      businessList.forEach((biz) => addMember(biz))
    },
    [addMember],
  )

  const removeMember = (businessId: string) => {
    setSelectedMembers((prev) => prev.filter((member) => member.businessId !== businessId))
  }

  const loadGroup = (group: Group) => {
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
  }

  // ### RENDER ###

  return (
    <div className="space-y-8">
      <TopBanner defaults={defaults} />

      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
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

      <div className="mt-6">
        {activeTab === 'campaigns' && (
          <CampaignsView
            campaigns={campaigns}
            draft={campaignDraft}
            setDraft={setCampaignDraft}
            templates={templates}
            groups={groups}
            onSave={saveCampaign}
            onDelete={deleteCampaign}
            isSaving={isSaving}
          />
        )}
        {activeTab === 'groups' && (
          <GroupsPanel
            draft={groupDraft}
            setDraft={setGroupDraft}
            members={selectedMembers}
            onRemoveMember={removeMember}
            onAddMember={addMember}
            onAddMany={addMembers}
            onSubmit={saveGroup}
            onReset={() => {
              setGroupDraft({ name: '' })
              setSelectedMembers([])
            }}
            isSaving={isSaving}
            existingGroups={groups}
            onSelectGroup={loadGroup}
            onDeleteGroup={deleteGroup}
          />
        )}
        {activeTab === 'templates' && (
          <TemplatesPanel
            templates={templates}
            draft={templateDraft}
            setDraft={setTemplateDraft}
            onEdit={(template) => setTemplateDraft({ ...template, textBody: template.textBody ?? '' })}
            onRemove={deleteTemplate}
            onSubmit={saveTemplate}
            isSaving={isSaving}
          />
        )}
        {activeTab === 'directory' && (
          <BusinessDirectoryPanel
            onAddMember={addMember}
            onAddMany={addMembers}
            existingMemberIds={selectedMembers.map((member) => member.businessId)}
          />
        )}
      </div>
    </div>
  )
}

// ### SUB-COMPONENTS (Placeholders/Stubs for now) ###

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

function CampaignsView({
  campaigns,
  draft,
  setDraft,
  templates,
  groups,
  onSave,
  onDelete,
  isSaving,
}: {
  campaigns: CampaignWithCounts[]
  draft: Partial<CampaignWithCounts>
  setDraft: (d: Partial<CampaignWithCounts>) => void
  templates: Template[]
  groups: Group[]
  onSave: () => void
  onDelete: (id: string) => void
  isSaving: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <aside className="md:col-span-1">
        <CampaignsPanel campaigns={campaigns} onSelect={setDraft} selectedId={draft.id} />
      </aside>
      <main className="md:col-span-2">
        <SequenceEditor
          draft={draft}
          setDraft={setDraft}
          templates={templates}
          groups={groups}
          onSave={onSave}
          onDelete={onDelete}
          isSaving={isSaving}
        />
      </main>
    </div>
  )
}

function CampaignsPanel({
  campaigns,
  onSelect,
  selectedId,
}: {
  campaigns: CampaignWithCounts[]
  onSelect: (campaign: Partial<CampaignWithCounts>) => void
  selectedId?: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <header className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Campaigns</h2>
        <button onClick={() => onSelect({ name: 'New Campaign', status: CampaignStatus.DRAFT, schedules: [] })} className="text-sm text-emerald-400 hover:text-emerald-300">
          + New
        </button>
      </header>
      <div className="mt-3 space-y-2">
        {campaigns.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className={`w-full rounded-lg p-3 text-left transition ${selectedId === c.id ? 'bg-emerald-500/20' : 'hover:bg-white/5'}`}
          >
            <p className="font-semibold text-white">{c.name}</p>
            <p className="text-xs text-neutral-400">
              {c.schedules.length} steps · {c.status}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

function SequenceEditor({
  draft,
  setDraft,
  templates,
  groups,
  onSave,
  onDelete,
  isSaving,
}: {
  draft: Partial<CampaignWithCounts>
  setDraft: (d: Partial<CampaignWithCounts>) => void
  templates: Template[]
  groups: Group[]
  onSave: () => void
  onDelete: (id: string) => void
  isSaving: boolean
}) {
  const steps = useMemo(() => draft.schedules || [], [draft.schedules])

  const updateStep = (index: number, newStepData: Partial<StepDraft>) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], ...newStepData }
    setDraft({ ...draft, schedules: newSteps })
  }

  const addStep = () => {
    const newSteps = [...steps, newStep(steps.length + 1) as any]
    setDraft({ ...draft, schedules: newSteps })
  }

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index)
    setDraft({ ...draft, schedules: newSteps })
  }

  if (!draft.name) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5">
        <p className="text-neutral-400">Select a campaign or create a new one to begin.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <input
          value={draft.name ?? ''}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none"
          placeholder="New Campaign Name"
        />
        <textarea
          value={draft.description ?? ''}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className="w-full resize-none bg-transparent text-sm text-neutral-400 focus:outline-none"
          placeholder="Optional description..."
          rows={2}
        />
      </header>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id || `step-${index}`} className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Step {index + 1}</h3>
              <button onClick={() => removeStep(index)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-wide text-neutral-400">Template</label>
                <select
                  value={step.templateId}
                  onChange={(e) => updateStep(index, { ...step, templateId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value="">Select template</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-neutral-400">Audience Group</label>
                <select
                  value={step.groupId}
                  onChange={(e) => updateStep(index, { ...step, groupId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value="">Select group</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.members.length} members)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-neutral-400">Step Name</label>
              <input
                value={step.name}
                onChange={(e) => updateStep(index, { ...step, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                placeholder={`e.g., Follow-up Email`}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-wide text-neutral-400">Send At (optional)</label>
                <input
                  type="datetime-local"
                  value={step.sendAt ? step.sendAt.toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateStep(index, { ...step, sendAt: e.target.value ? new Date(e.target.value) : null })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-neutral-400">Throttle (per minute)</label>
                <input
                  type="number"
                  min={1}
                  value={step.throttlePerMinute ?? ''}
                  onChange={(e) => updateStep(index, { ...step, throttlePerMinute: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  placeholder="60"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-wide text-neutral-400">Smart Window Start (optional)</label>
                <input
                  type="datetime-local"
                  value={step.smartWindowStart ? step.smartWindowStart.toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateStep(index, { ...step, smartWindowStart: e.target.value ? new Date(e.target.value) : null })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-neutral-400">Smart Window End (optional)</label>
                <input
                  type="datetime-local"
                  value={step.smartWindowEnd ? step.smartWindowEnd.toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateStep(index, { ...step, smartWindowEnd: e.target.value ? new Date(e.target.value) : null })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={addStep} className="rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-200 hover:bg-white/5">
          + Add Step
        </button>
        <div className="flex items-center gap-3">
          {draft.id ? (
            <button onClick={() => onDelete(draft.id!)} disabled={isSaving} className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50">
              Delete
            </button>
          ) : null}
          <button onClick={onSave} disabled={isSaving} className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save Campaign'}
          </button>
        </div>
      </div>
    </div>
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
