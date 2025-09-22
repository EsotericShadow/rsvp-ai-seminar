'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  Cog6ToothIcon, 
  PlayIcon, 
  PauseIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UsersIcon,
  EnvelopeIcon,
  ChartBarIcon,
  ArrowRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

type WorkflowTrigger = {
  id: string
  name: string
  type: 'time' | 'event' | 'condition' | 'manual'
  description: string
  isActive: boolean
  conditions: string[]
  actions: string[]
  icon: React.ReactNode
  color: string
}

type WorkflowRule = {
  id: string
  name: string
  description?: string
  triggerType: string
  triggerConfig: any
  conditions: any[]
  actions: any[]
  isEnabled: boolean
  lastRun?: string
  nextRun?: string
  runCount: number
  createdAt: string
  updatedAt: string
  campaignId?: string
  executions?: Array<{
    id: string
    status: string
    startedAt: string
    completedAt?: string
    error?: string
  }>
}

type WorkflowAutomationProps = {
  campaignId: string
  workflows: WorkflowRule[]
  onUpdateWorkflow: (workflow: WorkflowRule) => void
  onCreateWorkflow: (workflow: Omit<WorkflowRule, 'id'>) => void
  onDeleteWorkflow: (id: string) => void
}

const availableTriggers: WorkflowTrigger[] = [
  {
    id: 'rsvp-reminder',
    name: 'RSVP Reminder',
    type: 'time',
    description: 'Send reminder emails to non-responders',
    isActive: true,
    conditions: ['3 days before event', '1 day before event', '2 hours before event'],
    actions: ['Send reminder email', 'Update RSVP status', 'Add to follow-up list'],
    icon: <ClockIcon className="h-5 w-5" />,
    color: 'text-primary-400'
  },
  {
    id: 'rsvp-received',
    name: 'RSVP Received',
    type: 'event',
    description: 'Trigger when someone RSVPs',
    isActive: true,
    conditions: ['RSVP confirmed', 'RSVP declined', 'RSVP maybe'],
    actions: ['Send confirmation email', 'Update attendee list', 'Send calendar invite'],
    icon: <CheckCircleIcon className="h-5 w-5" />,
    color: 'text-success-400'
  },
  {
    id: 'event-approaching',
    name: 'Event Approaching',
    type: 'time',
    description: 'Trigger as event date approaches',
    isActive: true,
    conditions: ['1 week before', '3 days before', '1 day before'],
    actions: ['Send final details', 'Update venue capacity', 'Send parking info'],
    icon: <EnvelopeIcon className="h-5 w-5" />,
    color: 'text-info-400'
  },
  {
    id: 'capacity-reached',
    name: 'Capacity Reached',
    type: 'condition',
    description: 'Trigger when event reaches capacity',
    isActive: true,
    conditions: ['Max attendees reached', 'Waitlist activated', 'Registration closed'],
    actions: ['Close RSVP', 'Start waitlist', 'Send capacity notice'],
    icon: <UsersIcon className="h-5 w-5" />,
    color: 'text-warning-400'
  },
  {
    id: 'low-response',
    name: 'Low Response Rate',
    type: 'condition',
    description: 'Trigger when response rate is low',
    isActive: true,
    conditions: ['< 20% response rate', '< 50% after 3 days', 'Declining responses'],
    actions: ['Send follow-up campaign', 'Adjust messaging', 'Extend deadline'],
    icon: <ExclamationTriangleIcon className="h-5 w-5" />,
    color: 'text-error-400'
  },
  {
    id: 'event-cancelled',
    name: 'Event Cancelled',
    type: 'manual',
    description: 'Trigger when event is cancelled',
    isActive: true,
    conditions: ['Admin cancels event', 'Venue issues', 'Weather concerns'],
    actions: ['Send cancellation notice', 'Process refunds', 'Update calendar'],
    icon: <PlayIcon className="h-5 w-5" />,
    color: 'text-neutral-400'
  }
]

export function WorkflowAutomation({
  campaignId,
  workflows: initialWorkflows,
  onUpdateWorkflow,
  onCreateWorkflow,
  onDeleteWorkflow
}: WorkflowAutomationProps) {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>(initialWorkflows)
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTrigger, setSelectedTrigger] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showGlobalSettings, setShowGlobalSettings] = useState(false)

  // Fetch workflows on mount
  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/workflows')
      if (response.ok) {
        const data = await response.json()
        setWorkflows(data.workflows)
      }
    } catch (error) {
      console.error('Error fetching workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      if (filterStatus === 'all') return true
      if (filterStatus === 'active') return workflow.isEnabled
      if (filterStatus === 'inactive') return !workflow.isEnabled
      return true
    })
  }, [workflows, filterStatus])

  const activeWorkflows = workflows.filter(w => w.isEnabled).length
  const totalWorkflows = workflows.length

  const handleCreateWorkflow = async () => {
    if (!selectedTrigger) return
    
    const trigger = availableTriggers.find(t => t.id === selectedTrigger)
    if (!trigger) return

    try {
      setLoading(true)
      const response = await fetch('/api/admin/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `New ${trigger.name} Workflow`,
          description: trigger.description,
          triggerType: trigger.type,
          triggerConfig: { triggerId: trigger.id },
          conditions: [],
          actions: [],
          campaignId: campaignId === 'global' ? null : campaignId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setWorkflows(prev => [data.workflow, ...prev])
        onCreateWorkflow(data.workflow)
        setShowCreateForm(false)
        setSelectedTrigger('')
      }
    } catch (error) {
      console.error('Error creating workflow:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleWorkflow = async (workflow: WorkflowRule) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/workflows/${workflow.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !workflow.isEnabled })
      })

      if (response.ok) {
        const data = await response.json()
        setWorkflows(prev => prev.map(w => w.id === workflow.id ? data.workflow : w))
        onUpdateWorkflow(data.workflow)
      }
    } catch (error) {
      console.error('Error toggling workflow:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/workflows/${workflowId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setWorkflows(prev => prev.filter(w => w.id !== workflowId))
        onDeleteWorkflow(workflowId)
      }
    } catch (error) {
      console.error('Error deleting workflow:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (isEnabled: boolean) => {
    return isEnabled 
      ? 'bg-success-500/10 text-success-200 border-success-500/20'
      : 'bg-neutral-500/10 text-neutral-200 border-neutral-500/20'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <Cog6ToothIcon className="h-6 w-6 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {campaignId === 'global' ? 'Global Workflow Automation' : 'Campaign Automation'}
            </h3>
            <p className="text-sm text-neutral-400">
              {activeWorkflows} of {totalWorkflows} workflows active
              {campaignId === 'global' && ' • Global automation rules'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {campaignId === 'global' && (
            <button
              onClick={() => setShowGlobalSettings(true)}
              className="px-3 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 flex items-center gap-2"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              Settings
            </button>
          )}
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            New Workflow
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Active Workflows</p>
              <p className="text-2xl font-bold text-success-200">{activeWorkflows}</p>
            </div>
            <PlayIcon className="h-8 w-8 text-success-400" />
          </div>
        </div>
        
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Total Runs</p>
              <p className="text-2xl font-bold text-primary-200">
                {workflows.reduce((sum, w) => sum + w.runCount, 0)}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-primary-400" />
          </div>
        </div>
        
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Success Rate</p>
              <p className="text-2xl font-bold text-info-200">94%</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-info-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as 'all' | 'active' | 'inactive')}
              className={`px-3 py-1 text-sm rounded-lg ${
                filterStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Global Automation Features */}
      {campaignId === 'global' && (
        <div className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700">
          <h4 className="text-lg font-semibold text-white mb-4">RSVP Automation Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="font-medium text-white">Smart Reminders</h5>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Auto-send reminder emails to non-responders</li>
                <li>• Escalating reminder frequency based on urgency</li>
                <li>• Timezone-aware reminder scheduling</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-white">Response Management</h5>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Auto-confirm RSVPs and send calendar invites</li>
                <li>• Handle waitlist management when capacity reached</li>
                <li>• Track and follow up on "maybe" responses</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-white">Event Coordination</h5>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Send event details as date approaches</li>
                <li>• Auto-update venue capacity and logistics</li>
                <li>• Handle last-minute changes and cancellations</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-white">Analytics & Alerts</h5>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Monitor response rates and send alerts</li>
                <li>• Track engagement patterns for future events</li>
                <li>• Generate attendance reports automatically</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Workflows List */}
      <div className="space-y-4">
        {filteredWorkflows.length === 0 ? (
          <div className="text-center py-12">
            <Cog6ToothIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No workflows found</h3>
            <p className="text-neutral-400 mb-4">
              {filterStatus === 'all' 
                ? campaignId === 'global' 
                  ? 'Create your first global automation workflow'
                  : 'Create your first workflow to automate your campaigns'
                : `No ${filterStatus} workflows found`
              }
            </p>
            {filterStatus === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Create Workflow
              </button>
            )}
          </div>
        ) : (
          filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onToggle={handleToggleWorkflow}
              onDelete={handleDeleteWorkflow}
              getStatusColor={getStatusColor}
              loading={loading}
            />
          ))
        )}
      </div>

      {/* Create Workflow Modal */}
      {showCreateForm && (
        <CreateWorkflowModal
          triggers={availableTriggers}
          selectedTrigger={selectedTrigger}
          onSelectTrigger={setSelectedTrigger}
          onCreate={handleCreateWorkflow}
          onClose={() => {
            setShowCreateForm(false)
            setSelectedTrigger('')
          }}
        />
      )}

      {/* Global Settings Modal */}
      {showGlobalSettings && (
        <GlobalSettingsModal
          onClose={() => setShowGlobalSettings(false)}
        />
      )}
    </div>
  )
}

function GlobalSettingsModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState({
    autoReminderEmails: true,
    reminderFrequency: 'escalating', // 'fixed' | 'escalating'
    timezoneAwareReminders: true,
    autoConfirmRSVPs: true,
    autoSendCalendarInvites: true,
    waitlistManagement: true,
    capacityAlerts: true,
    responseRateMonitoring: true,
    lowResponseAlerts: true,
    eventDetailsReminders: true,
    lastMinuteChangeHandling: true,
    attendanceReportGeneration: true,
  })

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving global automation settings:', settings)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-2xl border border-neutral-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Global Automation Settings</h3>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-white mb-3">Reminder Automation</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Auto-send reminder emails</span>
                  <input
                    type="checkbox"
                    checked={settings.autoReminderEmails}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoReminderEmails: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Reminder frequency</span>
                  <select
                    value={settings.reminderFrequency}
                    onChange={(e) => setSettings(prev => ({ ...prev, reminderFrequency: e.target.value as 'fixed' | 'escalating' }))}
                    className="px-3 py-1 bg-neutral-700 border border-neutral-600 rounded text-white text-sm"
                  >
                    <option value="fixed">Fixed intervals</option>
                    <option value="escalating">Escalating frequency</option>
                  </select>
                </div>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Timezone-aware reminders</span>
                  <input
                    type="checkbox"
                    checked={settings.timezoneAwareReminders}
                    onChange={(e) => setSettings(prev => ({ ...prev, timezoneAwareReminders: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">RSVP Management</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Auto-confirm RSVPs</span>
                  <input
                    type="checkbox"
                    checked={settings.autoConfirmRSVPs}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoConfirmRSVPs: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Auto-send calendar invites</span>
                  <input
                    type="checkbox"
                    checked={settings.autoSendCalendarInvites}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoSendCalendarInvites: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Waitlist management</span>
                  <input
                    type="checkbox"
                    checked={settings.waitlistManagement}
                    onChange={(e) => setSettings(prev => ({ ...prev, waitlistManagement: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Monitoring & Alerts</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Capacity alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.capacityAlerts}
                    onChange={(e) => setSettings(prev => ({ ...prev, capacityAlerts: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Response rate monitoring</span>
                  <input
                    type="checkbox"
                    checked={settings.responseRateMonitoring}
                    onChange={(e) => setSettings(prev => ({ ...prev, responseRateMonitoring: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Low response alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.lowResponseAlerts}
                    onChange={(e) => setSettings(prev => ({ ...prev, lowResponseAlerts: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Event details reminders</span>
                  <input
                    type="checkbox"
                    checked={settings.eventDetailsReminders}
                    onChange={(e) => setSettings(prev => ({ ...prev, eventDetailsReminders: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Last-minute change handling</span>
                  <input
                    type="checkbox"
                    checked={settings.lastMinuteChangeHandling}
                    onChange={(e) => setSettings(prev => ({ ...prev, lastMinuteChangeHandling: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Attendance report generation</span>
                  <input
                    type="checkbox"
                    checked={settings.attendanceReportGeneration}
                    onChange={(e) => setSettings(prev => ({ ...prev, attendanceReportGeneration: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-neutral-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function WorkflowCard({
  workflow,
  onToggle,
  onDelete,
  getStatusColor,
  loading
}: {
  workflow: WorkflowRule
  onToggle: (workflow: WorkflowRule) => void
  onDelete: (id: string) => void
  getStatusColor: (isEnabled: boolean) => string
  loading: boolean
}) {
  const handleToggle = () => {
    onToggle(workflow)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${workflow.name}"?`)) {
      onDelete(workflow.id)
    }
  }

  // Get trigger info from available triggers
  const triggerInfo = availableTriggers.find(t => t.id === workflow.triggerConfig?.triggerId) || {
    name: workflow.triggerType,
    description: workflow.description || 'Custom trigger',
    icon: <Cog6ToothIcon className="h-5 w-5" />,
    color: 'text-neutral-400'
  }

  return (
    <div className="border border-white/10 rounded-lg p-4 hover:border-primary-400 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${triggerInfo.color}`}>
            {triggerInfo.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-white">{workflow.name}</h4>
              <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(workflow.isEnabled)}`}>
                {workflow.isEnabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-neutral-400 mb-2">{triggerInfo.description}</p>
            
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span>Runs: {workflow.runCount}</span>
              {workflow.lastRun && (
                <span>Last run: {new Date(workflow.lastRun).toLocaleDateString()}</span>
              )}
              {workflow.nextRun && (
                <span>Next run: {new Date(workflow.nextRun).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`p-2 rounded-lg ${
              workflow.isEnabled 
                ? 'text-warning-400 hover:bg-warning-500/10' 
                : 'text-success-400 hover:bg-success-500/10'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={workflow.isEnabled ? 'Pause workflow' : 'Activate workflow'}
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : workflow.isEnabled ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className={`p-2 text-error-400 hover:bg-error-500/10 rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Delete workflow"
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function CreateWorkflowModal({
  triggers,
  selectedTrigger,
  onSelectTrigger,
  onCreate,
  onClose
}: {
  triggers: WorkflowTrigger[]
  selectedTrigger: string
  onSelectTrigger: (triggerId: string) => void
  onCreate: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-2xl border border-neutral-700 w-full max-w-2xl">
        <div className="p-6 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Create New Workflow</h3>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Choose Trigger Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {triggers.map((trigger) => (
                  <button
                    key={trigger.id}
                    onClick={() => onSelectTrigger(trigger.id)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedTrigger === trigger.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-white/10 hover:border-primary-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${trigger.color}`}>
                        {trigger.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{trigger.name}</h4>
                        <p className="text-sm text-neutral-400">{trigger.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-neutral-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              disabled={!selectedTrigger}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Workflow
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
