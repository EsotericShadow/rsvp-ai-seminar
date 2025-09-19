'use client';

import { useEffect } from 'react';

type Connection = {
  downlink?: number
  effectiveType?: string
  rtt?: number
  saveData?: boolean
}

type VisibilityEvent = {
  state: DocumentVisibilityState
  at: number
}

const hasDoNotTrack = () => {
  if (typeof navigator === 'undefined') return false
  const nav: any = navigator
  const win: any = window
  const signals = [nav.doNotTrack, nav.msDoNotTrack, win?.doNotTrack]
  const gpc = nav.globalPrivacyControl
  return signals.includes('1') || signals.includes('yes') || gpc === true
}

export default function AnalyticsBeacon() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (hasDoNotTrack()) return

    let sent = false
    let pointerMoves = 0
    let clickCount = 0
    let keypressCount = 0
    let copyCount = 0
    let maxScrollPercent = 0

    const startTime = performance.now()

    const doc = document.documentElement
    const computeScroll = () => {
      const totalScrollable = doc.scrollHeight - window.innerHeight
      if (totalScrollable <= 0) {
        maxScrollPercent = 100
        return
      }
      const current = window.scrollY
      const percent = Math.round((current / totalScrollable) * 100)
      if (percent > maxScrollPercent) {
        maxScrollPercent = Math.min(percent, 100)
      }
    }

    computeScroll()

    const onScroll = () => computeScroll()
    const onClick = () => clickCount++
    const onKey = () => keypressCount++
    const onCopy = () => copyCount++
    const onPointerMove = () => {
      pointerMoves++
      if (pointerMoves > 5000) {
        // cap to avoid runaway counts
        pointerMoves = 5000
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    document.addEventListener('copy', onCopy)
    document.addEventListener('pointermove', onPointerMove, { passive: true })

    const visibilityTimeline: VisibilityEvent[] = [
      { state: document.visibilityState, at: Date.now() },
    ]
    const onVisibility = () => {
      const state = document.visibilityState
      visibilityTimeline.push({ state, at: Date.now() })
      if (state === 'hidden') {
        send('visibilityhidden')
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    const conn: any = (navigator as any).connection
    const snapshotConnection = (): Connection | undefined => {
      if (!conn) return undefined
      return {
        downlink: typeof conn.downlink === 'number' ? conn.downlink : undefined,
        effectiveType: conn.effectiveType,
        rtt: typeof conn.rtt === 'number' ? conn.rtt : undefined,
        saveData: conn.saveData ?? undefined,
      }
    }

    let connectionInfo = snapshotConnection()
    const onConnectionChange = () => {
      connectionInfo = snapshotConnection()
    }
    if (conn?.addEventListener) {
      conn.addEventListener('change', onConnectionChange)
    } else if (conn) {
      conn.onchange = onConnectionChange
    }

    const storagePromise = (async () => {
      try {
        if (navigator.storage && typeof navigator.storage.estimate === 'function') {
          return await navigator.storage.estimate()
        }
      } catch (err) {
        // ignore
      }
      return undefined
    })()

    const getNavigationTiming = () => {
      const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      if (!entry) return undefined
      return {
        type: entry.type,
        startTime: Math.round(entry.startTime),
        duration: Math.round(entry.duration),
        domContentLoaded: Math.round(entry.domContentLoadedEventEnd),
        loadEventEnd: Math.round(entry.loadEventEnd),
        responseEnd: Math.round(entry.responseEnd),
        requestStart: Math.round(entry.requestStart),
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
        redirectCount: entry.redirectCount,
      }
    }

    const getPaintTimings = () =>
      performance.getEntriesByType('paint').map((entry) => ({
        name: entry.name,
        startTime: Math.round(entry.startTime),
        duration: Math.round(entry.duration),
      }))

    const buildPayload = async (reason: string) => {
      const storage = await storagePromise

      return {
        page: window.location.pathname,
        query: window.location.search || '',
        referrer: document.referrer || undefined,
        screenW: window.screen?.width,
        screenH: window.screen?.height,
        viewportW: window.innerWidth,
        viewportH: window.innerHeight,
        orientation: window.screen.orientation?.type,
        dpr: window.devicePixelRatio || 1,
        language: navigator.language || (navigator as any).userLanguage,
        languages: navigator.languages && navigator.languages.length ? navigator.languages : undefined,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        userAgent: navigator.userAgent,
        platform: (navigator as any).userAgentData?.platform || navigator.platform,
        deviceMemory: (navigator as any).deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        maxTouchPoints: navigator.maxTouchPoints,
        connection: connectionInfo,
        storage,
        navigation: getNavigationTiming(),
        paint: getPaintTimings(),
        performance: {
          timeOrigin: Math.round(performance.timeOrigin),
          now: Math.round(performance.now()),
        },
        scrollDepth: maxScrollPercent,
        timeOnPageMs: Math.round(performance.now() - startTime),
        interactionCounts: {
          clicks: clickCount,
          keypresses: keypressCount,
          copies: copyCount,
          pointerMoves,
        },
        visibility: visibilityTimeline,
        reason,
      }
    }

    const send = async (reason: string) => {
      if (sent) return
      sent = true

      try {
        const payload = await buildPayload(reason)
        const serialized = JSON.stringify(payload, (_key, value) => (value === undefined ? undefined : value))
        if (navigator.sendBeacon) {
          const blob = new Blob([serialized], { type: 'application/json' })
          navigator.sendBeacon('/api/track/visit', blob)
        } else {
          await fetch('/api/track/visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
            cache: 'no-store',
            body: serialized,
          })
        }
      } catch (err) {
        // ignore
      }
    }

    const handlePageHide = () => send('pagehide')
    const handleBeforeUnload = () => send('beforeunload')
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('beforeunload', handleBeforeUnload)

    const fallbackTimeout = window.setTimeout(() => send('timeout'), 10000)

    return () => {
      window.clearTimeout(fallbackTimeout)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('copy', onCopy)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (conn?.removeEventListener) {
        conn.removeEventListener('change', onConnectionChange)
      } else if (conn) {
        conn.onchange = null
      }
    }
  }, [])

  return null
}
