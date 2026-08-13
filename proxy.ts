import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/')
  const isAdminApi = pathname.startsWith('/api/admin/')
  const isLoginPage = pathname === '/admin/login'
  const isLoginApi = pathname === '/api/admin/login'

  if ((!isAdminPage && !isAdminApi) || isLoginPage || isLoginApi) return NextResponse.next()

  if (isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) return NextResponse.next()

  if (isAdminApi) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const loginUrl = new URL('/admin/login', request.url)
  loginUrl.searchParams.set('redirect', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
