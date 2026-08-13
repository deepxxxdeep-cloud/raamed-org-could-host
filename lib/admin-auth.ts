import { createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_SESSION_COOKIE = 'raamed_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 2

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_LOGIN_PASSWORD || ''
}

export function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const payload = `admin:${expiresAt}`
  const signature = createHmac('sha256', getSessionSecret()).update(payload).digest('hex')
  return `${payload}.${signature}`
}

export function isValidAdminSession(value: string | undefined) {
  if (!value || !getSessionSecret()) return false
  const separator = value.lastIndexOf('.')
  if (separator <= 0) return false
  const payload = value.slice(0, separator)
  const signature = value.slice(separator + 1)
  const [role, expiresAtText] = payload.split(':')
  if (role !== 'admin' || !expiresAtText || !signature) return false
  const expiresAt = Number(expiresAtText)
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return false
  const expected = createHmac('sha256', getSessionSecret()).update(payload).digest('hex')
  if (signature.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

export { SESSION_TTL_SECONDS }
