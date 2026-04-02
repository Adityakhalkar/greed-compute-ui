import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://compute.deep-ml.com'
const COOKIE_NAME = 'greed_session'

async function proxy(req: NextRequest) {
  const jar = await cookies()
  const apiKey = jar.get(COOKIE_NAME)?.value
  if (!apiKey) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const url = new URL(req.url)
  const backendPath = url.pathname.replace(/^\/api/, '')
  const backendUrl = `${BACKEND}${backendPath}${url.search}`

  const headers = new Headers()
  headers.set('Content-Type', req.headers.get('Content-Type') || 'application/json')
  headers.set('X-API-Key', apiKey)

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? await req.text()
    : undefined

  const res = await fetch(backendUrl, {
    method: req.method,
    headers,
    body,
  })

  const responseBody = await res.text()
  return new NextResponse(responseBody, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const DELETE = proxy
export const PATCH = proxy
