import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, createAdminSession, SESSION_TTL_SECONDS } from '@/lib/admin-auth'


export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  if (email !== process.env.ADMIN_LOGIN_EMAIL?.trim().toLowerCase() || password !== process.env.ADMIN_LOGIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(ADMIN_SESSION_COOKIE)
  return response
}
