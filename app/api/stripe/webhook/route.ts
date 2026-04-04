import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const login = sub.metadata.github_login
      const status = sub.status
      console.log(`[stripe] subscription ${sub.id} for ${login}: ${status}`)
      // TODO: call Rust backend to update user plan
      // e.g. POST compute.deep-ml.com/v1/internal/plan { login, plan: "payg", status }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const login = sub.metadata.github_login
      console.log(`[stripe] subscription cancelled for ${login}`)
      // TODO: call Rust backend to downgrade to free
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      console.log(`[stripe] payment failed for invoice ${invoice.id}`)
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
