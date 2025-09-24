'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CampaignSend {
  id: string
  businessId: string
  businessName: string | null
  email: string
  inviteToken: string | null
  inviteLink: string | null
  status: string
  sentAt: Date | null
  openedAt: Date | null
  visitedAt: Date | null
  rsvpAt: Date | null
  error: string | null
  schedule: {
    id: string
    name: string
    campaign: {
      id: string
      name: string
    }
    group: {
      id: string
      name: string
      color: string | null
    }
  }
}

interface PerformanceMetrics {
  total: number
  sent: number
  opened: number
  visited: number
  rsvp: number
  failed: number
  pending: number
  openRate: number
  visitRate: number
  rsvpRate: number
}

interface CampaignSummary {
  campaignId: string
  campaignName: string
  total: number
  sent: number
  opened: number
  visited: number
  rsvp: number
  failed: number
  pending: number
}

interface GroupSummary {
  groupId: string
  groupName: string
  groupColor: string | null
  total: number
  sent: number
  opened: number
  visited: number
  rsvp: number
  failed: number
  pending: number
}

interface TrackingLinksPerformanceProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export default function TrackingLinksPerformance({ searchQuery = '', onSearchChange }: TrackingLinksPerformanceProps) {
  const [trackingLinks, setTrackingLinks] = useState<CampaignSend[]>([])
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null)
  const [campaignSummary, setCampaignSummary] = useState<CampaignSummary[]>([])
  const [groupSummary, setGroupSummary] = useState<GroupSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [activeTab, setActiveTab] = useState<'links' | 'campaigns' | 'groups'>('links')

  const fetchTrackingLinks = async (query: string = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      params.set('limit', '100')

      const response = await fetch(`/api/admin/analytics/tracking-links?${params}`)
      if (!response.ok) throw new Error('Failed to fetch tracking links')
      
      const data = await response.json()
      setTrackingLinks(data.trackingLinks)
      setPerformance(data.performance)
      setCampaignSummary(data.campaignSummary)
      setGroupSummary(data.groupSummary)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tracking links')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrackingLinks(searchQuery)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTrackingLinks(searchInput)
    onSearchChange?.(searchInput)
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'text-green-400'
      case 'PENDING': return 'text-yellow-400'
      case 'FAILED': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT': return '✓'
      case 'PENDING': return '⏳'
      case 'FAILED': return '✗'
      default: return '?'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-neutral-400">Loading tracking links...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-2">Error loading tracking links</div>
        <div className="text-sm text-neutral-500">{error}</div>
        <button
          onClick={() => fetchTrackingLinks(searchInput)}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search businesses, emails, or tracking tokens..."
          className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-emerald-400 focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Search
        </button>
      </form>

      {/* Performance Overview */}
      {performance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/40 border border-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{performance.total}</div>
            <div className="text-sm text-neutral-400">Total Links</div>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{performance.sent}</div>
            <div className="text-sm text-neutral-400">Sent</div>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{performance.opened}</div>
            <div className="text-sm text-neutral-400">Opened ({performance.openRate}%)</div>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-emerald-400">{performance.rsvp}</div>
            <div className="text-sm text-neutral-400">RSVPs ({performance.rsvpRate}%)</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { id: 'links', label: 'All Links', count: trackingLinks.length },
          { id: 'campaigns', label: 'By Campaign', count: campaignSummary.length },
          { id: 'groups', label: 'By Group', count: groupSummary.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          {trackingLinks.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              No tracking links found
            </div>
          ) : (
            trackingLinks.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-black/40 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Business Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: link.schedule.group.color || '#10b981' }}
                      />
                      <h3 className="font-semibold text-white">
                        {link.businessName || 'Unnamed Business'}
                      </h3>
                    </div>
                    <div className="text-sm text-neutral-300 space-y-1">
                      <div>Email: {link.email}</div>
                      <div>Group: {link.schedule.group.name}</div>
                      <div>Campaign: {link.schedule.campaign.name}</div>
                    </div>
                  </div>

                  {/* Tracking Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">Tracking</h3>
                    <div className="text-sm text-neutral-300 space-y-1">
                      <div>Token: {link.inviteToken?.slice(0, 12)}...</div>
                      <div>Status: <span className={getStatusColor(link.status)}>
                        {getStatusIcon(link.status)} {link.status}
                      </span></div>
                      {link.error && (
                        <div className="text-red-400 text-xs">Error: {link.error}</div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">Timeline</h3>
                    <div className="text-sm text-neutral-300 space-y-1">
                      <div>Sent: {formatDate(link.sentAt)}</div>
                      <div>Opened: {formatDate(link.openedAt)}</div>
                      <div>Visited: {formatDate(link.visitedAt)}</div>
                      <div>RSVP: {formatDate(link.rsvpAt)}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">Actions</h3>
                    <div className="space-y-2">
                      {link.inviteLink && (
                        <a
                          href={link.inviteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 text-center"
                        >
                          View Link
                        </a>
                      )}
                      <button
                        onClick={() => navigator.clipboard.writeText(link.inviteToken || '')}
                        className="block w-full px-3 py-1 text-xs bg-neutral-600 text-white rounded hover:bg-neutral-700"
                      >
                        Copy Token
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {campaignSummary.map((campaign, index) => (
            <motion.div
              key={campaign.campaignId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-black/40 border border-white/10 rounded-lg p-4"
            >
              <h3 className="font-semibold text-white mb-3">{campaign.campaignName}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{campaign.total}</div>
                  <div className="text-sm text-neutral-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{campaign.sent}</div>
                  <div className="text-sm text-neutral-400">Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{campaign.opened}</div>
                  <div className="text-sm text-neutral-400">Opened</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">{campaign.rsvp}</div>
                  <div className="text-sm text-neutral-400">RSVPs</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="space-y-4">
          {groupSummary.map((group, index) => (
            <motion.div
              key={group.groupId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-black/40 border border-white/10 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: group.groupColor || '#10b981' }}
                />
                <h3 className="font-semibold text-white">{group.groupName}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{group.total}</div>
                  <div className="text-sm text-neutral-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{group.sent}</div>
                  <div className="text-sm text-neutral-400">Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{group.opened}</div>
                  <div className="text-sm text-neutral-400">Opened</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">{group.rsvp}</div>
                  <div className="text-sm text-neutral-400">RSVPs</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}




