'use client';

import { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  EyeIcon, 
  CursorArrowRaysIcon, 
  UserPlusIcon,
  ChartBarIcon,
  ClockIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

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

export default function CampaignsTab() {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/campaigns/analytics?days=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-300">Loading campaign analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-red-400 text-lg font-semibold mb-2">Error Loading Analytics</div>
          <div className="text-gray-400">{error || 'No data available'}</div>
        </div>
      </div>
    );
  }

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
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Emails Sent</p>
              <p className="text-2xl font-bold text-white">{analytics.overview.sentJobs.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{analytics.overview.deliveryRate.toFixed(1)}% delivery rate</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Open Rate</p>
              <p className="text-2xl font-bold text-white">{analytics.emailEngagement.openRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-400">{analytics.emailEngagement.totalOpens} total opens</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <CursorArrowRaysIcon className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Click Rate</p>
              <p className="text-2xl font-bold text-white">{analytics.emailEngagement.clickRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-400">{analytics.emailEngagement.totalClicks} total clicks</p>
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
              <p className="text-2xl font-bold text-white">{analytics.conversionFunnel.emailToRSVPRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-400">{analytics.conversionFunnel.uniqueRSVPs} total RSVPs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{analytics.conversionFunnel.totalSends}</div>
            <div className="text-sm text-gray-400">Emails Sent</div>
            <div className="text-xs text-gray-500">100%</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{analytics.conversionFunnel.uniqueOpens}</div>
            <div className="text-sm text-gray-400">Opens</div>
            <div className="text-xs text-gray-500">{analytics.conversionFunnel.emailToOpenRate.toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{analytics.conversionFunnel.uniqueClicks}</div>
            <div className="text-sm text-gray-400">Clicks</div>
            <div className="text-xs text-gray-500">{analytics.conversionFunnel.emailToClickRate.toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{analytics.conversionFunnel.uniqueRSVPs}</div>
            <div className="text-sm text-gray-400">RSVPs</div>
            <div className="text-xs text-gray-500">{analytics.conversionFunnel.emailToRSVPRate.toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {analytics.conversionFunnel.clickToRSVPRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Click→RSVP</div>
            <div className="text-xs text-gray-500">Conversion</div>
          </div>
        </div>
      </div>

      {/* A/B Testing Results */}
      {analytics.abTestResults.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">A/B/C Test Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-neutral-300">
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-4">Template</th>
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 pr-4">Sends</th>
                  <th className="py-2 pr-4">Open Rate</th>
                  <th className="py-2 pr-4">Click Rate</th>
                  <th className="py-2 pr-4">RSVP Rate</th>
                  <th className="py-2 pr-4">CTR from Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analytics.abTestResults.map((result) => (
                  <tr key={result.templateId}>
                    <td className="py-3 pr-4 font-medium text-white">{result.templateName}</td>
                    <td className="py-3 pr-4 text-gray-300 max-w-xs truncate" title={result.subject}>
                      {result.subject}
                    </td>
                    <td className="py-3 pr-4 text-gray-300">{result.sends}</td>
                    <td className="py-3 pr-4 text-blue-400">{result.openRate.toFixed(1)}%</td>
                    <td className="py-3 pr-4 text-purple-400">{result.clickRate.toFixed(1)}%</td>
                    <td className="py-3 pr-4 text-green-400">{result.rsvpRate.toFixed(1)}%</td>
                    <td className="py-3 pr-4 text-orange-400">{result.ctrFromOpen.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Email Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-300">Bounce Rate</span>
              <span className="text-red-400">{analytics.emailEngagement.bounceRate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Complaint Rate</span>
              <span className="text-yellow-400">{analytics.emailEngagement.complaintRate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">CTR from Opens</span>
              <span className="text-blue-400">{analytics.emailEngagement.ctrRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Open to RSVP Rate</span>
              <span className="text-green-400">{analytics.conversionFunnel.openToRSVPRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Error Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(analytics.performance.errorBreakdown).map(([errorType, count]) => (
              <div key={errorType} className="flex justify-between">
                <span className="text-gray-300 capitalize">{errorType.replace('_', ' ')}</span>
                <span className="text-red-400">{count}</span>
              </div>
            ))}
            {Object.keys(analytics.performance.errorBreakdown).length === 0 && (
              <div className="text-gray-400 text-center py-4">No errors in selected timeframe</div>
            )}
          </div>
        </div>
      </div>

      {/* Geographic & Device Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
          <div className="space-y-3">
            {Object.entries(analytics.geoAnalytics.countries)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([country, count]) => (
                <div key={country} className="flex justify-between">
                  <span className="text-white">{country}</span>
                  <span className="text-gray-300">{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Device Types</h3>
          <div className="space-y-3">
            {Object.entries(analytics.geoAnalytics.devices)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([device, count]) => (
                <div key={device} className="flex justify-between">
                  <span className="text-white capitalize">{device}</span>
                  <span className="text-gray-300">{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Browsers</h3>
          <div className="space-y-3">
            {Object.entries(analytics.geoAnalytics.browsers)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([browser, count]) => (
                <div key={browser} className="flex justify-between">
                  <span className="text-white">{browser}</span>
                  <span className="text-gray-300">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Audience Analytics */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Audience Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{analytics.audienceAnalytics.totalGroups}</div>
            <div className="text-sm text-gray-400">Audience Groups</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{analytics.audienceAnalytics.totalMembers.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Members</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {analytics.audienceAnalytics.totalGroups > 0 
                ? Math.round(analytics.audienceAnalytics.totalMembers / analytics.audienceAnalytics.totalGroups)
                : 0
              }
            </div>
            <div className="text-sm text-gray-400">Avg Members/Group</div>
          </div>
        </div>
        
        {analytics.audienceAnalytics.groups.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold text-white mb-3">Group Breakdown</h4>
            <div className="space-y-2">
              {analytics.audienceAnalytics.groups.slice(0, 5).map((group) => (
                <div key={group.id} className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">{group.name}</div>
                    <div className="text-sm text-gray-400">{group.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-300">{group.memberCount} members</div>
                    <div className="text-xs text-gray-500">{group.scheduleCount} schedules</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}