import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getSessionCookieName } from '@/lib/admin-auth'

export async function POST(request: Request) {
  const store = cookies()
  store.set({
    name: getSessionCookieName(),
    value: '',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    expires: new Date(0),
  })

  const url = new URL('/admin/login?loggedOut=1', request.url)
  return NextResponse.redirect(url)
}

