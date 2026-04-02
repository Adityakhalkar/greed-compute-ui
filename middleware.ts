import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'greed_session'

const AUTH_ROUTES = ['/dashboard', '/playground']
const GUEST_ROUTES = ['/login']

export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has(COOKIE_NAME)
  const { pathname } = req.nextUrl

  // Logged-in users visiting /login → send to dashboard
  if (hasSession && GUEST_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Unauthenticated users visiting protected routes → send to login
  if (!hasSession && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/playground/:path*', '/login'],
}
