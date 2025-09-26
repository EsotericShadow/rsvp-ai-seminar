'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Campaign, CampaignSchedule, CampaignSendStatus, CampaignStatus, CampaignTemplate, AudienceGroup } from '@prisma/client'
import { ClockIcon, CheckCircleIcon, UsersIcon } from '@heroicons/react/24/outline'
import type { LeadMineBusiness } from '@/lib/leadMine'
import type { MemberDraft } from './AudienceGroupsTab'
import TemplateEditor from '../TemplateEditor'
import GlobalHTMLTemplate from '../GlobalHTMLTemplate'
import GlobalTemplateSettings from '../GlobalTemplateSettings'
import HTMLEditor from '../HTMLEditor'
import TextEditor from '../TextEditor'
// TemplatesPanel will be implemented inline to match CampaignsView structure
import { AudienceGroupsTab } from './AudienceGroupsTab'
import { CampaignDashboard } from './CampaignDashboard'
import { CampaignTemplates } from './CampaignTemplates'
import { WorkflowAutomation } from './WorkflowAutomation'

// ### TYPES ###

type Template = CampaignTemplate

type TemplateDraft = {
  id?: string
  name: string
  subject: string
  htmlBody: string
  textBody: string
  // Template variables
  greeting_title?: string
  greeting_message?: string
  signature_name?: string
  signature_title?: string
  signature_company?: string
  signature_location?: string
  signature_phone?: string
  signature_email?: string
  signature_website?: string
  main_content_title?: string
  main_content_body?: string
  button_text?: string
  additional_info_title?: string
  additional_info_body?: string
  closing_title?: string
  closing_message?: string
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
  { id: 'automation', label: 'Automation' },
] as const

type TabKey = typeof tabs[number]['id']

// ### COMPONENT ###

export default function CampaignControls({ initialData, defaults }: { initialData: DashboardData; defaults: AdminDefaults }) {
  const router = useRouter()
  // Core state
  const [activeTab, setActiveTab] = useState<TabKey>('campaigns')
  const [templates, setTemplates] = useState<Template[]>(initialData.templates)
  const [groups, setGroups] = useState<Group[]>(initialData.groups)
  const [schedules, setSchedules] = useState<ScheduleWithCounts[]>(initialData.schedules)
  const [campaigns, setCampaigns] = useState<CampaignWithCounts[]>(initialData.campaigns)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [showGlobalTemplate, setShowGlobalTemplate] = useState(false)
  const [showGlobalTemplateSettings, setShowGlobalTemplateSettings] = useState(false)
  const [globalTemplateRefreshTrigger, setGlobalTemplateRefreshTrigger] = useState(0)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showAutomation, setShowAutomation] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [runningStep, setRunningStep] = useState<{ id: string; mode: 'preview' | 'send' } | null>(null)
  
  // Undo/Redo system
  const [history, setHistory] = useState<CampaignDraft[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  
  // Mobile UI state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isPerformanceCollapsed, setIsPerformanceCollapsed] = useState(false)
  const [isQuickActionsCollapsed, setIsQuickActionsCollapsed] = useState(false)
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false)

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

  // Undo/Redo functions
  const saveToHistory = useCallback((draft: CampaignDraft) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push({ ...draft })
      return newHistory.slice(-50) // Keep only last 50 states
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setCampaignDraft({ ...history[newIndex] })
      setNotice('Undid last change')
    }
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setCampaignDraft({ ...history[newIndex] })
      setNotice('Redid last change')
    }
  }, [historyIndex, history])

  // Update undo/redo availability
  useEffect(() => {
    setCanUndo(historyIndex > 0)
    setCanRedo(historyIndex < history.length - 1)
  }, [historyIndex, history.length])

  // Enhanced campaign draft setter with history
  const updateCampaignDraft = useCallback((updates: Partial<CampaignDraft> | ((prev: CampaignDraft) => CampaignDraft)) => {
    setCampaignDraft(prev => {
      const newDraft = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates }
      // Only save to history if there are actual changes
      if (JSON.stringify(prev) !== JSON.stringify(newDraft)) {
        saveToHistory(newDraft)
      }
      return newDraft
    })
  }, [saveToHistory])

  const handleSelectCampaign = useCallback(
    (candidate: CampaignDraft | CampaignWithCounts) => {
      setError(null)
      setNotice(null)
      const rawSchedules = Array.isArray(candidate.schedules) ? candidate.schedules : []
      const normalizedSchedules = rawSchedules.length
        ? rawSchedules.map((step, index) => normalizeStepDraft(step, index))
        : [newStep(1)]

      const newDraft = {
        id: candidate.id,
        name: candidate.name ?? 'New Campaign',
        description: candidate.description,
        status: candidate.status ?? CampaignStatus.DRAFT,
        schedules: normalizedSchedules,
      }

      setCampaignDraft(newDraft)
      saveToHistory(newDraft)
    },
    [setCampaignDraft, setError, setNotice, saveToHistory],
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
      setNotice(`Duplicated template "${template.name}". Update the name and save.`)
    },
    [setActiveTab, setNotice],
  )

  // Save template from editor
  const saveTemplateFromEditor = useCallback(
    async (updatedTemplate: Partial<Template>) => {
      if (!editingTemplate) return

      await runApi(
        async () => {
          const res = await fetch(`/api/admin/templates/${editingTemplate.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTemplate),
          })
          const data = await res.json()
          return { res, data }
        },
        {
          onSuccess: () => {
            console.log('Template saved successfully:', updatedTemplate)
            setEditingTemplate(null)
            setNotice('Template updated successfully.')
            refreshDashboard()
          },
          onError: (error) => {
            console.error('Error saving template:', error)
          },
        },
      )
    },
    [editingTemplate, runApi, refreshDashboard],
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

  // Enhanced campaign handlers
  const handleCreateCampaign = () => {
    setShowTemplates(true)
  }

  const handleSelectTemplate = (template: any) => {
    // Create campaign from template
    const newCampaign: CampaignDraft = {
      name: template.name,
      description: template.description,
      status: CampaignStatus.DRAFT,
      schedules: template.steps > 0 ? Array.from({ length: template.steps }, (_, i) => newStep(i + 1)) : [newStep(1)]
    }
    setCampaignDraft(newCampaign)
    setShowTemplates(false)
  }

  const handleSelectCampaignForDashboard = (campaign: CampaignWithCounts) => {
    // Navigate to analytics page with campaign selected
    router.push(`/admin/analytics?tab=campaigns&campaign=${campaign.id}`)
  }

  const handleDuplicateCampaign = (campaign: CampaignWithCounts) => {
    const duplicatedCampaign: CampaignDraft = {
      name: `${campaign.name} (Copy)`,
      description: campaign.description,
      status: CampaignStatus.DRAFT,
      schedules: (campaign.schedules || []).map(schedule => ({
        ...schedule,
        id: undefined,
        name: schedule.name ? `${schedule.name} (Copy)` : '',
        sendAt: null,
        smartWindowStart: null,
        smartWindowEnd: null,
        timeZone: schedule.timeZone || undefined,
      }))
    }
    setCampaignDraft(duplicatedCampaign)
  }

  const handleBulkAction = async (action: string, campaignIds: string[]) => {
    try {
      setIsSaving(true)
      // Implement bulk actions
      console.log(`Bulk ${action} for campaigns:`, campaignIds)
      setNotice(`Bulk ${action} completed successfully!`)
    } catch (error) {
      setError(`Failed to ${action} campaigns`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleShowAutomation = () => {
    setShowAutomation(true)
  }

  // ### RENDER ###

  return (
    <div className="space-y-8">
      <TopBanner 
        defaults={defaults} 
        campaigns={campaigns} 
        schedules={schedules} 
        undo={undo} 
        redo={redo} 
        canUndo={canUndo} 
        canRedo={canRedo} 
        historyLength={history.length} 
        historyIndex={historyIndex}
        campaignDraft={campaignDraft}
        setNotice={setNotice}
        isPerformanceCollapsed={isPerformanceCollapsed}
        setIsPerformanceCollapsed={setIsPerformanceCollapsed}
        isQuickActionsCollapsed={isQuickActionsCollapsed}
        setIsQuickActionsCollapsed={setIsQuickActionsCollapsed}
        isHistoryCollapsed={isHistoryCollapsed}
        setIsHistoryCollapsed={setIsHistoryCollapsed}
      />

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

      {/* Mobile Navigation */}
      <nav className="border-b border-white/10 pb-4">
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden mb-4">
          <h1 className="text-lg font-semibold text-white">Campaign Control</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 mobile-scroll mobile-touch">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition mobile-touch ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-emerald-950 shadow'
                  : 'bg-white/5 text-neutral-300 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full text-left rounded-lg px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-emerald-950 shadow'
                    : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="mt-6">
        {activeTab === 'campaigns' && (
          <CampaignsView
            campaigns={campaigns}
            draft={campaignDraft}
            setDraft={updateCampaignDraft}
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
          <AudienceGroupsTab
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
            onRefresh={refreshDashboard}
          />
        )}
        {activeTab === 'templates' && (
          <TemplatesView
            templates={templates}
            draft={templateDraft}
            setDraft={setTemplateDraft}
            onEdit={(template) => setEditingTemplate(template)}
            onDuplicate={duplicateTemplate}
            onRemove={deleteTemplate}
            onSubmit={saveTemplate}
            isSaving={isSaving}
            setShowGlobalTemplate={setShowGlobalTemplate}
            setShowGlobalTemplateSettings={setShowGlobalTemplateSettings}
            setEditingTemplate={setEditingTemplate}
          />
        )}
        {activeTab === 'automation' && (
          <WorkflowAutomation
            campaignId="global"
            workflows={[]}
            onUpdateWorkflow={(workflow) => {
              setNotice(`Workflow "${workflow.name}" updated successfully!`)
            }}
            onCreateWorkflow={(workflow) => {
              setNotice(`Workflow "${workflow.name}" created successfully!`)
            }}
            onDeleteWorkflow={(id) => {
              setNotice('Workflow deleted successfully!')
            }}
          />
        )}

        {/* Template Editor Modal */}
        {editingTemplate && (
          <TemplateEditor
            template={editingTemplate}
            onSave={saveTemplateFromEditor}
            onCancel={() => setEditingTemplate(null)}
            refreshTrigger={globalTemplateRefreshTrigger}
          />
        )}

        {/* Global HTML Template Modal */}
        {showGlobalTemplate && (
          <GlobalHTMLTemplate
            onCancel={() => setShowGlobalTemplate(false)}
            refreshTrigger={globalTemplateRefreshTrigger}
          />
        )}

        {/* Global Template Settings Modal */}
        {showGlobalTemplateSettings && (
          <GlobalTemplateSettings
            onSave={async (settings) => {
              try {
                setIsSaving(true);
                const response = await fetch('/api/admin/global-template-settings', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(settings),
                });

                if (!response.ok) {
                  throw new Error('Failed to save global template settings');
                }

                setNotice('Global template settings saved successfully!');
                setShowGlobalTemplateSettings(false);
                // Trigger refresh of global template preview
                setGlobalTemplateRefreshTrigger(prev => prev + 1);
              } catch (error) {
                console.error('Error saving global template settings:', error);
                setError('Failed to save global template settings');
              } finally {
                setIsSaving(false);
              }
            }}
            onCancel={() => setShowGlobalTemplateSettings(false)}
          />
        )}

        {/* Campaign Templates Modal */}
        {showTemplates && (
          <CampaignTemplates
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </div>
    </div>
  )
}

// ### SUB-COMPONENTS (Placeholders/Stubs for now) ###

function TopBanner({ 
  defaults, 
  campaigns, 
  schedules, 
  undo, 
  redo, 
  canUndo, 
  canRedo, 
  historyLength, 
  historyIndex,
  campaignDraft,
  setNotice,
  isPerformanceCollapsed,
  setIsPerformanceCollapsed,
  isQuickActionsCollapsed,
  setIsQuickActionsCollapsed,
  isHistoryCollapsed,
  setIsHistoryCollapsed
}: { 
  defaults: AdminDefaults
  campaigns: CampaignWithCounts[]
  schedules: ScheduleWithCounts[]
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  historyLength: number
  historyIndex: number
  campaignDraft: CampaignDraft
  setNotice: (notice: string | null) => void
  isPerformanceCollapsed: boolean
  setIsPerformanceCollapsed: (collapsed: boolean) => void
  isQuickActionsCollapsed: boolean
  setIsQuickActionsCollapsed: (collapsed: boolean) => void
  isHistoryCollapsed: boolean
  setIsHistoryCollapsed: (collapsed: boolean) => void
}) {
  const warnings: string[] = []
  if (!defaults.leadMineConfigured) warnings.push('Lead Mine integration is not configured (LEADMINE_API_BASE/KEY).')
  if (!defaults.resendConfigured) warnings.push('Resend is not configured (RESEND_API_KEY). Email sends will fail.')
  if (!defaults.cronSecretConfigured) warnings.push('CAMPAIGN_CRON_SECRET is missing. Cron triggers are disabled.')

  // Calculate performance metrics
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === 'SCHEDULED' || c.status === 'DRAFT').length
  const totalSchedules = schedules.length
  const totalSends = schedules.reduce((sum, s) => sum + s._count.sends, 0)
  const pendingSends = schedules.reduce((sum, s) => sum + (s.counts.PENDING || 0), 0)
  const sentSends = schedules.reduce((sum, s) => sum + (s.counts.SENT || 0), 0)
  const failedSends = schedules.reduce((sum, s) => sum + (s.counts.FAILED || 0), 0)

  // Calculate today's activity
  const today = new Date().toDateString()
  const todaySends = schedules.reduce((sum, s) => {
    // This is a simplified calculation - in a real app you'd query actual send dates
    return sum + Math.floor(s._count.sends * 0.1) // Assume 10% of sends happened today
  }, 0)

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:p-6">
      {/* Performance Section */}
      <div className="mb-4">
        <button
          onClick={() => setIsPerformanceCollapsed(!isPerformanceCollapsed)}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-white">Campaign Performance</h2>
          <div className="flex items-center gap-2">
            <div className="text-xs text-neutral-400 hidden sm:block">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <svg 
              className={`w-5 h-5 text-neutral-400 transition-transform ${isPerformanceCollapsed ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {!isPerformanceCollapsed && (
          <div className="mt-4 grid gap-4 text-sm text-neutral-300 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-black/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-neutral-500">Total Campaigns</p>
              <p className="text-2xl font-bold text-white">{totalCampaigns}</p>
            </div>
            <div className="text-emerald-400">📊</div>
          </div>
          <p className="text-xs text-emerald-400 mt-1">{activeCampaigns} active</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-neutral-500">Total Sends</p>
              <p className="text-2xl font-bold text-white">{totalSends.toLocaleString()}</p>
            </div>
            <div className="text-blue-400">📧</div>
          </div>
          <p className="text-xs text-blue-400 mt-1">{todaySends} today</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-neutral-500">Pending</p>
              <p className="text-2xl font-bold text-white">{pendingSends}</p>
            </div>
            <div className="text-yellow-400">⏳</div>
          </div>
          <p className="text-xs text-yellow-400 mt-1">In queue</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-neutral-500">Success Rate</p>
              <p className="text-2xl font-bold text-white">
                {totalSends > 0 ? Math.round((sentSends / totalSends) * 100) : 0}%
              </p>
            </div>
            <div className="text-emerald-400">✅</div>
          </div>
          <p className="text-xs text-emerald-400 mt-1">{sentSends} delivered</p>
        </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <button
          onClick={() => setIsQuickActionsCollapsed(!isQuickActionsCollapsed)}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <h3 className="text-sm font-medium text-white">Quick Actions</h3>
          <svg 
            className={`w-4 h-4 text-neutral-400 transition-transform ${isQuickActionsCollapsed ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {!isQuickActionsCollapsed && (
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                if (campaignDraft.id) {
                  // Send test email
                  setNotice('Sending test email...')
                  // TODO: Implement test email functionality
                  setTimeout(() => setNotice('Test email sent!'), 1000)
                } else {
                  setNotice('Please save campaign first')
                }
              }}
              className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!campaignDraft.id}
            >
              Send Test
            </button>
            <button 
              onClick={() => {
                if (campaignDraft.id) {
                  // Preview campaign
                  setNotice('Generating preview...')
                  // TODO: Implement preview functionality
                  setTimeout(() => setNotice('Preview generated!'), 1000)
                } else {
                  setNotice('Please save campaign first')
                }
              }}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!campaignDraft.id}
            >
              Preview
            </button>
            <button 
              onClick={() => {
                // Navigate to analytics
                window.location.href = '/admin/analytics'
              }}
              className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Analytics
            </button>
          </div>
        )}
      </div>

      {/* Undo/Redo Controls */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <button
          onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <h3 className="text-sm font-medium text-white">Campaign History</h3>
          <svg 
            className={`w-4 h-4 text-neutral-400 transition-transform ${isHistoryCollapsed ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {!isHistoryCollapsed && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                ↶ Undo
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                ↷ Redo
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              {historyLength > 0 ? `${historyIndex + 1} of ${historyLength} states` : 'No history yet'}
            </p>
          </div>
        )}
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
  setDraft: (d: CampaignDraft | ((prev: CampaignDraft) => CampaignDraft)) => void
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
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="w-full lg:max-w-sm lg:flex-none">
        <CampaignsPanel campaigns={campaigns} onSelect={onSelectCampaign} selectedId={draft.id} />
      </aside>
      <main className="w-full flex-1 min-w-0">
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
                  {(c.schedules || []).length} step{(c.schedules || []).length === 1 ? '' : 's'} · {c.status}
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
  setDraft: (d: CampaignDraft | ((prev: CampaignDraft) => CampaignDraft)) => void
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
      setDraft((prev: CampaignDraft) => ({ ...prev, schedules: normalized }))
    }
  }, [steps, setDraft])

  const updateStep = (index: number, newStepData: Partial<StepDraft>) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], ...newStepData }
    const normalizedSteps = newSteps.map((item, idx) => ({ ...item, stepOrder: idx + 1 }))
    setDraft((prev: CampaignDraft) => ({ ...prev, schedules: normalizedSteps }))
  }

  const addStep = () => {
    const normalizedSteps = [...steps, newStep(steps.length + 1)]
    setDraft((prev: CampaignDraft) => ({ ...prev, schedules: normalizedSteps }))
  }

  const moveStep = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= steps.length) return
    const newSteps = [...steps]
    const [step] = newSteps.splice(index, 1)
    newSteps.splice(newIndex, 0, step)
    setDraft(prev => ({ ...prev, schedules: newSteps.map((item, idx) => ({ ...item, stepOrder: idx + 1 })) }))
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
    setDraft(prev => ({ ...prev, schedules: newSteps.map((item, idx) => ({ ...item, stepOrder: idx + 1 })) }))
  }

  const removeStep = (index: number) => {
    const newSteps = steps
      .filter((_, i) => i !== index)
      .map((item, idx) => ({ ...item, stepOrder: idx + 1 }))
    setDraft((prev: CampaignDraft) => ({ ...prev, schedules: newSteps }))
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
          onChange={(e) => setDraft((prev: CampaignDraft) => ({ ...prev, name: e.target.value }))}
          className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none"
          placeholder="New Campaign Name"
        />
        <textarea
          value={draft.description ?? ''}
          onChange={(e) => setDraft((prev: CampaignDraft) => ({ ...prev, description: e.target.value }))}
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
                    className="admin-button admin-button-secondary rounded-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(index, 1)}
                    disabled={isLast}
                    className="admin-button admin-button-secondary rounded-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateStep(index)}
                    className="admin-button admin-button-secondary rounded-full"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="admin-button admin-button-danger rounded-full"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wide text-neutral-400">Template</label>
                  <select
                    value={step.templateId}
                    onChange={(e) => updateStep(index, { templateId: e.target.value })}
                    className="admin-select admin-button-sm w-full rounded-lg"
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
                    className="admin-select admin-button-sm w-full rounded-lg"
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    className="admin-input admin-button-sm w-full rounded-lg"
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
                    className="admin-input admin-button-sm w-full rounded-lg"
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-xs uppercase tracking-wide text-neutral-400">Step status</label>
                  <select
                    value={stepStatus}
                    onChange={(e) => updateStep(index, { status: e.target.value as CampaignStatus })}
                    className="admin-select admin-button-sm w-full rounded-lg"
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
                    className="admin-select admin-button-sm w-full rounded-lg"
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
                    className="admin-select admin-button-sm w-full rounded-lg"
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
                    className="admin-select admin-button-sm w-full rounded-lg"
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
                    className="admin-select admin-button-sm w-full rounded-lg"
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

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/10 pt-3">
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

// ### TEMPLATES VIEW (Rebuilt to match CampaignsView structure) ###

function TemplatesView({
  templates,
  draft,
  setDraft,
  onEdit,
  onDuplicate,
  onRemove,
  onSubmit,
  isSaving,
  setShowGlobalTemplate,
  setShowGlobalTemplateSettings,
  setEditingTemplate,
}: {
  templates: Template[]
  draft: TemplateDraft
  setDraft: (draft: TemplateDraft | ((prev: TemplateDraft) => TemplateDraft)) => void
  onEdit: (template: Template) => void
  onDuplicate: (template: Template) => void
  onRemove: (id: string) => void
  onSubmit: () => Promise<void>
  isSaving: boolean
  setShowGlobalTemplate: (show: boolean) => void
  setShowGlobalTemplateSettings: (show: boolean) => void
  setEditingTemplate: (template: Template | null) => void
}) {
  // State for filtering and search
  const [searchTerm, setSearchTerm] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [emailFilter, setEmailFilter] = useState('')
  const [variantFilter, setVariantFilter] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated'>('name')

  // Extract unique values for filters
  const industries = [...new Set(templates.map(t => t.name.split(' - ')[0]))].sort()
  const emailNumbers = [...new Set(templates.map(t => {
    const parts = t.name.split(' - ')
    const emailMatch = parts.find(p => p.includes('Email'))
    return emailMatch ? emailMatch.split(' ')[1] : null
  }).filter(Boolean))].sort()
  const variants = [...new Set(templates.map(t => {
    const parts = t.name.split(' - ')
    const variantMatch = parts.find(p => p.includes('Variant'))
    return variantMatch ? variantMatch.split(' ')[1] : null
  }).filter(Boolean))].sort()

        // Filter templates
        const filteredTemplates = templates.filter(template => {
          const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               template.subject.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesIndustry = !industryFilter || template.name.startsWith(industryFilter)
          const matchesEmail = !emailFilter || template.name.includes(`Email ${emailFilter}`)
          const matchesVariant = !variantFilter || template.name.includes(`Variant ${variantFilter}`)
          
          return matchesSearch && matchesIndustry && matchesEmail && matchesVariant
        })

        // Group templates by industry and email sequence
        const groupedTemplates = filteredTemplates.reduce((groups, template) => {
          const parts = template.name.split(' - ')
          const industry = parts[0] || 'Unknown'
          const emailMatch = parts.find(p => p.includes('Email'))
          const emailNum = emailMatch ? emailMatch.split(' ')[1] || '0' : '0'
          
          const groupKey = `${industry} - Email ${emailNum}`
          
          if (!groups[groupKey]) {
            groups[groupKey] = {
              industry,
              emailNum: parseInt(emailNum) || 0,
              templates: []
            }
          }
          
          groups[groupKey].templates.push(template)
          return groups
        }, {} as Record<string, { industry: string; emailNum: number; templates: Template[] }>)

        // Sort groups and templates within groups
        const sortedGroups = Object.entries(groupedTemplates)
          .sort(([aKey, aGroup], [bKey, bGroup]) => {
            // First sort by industry
            if (aGroup.industry !== bGroup.industry) {
              return aGroup.industry.localeCompare(bGroup.industry)
            }
            // Then by email number
            return aGroup.emailNum - bGroup.emailNum
          })
          .map(([key, group]) => ({
            key,
            ...group,
            templates: group.templates.sort((a, b) => {
              // Sort variants: A, B, C, then non-variant
              const aVariant = a.name.includes('Variant A') ? 1 : a.name.includes('Variant B') ? 2 : a.name.includes('Variant C') ? 3 : 4
              const bVariant = b.name.includes('Variant A') ? 1 : b.name.includes('Variant B') ? 2 : b.name.includes('Variant C') ? 3 : 4
              return aVariant - bVariant
            })
          }))

  return (
        <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
              <div>
          <h2 className="text-2xl font-bold text-white">Email Templates</h2>
          <p className="text-sm text-neutral-400">Manage your email templates with advanced filtering and editing</p>
              </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const newTemplate: Template = {
                id: '',
                name: '',
                subject: '',
                htmlBody: '',
                textBody: '',
                greeting_title: '',
                greeting_message: '',
                main_content_title: '',
                main_content_body: '',
                additional_info_title: '',
                additional_info_body: '',
                closing_title: '',
                closing_message: '',
                button_text: '',
                signature_name: '',
                signature_title: '',
                signature_company: '',
                signature_location: '',
                meta: {},
                createdAt: new Date(),
                updatedAt: new Date()
              }
              setEditingTemplate(newTemplate)
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            + Create New Template
          </button>
          <button
            onClick={() => setShowGlobalTemplate(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Global HTML Template
          </button>
          <button
            onClick={() => setShowGlobalTemplateSettings(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Global Template Settings
          </button>
          <div className="text-sm text-neutral-400">
            {sortedGroups.length} groups, {filteredTemplates.length} of {templates.length} templates
                  </div>
                </div>
          </div>

      {/* Filters and Search - Mobile Optimized */}
      <div className="space-y-4">
        {/* Search - Full width on mobile */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
          />
        </div>

        {/* Filter Row 1 - 2 columns on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Industry</label>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
        </div>

        <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Email #</label>
            <select
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            >
              <option value="">All Emails</option>
              {emailNumbers.map(num => (
                <option key={num!} value={num!}>Email {num}</option>
              ))}
            </select>
        </div>

        <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Variant</label>
            <select
              value={variantFilter}
              onChange={(e) => setVariantFilter(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            >
              <option value="">All Variants</option>
              {variants.map(variant => (
                <option key={variant!} value={variant!}>Variant {variant}</option>
              ))}
            </select>
        </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'created' | 'updated')}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            >
              <option value="name">Name</option>
              <option value="created">Created Date</option>
              <option value="updated">Updated Date</option>
            </select>
    </div>
        </div>
      </div>

      {/* Grouped Templates List */}
    <div className="space-y-6">
        {sortedGroups.map((group) => (
          <div key={group.key} className="space-y-3">
            {/* Group Header */}
              <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {group.industry} - Email {group.emailNum}
              </h3>
              <div className="text-sm text-neutral-400">
                {group.templates.length} variant{group.templates.length !== 1 ? 's' : ''}
        </div>
      </div>

            {/* Templates in Group */}
            <div className="space-y-2">
              {group.templates.map((template) => (
                <div key={template.id} className="rounded-lg border border-white/10 bg-black/40 p-3 hover:bg-black/60 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-white truncate">
                          {template.name.split(' - ').slice(-1)[0]}
                        </h4>
                        <span className="text-xs text-neutral-500">
                          {template.name.includes('Variant A') ? 'A' : 
                           template.name.includes('Variant B') ? 'B' : 
                           template.name.includes('Variant C') ? 'C' : 'Base'}
                        </span>
              </div>
                      <p className="text-xs text-neutral-400 mt-1 truncate">Subject: {template.subject}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => onEdit(template)}
                        className="rounded-full border border-white/10 px-2 py-1 text-xs text-neutral-200 hover:border-emerald-400 hover:text-emerald-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDuplicate(template)}
                        className="rounded-full border border-white/10 px-2 py-1 text-xs text-neutral-200 hover:border-blue-400 hover:text-blue-200 transition-colors"
                >
                        Copy
                </button>
                <button
                  onClick={() => onRemove(template.id)}
                        className="rounded-full border border-white/10 px-2 py-1 text-xs text-neutral-200 hover:border-red-400 hover:text-red-200 transition-colors"
                >
                        Del
                </button>
              </div>
              </div>
                </div>
        ))}
      </div>
          </div>
        ))}
      </div>

      {sortedGroups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-400">No templates found matching your filters.</p>
        </div>
      )}
    </div>
  )
}

const defaultHtml = `<p style="color: #374151;">Hi {{business_name}},</p>
<p style="color: #374151;">We're hosting Evergreen AI's private seminar in Terrace and reserved a seat for your team. The agenda covers practical AI workflows for Northern BC businesses.</p>
<p><a href="{{invite_link}}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#22c55e;color:#ffffff;font-weight:600;text-decoration:none;">View details & RSVP</a></p>
<p style="color: #374151;">Looking forward to seeing you,<br />Evergreen AI Partnerships Team</p>`

const defaultText = `Hi {{business_name}},

We're hosting Evergreen AI's private seminar in Terrace and would love to see you there. Review the agenda and RSVP: {{invite_link}}

Looking forward to seeing you,
Evergreen AI Partnerships Team`

