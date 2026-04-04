import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const LOGIN_COOKIE = 'greed_login'
const SESSION_COOKIE = 'greed_session'

// Creates a Stripe billing portal session so users can manage their subscription
export async function POST() {
  const jar = await cookies()
  const apiKey = jar.get(SESSION_COOKIE)?.value
  const login = jar.get(LOGIN_COOKIE)?.value

  if (!apiKey || !login) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const customers = await stripe.customers.list({ limit: 1, email: `${login}@greed-compute.user` })
  if (customers.data.length === 0) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://greed-compute-ui.vercel.app'}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
