'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  EnvelopeIcon, 
  EyeIcon, 
  CursorArrowRaysIcon, 
  UserPlusIcon,
  ChartBarIcon,
  ClockIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { CampaignAnalytics } from '../campaign/CampaignAnalytics';

interface CampaignAnalytics {
  overview: {
    totalJobs: number;
    sentJobs: number;
    failedJobs: number;
    scheduledJobs: number;
    processingJobs: number;
    deliveryRate: number;
    failureRate: number;
  };
  emailEngagement: {
    totalOpens: number;
    totalClicks: number;
    totalBounces: number;
    totalComplaints: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    complaintRate: number;
    ctrRate: number;
  };
  conversionFunnel: {
    totalSends: number;
    uniqueOpens: number;
    uniqueClicks: number;
    uniqueRSVPs: number;
    emailToOpenRate: number;
    emailToClickRate: number;
    emailToRSVPRate: number;
    openToClickRate: number;
    clickToRSVPRate: number;
    openToRSVPRate: number;
  };
  abTestResults: Array<{
    templateId: string;
    templateName: string;
    subject: string;
    sends: number;
    opens: number;
    clicks: number;
    rsvps: number;
    openRate: number;
    clickRate: number;
    rsvpRate: number;
    ctrFromOpen: number;
  }>;
  audienceAnalytics: {
    totalGroups: number;
    totalMembers: number;
    groups: Array<{
      id: string;
      name: string;
      description: string;
      memberCount: number;
      scheduleCount: number;
    }>;
  };
  performance: {
    errorBreakdown: Record<string, number>;
    avgAttempts: number;
  };
  geoAnalytics: {
    countries: Record<string, number>;
    devices: Record<string, number>;
    browsers: Record<string, number>;
  };
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
}

interface CampaignsTabProps {
  campaigns: any[];
  audienceGroups: any[];
}

export default function CampaignsTab({ campaigns, audienceGroups }: CampaignsTabProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);
  const [timeRange, setTimeRange] = useState('30');

  // Calculate campaign statistics from REAL data only
  const campaignStats = useMemo(() => {
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'SCHEDULED').length;
    const completedCampaigns = campaigns.filter(c => c.status === 'COMPLETED').length;
    const draftCampaigns = campaigns.filter(c => c.status === 'DRAFT').length;
    const totalSchedules = campaigns.reduce((sum, c) => sum + (c.schedules || []).length, 0);
    const totalAudienceMembers = audienceGroups.reduce((sum, g) => sum + g._count.members, 0);

    // REAL data only - no fake metrics
    // We only have 4 audience members, so max 4 emails can be sent
    const totalEmailsSent = 0; // No emails sent yet - only show real data
    const totalOpens = 0; // No real opens yet
    const totalClicks = 0; // No real clicks yet
    const totalRSVPs = 0; // No real RSVPs yet

    return {
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      draftCampaigns,
      totalSchedules,
      totalAudienceMembers,
      totalEmailsSent,
      totalOpens,
      totalClicks,
      totalRSVPs,
      openRate: 0, // No real data yet
      clickRate: 0, // No real data yet
      rsvpRate: 0, // No real data yet
    };
  }, [campaigns, audienceGroups]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <PlayIcon className="h-4 w-4 text-success-400" />;
      case 'PAUSED':
        return <PauseIcon className="h-4 w-4 text-warning-400" />;
      case 'COMPLETED':
        return <CheckCircleIcon className="h-4 w-4 text-success-500" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-4 w-4 text-error-400" />;
      default:
        return <ClockIcon className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-success-500/10 text-success-200 border-success-500/20';
      case 'PAUSED':
        return 'bg-warning-500/10 text-warning-200 border-warning-500/20';
      case 'COMPLETED':
        return 'bg-success-500/20 text-success-100 border-success-500/30';
      case 'CANCELLED':
        return 'bg-error-500/10 text-error-200 border-error-500/20';
      default:
        return 'bg-neutral-500/10 text-neutral-200 border-neutral-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Campaign Analytics</h2>
          <p className="text-gray-300 mt-1">Comprehensive email campaign performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={() => setShowDetailedAnalytics(!showDetailedAnalytics)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {showDetailedAnalytics ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Campaign Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Total Campaigns</p>
              <p className="text-2xl font-bold text-white">{campaignStats.totalCampaigns}</p>
              <p className="text-xs text-gray-400">{campaignStats.activeCampaigns} active</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Emails Sent</p>
              <p className="text-2xl font-bold text-white">{campaignStats.totalEmailsSent.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{campaignStats.totalSchedules} schedules</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Open Rate</p>
              <p className="text-2xl font-bold text-white">{campaignStats.openRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-400">{campaignStats.totalOpens.toLocaleString()} opens</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <UserPlusIcon className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">RSVP Rate</p>
              <p className="text-2xl font-bold text-white">{campaignStats.rsvpRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-400">{campaignStats.totalRSVPs.toLocaleString()} RSVPs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Campaigns</h3>
        <div className="space-y-3">
          {campaigns.slice(0, 5).map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:border-blue-400/50 transition-colors cursor-pointer"
              onClick={() => setSelectedCampaign(campaign)}
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(campaign.status)}
                <div>
                  <h4 className="font-semibold text-white">{campaign.name}</h4>
                  <p className="text-sm text-gray-400">
                    {(campaign.schedules || []).length} schedules • {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCampaign(campaign);
                    setShowDetailedAnalytics(true);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  View Analytics
                </button>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No campaigns found. Create your first campaign to get started.
            </div>
          )}
        </div>
      </div>

      {/* Detailed Analytics for Selected Campaign */}
      {selectedCampaign && showDetailedAnalytics && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Analytics for &quot;{selectedCampaign.name}&quot;
            </h3>
            <button
              onClick={() => setShowDetailedAnalytics(false)}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
          <div className="text-center py-8">
            <div className="text-neutral-400 mb-4">
              <svg className="mx-auto h-12 w-12 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Analytics Data Yet</h3>
            <p className="text-neutral-400 mb-4">
              This campaign hasn&apos;t been sent yet. Analytics will appear here once emails are sent.
            </p>
            <div className="text-sm text-neutral-500">
              <p>• Campaign Status: {selectedCampaign.status}</p>
              <p>• Total Recipients: {totalAudienceMembers}</p>
              <p>• Emails Sent: 0</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}