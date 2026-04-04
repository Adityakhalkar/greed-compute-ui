import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const LOGIN_COOKIE = 'greed_login'
const SESSION_COOKIE = 'greed_session'

export async function GET() {
  try {
    const jar = await cookies()
    const apiKey = jar.get(SESSION_COOKIE)?.value
    const login = jar.get(LOGIN_COOKIE)?.value

    if (!apiKey || !login) {
      return NextResponse.json({ plan: 'free', authenticated: false })
    }

    const customers = await stripe.customers.list({
      limit: 1,
      email: `${login}@greed-compute.user`,
    })

    if (customers.data.length === 0) {
      return NextResponse.json({ plan: 'free', login })
    }

    const subs = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1,
    })

    if (subs.data.length > 0) {
      const sub = subs.data[0]
      return NextResponse.json({
        plan: 'pay-as-you-go',
        login,
        subscription: {
          id: sub.id,
          status: sub.status,
          current_period_end: sub.current_period_end,
        },
      })
    }

    return NextResponse.json({ plan: 'free', login })
  } catch (err) {
    console.error('[stripe/status]', err)
    return NextResponse.json({ plan: 'free', error: true })
  }
}
