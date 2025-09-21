import { Suspense } from 'react';

interface RSVP {
  id: string;
  fullName: string;
  email: string;
  organization?: string;
  phone?: string;
  attendeeCount: number;
  attendanceStatus: string;
  dietaryPreference?: string;
  dietaryOther?: string;
  accessibilityNeeds?: string;
  wantsResources: boolean;
  wantsAudit: boolean;
  createdAt: Date;
  visitorId?: string;
  sessionId?: string;
  referrer?: string;
  eid?: string;
  device?: string;
  browser?: string;
  platform?: string;
  userAgent?: string;
  country?: string;
  region?: string;
  city?: string;
}

interface RSVPsTabProps {
  rsvps: RSVP[];
}

function fmt(d: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Vancouver',
  }).format(d);
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] uppercase tracking-wide text-neutral-300">
      {children}
    </span>
  );
}

const dash = <span className="text-neutral-500">-</span>;

function shortId(id?: string | null): React.ReactNode {
  if (!id) return dash;
  if (id.length <= 12) return id;
  return id.slice(0, 6) + '…' + id.slice(-4);
}

export default function RSVPsTab({ rsvps }: RSVPsTabProps) {
  // Calculate RSVP statistics
  const totalRSVPs = rsvps.length;
  const totalAttendees = rsvps.reduce((sum, rsvp) => sum + (rsvp.attendeeCount || 0), 0);
  const withDietaryRestrictions = rsvps.filter(r => r.dietaryPreference || r.dietaryOther).length;
  const wantResources = rsvps.filter(r => r.wantsResources).length;
  const wantAudit = rsvps.filter(r => r.wantsAudit).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">RSVP Analytics</h2>
          <p className="text-gray-300 mt-1">Detailed RSVP submissions and attendee data</p>
        </div>
        <div className="text-sm text-gray-400">
          {totalRSVPs} RSVPs • {totalAttendees} Total Attendees
        </div>
      </div>

      {/* RSVP Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <p className="text-sm font-medium text-gray-300">Total RSVPs</p>
              <p className="text-2xl font-bold text-white">{totalRSVPs}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Total Attendees</p>
              <p className="text-2xl font-bold text-white">{totalAttendees}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Want Resources</p>
              <p className="text-2xl font-bold text-white">{wantResources}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Want Audit</p>
              <p className="text-2xl font-bold text-white">{wantAudit}</p>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Table */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent RSVPs</h3>
          <div className="text-sm text-gray-400">
            Showing {rsvps.length} RSVPs
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full text-sm">
            <thead className="text-left text-neutral-300">
              <tr className="border-b border-white/10">
                <th className="py-2 pr-4">When</th>
                <th className="py-2 pr-4">Attendee</th>
                <th className="py-2 pr-4">Contact</th>
                <th className="py-2 pr-4">Attendance</th>
                <th className="py-2 pr-4">Marketing</th>
                <th className="py-2 pr-4">Referrer</th>
                <th className="py-2 pr-4">Client</th>
                <th className="py-2 pr-4">Geo &amp; Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rsvps.map((r) => {
                const location = [r.city, r.region, r.country].filter(Boolean).join(', ') || '-';
                const marketingLine = r.eid ? `Campaign: ${r.eid}` : '-';
                const marketingMeta = [
                  r.eid ? `eid: ${r.eid}` : null,
                ].filter(Boolean);
                const dietary = [r.dietaryPreference, r.dietaryOther].filter(Boolean).join(' · ');
                
                return (
                  <tr key={r.id} className="align-top">
                    <td className="py-3 pr-4 whitespace-nowrap text-neutral-300">{fmt(r.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-neutral-50">{r.fullName}</div>
                      <div className="text-xs text-neutral-400 break-all">{r.email}</div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-neutral-300 space-y-1">
                      <div>{r.organization || dash}</div>
                      <div className="text-xs text-neutral-500">{r.phone || dash}</div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-neutral-300 space-y-1">
                      <div>
                        {r.attendanceStatus}
                        {typeof r.attendeeCount === 'number' ? ` · ${r.attendeeCount} attending` : ''}
                      </div>
                      {dietary ? <div className="text-xs text-neutral-500">Diet: {dietary}</div> : null}
                      {r.accessibilityNeeds ? (
                        <div className="text-xs text-amber-300">Accessibility: {r.accessibilityNeeds}</div>
                      ) : null}
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Pill>{r.wantsResources ? 'Wants resources' : 'No resources'}</Pill>
                        <Pill>{r.wantsAudit ? 'Wants audit' : 'No audit'}</Pill>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-neutral-300 space-y-1">
                      <div className="text-neutral-200">{marketingLine}</div>
                      {marketingMeta.length ? (
                        <div className="flex flex-wrap gap-1 text-xs text-neutral-500">
                          {marketingMeta.map((item) => (
                            <span key={item}>{item}</span>
                          ))}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-sm text-neutral-300 max-w-[18rem] truncate" title={r.referrer ?? ''}>
                      {r.referrer || dash}
                    </td>
                    <td className="py-3 pr-4 text-sm text-neutral-300 space-y-1">
                      <div>{r.device || dash}{r.browser ? ` · ${r.browser}` : ''}</div>
                      {r.platform ? <div className="text-xs text-neutral-500">{r.platform}</div> : null}
                      {r.userAgent ? (
                        <div className="text-xs text-neutral-600 line-clamp-2" title={r.userAgent}>
                          {r.userAgent}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-sm text-neutral-300 space-y-1">
                      <div>{location}</div>
                      <div className="text-xs text-neutral-500">
                        <div title={r.visitorId ?? undefined}>Visitor: {shortId(r.visitorId)}</div>
                        <div title={r.sessionId ?? undefined}>Session: {shortId(r.sessionId)}</div>
                      </div>
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
