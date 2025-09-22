'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  ChartBarIcon, 
  EyeIcon, 
  CursorArrowRaysIcon, 
  EnvelopeOpenIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

type CampaignMetrics = {
  id: string
  name: string
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled'
  totalRecipients: number
  emailsSent: number
  emailsDelivered: number
  emailsOpened: number
  emailsClicked: number
  unsubscribes: number
  bounces: number
  complaints: number
  createdAt: string
  lastSentAt?: string
  nextSendAt?: string
  openRate: number
  clickRate: number
  deliveryRate: number
  unsubscribeRate: number
  bounceRate: number
  complaintRate: number
  trends: {
    openRate: number
    clickRate: number
    deliveryRate: number
  }
  hourlyData: Array<{
    hour: string
    opens: number
    clicks: number
    deliveries: number
  }>
  topTemplates: Array<{
    id: string
    name: string
    openRate: number
    clickRate: number
  }>
}

type CampaignAnalyticsProps = {
  campaignId: string
  metrics: CampaignMetrics
  onRefresh: () => void
  isRefreshing: boolean
}

export function CampaignAnalytics({
  campaignId,
  metrics,
  onRefresh,
  isRefreshing
}: CampaignAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')
  const [selectedMetric, setSelectedMetric] = useState<'opens' | 'clicks' | 'deliveries'>('opens')

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (metrics.status === 'running') {
        onRefresh()
      }
    }, 30000) // Refresh every 30 seconds for running campaigns

    return () => clearInterval(interval)
  }, [metrics.status, onRefresh])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-success-500/10 text-success-200 border-success-500/20'
      case 'scheduled':
        return 'bg-primary-500/10 text-primary-200 border-primary-500/20'
      case 'paused':
        return 'bg-warning-500/10 text-warning-200 border-warning-500/20'
      case 'completed':
        return 'bg-success-500/20 text-success-100 border-success-500/30'
      case 'cancelled':
        return 'bg-error-500/10 text-error-200 border-error-500/20'
      default:
        return 'bg-neutral-500/10 text-neutral-200 border-neutral-500/20'
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-success-400" />
    } else if (trend < 0) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-error-400" />
    }
    return <div className="h-4 w-4" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-success-400'
    if (trend < 0) return 'text-error-400'
    return 'text-neutral-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <ChartBarIcon className="h-6 w-6 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Campaign Analytics</h3>
            <p className="text-sm text-neutral-400">Real-time performance metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
            className="px-3 py-2 border border-white/10 bg-black/60 rounded-lg text-white focus:outline-none focus:border-primary-400"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Campaign Status */}
      <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white">{metrics.name}</h4>
            <p className="text-sm text-neutral-400">
              Created {new Date(metrics.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(metrics.status)}`}>
              {metrics.status}
            </span>
            {metrics.status === 'running' && (
              <div className="flex items-center gap-1 text-success-400">
                <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Live</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Open Rate"
          value={`${metrics.openRate.toFixed(1)}%`}
          trend={metrics.trends.openRate}
          icon={<EyeIcon className="h-5 w-5" />}
          color="text-primary-400"
          bgColor="bg-primary-500/10"
          borderColor="border-primary-500/20"
        />
        <MetricCard
          title="Click Rate"
          value={`${metrics.clickRate.toFixed(1)}%`}
          trend={metrics.trends.clickRate}
          icon={<CursorArrowRaysIcon className="h-5 w-5" />}
          color="text-success-400"
          bgColor="bg-success-500/10"
          borderColor="border-success-500/20"
        />
        <MetricCard
          title="Delivery Rate"
          value={`${metrics.deliveryRate.toFixed(1)}%`}
          trend={metrics.trends.deliveryRate}
          icon={<EnvelopeOpenIcon className="h-5 w-5" />}
          color="text-info-400"
          bgColor="bg-info-500/10"
          borderColor="border-info-500/20"
        />
        <MetricCard
          title="Unsubscribe Rate"
          value={`${metrics.unsubscribeRate.toFixed(2)}%`}
          trend={-metrics.unsubscribeRate} // Negative trend is good for unsubscribes
          icon={<XMarkIcon className="h-5 w-5" />}
          color="text-error-400"
          bgColor="bg-error-500/10"
          borderColor="border-error-500/20"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Metrics */}
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
          <h4 className="font-semibold text-white mb-4">Volume Metrics</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-300">Total Recipients</span>
              </div>
              <span className="text-white font-semibold">{metrics.totalRecipients.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EnvelopeOpenIcon className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-300">Emails Sent</span>
              </div>
              <span className="text-white font-semibold">{metrics.emailsSent.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-300">Delivered</span>
              </div>
              <span className="text-white font-semibold">{metrics.emailsDelivered.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeIcon className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-300">Opened</span>
              </div>
              <span className="text-white font-semibold">{metrics.emailsOpened.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CursorArrowRaysIcon className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-300">Clicked</span>
              </div>
              <span className="text-white font-semibold">{metrics.emailsClicked.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Performance Issues */}
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
          <h4 className="font-semibold text-white mb-4">Performance Issues</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XMarkIcon className="h-4 w-4 text-error-400" />
                <span className="text-sm text-neutral-300">Bounces</span>
              </div>
              <span className="text-error-400 font-semibold">{metrics.bounces.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XMarkIcon className="h-4 w-4 text-error-400" />
                <span className="text-sm text-neutral-300">Unsubscribes</span>
              </div>
              <span className="text-error-400 font-semibold">{metrics.unsubscribes.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-warning-400" />
                <span className="text-sm text-neutral-300">Complaints</span>
              </div>
              <span className="text-warning-400 font-semibold">{metrics.complaints.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Performance Chart */}
      <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-white">Hourly Performance</h4>
          <div className="flex gap-2">
            {['opens', 'clicks', 'deliveries'].map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric as 'opens' | 'clicks' | 'deliveries')}
                className={`px-3 py-1 text-sm rounded-lg ${
                  selectedMetric === metric
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 flex items-end gap-1">
          {metrics.hourlyData.map((data, index) => {
            const value = data[selectedMetric as keyof typeof data] as number
            const maxValue = Math.max(...metrics.hourlyData.map(d => d[selectedMetric as keyof typeof d] as number))
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t ${
                    selectedMetric === 'opens' ? 'bg-primary-500' :
                    selectedMetric === 'clicks' ? 'bg-success-500' : 'bg-info-500'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <div className="text-xs text-neutral-400 mt-1">{data.hour}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Performing Templates */}
      {metrics.topTemplates.length > 0 && (
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
          <h4 className="font-semibold text-white mb-4">Top Performing Templates</h4>
          <div className="space-y-3">
            {metrics.topTemplates.map((template, index) => (
              <div key={template.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs text-white">
                    {index + 1}
                  </div>
                  <span className="text-white">{template.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-primary-400">{template.openRate.toFixed(1)}% open</span>
                  <span className="text-success-400">{template.clickRate.toFixed(1)}% click</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({
  title,
  value,
  trend,
  icon,
  color,
  bgColor,
  borderColor
}: {
  title: string
  value: string
  trend: number
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}) {
  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-success-400" />
    } else if (trend < 0) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-error-400" />
    }
    return <div className="h-4 w-4" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-success-400'
    if (trend < 0) return 'text-error-400'
    return 'text-neutral-400'
  }

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon(trend)}
          <span className={`text-sm ${getTrendColor(trend)}`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-neutral-400">{title}</div>
      </div>
    </div>
  )
}
