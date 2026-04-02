import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'greed_session'
const LOGIN_COOKIE = 'greed_login'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: MAX_AGE,
}

// GET — check auth status without exposing the key
export async function GET() {
  const jar = await cookies()
  const key = jar.get(COOKIE_NAME)?.value
  const login = jar.get(LOGIN_COOKIE)?.value
  return NextResponse.json({
    authenticated: !!key,
    login: login || null,
  })
}

// POST — set session cookie from OAuth callback
export async function POST(req: NextRequest) {
  const { key, login } = await req.json()
  if (!key || typeof key !== 'string') {
    return NextResponse.json({ error: 'Missing API key' }, { status: 400 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, key, cookieOpts)
  if (login) {
    res.cookies.set(LOGIN_COOKIE, login, { ...cookieOpts, httpOnly: false })
  }
  return res
}

// DELETE — clear session
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, '', { ...cookieOpts, maxAge: 0 })
  res.cookies.set(LOGIN_COOKIE, '', { ...cookieOpts, httpOnly: false, maxAge: 0 })
  return res
}
