'use client'

import { useState, useMemo } from 'react'
import { Campaign, CampaignStatus, CampaignSchedule, CampaignSendStatus } from '@prisma/client'

// Import the same types as CampaignControls
import { 
  ChartBarIcon, 
  PlayIcon, 
  PauseIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  EnvelopeIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

type ScheduleWithCounts = CampaignSchedule & {
  counts: Record<CampaignSendStatus, number>
}

type CampaignWithCounts = Campaign & {
  schedules: ScheduleWithCounts[]
  counts: Record<CampaignSendStatus, number>
}

type CampaignDashboardProps = {
  campaigns: any[]
  onSelectCampaign: (campaign: any) => void
  onCreateCampaign: () => void
  onDuplicateCampaign: (campaign: any) => void
  onDeleteCampaign: (id: string) => void
  onBulkAction: (action: string, campaignIds: string[]) => void
}

export function CampaignDashboard({
  campaigns,
  onSelectCampaign,
  onCreateCampaign,
  onDuplicateCampaign,
  onDeleteCampaign,
  onBulkAction
}: CampaignDashboardProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'status' | 'schedules'>('created')
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])

  // Calculate analytics
  const analytics = useMemo(() => {
    const total = campaigns.length
    const active = campaigns.filter(c => c.status === CampaignStatus.SCHEDULED).length
    const completed = campaigns.filter(c => c.status === CampaignStatus.COMPLETED).length
    const paused = campaigns.filter(c => c.status === CampaignStatus.PAUSED).length
    const draft = campaigns.filter(c => c.status === CampaignStatus.DRAFT).length
    const totalSchedules = campaigns.reduce((sum, c) => sum + (c.schedules || []).length, 0)
    
    return {
      total,
      active,
      completed,
      paused,
      draft,
      totalSchedules,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }, [campaigns])

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'status':
          return a.status.localeCompare(b.status)
        case 'schedules':
          return (b.schedules || []).length - (a.schedules || []).length
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }, [campaigns, searchTerm, filterStatus, sortBy])

  const handleSelectCampaign = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    )
  }

  const handleSelectAll = () => {
    setSelectedCampaigns(
      selectedCampaigns.length === filteredCampaigns.length 
        ? [] 
        : filteredCampaigns.map(c => c.id)
    )
  }

  const getStatusIcon = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.SCHEDULED:
        return <PlayIcon className="h-4 w-4 text-success-400" />
      case CampaignStatus.PAUSED:
        return <PauseIcon className="h-4 w-4 text-warning-400" />
      case CampaignStatus.COMPLETED:
        return <CheckCircleIcon className="h-4 w-4 text-success-500" />
      case CampaignStatus.CANCELLED:
        return <XCircleIcon className="h-4 w-4 text-error-400" />
      default:
        return <ClockIcon className="h-4 w-4 text-neutral-400" />
    }
  }

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.SCHEDULED:
        return 'bg-success-500/10 text-success-200 border-success-500/20'
      case CampaignStatus.PAUSED:
        return 'bg-warning-500/10 text-warning-200 border-warning-500/20'
      case CampaignStatus.COMPLETED:
        return 'bg-success-500/20 text-success-100 border-success-500/30'
      case CampaignStatus.CANCELLED:
        return 'bg-error-500/10 text-error-200 border-error-500/20'
      default:
        return 'bg-neutral-500/10 text-neutral-200 border-neutral-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Total Campaigns</p>
              <p className="text-2xl font-bold text-white">{analytics.total}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-primary-400" />
          </div>
        </div>
        
        <div className="bg-success-500/10 rounded-lg p-4 border border-success-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-success-300">Active</p>
              <p className="text-2xl font-bold text-success-200">{analytics.active}</p>
            </div>
            <PlayIcon className="h-8 w-8 text-success-400" />
          </div>
        </div>
        
        <div className="bg-primary-500/10 rounded-lg p-4 border border-primary-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-300">Completed</p>
              <p className="text-2xl font-bold text-primary-200">{analytics.completed}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-primary-400" />
          </div>
        </div>
        
        <div className="bg-warning-500/10 rounded-lg p-4 border border-warning-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-warning-300">Completion Rate</p>
              <p className="text-2xl font-bold text-warning-200">{analytics.completionRate}%</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-warning-400" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-neutral-700 text-neutral-300'}`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-neutral-700 text-neutral-300'}`}
            >
              <div className="w-4 h-4 flex flex-col gap-0.5">
                <div className="bg-current h-1 rounded-sm"></div>
                <div className="bg-current h-1 rounded-sm"></div>
                <div className="bg-current h-1 rounded-sm"></div>
              </div>
            </button>
          </div>
          
          {selectedCampaigns.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-300">
                {selectedCampaigns.length} selected
              </span>
              <button
                onClick={() => onBulkAction('pause', selectedCampaigns)}
                className="px-3 py-1 bg-warning-600 text-white text-sm rounded-lg hover:bg-warning-700"
              >
                Pause
              </button>
              <button
                onClick={() => onBulkAction('delete', selectedCampaigns)}
                className="px-3 py-1 bg-error-600 text-white text-sm rounded-lg hover:bg-error-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onCreateCampaign}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <span>+</span>
          New Campaign
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-white/10 bg-black/60 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-primary-400"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as CampaignStatus | 'all')}
            className="px-3 py-2 border border-white/10 bg-black/60 rounded-lg text-white focus:outline-none focus:border-primary-400"
          >
            <option value="all">All Status</option>
            <option value={CampaignStatus.DRAFT}>Draft</option>
            <option value={CampaignStatus.SCHEDULED}>Active</option>
            <option value={CampaignStatus.PAUSED}>Paused</option>
            <option value={CampaignStatus.COMPLETED}>Completed</option>
            <option value={CampaignStatus.CANCELLED}>Cancelled</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'created' | 'status' | 'schedules')}
            className="px-3 py-2 border border-white/10 bg-black/60 rounded-lg text-white focus:outline-none focus:border-primary-400"
          >
            <option value="created">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
            <option value="schedules">Sort by Steps</option>
          </select>
        </div>
      </div>

      {/* Campaigns List/Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📧</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchTerm ? 'No campaigns found' : 'No campaigns yet'}
          </h3>
          <p className="text-neutral-400 mb-4">
            {searchTerm 
              ? 'Try adjusting your search or filters'
              : 'Create your first campaign to get started'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={onCreateCampaign}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Campaign
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-3'
        }>
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              viewMode={viewMode}
              isSelected={selectedCampaigns.includes(campaign.id)}
              onSelect={() => handleSelectCampaign(campaign.id)}
              onEdit={() => onSelectCampaign(campaign)}
              onDuplicate={() => onDuplicateCampaign(campaign)}
              onDelete={() => onDeleteCampaign(campaign.id)}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CampaignCard({
  campaign,
  viewMode,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  getStatusIcon,
  getStatusColor
}: {
  campaign: any
  viewMode: 'grid' | 'list'
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  getStatusIcon: (status: CampaignStatus) => React.ReactNode
  getStatusColor: (status: CampaignStatus) => string
}) {
  const isGrid = viewMode === 'grid'
  
  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'border-primary-500 bg-primary-500/10' 
          : 'border-white/10 bg-black/40 hover:border-primary-400 hover:bg-primary-500/5'
      } ${isGrid ? 'h-full' : 'flex items-center justify-between'}`}
      onClick={onSelect}
    >
      <div className={isGrid ? 'space-y-3' : 'flex-1'}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{campaign.name}</h3>
            {campaign.description && (
              <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
                {campaign.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {getStatusIcon(campaign.status)}
            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(campaign.status)}`}>
              {campaign.status}
            </span>
          </div>
        </div>
        
        <div className={`flex items-center gap-4 text-sm text-neutral-400 ${isGrid ? 'flex-wrap' : ''}`}>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <UsersIcon className="h-4 w-4" />
            <span>{(campaign.schedules || []).length} step{(campaign.schedules || []).length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
      
      <div className={`flex items-center gap-2 ${isGrid ? 'mt-3' : 'ml-4'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg"
          title="Edit Campaign"
        >
          <Cog6ToothIcon className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate()
          }}
          className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg"
          title="Duplicate Campaign"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm('Are you sure you want to delete this campaign?')) {
              onDelete()
            }
          }}
          className="p-2 text-error-400 hover:text-error-300 hover:bg-error-500/10 rounded-lg"
          title="Delete Campaign"
        >
          <XCircleIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
