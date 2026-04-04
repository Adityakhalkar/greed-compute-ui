import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
})

export const PRICE_ID = 'price_1TINQ2FxDBIkmD85DIpKekhQ'
