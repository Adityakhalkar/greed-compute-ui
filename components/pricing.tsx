'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started. No credit card.',
    features: [
      '500 executions / day',
      '3 concurrent sessions',
      '50 MB checkpoint storage',
      '1 day retention',
      'Blank template only',
      '5 fork workers max',
    ],
    cta: 'Get API key',
    href: '/login',
    accent: false,
    checkout: false,
  },
  {
    name: 'Pay as you go',
    price: '$0.001',
    period: '/ execution',
    description: '500 free daily. Pay only for what you use.',
    features: [
      '500 free executions / day',
      '$0.001 per execution after (= $1 / 1,000)',
      '50 concurrent sessions',
      '5 GB checkpoint storage',
      '30 day retention',
      'All templates (ML, data-science, scraping)',
      'Fork up to 50 workers',
      '$0 monthly minimum',
    ],
    cta: 'Add payment method',
    href: '#',
    accent: true,
    checkout: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Dedicated infra, SLAs, volume pricing.',
    features: [
      'Unlimited everything',
      'Dedicated warm pool',
      'Custom templates',
      'SSO / SAML',
      'SLA 99.9%',
      'Slack / dedicated support',
    ],
    cta: 'Talk to us',
    href: 'mailto:hello@deep-ml.com?subject=greed-compute enterprise',
    accent: false,
    checkout: false,
  },
]

export function Pricing() {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          plan: 'pro',
          success_url: `${window.location.origin}/dashboard?upgraded=true`,
          cancel_url: `${window.location.origin}/upgrade`,
        }),
      })
      if (res.status === 401) {
        window.location.href = '/login'
        return
      }
      const data = await res.json()
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="pricing" className="border-t border-border px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-xs tracking-widest uppercase text-text-tertiary mb-3 font-mono">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-text-primary">Costs less than the tokens you save.</h2>
          <p className="text-text-secondary mt-3 max-w-lg">
            500 free executions every day. After that, $0.001 per execution. If your agent
            makes 100 tool calls a day, greed-compute costs $0.05. The tokens it saves you?
            Worth $2-15 depending on your model. Do the math.
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

              {plan.checkout ? (
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="block text-center py-2.5 text-xs font-medium transition-colors bg-accent text-background hover:bg-accent-dim disabled:opacity-50"
                >
                  {loading ? 'Redirecting...' : plan.cta}
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
      </div>
    </section>
  )
}
