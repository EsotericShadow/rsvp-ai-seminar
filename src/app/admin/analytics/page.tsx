import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function fmt(d: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Vancouver',
  }).format(d)
}

type SearchParams = { [k: string]: string | string[] | undefined }

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const key = typeof searchParams.key === 'string' ? searchParams.key : undefined
  const q   = typeof searchParams.q === 'string' ? searchParams.q : undefined

  if (!process.env.ADMIN_KEY) {
    return (
      <div className="min-h-[100svh] grid place-items-center p-6">
        <div className="max-w-lg w-full glass rounded-2xl p-6">
          <h1 className="text-xl font-semibold mb-2">Admin key not configured</h1>
          <p className="text-sm text-gray-600">Set <code>ADMIN_KEY</code> in your .env.</p>
        </div>
      </div>
    )
  }

  if (key !== process.env.ADMIN_KEY) {
    return (
      <div className="min-h-[100svh] grid place-items-center p-6">
        <div className="max-w-sm w-full glass rounded-2xl p-6">
          <h1 className="text-xl font-semibold mb-2">Unauthorized</h1>
          <p className="text-sm text-gray-600">Add <code>?key=YOUR_ADMIN_KEY</code> to the URL.</p>
        </div>
      </div>
    )
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

  const [visits, rsvps, totals] = await Promise.all([
    prisma.visit.findMany({ where: visitWhere as any, orderBy: { createdAt: 'desc' }, take: 200 }),
    prisma.rSVP.findMany({ where: rsvpWhere as any, orderBy: { createdAt: 'desc' }, take: 200 }),
    (async () => ({
      visits: await prisma.visit.count(),
      rsvps: await prisma.rSVP.count(),
    }))(),
  ])

  return (
    <div className="min-h-[100svh] bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Admin · Analytics</h1>
            <p className="text-sm text-neutral-400 mt-1">Last 200 rows shown below. Total Visits: {totals.visits}, RSVPs: {totals.rsvps}</p>
          </div>

          <form className="flex gap-2" action="/admin/analytics" method="get">
            <input type="hidden" name="key" value={key} />
            <input
              name="q"
              defaultValue={q || ''}
              placeholder="Search email, eid, campaign…"
              className="w-56 rounded-lg px-3 py-2 bg-neutral-900 border border-neutral-800 outline-none focus:ring-2 ring-brand-sage"
            />
            <button className="rounded-lg bg-brand-ink hover:bg-brand-mid px-3 py-2">Search</button>
            <a
              className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-3 py-2"
              href={`/api/admin/export?type=rsvps&key=${encodeURIComponent(key!)}`}
            >
              Export RSVPs CSV
            </a>
            <a
              className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-3 py-2"
              href={`/api/admin/export?type=visits&key=${encodeURIComponent(key!)}`}
            >
              Export Visits CSV
            </a>
          </form>
        </header>

        {/* RSVPs */}
        <section className="glass rounded-2xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Recent RSVPs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-neutral-300">
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">UTM</th>
                  <th className="py-2 pr-4">Referrer</th>
                  <th className="py-2 pr-4">Device</th>
                  <th className="py-2 pr-4">Geo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rsvps.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 pr-4 whitespace-nowrap">{fmt(r.createdAt)}</td>
                    <td className="py-2 pr-4">{r.fullName}</td>
                    <td className="py-2 pr-4">{r.email}</td>
                    <td className="py-2 pr-4">
                      <div className="text-neutral-300">
                        {r.utmSource || '-'} / {r.utmMedium || '-'} / {r.utmCampaign || '-'}
                        {r.eid ? <span className="text-neutral-500"> · eid: {r.eid}</span> : null}
                      </div>
                    </td>
                    <td className="py-2 pr-4 max-w-[18rem] truncate" title={r.referrer ?? ''}>{r.referrer || '-'}</td>
                    <td className="py-2 pr-4">{r.device || '-'}{r.browser ? ` · ${r.browser}` : ''}</td>
                    <td className="py-2 pr-4">{[r.city, r.region, r.country].filter(Boolean).join(', ') || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Visits */}
        <section className="glass rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-3">Recent Visits</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-neutral-300">
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Path</th>
                  <th className="py-2 pr-4">UTM</th>
                  <th className="py-2 pr-4">Referrer</th>
                  <th className="py-2 pr-4">Device</th>
                  <th className="py-2 pr-4">Geo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2 pr-4 whitespace-nowrap">{fmt(v.createdAt)}</td>
                    <td className="py-2 pr-4">{v.path}{v.query ? <span className="text-neutral-500"> {v.query}</span> : null}</td>
                    <td className="py-2 pr-4">
                      <div className="text-neutral-300">
                        {v.utmSource || '-'} / {v.utmMedium || '-'} / {v.utmCampaign || '-'}
                        {v.eid ? <span className="text-neutral-500"> · eid: {v.eid}</span> : null}
                      </div>
                    </td>
                    <td className="py-2 pr-4 max-w-[18rem] truncate" title={v.referrer ?? ''}>{v.referrer || '-'}</td>
                    <td className="py-2 pr-4">{v.device || '-'}{v.browser ? ` · ${v.browser}` : ''}</td>
                    <td className="py-2 pr-4">{[v.city, v.region, v.country].filter(Boolean).join(', ') || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
