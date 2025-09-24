'use client'

import { useState, useMemo } from 'react'
import { 
  ClockIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

type ScheduleOptimization = {
  id: string
  type: 'timing' | 'frequency' | 'audience' | 'content'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  suggestion: string
  icon: React.ReactNode
  color: string
}

type SmartSchedulerProps = {
  campaignId: string
  currentSchedule: any
  onUpdateSchedule: (schedule: any) => void
  audienceSize: number
  timezone: string
}

export function SmartScheduler({
  campaignId,
  currentSchedule,
  onUpdateSchedule,
  audienceSize,
  timezone
}: SmartSchedulerProps) {
  const [showOptimizations, setShowOptimizations] = useState(true)
  const [selectedOptimizations, setSelectedOptimizations] = useState<string[]>([])

  // Generate smart optimizations based on current schedule and audience
  const optimizations = useMemo(() => {
    const opts: ScheduleOptimization[] = []

    // Timing optimizations
    if (currentSchedule.sendAt) {
      const sendHour = new Date(currentSchedule.sendAt).getHours()
      if (sendHour < 9 || sendHour > 17) {
        opts.push({
          id: 'timing-1',
          type: 'timing',
          priority: 'high',
          title: 'Optimize Send Time',
          description: 'Current send time is outside business hours',
          impact: 'Could increase open rates by 15-25%',
          suggestion: 'Schedule between 9 AM - 5 PM for better engagement',
          icon: <ClockIcon className="h-5 w-5" />,
          color: 'text-warning-400'
        })
      }
    }

    // Frequency optimizations
    if (currentSchedule.repeatIntervalMins && currentSchedule.repeatIntervalMins < 60) {
      opts.push({
        id: 'frequency-1',
        type: 'frequency',
        priority: 'high',
        title: 'Reduce Email Frequency',
        description: 'Sending emails too frequently may cause unsubscribes',
        impact: 'Could reduce unsubscribe rate by 30%',
        suggestion: 'Increase interval to at least 1 hour between sends',
        icon: <ExclamationTriangleIcon className="h-5 w-5" />,
        color: 'text-error-400'
      })
    }

    // Audience size optimizations
    if (audienceSize > 1000) {
      opts.push({
        id: 'audience-1',
        type: 'audience',
        priority: 'medium',
        title: 'Consider Batch Sending',
        description: 'Large audience may benefit from batched delivery',
        impact: 'Could improve deliverability and reduce server load',
        suggestion: 'Split into batches of 500-1000 recipients',
        icon: <UsersIcon className="h-5 w-5" />,
        color: 'text-info-400'
      })
    }

    // Timezone optimizations
    if (timezone !== 'America/Vancouver') {
      opts.push({
        id: 'timing-2',
        type: 'timing',
        priority: 'medium',
        title: 'Timezone Optimization',
        description: 'Consider your audience\'s timezone for better engagement',
        impact: 'Could increase open rates by 20%',
        suggestion: 'Adjust send time based on audience location',
        icon: <CalendarIcon className="h-5 w-5" />,
        color: 'text-primary-400'
      })
    }

    // Content timing optimizations
    opts.push({
      id: 'content-1',
      type: 'content',
      priority: 'low',
      title: 'A/B Test Send Times',
      description: 'Test different send times to find optimal engagement',
      impact: 'Could discover 40% better performance',
      suggestion: 'Run A/B tests with different time slots',
      icon: <ChartBarIcon className="h-5 w-5" />,
      color: 'text-success-400'
    })

    return opts
  }, [currentSchedule, audienceSize, timezone])

  const highPriorityOpts = optimizations.filter(opt => opt.priority === 'high')
  const mediumPriorityOpts = optimizations.filter(opt => opt.priority === 'medium')
  const lowPriorityOpts = optimizations.filter(opt => opt.priority === 'low')

  const handleApplyOptimization = (optimizationId: string) => {
    const optimization = optimizations.find(opt => opt.id === optimizationId)
    if (!optimization) return

    let updatedSchedule = { ...currentSchedule }

    switch (optimization.type) {
      case 'timing':
        if (optimizationId === 'timing-1') {
          // Set to 10 AM in the campaign's timezone
          const now = new Date()
          now.setHours(10, 0, 0, 0)
          updatedSchedule.sendAt = now.toISOString()
        }
        break
      case 'frequency':
        if (optimizationId === 'frequency-1') {
          updatedSchedule.repeatIntervalMins = 60
        }
        break
      case 'audience':
        if (optimizationId === 'audience-1') {
          updatedSchedule.batchSize = Math.min(1000, audienceSize)
        }
        break
    }

    onUpdateSchedule(updatedSchedule)
    setSelectedOptimizations(prev => [...prev, optimizationId])
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-error-500/20 bg-error-500/5'
      case 'medium':
        return 'border-warning-500/20 bg-warning-500/5'
      case 'low':
        return 'border-info-500/20 bg-info-500/5'
      default:
        return 'border-neutral-500/20 bg-neutral-500/5'
    }
  }

  return (
    <div className="space-y-6">
      {/* Smart Scheduler Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <LightBulbIcon className="h-6 w-6 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Smart Scheduler</h3>
            <p className="text-sm text-neutral-400">AI-powered scheduling optimizations</p>
          </div>
        </div>
        <button
          onClick={() => setShowOptimizations(!showOptimizations)}
          className="px-3 py-1 bg-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-600"
        >
          {showOptimizations ? 'Hide' : 'Show'} Optimizations
        </button>
      </div>

      {/* Current Schedule Summary */}
      <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
        <h4 className="font-semibold text-white mb-3">Current Schedule</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-neutral-400" />
            <div>
              <div className="text-sm text-neutral-400">Send Time</div>
              <div className="text-white">
                {currentSchedule.sendAt 
                  ? new Date(currentSchedule.sendAt).toLocaleString()
                  : 'Not set'
                }
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-neutral-400" />
            <div>
              <div className="text-sm text-neutral-400">Frequency</div>
              <div className="text-white">
                {currentSchedule.repeatIntervalMins 
                  ? `Every ${currentSchedule.repeatIntervalMins} minutes`
                  : 'Single send'
                }
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-neutral-400" />
            <div>
              <div className="text-sm text-neutral-400">Audience Size</div>
              <div className="text-white">{audienceSize.toLocaleString()} recipients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimizations */}
      {showOptimizations && (
        <div className="space-y-4">
          {/* High Priority */}
          {highPriorityOpts.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-error-400" />
                High Priority ({highPriorityOpts.length})
              </h4>
              <div className="space-y-3">
                {highPriorityOpts.map((optimization) => (
                  <OptimizationCard
                    key={optimization.id}
                    optimization={optimization}
                    isApplied={selectedOptimizations.includes(optimization.id)}
                    onApply={() => handleApplyOptimization(optimization.id)}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Medium Priority */}
          {mediumPriorityOpts.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-warning-400" />
                Medium Priority ({mediumPriorityOpts.length})
              </h4>
              <div className="space-y-3">
                {mediumPriorityOpts.map((optimization) => (
                  <OptimizationCard
                    key={optimization.id}
                    optimization={optimization}
                    isApplied={selectedOptimizations.includes(optimization.id)}
                    onApply={() => handleApplyOptimization(optimization.id)}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Low Priority */}
          {lowPriorityOpts.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-info-400" />
                Low Priority ({lowPriorityOpts.length})
              </h4>
              <div className="space-y-3">
                {lowPriorityOpts.map((optimization) => (
                  <OptimizationCard
                    key={optimization.id}
                    optimization={optimization}
                    isApplied={selectedOptimizations.includes(optimization.id)}
                    onApply={() => handleApplyOptimization(optimization.id)}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </div>
            </div>
          )}

          {optimizations.length === 0 && (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-12 w-12 text-success-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Great Schedule!</h3>
              <p className="text-neutral-400">Your current schedule looks optimized. No suggestions at this time.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function OptimizationCard({
  optimization,
  isApplied,
  onApply,
  getPriorityColor
}: {
  optimization: ScheduleOptimization
  isApplied: boolean
  onApply: () => void
  getPriorityColor: (priority: string) => string
}) {
  return (
    <div className={`border rounded-lg p-4 ${getPriorityColor(optimization.priority)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${optimization.color}`}>
            {optimization.icon}
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-white">{optimization.title}</h5>
            <p className="text-sm text-neutral-300 mt-1">{optimization.description}</p>
            <div className="mt-2 flex items-center gap-4 text-xs">
              <span className="text-success-400">📈 {optimization.impact}</span>
              <span className="text-neutral-400">💡 {optimization.suggestion}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onApply}
          disabled={isApplied}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isApplied
              ? 'bg-success-500 text-white cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {isApplied ? 'Applied' : 'Apply'}
        </button>
      </div>
    </div>
  )
}





