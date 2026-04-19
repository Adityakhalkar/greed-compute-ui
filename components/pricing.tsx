'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    name: 'Hobby',
    price: '$0',
    period: 'forever',
    description: 'Get started. No credit card.',
    features: [
      '50 credits / day',
      '1 credit = 1 execution-second',
      '2 concurrent sessions',
      '200 MB checkpoint storage',
      '3-day retention',
      '60 req / min',
    ],
    cta: 'Get API key',
    href: '/login',
    accent: false,
    checkout: false,
    plan: null,
  },
  {
    name: 'Builder',
    price: '$15',
    period: '/ month',
    description: 'For developers building real agent workflows.',
    features: [
      '500 credits / day',
      '1 credit = 1 execution-second',
      '10 concurrent sessions',
      '5 GB checkpoint storage',
      '30-day retention',
      '300 req / min',
      'All session templates',
      'CALF checkpoint fork',
    ],
    cta: 'Upgrade to Builder',
    href: '#',
    accent: true,
    checkout: true,
    plan: 'builder',
  },
  {
    name: 'Scale',
    price: '$49',
    period: '/ month',
    description: 'For teams running production agent workloads.',
    features: [
      '5,000 credits / day',
      '1 credit = 1 execution-second',
      '100 concurrent sessions',
      '50 GB checkpoint storage',
      '90-day retention',
      '2,000 req / min',
      'Shared Agent Workspaces (SAW)',
      'Agent swarm / map-reduce',
    ],
    cta: 'Upgrade to Scale',
    href: '#',
    accent: false,
    checkout: true,
    plan: 'scale',
  },
]

export function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleCheckout = async (plan: string) => {
    setLoadingPlan(plan)
    try {
      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          plan,
          success_url: `${window.location.origin}/dashboard?upgraded=1`,
          cancel_url: window.location.href,
        }),
      })
      if (res.status === 401) { window.location.href = '/login'; return }
      const data = await res.json()
      if (data.checkout_url) window.location.href = data.checkout_url
    } catch {
      // silently fail
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <section id="pricing" className="border-t border-border px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-xs tracking-widest uppercase text-text-tertiary mb-3 font-mono">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-text-primary">Costs less than the tokens you save.</h2>
          <p className="text-text-secondary mt-3 max-w-lg">
            1 credit = 1 second of execution time. Credits reset daily at midnight UTC.
            Idle sessions cost zero — you only pay for compute that actually runs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={cn(
                'border p-6 flex flex-col',
                plan.accent ? 'border-accent bg-surface' : 'border-border bg-surface'
              )}
            >
              {plan.accent && (
                <div className="text-xs font-mono text-accent mb-4 tracking-widest uppercase">Recommended</div>
              )}

              <div className="mb-6">
                <p className="text-sm text-text-tertiary mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-semibold text-text-primary tabular-nums">{plan.price}</span>
                  {plan.period && <span className="text-text-tertiary text-sm">{plan.period}</span>}
                </div>
                <p className="text-xs text-text-secondary">{plan.description}</p>
              </div>

              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-text-secondary">
                    <span className="text-accent mt-0.5 shrink-0">·</span>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.checkout && plan.plan ? (
                <button
                  onClick={() => handleCheckout(plan.plan!)}
                  disabled={loadingPlan === plan.plan}
                  className={cn(
                    'block text-center py-2.5 text-xs font-medium transition-colors disabled:opacity-50',
                    plan.accent
                      ? 'bg-accent text-background hover:bg-accent-dim'
                      : 'border border-border text-text-secondary hover:border-border-strong hover:text-text-primary'
                  )}
                >
                  {loadingPlan === plan.plan ? 'Redirecting...' : plan.cta}
                </button>
              ) : (
                <a
                  href={plan.href}
                  className={cn(
                    'block text-center py-2.5 text-xs font-medium transition-colors',
                    plan.accent
                      ? 'bg-accent text-background hover:bg-accent-dim'
                      : 'border border-border text-text-secondary hover:border-border-strong hover:text-text-primary'
                  )}
                >
                  {plan.cta}
                </a>
              )}
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-text-tertiary">
          Need more?{' '}
          <a href="mailto:hello@deep-ml.com?subject=greed-compute enterprise" className="text-accent hover:text-accent-dim transition-colors">
            Contact us
          </a>{' '}
          for custom enterprise plans.
        </p>
      </div>
    </section>
  )
}