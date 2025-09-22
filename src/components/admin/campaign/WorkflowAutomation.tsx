'use client'

import { useState, useMemo } from 'react'
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
  trigger: WorkflowTrigger
  conditions: Array<{
    field: string
    operator: string
    value: string
  }>
  actions: Array<{
    type: string
    config: any
  }>
  isEnabled: boolean
  lastRun?: string
  nextRun?: string
  runCount: number
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
    id: 'schedule',
    name: 'Scheduled Time',
    type: 'time',
    description: 'Trigger at a specific time or interval',
    isActive: true,
    conditions: ['Every day at 9 AM', 'Every Monday', 'First of month'],
    actions: ['Send email', 'Pause campaign', 'Update audience'],
    icon: <ClockIcon className="h-5 w-5" />,
    color: 'text-primary-400'
  },
  {
    id: 'email-opened',
    name: 'Email Opened',
    type: 'event',
    description: 'Trigger when recipient opens an email',
    isActive: true,
    conditions: ['Opens specific email', 'Opens any email', 'Opens within timeframe'],
    actions: ['Send follow-up', 'Add to segment', 'Update profile'],
    icon: <EnvelopeIcon className="h-5 w-5" />,
    color: 'text-success-400'
  },
  {
    id: 'email-clicked',
    name: 'Email Clicked',
    type: 'event',
    description: 'Trigger when recipient clicks a link',
    isActive: true,
    conditions: ['Clicks specific link', 'Clicks any link', 'Clicks multiple times'],
    actions: ['Send targeted email', 'Add to hot leads', 'Schedule call'],
    icon: <ChartBarIcon className="h-5 w-5" />,
    color: 'text-info-400'
  },
  {
    id: 'unsubscribe',
    name: 'Unsubscribed',
    type: 'event',
    description: 'Trigger when someone unsubscribes',
    isActive: true,
    conditions: ['Unsubscribes from campaign', 'Unsubscribes from all'],
    actions: ['Send goodbye email', 'Remove from lists', 'Update preferences'],
    icon: <ExclamationTriangleIcon className="h-5 w-5" />,
    color: 'text-error-400'
  },
  {
    id: 'audience-size',
    name: 'Audience Size',
    type: 'condition',
    description: 'Trigger based on audience size changes',
    isActive: true,
    conditions: ['Audience grows by X', 'Audience shrinks by X', 'Reaches threshold'],
    actions: ['Send notification', 'Adjust send rate', 'Split audience'],
    icon: <UsersIcon className="h-5 w-5" />,
    color: 'text-warning-400'
  },
  {
    id: 'manual',
    name: 'Manual Trigger',
    type: 'manual',
    description: 'Trigger manually or via API',
    isActive: true,
    conditions: ['API call', 'Button click', 'Admin action'],
    actions: ['Send email', 'Update campaign', 'Export data'],
    icon: <PlayIcon className="h-5 w-5" />,
    color: 'text-neutral-400'
  }
]

export function WorkflowAutomation({
  campaignId,
  workflows,
  onUpdateWorkflow,
  onCreateWorkflow,
  onDeleteWorkflow
}: WorkflowAutomationProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTrigger, setSelectedTrigger] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showGlobalSettings, setShowGlobalSettings] = useState(false)

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

  const handleCreateWorkflow = () => {
    if (!selectedTrigger) return
    
    const trigger = availableTriggers.find(t => t.id === selectedTrigger)
    if (!trigger) return

    const newWorkflow: Omit<WorkflowRule, 'id'> = {
      name: `New ${trigger.name} Workflow`,
      trigger,
      conditions: [],
      actions: [],
      isEnabled: false,
      runCount: 0
    }

    onCreateWorkflow(newWorkflow)
    setShowCreateForm(false)
    setSelectedTrigger('')
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
          <h4 className="text-lg font-semibold text-white mb-4">Global Automation Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="font-medium text-white">Smart Scheduling</h5>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Auto-optimize send times based on audience engagement</li>
                <li>• Intelligent throttling to prevent spam detection</li>
                <li>• Timezone-aware delivery scheduling</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-white">Audience Management</h5>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Auto-segment audiences based on behavior</li>
                <li>• Dynamic list cleaning and maintenance</li>
                <li>• Engagement-based audience scoring</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-white">Performance Monitoring</h5>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Real-time performance alerts</li>
                <li>• Automatic A/B testing optimization</li>
                <li>• Deliverability monitoring and recovery</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-white">Compliance & Safety</h5>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Automatic unsubscribe handling</li>
                <li>• Bounce management and list hygiene</li>
                <li>• Compliance monitoring and reporting</li>
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
              onUpdate={onUpdateWorkflow}
              onDelete={onDeleteWorkflow}
              getStatusColor={getStatusColor}
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
    autoOptimizeSendTimes: true,
    intelligentThrottling: true,
    timezoneAwareDelivery: true,
    autoSegmentAudiences: false,
    dynamicListCleaning: true,
    engagementScoring: true,
    performanceAlerts: true,
    autoABTesting: false,
    deliverabilityMonitoring: true,
    autoUnsubscribeHandling: true,
    bounceManagement: true,
    complianceMonitoring: true,
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
              <h4 className="font-semibold text-white mb-3">Smart Scheduling</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Auto-optimize send times</span>
                  <input
                    type="checkbox"
                    checked={settings.autoOptimizeSendTimes}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoOptimizeSendTimes: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Intelligent throttling</span>
                  <input
                    type="checkbox"
                    checked={settings.intelligentThrottling}
                    onChange={(e) => setSettings(prev => ({ ...prev, intelligentThrottling: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Timezone-aware delivery</span>
                  <input
                    type="checkbox"
                    checked={settings.timezoneAwareDelivery}
                    onChange={(e) => setSettings(prev => ({ ...prev, timezoneAwareDelivery: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Audience Management</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Auto-segment audiences</span>
                  <input
                    type="checkbox"
                    checked={settings.autoSegmentAudiences}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoSegmentAudiences: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Dynamic list cleaning</span>
                  <input
                    type="checkbox"
                    checked={settings.dynamicListCleaning}
                    onChange={(e) => setSettings(prev => ({ ...prev, dynamicListCleaning: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Engagement scoring</span>
                  <input
                    type="checkbox"
                    checked={settings.engagementScoring}
                    onChange={(e) => setSettings(prev => ({ ...prev, engagementScoring: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Performance & Compliance</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Performance alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.performanceAlerts}
                    onChange={(e) => setSettings(prev => ({ ...prev, performanceAlerts: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Auto A/B testing</span>
                  <input
                    type="checkbox"
                    checked={settings.autoABTesting}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoABTesting: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Deliverability monitoring</span>
                  <input
                    type="checkbox"
                    checked={settings.deliverabilityMonitoring}
                    onChange={(e) => setSettings(prev => ({ ...prev, deliverabilityMonitoring: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Auto unsubscribe handling</span>
                  <input
                    type="checkbox"
                    checked={settings.autoUnsubscribeHandling}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoUnsubscribeHandling: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Bounce management</span>
                  <input
                    type="checkbox"
                    checked={settings.bounceManagement}
                    onChange={(e) => setSettings(prev => ({ ...prev, bounceManagement: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-neutral-300">Compliance monitoring</span>
                  <input
                    type="checkbox"
                    checked={settings.complianceMonitoring}
                    onChange={(e) => setSettings(prev => ({ ...prev, complianceMonitoring: e.target.checked }))}
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
  onUpdate,
  onDelete,
  getStatusColor
}: {
  workflow: WorkflowRule
  onUpdate: (workflow: WorkflowRule) => void
  onDelete: (id: string) => void
  getStatusColor: (isEnabled: boolean) => string
}) {
  const handleToggle = () => {
    onUpdate({ ...workflow, isEnabled: !workflow.isEnabled })
  }

  return (
    <div className="border border-white/10 rounded-lg p-4 hover:border-primary-400 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${workflow.trigger.color}`}>
            {workflow.trigger.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-white">{workflow.name}</h4>
              <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(workflow.isEnabled)}`}>
                {workflow.isEnabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-neutral-400 mb-2">{workflow.trigger.description}</p>
            
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
            className={`p-2 rounded-lg ${
              workflow.isEnabled 
                ? 'text-warning-400 hover:bg-warning-500/10' 
                : 'text-success-400 hover:bg-success-500/10'
            }`}
            title={workflow.isEnabled ? 'Pause workflow' : 'Activate workflow'}
          >
            {workflow.isEnabled ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onDelete(workflow.id)}
            className="p-2 text-error-400 hover:bg-error-500/10 rounded-lg"
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
