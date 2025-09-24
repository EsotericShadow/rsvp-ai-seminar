import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

import { createSessionToken, getAdminConfig, getNewExpiry, getSessionCookieName } from '@/lib/admin-auth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

type SearchParams = { [key: string]: string | string[] | undefined }

async function loginAction(formData: FormData) {
  'use server'

  const config = getAdminConfig()
  if (!config) {
    redirect('/admin/login?error=config')
  }

  const { username: expectedUsername, passwordHash, sessionSecret } = config

  const username = String(formData.get('username') || '')
  const password = String(formData.get('password') || '')
  const nextRaw = String(formData.get('next') || '/admin/analytics')
  const next = nextRaw.startsWith('/') ? nextRaw : '/admin/analytics'

  if (username !== expectedUsername) {
    redirect(`/admin/login?error=invalid&next=${encodeURIComponent(next)}`)
  }

  const ok = await bcrypt.compare(password, passwordHash)

  if (!ok) {
    redirect(`/admin/login?error=invalid&next=${encodeURIComponent(next)}`)
  }

  const expiresAt = getNewExpiry()
  const token = createSessionToken(expectedUsername, sessionSecret, expiresAt)

  cookies().set({
    name: getSessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expiresAt),
  })

  redirect(next)
}

export default function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { error, next, loggedOut } = normalizeParams(searchParams)

  const config = getAdminConfig()
  if (!config) {
    return (
      <div className="min-h-[100svh] grid place-items-center bg-neutral-950 text-neutral-100 p-6">
        <div className="w-full max-w-lg glass rounded-2xl p-6">
          <h1 className="text-xl font-semibold mb-2">Admin login not configured</h1>
          <p className="text-sm text-neutral-400">
            Set <code>ADMIN_USER</code>, <code>ADMIN_PASSWORD_HASH</code>, and <code>ADMIN_SESSION_SECRET</code> in your environment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100svh] grid place-items-center bg-neutral-950 text-neutral-100 p-6">
      <div className="w-full max-w-sm glass rounded-2xl p-6">
        <h1 className="text-xl font-semibold mb-4 text-center">Admin Login</h1>
        {loggedOut ? (
          <div className="mb-4 rounded-lg bg-emerald-500/10 text-emerald-300 px-3 py-2 text-sm">
            Signed out successfully.
          </div>
        ) : null}
        {error ? (
          <div className="mb-4 rounded-lg bg-red-500/10 text-red-300 px-3 py-2 text-sm">
            {error === 'invalid' && 'Invalid username or password.'}
            {error === 'config' && 'Admin credentials are not configured.'}
          </div>
        ) : null}
        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="text-sm text-neutral-400 block mb-1" htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-3 text-white placeholder:text-neutral-400 outline-none focus:ring-2 ring-brand-sage focus:border-brand-sage transition-colors duration-200 min-h-[44px]"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="text-sm text-neutral-400 block mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-3 text-white placeholder:text-neutral-400 outline-none focus:ring-2 ring-brand-sage focus:border-brand-sage transition-colors duration-200 min-h-[44px]"
              placeholder="Enter password"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full rounded-lg bg-brand-ink hover:bg-brand-mid active:bg-brand-mid px-3 py-3 font-medium text-white transition-all duration-200 active:scale-95 touch-manipulation min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand-sage focus:ring-offset-2 focus:ring-offset-neutral-950"
          >
            <span className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign in
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}

function normalizeParams(searchParams: SearchParams) {
  const error = typeof searchParams.error === 'string' ? searchParams.error : undefined
  const nextRaw = typeof searchParams.next === 'string' ? searchParams.next : '/admin/analytics'
  const next = nextRaw.startsWith('/') ? nextRaw : '/admin/analytics'
  const loggedOutParam = searchParams.loggedOut
  const loggedOut = Array.isArray(loggedOutParam) ? loggedOutParam[0] === '1' : loggedOutParam === '1'
  return { error, next, loggedOut }
}
