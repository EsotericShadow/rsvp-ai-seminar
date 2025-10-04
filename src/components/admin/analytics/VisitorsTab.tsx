import { Suspense } from 'react';

interface Visitor {
  id: string;
  visitorId?: string;
  sessionId?: string;
  createdAt: Date;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  eid?: string;
  userAgent?: string;
  language?: string;
  tz?: string;
  country?: string;
  region?: string;
  city?: string;
  ipHash?: string;
  screenW?: number;
  screenH?: number;
  dpr?: number;
  platform?: string;
  device?: string;
  browser?: string;
  meta?: any;
}

interface VisitorsTabProps {
  visitors: Visitor[];
}

function fmt(d: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Vancouver',
  }).format(d);
}

const dash = <span className="text-neutral-500">-</span>;

function shortId(id?: string | null): React.ReactNode {
  if (!id) return dash;
  if (id.length <= 12) return id;
  return id.slice(0, 6) + '…' + id.slice(-4);
}

function formatDuration(ms?: number | null) {
  if (!ms || ms < 0) return '-';
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

function formatConnection(connection: any) {
  if (!connection) return null;
  if (typeof connection === 'string') return connection;
  const { effectiveType, downlink, rtt } = connection;
  return `${effectiveType || 'unknown'} · ${downlink || 0} Mbps · ${rtt || 0} ms RTT`;
}

export default function VisitorsTab({ visitors }: VisitorsTabProps) {
  // Calculate visitor statistics
  const totalVisitors = visitors.length;
  const uniqueVisitors = new Set(visitors.map(v => v.visitorId).filter(Boolean)).size;
  const totalSessions = new Set(visitors.map(v => v.sessionId).filter(Boolean)).size;
  
  // Device breakdown
  const deviceBreakdown = visitors.reduce((acc, visitor) => {
    const device = visitor.device || 'desktop';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Browser breakdown
  const browserBreakdown = visitors.reduce((acc, visitor) => {
    const browser = visitor.browser || 'unknown';
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Country breakdown
  const countryBreakdown = visitors.reduce((acc, visitor) => {
    const country = visitor.country || 'unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate engagement metrics from meta data
  const engagementStats = visitors.reduce((acc, visitor) => {
    if (visitor.meta?.analytics) {
      const analytics = visitor.meta.analytics;
      if (analytics.engagementScore) acc.totalEngagement += analytics.engagementScore;
      if (analytics.timeOnPageMs) acc.totalTimeOnPage += analytics.timeOnPageMs;
      if (analytics.scrollDepth) acc.totalScrollDepth += analytics.scrollDepth;
      acc.count++;
    }
    return acc;
  }, { totalEngagement: 0, totalTimeOnPage: 0, totalScrollDepth: 0, count: 0 });

  const avgEngagement = engagementStats.count > 0 ? engagementStats.totalEngagement / engagementStats.count : 0;
  const avgTimeOnPage = engagementStats.count > 0 ? engagementStats.totalTimeOnPage / engagementStats.count : 0;
  const avgScrollDepth = engagementStats.count > 0 ? engagementStats.totalScrollDepth / engagementStats.count : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Visitor Analytics</h2>
          <p className="text-gray-300 mt-1">Website traffic and visitor behavior insights</p>
        </div>
        <div className="text-sm text-gray-400">
          {totalVisitors} Visits • {uniqueVisitors} Unique Visitors • {totalSessions} Sessions
        </div>
      </div>

      {/* Visitor Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Total Visits</p>
              <p className="text-2xl font-bold text-white">{totalVisitors}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Unique Visitors</p>
              <p className="text-2xl font-bold text-white">{uniqueVisitors}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Avg. Time on Page</p>
              <p className="text-2xl font-bold text-white">
                {avgTimeOnPage > 1000 
                  ? `${(avgTimeOnPage / 1000).toFixed(1)}s`
                  : `${Math.floor(avgTimeOnPage)}ms`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Avg. Scroll Depth</p>
              <p className="text-2xl font-bold text-white">{avgScrollDepth.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Device Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(deviceBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([device, count]) => (
                <div key={device} className="flex items-center justify-between">
                  <span className="text-white capitalize">{device}</span>
                  <span className="text-gray-300">{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Browser Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(browserBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([browser, count]) => (
                <div key={browser} className="flex items-center justify-between">
                  <span className="text-white">{browser}</span>
                  <span className="text-gray-300">{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
          <div className="space-y-3">
            {Object.entries(countryBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([country, count]) => (
                <div key={country} className="flex items-center justify-between">
                  <span className="text-white">{country}</span>
                  <span className="text-gray-300">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recent Visitors Table */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Visitors</h3>
          <div className="text-sm text-gray-400">
            Showing {visitors.length} visits
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-[1400px] w-full text-sm">
            <thead className="text-left text-neutral-300">
              <tr className="border-b border-white/10">
                <th className="py-2 pr-4">When</th>
                <th className="py-2 pr-4">Visitor</th>
                <th className="py-2 pr-4">Session</th>
                <th className="py-2 pr-4">Marketing</th>
                <th className="py-2 pr-4">Referrer</th>
                <th className="py-2 pr-4">Client</th>
                <th className="py-2 pr-4">Location</th>
                <th className="py-2 pr-4">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visitors.slice(0, 50).map((visitor) => {
                const location = [visitor.city, visitor.region, visitor.country].filter(Boolean).join(', ') || '-';
                const marketingLine = `${visitor.utmSource || '-'} / ${visitor.utmMedium || '-'} / ${visitor.utmCampaign || '-'}`;
                const analytics = visitor.meta?.analytics;
                const connection = analytics?.connection ? formatConnection(analytics.connection) : null;
                
                return (
                  <tr key={visitor.id} className="align-top">
                    <td className="py-3 pr-4 whitespace-nowrap text-neutral-300">{fmt(visitor.createdAt)}</td>
                    <td className="py-3 pr-4 text-sm text-neutral-300">
                      <div title={visitor.visitorId ?? undefined}>Visitor: {shortId(visitor.visitorId)}</div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-neutral-300">
                      <div title={visitor.sessionId ?? undefined}>Session: {shortId(visitor.sessionId)}</div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-neutral-300 space-y-1">
                      <div className="text-neutral-200">{marketingLine}</div>
                      {visitor.eid && (
                        <div className="text-xs text-neutral-500">eid: {visitor.eid}</div>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-sm text-neutral-300 max-w-[20rem] truncate" title={visitor.referrer ?? ''}>
                      {visitor.referrer || dash}
                    </td>
                    <td className="py-3 pr-4 text-sm text-neutral-300 space-y-1">
                      <div>{visitor.device || dash}{visitor.browser ? ` · ${visitor.browser}` : ''}</div>
                      {visitor.platform ? <div className="text-xs text-neutral-500">{visitor.platform}</div> : null}
                      {connection && (
                        <div className="text-xs text-neutral-500">Conn: {connection}</div>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-sm text-neutral-300 space-y-1">
                      <div>{location}</div>
                      {visitor.language && (
                        <div className="text-xs text-neutral-500">Lang: {visitor.language}</div>
                      )}
                      {visitor.tz && (
                        <div className="text-xs text-neutral-500">TZ: {visitor.tz}</div>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-sm text-neutral-300 space-y-1">
                      {analytics?.engagementScore && (
                        <div>Score: {analytics.engagementScore.toFixed(1)}</div>
                      )}
                      {analytics?.timeOnPageMs && (
                        <div className="text-xs text-neutral-500">Time: {formatDuration(analytics.timeOnPageMs)}</div>
                      )}
                      {analytics?.scrollDepth && (
                        <div className="text-xs text-neutral-500">Scroll: {analytics.scrollDepth.toFixed(0)}%</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}









