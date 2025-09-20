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

type CampaignDraft = Partial<Omit<CampaignWithCounts, 'schedules'>> & {
  schedules?: StepDraft[]
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
  repeatIntervalMins?: number | null
  timeZone?: string
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
  throttlePerMinute: 60,
  repeatIntervalMins: null,
  timeZone: 'America/Vancouver',
  stepOrder: order,
  smartWindowStart: null,
  smartWindowEnd: null,
  status: CampaignStatus.DRAFT,
})

const parseDateValue = (value: unknown): Date | null => {
  if (!value) return null
  if (value instanceof Date) return value
  const dt = new Date(String(value))
  return Number.isNaN(dt.getTime()) ? null : dt
}

const formatDateTimeLocal = (value: Date | null | undefined): string => {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (input: number) => String(input).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const TIME_ZONE_OPTIONS = [
  'America/Vancouver',
  'America/Los_Angeles',
  'America/Edmonton',
  'America/Denver',
  'America/Winnipeg',
  'America/Chicago',
  'America/Toronto',
  'America/New_York',
  'America/Halifax',
  'America/Phoenix',
  'America/Anchorage',
] as const

const TIME_ZONE_DATALIST_ID = 'campaign-timezones'

const sameDate = (a: Date | null | undefined, b: Date | null | undefined) => {
  const timeA = a ? a.getTime() : null
  const timeB = b ? b.getTime() : null
  return timeA === timeB
}

const normalizeStepDraft = (step: any, index: number): StepDraft => {
  const templateId = step?.templateId ?? step?.template?.id ?? ''
  const groupId = step?.groupId ?? step?.group?.id ?? ''
  const throttle =
    step?.throttlePerMinute === undefined || step.throttlePerMinute === null
      ? 60
      : Number(step.throttlePerMinute)
  const repeat =
    step?.repeatIntervalMins === undefined
      ? null
      : step.repeatIntervalMins === null
      ? null
      : Number(step.repeatIntervalMins)
  const timeZone =
    typeof step?.timeZone === 'string' && step.timeZone.trim()
      ? String(step.timeZone)
      : 'America/Vancouver'

  return {
    id: step?.id ? String(step.id) : undefined,
    name: step?.name ?? '',
    templateId,
    groupId,
    sendAt: parseDateValue(step?.sendAt),
    throttlePerMinute: throttle,
    repeatIntervalMins: repeat,
    timeZone,
    stepOrder: step?.stepOrder ?? index + 1,
    smartWindowStart: parseDateValue(step?.smartWindowStart),
    smartWindowEnd: parseDateValue(step?.smartWindowEnd),
    status: step?.status ?? CampaignStatus.DRAFT,
  }
}

const compareStepDraft = (a: StepDraft, b: StepDraft) =>
  (a.id ?? undefined) === (b.id ?? undefined) &&
  a.name === b.name &&
  a.templateId === b.templateId &&
  a.groupId === b.groupId &&
  sameDate(a.sendAt, b.sendAt) &&
  (a.throttlePerMinute ?? 60) === (b.throttlePerMinute ?? 60) &&
  (a.repeatIntervalMins ?? null) === (b.repeatIntervalMins ?? null) &&
  (a.timeZone ?? 'America/Vancouver') === (b.timeZone ?? 'America/Vancouver') &&
  a.stepOrder === b.stepOrder &&
  sameDate(a.smartWindowStart ?? null, b.smartWindowStart ?? null) &&
  sameDate(a.smartWindowEnd ?? null, b.smartWindowEnd ?? null) &&
  a.status === b.status

const stepDraftsEquivalent = (original: any, normalized: StepDraft, index: number) =>
  compareStepDraft(normalizeStepDraft(original, index), normalized)

type StepSection = {
  id: 'audience' | 'messaging' | 'timing' | 'review'
  label: string
  description: string
  status: 'complete' | 'current' | 'pending'
}

function buildStepSections(steps: StepDraft[], draft: CampaignDraft): StepSection[] {
  const hasAudience = steps.length > 0 && steps.every((step) => Boolean(step.groupId))
  const hasMessaging = steps.length > 0 && steps.every((step) => Boolean(step.templateId) && Boolean(step.name?.trim()))
  const hasTiming = steps.length > 0 && steps.every((step) => Boolean(step.sendAt) || Boolean(step.smartWindowStart))
  const reviewReady = hasAudience && hasMessaging && hasTiming && draft.status !== undefined

  const base: Array<{ id: StepSection['id']; label: string; description: string; complete: boolean }> = [
    {
      id: 'audience',
      label: 'Audience',
      description: 'Choose who should receive this touchpoint.',
      complete: hasAudience,
    },
    {
      id: 'messaging',
      label: 'Messaging',
      description: 'Pick the template and tailor the subject.',
      complete: hasMessaging,
    },
    {
      id: 'timing',
      label: 'Timing',
      description: 'Schedule the send window and cadence.',
      complete: hasTiming,
    },
    {
      id: 'review',
      label: 'Review',
      description: 'Confirm status and final checks.',
      complete: reviewReady,
    },
  ]

  let currentAssigned = false
  return base.map(({ id, label, description, complete }) => {
    if (complete) {
      return { id, label, description, status: 'complete' as const }
    }
    if (!currentAssigned) {
      currentAssigned = true
      return { id, label, description, status: 'current' as const }
    }
    return { id, label, description, status: 'pending' as const }
  })
}

function Stepper({ sections }: { sections: StepSection[] }) {
  return (
    <ol className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-neutral-900/60 p-4 shadow-sm sm:flex-row sm:items-stretch sm:gap-4">
      {sections.map((section, idx) => {
        const statusStyles =
          section.status === 'complete'
            ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
            : section.status === 'current'
            ? 'border-white/40 bg-white/10 text-white'
            : 'border-white/10 bg-transparent text-neutral-400'

        return (
          <li key={section.id} className="flex flex-1 items-start gap-3">
            <div className={`flex h-7 w-7 flex-none items-center justify-center rounded-full border text-xs font-semibold ${statusStyles}`}>
              {section.status === 'complete' ? '✓' : idx + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{section.label}</p>
              <p className="text-xs text-neutral-400">{section.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

const tabs = [
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'groups', label: 'Audience Groups' },
  { id: 'templates', label: 'Templates' },
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
  const [notice, setNotice] = useState<string | null>(null)
  const [runningStep, setRunningStep] = useState<{ id: string; mode: 'preview' | 'send' } | null>(null)

  // Drafts
  const [campaignDraft, setCampaignDraft] = useState<CampaignDraft>({})
  const [groupDraft, setGroupDraft] = useState<{ id?: string; name: string; description?: string }>(() => ({ name: '' }))
  const [templateDraft, setTemplateDraft] = useState<{ id?: string; name: string; subject: string; htmlBody: string; textBody: string }>(() => ({
    name: '',
    subject: '',
    htmlBody: defaultHtml,
    textBody: defaultText,
  }))

  // Group builder state
  const [selectedMembers, setSelectedMembers] = useState<MemberDraft[]>([])

  const handleSelectCampaign = useCallback(
    (candidate: CampaignDraft | CampaignWithCounts) => {
      setError(null)
      setNotice(null)
      const rawSchedules = Array.isArray(candidate.schedules) ? candidate.schedules : []
      const normalizedSchedules = rawSchedules.length
        ? rawSchedules.map((step, index) => normalizeStepDraft(step, index))
        : [newStep(1)]

      setCampaignDraft({
        id: candidate.id,
        name: candidate.name ?? 'New Campaign',
        description: candidate.description,
        status: candidate.status ?? CampaignStatus.DRAFT,
        schedules: normalizedSchedules,
      })
    },
    [setCampaignDraft, setError, setNotice],
  )

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
        setNotice(null)
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
    const payload = { ...campaignDraft, steps: campaignDraft.schedules }
    await runApi<{ campaign: CampaignWithCounts }>(
      async () => {
        const res = await fetch('/api/admin/campaign/campaigns', {
          method: isUpdate ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        return { res, data }
      },
      {
        onSuccess: ({ campaign }) => {
          setCampaignDraft({})
          setNotice(isUpdate ? 'Campaign updated successfully.' : 'Campaign created successfully.')
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
            setNotice('Campaign deleted.')
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

  const duplicateTemplate = useCallback(
    (template: Template) => {
      setTemplateDraft({
        id: undefined,
        name: `${template.name} copy`,
        subject: template.subject,
        htmlBody: template.htmlBody,
        textBody: template.textBody ?? '',
      })
      setActiveTab('templates')
      setNotice(`Duplicated template “${template.name}”. Update the name and save.`)
    },
    [setActiveTab, setNotice],
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

  const addManualMember = useCallback(
    (member: MemberDraft) => {
      setSelectedMembers((prev) => {
        if (prev.some((existing) => existing.businessId === member.businessId)) return prev
        return [...prev, member]
      })
      setActiveTab('groups')
      setNotice(`Added manual contact ${member.businessName ?? member.businessId}.`)
    },
    [setActiveTab, setNotice],
  )

  const runScheduleStep = useCallback(
    async (scheduleId: string, mode: 'preview' | 'send') => {
      if (!scheduleId) return
      setRunningStep({ id: scheduleId, mode })
      setError(null)
      setNotice(null)
      try {
        const res = await fetch('/api/admin/campaign/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scheduleId, previewOnly: mode === 'preview' }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(data.error || 'Failed to trigger schedule send')
        }
        const result = data.result ?? {}
        if (result.windowClosed) {
          setNotice(`Smart window closed at ${new Date(result.windowClosed).toLocaleString()}. No emails were sent.`)
        } else if (result.deferredUntil) {
          setNotice(`Not yet in smart window. Rescheduled for ${new Date(result.deferredUntil).toLocaleString()}.`)
        } else if (mode === 'preview') {
          setNotice(`Preview ready: ${result.processed ?? 0} recipient(s) processed.`)
        } else {
          setNotice(`Send complete: ${result.sent ?? 0} of ${result.processed ?? 0} recipient(s) sent.`)
        }
        await refreshDashboard()
      } catch (err: any) {
        setError(err?.message || 'Failed to trigger schedule send')
      } finally {
        setRunningStep(null)
      }
    },
    [refreshDashboard],
  )

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

      {notice ? (
        <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
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
            onSelectCampaign={handleSelectCampaign}
            onRunStep={runScheduleStep}
            runningStep={runningStep}
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
            onAddManual={addManualMember}
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
            onDuplicate={duplicateTemplate}
            onRemove={deleteTemplate}
            onSubmit={saveTemplate}
            isSaving={isSaving}
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
  onSelectCampaign,
  onRunStep,
  runningStep,
}: {
  campaigns: CampaignWithCounts[]
  draft: CampaignDraft
  setDraft: (d: CampaignDraft) => void
  templates: Template[]
  groups: Group[]
  onSave: () => void
  onDelete: (id: string) => void
  isSaving: boolean
  onSelectCampaign: (campaign: CampaignDraft | CampaignWithCounts) => void
  onRunStep: (scheduleId: string, mode: 'preview' | 'send') => void
  runningStep: { id: string; mode: 'preview' | 'send' } | null
}) {
  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <aside className="w-full xl:max-w-xs xl:flex-none">
        <CampaignsPanel campaigns={campaigns} onSelect={onSelectCampaign} selectedId={draft.id} />
      </aside>
      <main className="w-full flex-1">
        <SequenceEditor
          draft={draft}
          setDraft={setDraft}
          templates={templates}
          groups={groups}
          onSave={onSave}
          onDelete={onDelete}
          isSaving={isSaving}
          onRunStep={onRunStep}
          runningStep={runningStep}
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
  onSelect: (campaign: CampaignDraft | CampaignWithCounts) => void
  selectedId?: string
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">Campaigns</h2>
          <p className="text-xs text-neutral-400">Select a campaign or start a new sequence.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelect({ name: 'New Campaign', status: CampaignStatus.DRAFT, schedules: [newStep(1)] })}
            className="rounded-full border border-emerald-400 px-3 py-1 text-xs text-emerald-200 hover:bg-emerald-500/10"
          >
            + New
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300 hover:border-white/30 xl:hidden"
          >
            {isCollapsed ? 'Show' : 'Hide'}
          </button>
        </div>
      </header>
      <div className={`-mx-2 flex-1 overflow-y-auto px-2 ${isCollapsed ? 'hidden' : ''}`}>
        {campaigns.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/20 bg-black/20 p-4 text-xs text-neutral-400">
            No campaigns yet. Create a new one to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                  selectedId === c.id
                    ? 'border-emerald-400 bg-emerald-500/15 text-emerald-50'
                    : 'border-white/10 bg-black/30 text-neutral-200 hover:border-emerald-400'
                }`}
              >
                <p className="font-semibold leading-tight">{c.name}</p>
                <p className="mt-1 text-[11px] text-neutral-400">
                  {c.schedules.length} step{c.schedules.length === 1 ? '' : 's'} · {c.status}
                </p>
              </button>
            ))}
          </div>
        )}
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
  onRunStep,
  runningStep,
}: {
  draft: CampaignDraft
  setDraft: (d: CampaignDraft) => void
  templates: Template[]
  groups: Group[]
  onSave: () => void
  onDelete: (id: string) => void
  isSaving: boolean
  onRunStep: (scheduleId: string, mode: 'preview' | 'send') => void
  runningStep: { id: string; mode: 'preview' | 'send' } | null
}) {
  const steps = useMemo<StepDraft[]>(() => (draft.schedules as StepDraft[] | undefined) ?? [], [draft.schedules])
  const sections = useMemo(() => buildStepSections(steps, draft), [steps, draft])

  useEffect(() => {
    if (!steps.length) return
    let needsUpdate = false
    const normalized = steps.map((step, index) => {
      const normalizedStep = normalizeStepDraft(step, index)
      if (!stepDraftsEquivalent(step, normalizedStep, index)) {
        needsUpdate = true
      }
      return normalizedStep
    })
    if (needsUpdate) {
      setDraft({ ...draft, schedules: normalized })
    }
  }, [steps, draft, setDraft])

  const updateStep = (index: number, newStepData: Partial<StepDraft>) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], ...newStepData }
    const normalizedSteps = newSteps.map((item, idx) => ({ ...item, stepOrder: idx + 1 }))
    setDraft({ ...draft, schedules: normalizedSteps })
  }

  const addStep = () => {
    const normalizedSteps = [...steps, newStep(steps.length + 1)]
    setDraft({ ...draft, schedules: normalizedSteps })
  }

  const moveStep = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= steps.length) return
    const newSteps = [...steps]
    const [step] = newSteps.splice(index, 1)
    newSteps.splice(newIndex, 0, step)
    setDraft({ ...draft, schedules: newSteps.map((item, idx) => ({ ...item, stepOrder: idx + 1 })) })
  }

  const duplicateStep = (index: number) => {
    const step = steps[index]
    const clone: StepDraft = {
      ...step,
      id: undefined,
      name: step.name ? `${step.name} (copy)` : '',
      stepOrder: index + 2,
      sendAt: step.sendAt ? new Date(step.sendAt) : null,
      smartWindowStart: step.smartWindowStart ? new Date(step.smartWindowStart) : null,
      smartWindowEnd: step.smartWindowEnd ? new Date(step.smartWindowEnd) : null,
    }
    const newSteps = [...steps]
    newSteps.splice(index + 1, 0, clone)
    setDraft({ ...draft, schedules: newSteps.map((item, idx) => ({ ...item, stepOrder: idx + 1 })) })
  }

  const removeStep = (index: number) => {
    const newSteps = steps
      .filter((_, i) => i !== index)
      .map((item, idx) => ({ ...item, stepOrder: idx + 1 }))
    setDraft({ ...draft, schedules: newSteps })
  }

  if (!draft.name) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5">
        <p className="text-neutral-400">Select a campaign or create a new one to begin.</p>
      </div>
    )
  }

  const statusOptions = [
    CampaignStatus.DRAFT,
    CampaignStatus.SCHEDULED,
    CampaignStatus.PAUSED,
    CampaignStatus.COMPLETED,
    CampaignStatus.CANCELLED,
  ]

  return (
    <div className="space-y-6">
      <Stepper sections={sections} />

      <header className="space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4 shadow-sm">
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

      <div className="relative pl-8">
        <div
          className="absolute bottom-0 left-[1.3rem] top-0 w-0.5 bg-neutral-800/80"
          aria-hidden="true"
        />
        {steps.map((step, index) => {
          const stepStatus = step.status ?? CampaignStatus.DRAFT
          const throttleValue = step.throttlePerMinute ?? 60
          const repeatValue = step.repeatIntervalMins ?? null
          const repeatFieldValue = repeatValue ?? ''
          const timeZoneValue = step.timeZone ?? 'America/Vancouver'
          const isFirst = index === 0
          const isLast = index === steps.length - 1
          const stepId = step.id
          const isStepRunning = runningStep?.id === stepId
          const isPreviewRunning = isStepRunning && runningStep?.mode === 'preview'
          const isSendRunning = isStepRunning && runningStep?.mode === 'send'
          const runDisabled = !stepId || isSaving || Boolean(runningStep)

          return (
            <div key={stepId || `step-${index}`} className="relative pl-2">
              <div className="absolute left-[-2.1rem] top-2 h-6 w-6 rounded-full border-2 border-neutral-800/80 bg-neutral-950" />
              <div className="space-y-4 rounded-2xl border border-white/10 bg-neutral-900/70 p-4 shadow-sm backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">Step {index + 1}</h3>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] uppercase tracking-wide text-neutral-300">
                      {stepStatus}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {repeatValue
                      ? `Repeats every ${repeatValue} minute${repeatValue === 1 ? '' : 's'}`
                      : 'Single run'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-200">
                  <button
                    type="button"
                    onClick={() => moveStep(index, -1)}
                    disabled={isFirst}
                    className="rounded-full border border-white/10 px-3 py-1 hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(index, 1)}
                    disabled={isLast}
                    className="rounded-full border border-white/10 px-3 py-1 hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateStep(index)}
                    className="rounded-full border border-white/10 px-3 py-1 hover:border-white/30"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="rounded-full border border-red-500/40 px-3 py-1 text-red-200 hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wide text-neutral-400">Template</label>
                  <select
                    value={step.templateId}
                    onChange={(e) => updateStep(index, { templateId: e.target.value })}
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
                    onChange={(e) => updateStep(index, { groupId: e.target.value })}
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
                  onChange={(e) => updateStep(index, { name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  placeholder="e.g., Follow-up Email"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wide text-neutral-400">Send At (optional)</label>
                  <input
                    type="datetime-local"
                    value={formatDateTimeLocal(step.sendAt)}
                    onChange={(e) =>
                      updateStep(index, {
                        sendAt: e.target.value ? new Date(e.target.value) : null,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-neutral-400">Throttle (per minute)</label>
                  <input
                    type="number"
                    min={1}
                    value={throttleValue}
                    onChange={(e) =>
                      updateStep(index, {
                        throttlePerMinute: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs uppercase tracking-wide text-neutral-400">Step status</label>
                  <select
                    value={stepStatus}
                    onChange={(e) => updateStep(index, { status: e.target.value as CampaignStatus })}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-neutral-400">Repeat interval (mins)</label>
                  <input
                    type="number"
                    min={0}
                    value={repeatFieldValue}
                    onChange={(e) =>
                      updateStep(index, {
                        repeatIntervalMins: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    placeholder="Leave blank to disable"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-neutral-400">Time zone</label>
                  <input
                    type="text"
                    list={TIME_ZONE_DATALIST_ID}
                    value={timeZoneValue}
                    onChange={(e) => updateStep(index, { timeZone: e.target.value.trim() || undefined })}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    placeholder="America/Vancouver"
                  />
                  <p className="mt-1 text-[11px] text-neutral-500">Use an IANA time zone identifier.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wide text-neutral-400">Smart window start</label>
                  <input
                    type="datetime-local"
                    value={formatDateTimeLocal(step.smartWindowStart ?? null)}
                    onChange={(e) =>
                      updateStep(index, {
                        smartWindowStart: e.target.value ? new Date(e.target.value) : null,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="sm:space-y-2">
                  <label className="text-xs uppercase tracking-wide text-neutral-400">Smart window end</label>
                  <input
                    type="datetime-local"
                    value={formatDateTimeLocal(step.smartWindowEnd ?? null)}
                    onChange={(e) =>
                      updateStep(index, {
                        smartWindowEnd: e.target.value ? new Date(e.target.value) : null,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => updateStep(index, { smartWindowStart: null, smartWindowEnd: null })}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300 hover:border-white/30"
                    >
                      Clear window
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-neutral-500">
                Smart windows limit sends to the specified interval. Outside the window the schedule waits or completes.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                <p className="text-xs text-neutral-500">Preview simulates this step without sending email.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={runDisabled}
                    onClick={() => {
                      if (!stepId || runDisabled) return
                      onRunStep(stepId, 'preview')
                    }}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200 hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPreviewRunning ? 'Previewing…' : 'Preview'}
                  </button>
                  <button
                    type="button"
                    disabled={runDisabled}
                    onClick={() => {
                      if (!stepId || runDisabled) return
                      onRunStep(stepId, 'send')
                    }}
                    className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSendRunning ? 'Sending…' : 'Send now'}
                  </button>
                </div>
              </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="relative pl-2 pt-4">
        <div className="absolute left-[-2.1rem] top-6 h-6 w-6 rounded-full border-2 border-neutral-800/80 bg-neutral-950" />
        <button
          onClick={addStep}
          type="button"
          className="w-full rounded-2xl border-2 border-dashed border-white/10 py-8 text-center text-sm text-neutral-400 hover:border-white/30 hover:text-neutral-300"
        >
          + Add Step
        </button>
      </div>

      <datalist id={TIME_ZONE_DATALIST_ID}>
        {TIME_ZONE_OPTIONS.map((tz) => (
          <option key={tz} value={tz} />
        ))}
      </datalist>

      <div className="flex items-center justify-between pt-6">
        {draft.id ? (
          <button
            onClick={() => onDelete(draft.id!)}
            type="button"
            disabled={isSaving}
            className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            Delete
          </button>
        ) : null}
        <button
          onClick={onSave}
          type="button"
          disabled={isSaving}
          className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Campaign'}
        </button>
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
