'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Business {
  businessId: string
  businessName: string | null
  primaryEmail: string
  group: {
    id: string
    name: string
    color: string | null
  }
}

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

interface Visitor {
  id: string
  createdAt: Date
  visitorId: string
  sessionId: string
  path: string
  query: string | null
  referrer: string | null
  eid: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmTerm: string | null
  utmContent: string | null
  userAgent: string | null
  language: string | null
  country: string | null
  region: string | null
  city: string | null
  platform: string | null
  device: string | null
  browser: string | null
  timeOnPageMs: number | null
  scrollDepth: number | null
  screenW: number | null
  screenH: number | null
  viewportW: number | null
  viewportH: number | null
  business: Business | null
  campaignSend: CampaignSend | null
}

interface VisitorsWithBusinessProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export default function VisitorsWithBusiness({ searchQuery = '', onSearchChange }: VisitorsWithBusinessProps) {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(searchQuery)

  const fetchVisitors = async (query: string = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      params.set('limit', '100')

      const response = await fetch(`/api/admin/analytics/visitors?${params}`)
      if (!response.ok) throw new Error('Failed to fetch visitors')
      
      const data = await response.json()
      setVisitors(data.visits)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch visitors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVisitors(searchQuery)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchVisitors(searchInput)
    onSearchChange?.(searchInput)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString()
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'text-green-400'
      case 'PENDING': return 'text-yellow-400'
      case 'FAILED': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-neutral-400">Loading visitors...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-2">Error loading visitors</div>
        <div className="text-sm text-neutral-500">{error}</div>
        <button
          onClick={() => fetchVisitors(searchInput)}
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
          placeholder="Search visitors, businesses, or tracking IDs..."
          className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-emerald-400 focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Search
        </button>
      </form>

      {/* Visitors List */}
      <div className="space-y-4">
        {visitors.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            No visitors found
          </div>
        ) : (
          visitors.map((visitor, index) => (
            <motion.div
              key={visitor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-black/40 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Visitor Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">Visitor</h3>
                    {visitor.business && (
                      <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-200 rounded border border-emerald-500/30">
                        Business Tracked
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-300 space-y-1">
                    <div>ID: {visitor.visitorId.slice(0, 8)}...</div>
                    <div>Session: {visitor.sessionId.slice(0, 8)}...</div>
                    <div>Time: {formatDate(visitor.createdAt)}</div>
                    <div>Duration: {formatDuration(visitor.timeOnPageMs)}</div>
                    {visitor.scrollDepth && (
                      <div>Scroll: {visitor.scrollDepth}%</div>
                    )}
                  </div>
                </div>

                {/* Business Info */}
                <div className="space-y-2">
                  {visitor.business ? (
                    <>
                      <h3 className="font-semibold text-white">Business</h3>
                      <div className="text-sm text-neutral-300 space-y-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full border border-white/20"
                            style={{ backgroundColor: visitor.business.group.color || '#10b981' }}
                          />
                          <span className="font-medium">{visitor.business.businessName || 'Unnamed Business'}</span>
                        </div>
                        <div>Email: {visitor.business.primaryEmail}</div>
                        <div>Group: {visitor.business.group.name}</div>
                        <div>Tracking: {visitor.eid}</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-neutral-500">
                      <div>No business tracking</div>
                      {visitor.eid && <div>EID: {visitor.eid}</div>}
                    </div>
                  )}
                </div>

                {/* Campaign & Technical Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Campaign & Tech</h3>
                  <div className="text-sm text-neutral-300 space-y-1">
                    {visitor.campaignSend ? (
                      <>
                        <div>Campaign: {visitor.campaignSend.schedule.campaign.name}</div>
                        <div>Status: <span className={getStatusColor(visitor.campaignSend.status)}>{visitor.campaignSend.status}</span></div>
                        {visitor.campaignSend.sentAt && (
                          <div>Sent: {formatDate(visitor.campaignSend.sentAt)}</div>
                        )}
                        {visitor.campaignSend.openedAt && (
                          <div>Opened: {formatDate(visitor.campaignSend.openedAt)}</div>
                        )}
                        {visitor.campaignSend.rsvpAt && (
                          <div>RSVP: {formatDate(visitor.campaignSend.rsvpAt)}</div>
                        )}
                      </>
                    ) : (
                      <div className="text-neutral-500">No campaign data</div>
                    )}
                    <div>Device: {visitor.device} • {visitor.browser}</div>
                    <div>Location: {visitor.city}, {visitor.region}, {visitor.country}</div>
                    {visitor.utmSource && (
                      <div>UTM: {visitor.utmSource} / {visitor.utmCampaign}</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}






