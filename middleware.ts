import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const SESSION_MS = 30 * 60 * 1000

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const url = req.nextUrl

  // 1) Visitor ID (2 years)
  let vid = req.cookies.get('vid')?.value
  if (!vid) {
    vid = crypto.randomUUID()
    res.cookies.set('vid', vid, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60 * 24 * 365 * 2,
    })
  }

  // 2) Session ID (30-min rolling)
  const now = Date.now()
  let sid = req.cookies.get('sid')?.value
  const sidTs = Number(req.cookies.get('sid_ts')?.value || 0)
  if (!sid || now - sidTs > SESSION_MS) {
    sid = crypto.randomUUID()
    res.cookies.set('sid', sid, { path: '/', httpOnly: true, sameSite: 'lax', secure: true, maxAge: 60 * 60 * 24 })
    res.cookies.set('sid_ts', String(now), { path: '/', httpOnly: true, sameSite: 'lax', secure: true, maxAge: 60 * 60 * 24 })
  } else {
    res.cookies.set('sid_ts', String(now), { path: '/', httpOnly: true, sameSite: 'lax', secure: true, maxAge: 60 * 60 * 24 })
  }

  // 3) Persist UTM/eid/click IDs (90 days)
  const sp = url.searchParams
  const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','eid','gclid','fbclid','msclkid']
  for (const k of utmKeys) {
    const v = sp.get(k)
    if (v) {
      res.cookies.set(k, v, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: 60 * 60 * 24 * 90,
      })
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/__pixel).*)'], // run on pages & normal APIs
}
