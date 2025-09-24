import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionCookieName, verifySessionToken, getAdminConfig } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const config = getAdminConfig()
    if (!config) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const cookieStore = cookies()
    const sessionCookieName = getSessionCookieName()
    const sessionToken = cookieStore.get(sessionCookieName)

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Verify the session token
    const isValid = verifySessionToken(sessionToken.value, config.sessionSecret)

    if (isValid) {
      return NextResponse.json({ authenticated: true })
    }

    return NextResponse.json({ authenticated: false }, { status: 401 })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}

