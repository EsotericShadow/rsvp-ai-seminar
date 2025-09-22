import { Suspense } from 'react';
import VisitsTrendChart from './VisitsTrendChart';
import DeviceBreakdownChart from './DeviceBreakdownChart';

interface OverviewTabProps {
  stats: {
    totalVisits: number;
    totalRSVPs: number;
    conversionRate: number;
    avgSessionDuration: number;
    bounceRate: number;
    topCountries: Array<{ country: string; count: number }>;
    topBrowsers: Array<{ browser: string; count: number }>;
    deviceBreakdown: Array<{ name: string; count: number }>;
    visitsTrend: Array<{ label: string; count: number }>;
    // Campaign stats
    totalCampaigns?: number;
    activeCampaigns?: number;
    completedCampaigns?: number;
    totalSchedules?: number;
    totalAudienceMembers?: number;
  };
}

export default function OverviewTab({ stats }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Overview</h2>
          <p className="text-neutral-300 mt-1">Key performance indicators and trends</p>
        </div>
        <div className="text-sm text-neutral-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-300">Total Visitors</p>
              <p className="text-2xl font-bold text-white">{stats.totalVisits.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-300">Total RSVPs</p>
              <p className="text-2xl font-bold text-white">{stats.totalRSVPs.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-accent-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-300">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">{stats.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-warning-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-300">Avg. Session</p>
              <p className="text-2xl font-bold text-white">
                {stats.avgSessionDuration > 60 
                  ? `${Math.floor(stats.avgSessionDuration / 60)}m ${Math.floor(stats.avgSessionDuration % 60)}s`
                  : `${Math.floor(stats.avgSessionDuration)}s`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Metrics */}
      {stats.totalCampaigns !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-300">Total Campaigns</p>
                <p className="text-2xl font-bold text-white">{stats.totalCampaigns}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-300">Active Campaigns</p>
                <p className="text-2xl font-bold text-white">{stats.activeCampaigns}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-info-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-info-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-300">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completedCampaigns}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-warning-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-300">Total Schedules</p>
                <p className="text-2xl font-bold text-white">{stats.totalSchedules}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-300">Audience Members</p>
                <p className="text-2xl font-bold text-white">{stats.totalAudienceMembers?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Visits Trend</h3>
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-neutral-400">Loading chart...</div>}>
            <VisitsTrendChart data={stats.visitsTrend} />
          </Suspense>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Device Breakdown</h3>
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-neutral-400">Loading chart...</div>}>
            <DeviceBreakdownChart data={stats.deviceBreakdown} />
          </Suspense>
        </div>
      </div>

      {/* Top Countries and Browsers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
          <div className="space-y-3">
            {stats.topCountries.slice(0, 5).map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-neutral-400 w-6">#{index + 1}</span>
                  <span className="text-white font-medium ml-2">{country.country}</span>
                </div>
                <span className="text-neutral-300">{country.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Browsers</h3>
          <div className="space-y-3">
            {stats.topBrowsers.slice(0, 5).map((browser, index) => (
              <div key={browser.browser} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-neutral-400 w-6">#{index + 1}</span>
                  <span className="text-white font-medium ml-2">{browser.browser}</span>
                </div>
                <span className="text-neutral-300">{browser.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
