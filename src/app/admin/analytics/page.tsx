import type { Prisma } from '@prisma/client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getAdminConfig, getSessionCookieName, verifySessionToken } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import AnalyticsClientWrapper from '@/components/admin/analytics/AnalyticsClientWrapper'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type SearchParams = { [k: string]: string | string[] | undefined }

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined
  const tab = typeof searchParams.tab === 'string' ? searchParams.tab : 'overview'

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
          { fullName: { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
          { organization: { contains: q, mode: 'insensitive' as const } },
          { visitorId: { contains: q } },
          { sessionId: { contains: q } },
          { eid: { contains: q } },
        ],
      }
    : {}

  // Fetch data based on current tab
  const [visits, rsvps] = await Promise.all([
    prisma.visit.findMany({
      where: visitWhere,
      orderBy: { createdAt: 'desc' },
      take: tab === 'visitors' ? 1000 : 100,
    }),
    prisma.rSVP.findMany({
      where: rsvpWhere,
      orderBy: { createdAt: 'desc' },
      take: tab === 'rsvps' ? 1000 : 100,
    }),
  ])

  // Calculate overview statistics
  const totalVisits = visits.length
  const totalRSVPs = rsvps.length
  const conversionRate = totalVisits > 0 ? (totalRSVPs / totalVisits) * 100 : 0
  
  // Calculate average session duration from visits
  const avgSessionDuration = visits.reduce((sum, visit) => {
    if (visit.timeOnPageMs) {
      return sum + visit.timeOnPageMs
    }
    return sum
  }, 0) / Math.max(visits.length, 1)

  // Calculate bounce rate (simplified - based on time on page)
  const bounceRate = visits.reduce((sum, visit) => {
    // Consider visits with very short time as bounces
    if (visit.timeOnPageMs && visit.timeOnPageMs < 5000) {
      return sum + 1
    }
    return sum
  }, 0) / Math.max(visits.length, 1) * 100

  // Top countries
  const countryCounts = visits.reduce((acc, visit) => {
    const country = visit.country || 'Unknown'
    acc[country] = (acc[country] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topCountries = Object.entries(countryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }))

  // Top browsers
  const browserCounts = visits.reduce((acc, visit) => {
    const browser = visit.browser || 'Unknown'
    acc[browser] = (acc[browser] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topBrowsers = Object.entries(browserCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([browser, count]) => ({ browser, count }))

  // Calculate device analytics
  const deviceCounts = visits.reduce((acc, visit) => {
    const device = visit.device || 'Unknown'
    acc[device] = (acc[device] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const deviceBreakdown = Object.entries(deviceCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([device, count]) => ({ name: device, count }))

  // Calculate platform analytics
  const platformCounts = visits.reduce((acc, visit) => {
    const platform = visit.platform || 'Unknown'
    acc[platform] = (acc[platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const platformBreakdown = Object.entries(platformCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([platform, count]) => ({ name: platform, count }))

  // Calculate timeline analytics
  const visitsByDay = visits.reduce((acc, visit) => {
    const day = visit.createdAt.toISOString().split('T')[0]
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const visitsTrend = Object.entries(visitsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count]) => ({ label: new Date(day).toLocaleDateString(), count }))

  const rsvpsByDay = rsvps.reduce((acc, rsvp) => {
    const day = rsvp.createdAt.toISOString().split('T')[0]
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const rsvpsTrend = Object.entries(rsvpsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count]) => ({ label: new Date(day).toLocaleDateString(), count }))

  // Calculate hourly patterns
  const hourlyPatterns = visits.reduce((acc, visit) => {
    const hour = visit.createdAt.getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourlyPatterns[i] || 0,
    label: `${i}:00`
  }))

  // Calculate daily patterns (day of week)
  const dailyPatterns = visits.reduce((acc, visit) => {
    const day = visit.createdAt.getDay()
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  const dailyData = [
    { day: 0, name: 'Sunday', count: dailyPatterns[0] || 0 },
    { day: 1, name: 'Monday', count: dailyPatterns[1] || 0 },
    { day: 2, name: 'Tuesday', count: dailyPatterns[2] || 0 },
    { day: 3, name: 'Wednesday', count: dailyPatterns[3] || 0 },
    { day: 4, name: 'Thursday', count: dailyPatterns[4] || 0 },
    { day: 5, name: 'Friday', count: dailyPatterns[5] || 0 },
    { day: 6, name: 'Saturday', count: dailyPatterns[6] || 0 },
  ]

  const overviewStats = {
    totalVisits,
    totalRSVPs,
    conversionRate,
    avgSessionDuration,
    bounceRate,
    topCountries,
    topBrowsers,
    deviceBreakdown,
    platformBreakdown,
    visitsTrend,
    rsvpsTrend,
    hourlyData,
    dailyData,
  }

  return (
    <AdminLayout
      title="Analytics Dashboard"
      subtitle="Comprehensive analytics and insights for your RSVP campaigns and website performance."
      badge="Evergreen Admin"
    >
      <AnalyticsClientWrapper
        initialTab={tab}
        overviewStats={overviewStats}
        rsvps={rsvps}
        visitors={visits}
      />
    </AdminLayout>
  )
}
