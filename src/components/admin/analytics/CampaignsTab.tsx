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

  // Calculate campaign statistics from the data
  const campaignStats = useMemo(() => {
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'SCHEDULED').length;
    const completedCampaigns = campaigns.filter(c => c.status === 'COMPLETED').length;
    const draftCampaigns = campaigns.filter(c => c.status === 'DRAFT').length;
    const totalSchedules = campaigns.reduce((sum, c) => sum + c._count.schedules, 0);
    const totalAudienceMembers = audienceGroups.reduce((sum, g) => sum + g._count.members, 0);

    // Calculate engagement metrics (mock data for now)
    const totalEmailsSent = campaigns.reduce((sum, c) => sum + (c.schedules?.length || 0) * 100, 0);
    const totalOpens = Math.floor(totalEmailsSent * 0.25); // 25% open rate
    const totalClicks = Math.floor(totalOpens * 0.15); // 15% click rate
    const totalRSVPs = Math.floor(totalClicks * 0.3); // 30% RSVP rate

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
      openRate: totalEmailsSent > 0 ? (totalOpens / totalEmailsSent) * 100 : 0,
      clickRate: totalEmailsSent > 0 ? (totalClicks / totalEmailsSent) * 100 : 0,
      rsvpRate: totalEmailsSent > 0 ? (totalRSVPs / totalEmailsSent) * 100 : 0,
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
                    {campaign._count.schedules} schedules • {new Date(campaign.createdAt).toLocaleDateString()}
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
              Analytics for "{selectedCampaign.name}"
            </h3>
            <button
              onClick={() => setShowDetailedAnalytics(false)}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
          <CampaignAnalytics
            campaignId={selectedCampaign.id}
            metrics={{
              id: selectedCampaign.id,
              name: selectedCampaign.name,
              status: selectedCampaign.status.toLowerCase(),
              totalRecipients: 1000,
              emailsSent: 850,
              emailsDelivered: 820,
              emailsOpened: 245,
              emailsClicked: 45,
              unsubscribes: 12,
              bounces: 8,
              complaints: 2,
              createdAt: selectedCampaign.createdAt.toISOString(),
              lastSentAt: new Date().toISOString(),
              nextSendAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              openRate: 29.9,
              clickRate: 5.5,
              deliveryRate: 96.5,
              unsubscribeRate: 1.4,
              bounceRate: 0.9,
              complaintRate: 0.2,
              trends: {
                openRate: 2.3,
                clickRate: -0.8,
                deliveryRate: 0.5
              },
              hourlyData: Array.from({ length: 24 }, (_, i) => ({
                hour: `${i}:00`,
                opens: Math.floor(Math.random() * 20),
                clicks: Math.floor(Math.random() * 5),
                deliveries: Math.floor(Math.random() * 30)
              })),
              topTemplates: [
                { id: '1', name: 'Welcome Email', openRate: 35.2, clickRate: 8.1 },
                { id: '2', name: 'Follow-up', openRate: 28.7, clickRate: 6.3 }
              ]
            }}
            onRefresh={() => console.log('Refreshing analytics...')}
            isRefreshing={false}
          />
        </div>
      )}

    </div>
  );
}