import type { Prisma } from '@prisma/client'
import type { ReactNode } from 'react'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getAdminConfig, getSessionCookieName, verifySessionToken } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'
import VisitsTrendChart from '@/components/admin/analytics/VisitsTrendChart'
import DeviceBreakdownChart from '@/components/admin/analytics/DeviceBreakdownChart'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function fmt(d: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Vancouver',
  }).format(d)
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] uppercase tracking-wide text-neutral-300">
      {children}
    </span>
  )
}

const dash = <span className="text-neutral-500">-</span>

function shortId(id?: string | null): ReactNode {
  if (!id) return dash
  if (id.length <= 12) return id
  return id.slice(0, 6) + '…' + id.slice(-4)
}

function formatDuration(ms?: number | null) {
  if (!ms || ms < 0) return '-'
  if (ms < 1000) return `${ms} ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.round((ms % 60000) / 1000)
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

function formatConnection(connection: any) {
  if (!connection) return null
  const bits: string[] = []
  if (connection.effectiveType) bits.push(connection.effectiveType)
  if (typeof connection.downlink === 'number') bits.push(`${connection.downlink} Mbps`)
  if (typeof connection.rtt === 'number') bits.push(`${connection.rtt} ms RTT`)
  if (connection.saveData) bits.push('save-data')
  return bits.length ? bits.join(' · ') : null
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0%'
  return `${(value * 100).toFixed(1)}%`
}

function asRecord(value: Prisma.JsonValue | null): Record<string, any> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, any>
}

function asStringArray(value: Prisma.JsonValue | null): string[] | null {
  if (!value || !Array.isArray(value)) return null
  return value.map((item) => String(item))
}

type VisibilityEvent = { state: string; at: number }

function asVisibilityList(value: Prisma.JsonValue | null): VisibilityEvent[] {
  if (!value || !Array.isArray(value)) return []
  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const record = entry as Record<string, any>
      const state = typeof record.state === 'string' ? record.state : null
      const at = typeof record.at === 'number' ? record.at : null
      if (!state || at === null) return null
      return { state, at }
    })
    .filter((item): item is VisibilityEvent => item !== null)
}

type SearchParams = { [k: string]: string | string[] | undefined }

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined

  const adminConfig = getAdminConfig()
  if (!adminConfig) {
    redirect('/admin/login?error=config')
  }

  const { sessionSecret } = adminConfig

  const token = cookies().get(getSessionCookieName())?.value
  const session = verifySessionToken(token, sessionSecret)
  if (!session) {
    const next = q ? `/admin/analytics?q=${encodeURIComponent(q)}` : '/admin/analytics'
    redirect(`/admin/login?next=${encodeURIComponent(next)}`)
  }

  if (!process.env.DATABASE_URL) {
    return (
      <div className="min-h-[100svh] grid place-items-center p-6">
        <div className="max-w-lg w-full glass rounded-2xl p-6">
          <h1 className="text-xl font-semibold mb-2">Database not configured</h1>
          <p className="text-sm text-gray-600">Set <code>DATABASE_URL</code> in your environment before loading analytics.</p>
        </div>
      </div>
    )
  }

  const now = new Date()
  const dayMs = 1000 * 60 * 60 * 24
  const visitsTrendDays = 14
  const visitsTrendStart = new Date(now.getTime() - (visitsTrendDays - 1) * dayMs)
  const last7Date = new Date(now.getTime() - 7 * dayMs)
  const last30Date = new Date(now.getTime() - 30 * dayMs)

  // Filters (simple "q" search)
  const visitWhere = q
    ? {
        OR: [
          { visitorId: { contains: q } },
          { sessionId: { contains: q } },
          { eid: { contains: q } },
          { utmCampaign: { contains: q, mode: 'insensitive' as const } },
          { utmSource: { contains: q, mode: 'insensitive' as const } },
          { referrer: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const rsvpWhere = q
    ? {
        OR: [
          { email: { contains: q, mode: 'insensitive' as const } },
          { fullName: { contains: q, mode: 'insensitive' as const } },
          { eid: { contains: q } },
          { utmCampaign: { contains: q, mode: 'insensitive' as const } },
          { utmSource: { contains: q, mode: 'insensitive' as const } },
          { referrer: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [
    visits,
    rsvps,
    totals,
    visitsLast7,
    visitAggregates,
    engagedCount,
    deepScrollCount,
    visitsByDayRaw,
    topPagesRaw,
    topReferrersRaw,
    topCountriesRaw,
    deviceBreakdownRaw,
    utmSourceRaw,
    utmCampaignRaw,
  ] = await Promise.all([
    prisma.visit.findMany({ where: visitWhere as any, orderBy: { createdAt: 'desc' }, take: 200 }),
    prisma.rSVP.findMany({ where: rsvpWhere as any, orderBy: { createdAt: 'desc' }, take: 200 }),
    (async () => ({
      visits: await prisma.visit.count(),
      rsvps: await prisma.rSVP.count(),
    }))(),
    prisma.visit.count({ where: { createdAt: { gte: last7Date } } }),
    prisma.visit.aggregate({
      _avg: { timeOnPageMs: true, scrollDepth: true, dpr: true },
      _count: { _all: true },
    }),
    prisma.visit.count({ where: { timeOnPageMs: { gt: 60_000 } } }),
    prisma.visit.count({ where: { scrollDepth: { gte: 75 } } }),
    prisma.$queryRaw<Array<{ date: Date; count: number }>>`
      SELECT date_trunc('day', "createdAt")::date AS date, COUNT(*)::int AS count
      FROM "Visit"
      WHERE "createdAt" >= ${visitsTrendStart}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<Array<{ path: string | null; count: number }>>`
      SELECT "path" AS path, COUNT(*)::int AS count
      FROM "Visit"
      WHERE "createdAt" >= ${last30Date}
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 6
    `,
    prisma.$queryRaw<Array<{ referrer: string | null; count: number }>>`
      SELECT COALESCE(NULLIF("referrer", ''), 'direct') AS referrer, COUNT(*)::int AS count
      FROM "Visit"
      WHERE "createdAt" >= ${last30Date}
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 6
    `,
    prisma.$queryRaw<Array<{ country: string | null; count: number }>>`
      SELECT COALESCE(NULLIF("country", ''), 'unknown') AS country, COUNT(*)::int AS count
      FROM "Visit"
      WHERE "createdAt" >= ${last30Date}
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 6
    `,
    prisma.$queryRaw<Array<{ device: string | null; count: number }>>`
      SELECT COALESCE(NULLIF("device", ''), 'unknown') AS device, COUNT(*)::int AS count
      FROM "Visit"
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 6
    `,
    prisma.$queryRaw<Array<{ source: string | null; count: number }>>`
      SELECT COALESCE(NULLIF("utmSource", ''), '(none)') AS source, COUNT(*)::int AS count
      FROM "Visit"
      WHERE "utmSource" IS NOT NULL AND "utmSource" <> ''
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 6
    `,
    prisma.$queryRaw<Array<{ campaign: string | null; count: number }>>`
      SELECT COALESCE(NULLIF("utmCampaign", ''), '(none)') AS campaign, COUNT(*)::int AS count
      FROM "Visit"
      WHERE "utmCampaign" IS NOT NULL AND "utmCampaign" <> ''
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 6
    `,
  ])

  const averageTimeOnPageMs = Number(visitAggregates._avg.timeOnPageMs ?? 0)
  const averageScrollDepth = Number(visitAggregates._avg.scrollDepth ?? 0)
  const averageDpr = Number(visitAggregates._avg.dpr ?? 0)
  const totalVisits = totals.visits
  const engagedShare = totalVisits ? engagedCount / totalVisits : 0
  const deepScrollShare = totalVisits ? deepScrollCount / totalVisits : 0

  const dateLabelFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
  const visitsTrendMap = new Map<string, number>()
  for (const row of visitsByDayRaw) {
    const key = row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date)
    visitsTrendMap.set(key, Number(row.count))
  }
  const visitsTrendData: { label: string; count: number }[] = []
  for (let i = 0; i < visitsTrendDays; i += 1) {
    const date = new Date(visitsTrendStart.getTime() + i * dayMs)
    const key = date.toISOString().slice(0, 10)
    visitsTrendData.push({ label: dateLabelFormatter.format(date), count: visitsTrendMap.get(key) ?? 0 })
  }

  const topPages = topPagesRaw.map((row) => ({
    name: row.path && row.path.length > 0 ? row.path : '(unknown)',
    count: Number(row.count),
  }))

  const topReferrers = topReferrersRaw.map((row) => ({
    name: row.referrer && row.referrer.length > 0 ? row.referrer : 'direct',
    count: Number(row.count),
  }))

  const topCountries = topCountriesRaw.map((row) => ({
    name: row.country && row.country.length > 0 ? row.country : 'unknown',
    count: Number(row.count),
  }))

  const deviceData = deviceBreakdownRaw.map((row) => ({
    name: row.device && row.device.length > 0 ? row.device : 'unknown',
    count: Number(row.count),
  }))

  const utmSources = utmSourceRaw.map((row) => ({
    name: row.source && row.source.length > 0 ? row.source : '(none)',
    count: Number(row.count),
  }))

  const utmCampaigns = utmCampaignRaw.map((row) => ({
    name: row.campaign && row.campaign.length > 0 ? row.campaign : '(none)',
    count: Number(row.count),
  }))

  const numberFormatter = new Intl.NumberFormat('en-US')

  const summaryCards = [
    {
      label: 'Total visits',
      value: numberFormatter.format(totalVisits),
      helper: 'All time sessions',
    },
    {
      label: 'Visits (7 days)',
      value: numberFormatter.format(visitsLast7),
      helper: 'Past week volume',
    },
    {
      label: 'Avg time on page',
      value: formatDuration(Math.round(averageTimeOnPageMs)),
      helper: 'Across all visits',
    },
    {
      label: 'Avg scroll depth',
      value: `${Math.round(averageScrollDepth || 0)}%`,
      helper: 'Across all visits',
    },
    {
      label: 'Engaged visits',
      value: formatPercent(engagedShare),
      helper: `${numberFormatter.format(engagedCount)} sessions > 60s`,
    },
    {
      label: 'Deep scroll share',
      value: formatPercent(deepScrollShare),
      helper: `${numberFormatter.format(deepScrollCount)} reached 75%`,
    },
  ]

  return (
    <div className="min-h-[100svh] bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Admin · Analytics</h1>
            <p className="text-sm text-neutral-400 mt-1">Last 200 rows shown below. Total Visits: {totals.visits}, RSVPs: {totals.rsvps}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <form className="flex gap-2" action="/admin/analytics" method="get">
              <input
                name="q"
                defaultValue={q || ''}
                placeholder="Search email, eid, campaign…"
                className="w-56 rounded-lg px-3 py-2 bg-neutral-900 border border-neutral-800 outline-none focus:ring-2 ring-brand-sage"
              />
              <button className="rounded-lg bg-brand-ink hover:bg-brand-mid px-3 py-2">Search</button>
            </form>
            <div className="flex gap-2 flex-wrap">
              <a
                className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-3 py-2"
                href="/api/admin/export?type=rsvps"
              >
                Export RSVPs CSV
              </a>
              <a
                className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-3 py-2"
                href="/api/admin/export?type=visits"
              >
                Export Visits CSV
              </a>
              <form action="/admin/logout" method="post">
                <button className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-3 py-2">
                  Log out
                </button>
              </form>
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-wide text-neutral-400">{card.label}</div>
              <div className="mt-2 text-2xl font-semibold text-neutral-50">{card.value}</div>
              <div className="mt-1 text-xs text-neutral-500">{card.helper}</div>
            </div>
          ))}
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="glass rounded-2xl p-4 sm:p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Visits trend (last 14 days)</h2>
            <VisitsTrendChart data={visitsTrendData} />
          </div>
          <div className="glass rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Device &amp; hardware mix</h2>
            <DeviceBreakdownChart data={deviceData} />
            <div className="mt-4 text-xs text-neutral-500 space-y-1">
              <div>Average device DPR: {Number.isFinite(averageDpr) && averageDpr > 0 ? averageDpr.toFixed(2) : '—'}</div>
              <div>Engaged sessions (&gt;60s): {formatPercent(engagedShare)}</div>
              <div>Deep scroll (&ge;75%): {formatPercent(deepScrollShare)}</div>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="glass rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Top pages (30 days)</h2>
            <ul className="space-y-2 text-sm">
              {topPages.length ? (
                topPages.map((item, idx) => (
                  <li key={`${item.name}-${idx}`} className="flex items-center justify-between gap-2">
                    <span className="truncate text-neutral-200" title={item.name}>{item.name}</span>
                    <span className="text-neutral-400">{numberFormatter.format(item.count)}</span>
                  </li>
                ))
              ) : (
                <li className="text-neutral-500">Not enough data yet.</li>
              )}
            </ul>
          </div>
          <div className="glass rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Top referrers (30 days)</h2>
            <ul className="space-y-2 text-sm">
              {topReferrers.length ? (
                topReferrers.map((item, idx) => (
                  <li key={`${item.name}-${idx}`} className="flex items-center justify-between gap-2">
                    <span className="truncate text-neutral-200" title={item.name}>{item.name}</span>
                    <span className="text-neutral-400">{numberFormatter.format(item.count)}</span>
                  </li>
                ))
              ) : (
                <li className="text-neutral-500">Not enough data yet.</li>
              )}
            </ul>
          </div>
          <div className="glass rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Top countries (30 days)</h2>
            <ul className="space-y-2 text-sm">
              {topCountries.length ? (
                topCountries.map((item, idx) => (
                  <li key={`${item.name}-${idx}`} className="flex items-center justify-between gap-2">
                    <span className="truncate text-neutral-200" title={item.name}>{item.name}</span>
                    <span className="text-neutral-400">{numberFormatter.format(item.count)}</span>
                  </li>
                ))
              ) : (
                <li className="text-neutral-500">Not enough data yet.</li>
              )}
            </ul>
          </div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-2">
          <div className="glass rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Top UTM sources</h2>
            <ul className="space-y-2 text-sm">
              {utmSources.length ? (
                utmSources.map((item, idx) => (
                  <li key={`${item.name}-${idx}`} className="flex items-center justify-between gap-2">
                    <span className="truncate text-neutral-200" title={item.name}>{item.name}</span>
                    <span className="text-neutral-400">{numberFormatter.format(item.count)}</span>
                  </li>
                ))
              ) : (
                <li className="text-neutral-500">Not enough data yet.</li>
              )}
            </ul>
          </div>
          <div className="glass rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Top UTM campaigns</h2>
            <ul className="space-y-2 text-sm">
              {utmCampaigns.length ? (
                utmCampaigns.map((item, idx) => (
                  <li key={`${item.name}-${idx}`} className="flex items-center justify-between gap-2">
                    <span className="truncate text-neutral-200" title={item.name}>{item.name}</span>
                    <span className="text-neutral-400">{numberFormatter.format(item.count)}</span>
                  </li>
                ))
              ) : (
                <li className="text-neutral-500">Not enough data yet.</li>
              )}
            </ul>
          </div>
        </section>

        {/* RSVPs */}
        <section className="glass rounded-2xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Recent RSVPs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-sm">
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
                  const location = [r.city, r.region, r.country].filter(Boolean).join(', ') || '-'
                  const marketingLine = `${r.utmSource || '-'} / ${r.utmMedium || '-'} / ${r.utmCampaign || '-'}`
                  const marketingMeta = [
                    r.eid ? `eid: ${r.eid}` : null,
                    r.utmTerm ? `term: ${r.utmTerm}` : null,
                    r.utmContent ? `content: ${r.utmContent}` : null,
                  ].filter(Boolean)
                  const dietary = [r.dietaryPreference, r.dietaryOther].filter(Boolean).join(' · ')
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
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Visits */}
        <section className="glass rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-3">Recent Visits</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full text-sm">
              <thead className="text-left text-neutral-300">
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Path</th>
                  <th className="py-2 pr-4">Visitor</th>
                  <th className="py-2 pr-4">Marketing</th>
                  <th className="py-2 pr-4">Referrer</th>
                  <th className="py-2 pr-4">Client</th>
                  <th className="py-2 pr-4">Engagement</th>
                  <th className="py-2 pr-4">Geo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visits.map((v) => {
                  const location = [v.city, v.region, v.country].filter(Boolean).join(', ') || '-'
                  const marketingLine = `${v.utmSource || '-'} / ${v.utmMedium || '-'} / ${v.utmCampaign || '-'}`
                  const marketingMeta = [
                    v.eid ? `eid: ${v.eid}` : null,
                    v.utmTerm ? `term: ${v.utmTerm}` : null,
                    v.utmContent ? `content: ${v.utmContent}` : null,
                    v.gclid ? `gclid: ${v.gclid}` : null,
                    v.fbclid ? `fbclid: ${v.fbclid}` : null,
                    v.msclkid ? `msclkid: ${v.msclkid}` : null,
                  ].filter(Boolean)
                  const resolution = v.screenW && v.screenH ? `${v.screenW}×${v.screenH}` : null
                  const viewport = v.viewportW && v.viewportH ? `${v.viewportW}×${v.viewportH}` : null
                  const connection = formatConnection(asRecord(v.connection))
                  const languageList = asStringArray(v.languages)?.join(', ') ?? null
                  const interactions = asRecord(v.interactionCounts)
                  const visibilityEvents = asVisibilityList(v.visibility)
                  return (
                    <tr key={v.id} className="align-top">
                      <td className="py-3 pr-4 whitespace-nowrap text-neutral-300">{fmt(v.createdAt)}</td>
                      <td className="py-3 pr-4 text-sm text-neutral-200 space-y-1">
                        <div className="font-medium text-neutral-50">{v.path}</div>
                        {v.query ? <div className="text-xs text-neutral-500 break-all">{v.query}</div> : null}
                      </td>
                      <td className="py-3 pr-4 text-sm text-neutral-300 space-y-1">
                        <div title={v.visitorId ?? undefined}>Visitor: {shortId(v.visitorId)}</div>
                        <div title={v.sessionId ?? undefined}>Session: {shortId(v.sessionId)}</div>
                        {v.eid ? <div className="text-xs text-neutral-500">eid: {v.eid}</div> : null}
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
                      <td className="py-3 pr-4 text-sm text-neutral-300 max-w-[18rem] truncate" title={v.referrer ?? ''}>
                        {v.referrer || dash}
                      </td>
                      <td className="py-3 pr-4 text-sm text-neutral-300 space-y-1">
                        <div>{v.device || dash}{v.browser ? ` · ${v.browser}` : ''}</div>
                        {v.platform ? <div className="text-xs text-neutral-500">{v.platform}</div> : null}
                        {viewport ? <div className="text-xs text-neutral-500">Viewport {viewport}</div> : null}
                        <div className="flex flex-wrap gap-1 text-xs text-neutral-500">
                          {resolution ? <Pill>{`Screen ${resolution}`}</Pill> : null}
                          {typeof v.dpr === 'number' ? <Pill>{`${v.dpr.toFixed(1)}x DPR`}</Pill> : null}
                          {v.orientation ? <Pill>{v.orientation}</Pill> : null}
                          {typeof v.deviceMemory === 'number' ? <Pill>{`${v.deviceMemory} GB RAM`}</Pill> : null}
                          {typeof v.hardwareConcurrency === 'number' ? <Pill>{`${v.hardwareConcurrency} cores`}</Pill> : null}
                          {typeof v.maxTouchPoints === 'number' ? <Pill>{`${v.maxTouchPoints} touch`}</Pill> : null}
                        </div>
                        {connection ? <div className="text-xs text-neutral-500">Conn: {connection}</div> : null}
                        {languageList ? <div className="text-xs text-neutral-500">Langs: {languageList}</div> : null}
                      </td>
                      <td className="py-3 pr-4 text-sm text-neutral-300 space-y-1">
                        <div>Time on page: {formatDuration(v.timeOnPageMs)}</div>
                        <div>Scroll depth: {typeof v.scrollDepth === 'number' ? `${v.scrollDepth}%` : '-'}</div>
                        {interactions ? (
                          <div className="text-xs text-neutral-500 space-x-2">
                            {'clicks' in interactions ? <span>Clicks: {interactions.clicks}</span> : null}
                            {'keypresses' in interactions ? <span>Keys: {interactions.keypresses}</span> : null}
                            {'copies' in interactions ? <span>Copies: {interactions.copies}</span> : null}
                            {'pointerMoves' in interactions ? <span>Pointer: {interactions.pointerMoves}</span> : null}
                          </div>
                        ) : null}
                        {visibilityEvents.length ? (
                          <div className="text-xs text-neutral-500">
                            Visible events: {visibilityEvents.length}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4 text-sm text-neutral-300 space-y-1">
                        <div>{location}</div>
                        <div className="text-xs text-neutral-500">IP hash: {v.ipHash || dash}</div>
                        {v.language ? <div className="text-xs text-neutral-500">Lang: {v.language}</div> : null}
                        {v.tz ? <div className="text-xs text-neutral-500">TZ: {v.tz}</div> : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
