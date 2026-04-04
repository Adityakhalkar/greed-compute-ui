import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe, PRICE_ID } from '@/lib/stripe'

const LOGIN_COOKIE = 'greed_login'
const SESSION_COOKIE = 'greed_session'

export async function POST() {
  try {
    const jar = await cookies()
    const apiKey = jar.get(SESSION_COOKIE)?.value
    const login = jar.get(LOGIN_COOKIE)?.value

    if (!apiKey || !login) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Find or create Stripe customer by GitHub login
    const existing = await stripe.customers.list({ limit: 1, email: `${login}@greed-compute.user` })
    let customer: string

    if (existing.data.length > 0) {
      customer = existing.data[0].id
    } else {
      const c = await stripe.customers.create({
        email: `${login}@greed-compute.user`,
        name: login,
        metadata: { github_login: login, api_key_prefix: apiKey.slice(0, 12) },
      })
      customer = c.id
    }

    // Check if already subscribed
    const subs = await stripe.subscriptions.list({ customer, status: 'active', limit: 1 })
    if (subs.data.length > 0) {
      return NextResponse.json({ error: 'Already subscribed', subscription_id: subs.data[0].id }, { status: 409 })
    }

    const session = await stripe.checkout.sessions.create({
      customer,
      mode: 'subscription',
      line_items: [{ price: PRICE_ID }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://greed-compute-ui.vercel.app'}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://greed-compute-ui.vercel.app'}/upgrade`,
      subscription_data: {
        metadata: { github_login: login, api_key_prefix: apiKey.slice(0, 12) },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout] Error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
