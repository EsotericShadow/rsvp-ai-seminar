import crypto from 'crypto'

const SESSION_COOKIE = 'admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 12 // 12 hours

type Config = {
  username: string
  passwordHash: string
  sessionSecret: string
}

export function getAdminConfig(): Config | null {
  const username = process.env.ADMIN_USER
  const passwordHash = process.env.ADMIN_PASSWORD_HASH
  const sessionSecret = process.env.ADMIN_SESSION_SECRET

  if (!username || !passwordHash || !sessionSecret) {
    return null
  }

  return {
    username,
    passwordHash,
    sessionSecret,
  }
}

export function getSessionCookieName() {
  return SESSION_COOKIE
}

export function createSessionToken(username: string, secret: string, expiresAt: number) {
  const payload = `${username}:${expiresAt}`
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}:${signature}`
}

export function verifySessionToken(token: string | undefined, secret: string) {
  if (!token) return null

  const parts = token.split(':')
  if (parts.length !== 3) return null

  const [username, expires, signature] = parts
  const payload = `${username}:${expires}`
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')

  if (signature.length !== expected.length) return null

  const sigBuf = Buffer.from(signature, 'hex')
  const expectedBuf = Buffer.from(expected, 'hex')

  if (sigBuf.length !== expectedBuf.length) return null

  try {
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null
  } catch (err) {
    return null
  }

  const expMs = Number(expires)
  if (!Number.isFinite(expMs) || expMs < Date.now()) return null

  return { username, expiresAt: expMs }
}

export function getNewExpiry() {
  return Date.now() + SESSION_TTL_MS
}
