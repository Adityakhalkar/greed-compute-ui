import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  httpClient: Stripe.createFetchHttpClient(),
})

export const PRICE_ID = 'price_1TINQ2FxDBIkmD85DIpKekhQ'
