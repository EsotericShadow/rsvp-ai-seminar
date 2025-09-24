'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { JuniperAISystem } from '@/components/ai/JuniperAISystem'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Skip auth check if we're on the login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    // Skip auth check for login page
    if (isLoginPage) {
      setIsLoading(false)
      return
    }

    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/check')
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, isLoginPage])

  // For login page, render children directly without auth check
  if (isLoginPage) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      {/* AI Assistant - Only visible in admin area */}
        <JuniperAISystem isAdmin={true} />
    </div>
  )
}
