import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getAdminConfig, getSessionCookieName, verifySessionToken } from '@/lib/admin-auth'

export function requireAdminSession() {
  const config = getAdminConfig()
  if (!config) {
    return { response: NextResponse.json({ error: 'Admin access not configured' }, { status: 500 }) }
  }

  const token = cookies().get(getSessionCookieName())?.value
  const session = verifySessionToken(token, config.sessionSecret)
  if (!session) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { session }
}
