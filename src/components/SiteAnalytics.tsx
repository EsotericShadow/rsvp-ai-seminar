'use client'

import { usePathname } from 'next/navigation'

import AnalyticsBeacon from '@/components/AnalyticsBeacon'

export default function SiteAnalytics() {
  const pathname = usePathname() || '/'

  if (pathname.startsWith('/admin')) {
    return null
  }

  return <AnalyticsBeacon />
}
