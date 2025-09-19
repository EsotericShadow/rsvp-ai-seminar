'use client'

import { useState, useCallback } from 'react'

// FAKE TYPES FOR NOW
type BusinessResult = any

export function BusinessDirectoryPanel({
  onAddMember,
}: {
  onAddMember: (business: BusinessResult) => void
}) {
  const [results, setResults] = useState<BusinessResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{ hasMore: boolean; cursor: string | null }>({ hasMore: false, cursor: null })

  const searchBusinesses = useCallback(async (query: string, cursor?: string) => {
    setSearchQuery(query)
    if (!query || query.length < 2) {
      setResults([])
      return
    }
    setIsSearching(true)
    setError(null)
    try {
      const url = `/api/admin/campaign/businesses?q=${encodeURIComponent(query)}&limit=25${cursor ? `&cursor=${cursor}` : ''}`
      const res = await fetch(url)
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Search failed')
      }
      const data = await res.json()
      setResults((prev) => (cursor ? [...prev, ...data.businesses] : data.businesses))
      setPagination(data.pagination)
    } catch (err: any) {
      setError(err?.message || 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }, [])

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
      <header>
        <h2 className="text-xl font-semibold text-white">Business Directory</h2>
        <p className="text-sm text-neutral-400">Search for businesses in the Lead Mine to add to your audience groups.</p>
      </header>

      <div>
        <label className="text-xs uppercase tracking-wide text-neutral-400">Search Lead Mine businesses</label>
        <input
          value={searchQuery}
          onChange={(event) => searchBusinesses(event.target.value)}
          placeholder="Search by business name, contact, or tag"
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
        />
        {isSearching && !results.length ? <p className="mt-2 text-xs text-neutral-500">Searching…</p> : null}
        {error ? <p className="mt-2 text-xs text-red-400">Error: {error}</p> : null}
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {results.map((biz) => (
          <div key={biz.id} className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-black/30 p-3 text-sm">
            <div>
              <p className="font-semibold text-white">{biz.name ?? 'Unknown business'}</p>
              <p className="text-xs text-neutral-400">{biz.contact.primaryEmail || biz.contact.alternateEmail || 'No email'}</p>
              {biz.contact.tags.length ? (
                <p className="mt-1 text-xs text-neutral-500">Tags: {biz.contact.tags.join(', ')}</p>
              ) : null}
            </div>
            <button
              onClick={() => onAddMember(biz)}
              className="rounded-full border border-emerald-400 px-3 py-1 text-xs text-emerald-200 hover:bg-emerald-500/10"
            >
              Add
            </button>
          </div>
        ))}
        {pagination.hasMore && (
          <div className="pt-2 text-center">
            <button
              onClick={() => searchBusinesses(searchQuery, pagination.cursor || undefined)}
              disabled={isSearching}
              className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-50"
            >
              {isSearching ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
