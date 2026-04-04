import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
  typescript: true,
})

export const PRICE_ID = 'price_1TINQ2FxDBIkmD85DIpKekhQ'
