'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Nav } from '@/components/nav'
import { session } from '@/lib/api'
import { cn } from '@/lib/utils'

interface BillingStatus {
  plan: string
  login?: string
  subscription?: {
    id: string
    status: string
    current_period_end: number
  }
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="1" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-border rounded', className)} />
}

function StatCardSkeleton() {
  return (
    <div className="border border-border bg-surface p-6">
      <SkeletonBlock className="h-3 w-24 mb-4" />
      <SkeletonBlock className="h-7 w-32 mb-3" />
      <SkeletonBlock className="h-1 w-full" />
    </div>
  )
}

function LinkCardSkeleton() {
  return (
    <div className="border border-border bg-surface p-6">
      <SkeletonBlock className="h-4 w-28 mb-2" />
      <SkeletonBlock className="h-3 w-48" />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:px-12">
      <div className="flex items-start justify-between mb-10">
        <div>
          <SkeletonBlock className="h-7 w-40 mb-2" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
        <SkeletonBlock className="h-4 w-16" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LinkCardSkeleton />
        <LinkCardSkeleton />
      </div>
    </div>
  )
}

const PLAN_LIMITS = {
  free: { sessions: 3, executions: '500 / day', storage: '50 MB', retention: '1 day', workers: 5 },
  'pay-as-you-go': { sessions: 50, executions: '500 free + $0.001 each', storage: '5 GB', retention: '30 days', workers: 50 },
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const [login, setLogin]           = useState<string>('')
  const [newKey, setNewKey]         = useState<string | null>(null)
  const [keyCopied, setKeyCopied]   = useState(false)
  const [billing, setBilling]       = useState<BillingStatus | null>(null)
  const [loading, setLoading]       = useState(true)
  const [ready, setReady]           = useState(false)

  useEffect(() => {
    const urlKey   = searchParams.get('key')
    const urlLogin = searchParams.get('login')

    if (urlKey) {
      session.set(urlKey, urlLogin || '').then(() => {
        setLogin(urlLogin || '')
        setNewKey(urlKey)
        setReady(true)
        window.history.replaceState({}, '', '/dashboard')
      })
    } else {
      session.check().then(s => {
        setLogin(s.login || '')
        setReady(true)
      })
    }
  }, [searchParams])

  // Fetch billing status from Stripe
  useEffect(() => {
    if (!ready) return
    setLoading(true)
    fetch('/api/stripe/status', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(setBilling)
      .catch(() => setBilling({ plan: 'free' }))
      .finally(() => setLoading(false))
  }, [ready])

  // Clean up ?upgraded= param
  useEffect(() => {
    if (searchParams.get('upgraded')) {
      toast.success('Payment method added — you\'re on pay-as-you-go!')
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams])

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setKeyCopied(true)
    toast.success('API key copied')
    setTimeout(() => setKeyCopied(false), 2000)
  }

  const signOut = async () => {
    await session.clear()
    window.location.href = '/login'
  }

  const openBilling = async () => {
    const res = await fetch('/api/stripe/portal', { method: 'POST', credentials: 'same-origin' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  if (!ready) return <DashboardSkeleton />

  const plan = billing?.plan || 'free'
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
  const isPaid = plan === 'pay-as-you-go'

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:px-12">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Dashboard</h1>
          {login && <p className="text-xs text-text-tertiary font-mono">@{login}</p>}
        </div>
        <button onClick={signOut} className="text-xs text-text-tertiary hover:text-text-secondary transition-colors font-mono">
          Sign out
        </button>
      </div>

      <AnimatePresence>
        {newKey && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="border border-accent bg-surface p-5 mb-8"
          >
            <p className="text-xs text-accent font-mono tracking-widest uppercase mb-3">Your API key</p>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              Copy this now. For security we won't show it again — sign in again anytime to retrieve it.
            </p>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-background border border-border px-3 py-2 text-xs font-mono text-text-primary tracking-wider overflow-x-auto">
                {newKey}
              </code>
              <button
                onClick={() => copyKey(newKey)}
                className="shrink-0 flex items-center gap-2 px-3 py-2 bg-accent text-background text-xs font-medium hover:bg-accent-dim transition-colors"
              >
                <CopyIcon />
                {keyCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button onClick={() => setNewKey(null)} className="mt-3 text-xs text-text-tertiary hover:text-text-secondary transition-colors">
              I've saved it, dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && !billing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      )}

      {billing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="border border-border bg-surface p-6">
            <p className="text-xs uppercase tracking-widest text-text-tertiary mb-2">Plan</p>
            <p className="text-2xl font-semibold text-text-primary capitalize">{plan.replace(/-/g, ' ')}</p>
            {!isPaid && (
              <a href="/upgrade" className="mt-3 inline-block text-xs text-accent hover:text-accent-dim transition-colors">
                Add payment method →
              </a>
            )}
            {isPaid && (
              <button onClick={openBilling} className="mt-3 text-xs text-accent hover:text-accent-dim transition-colors">
                Manage billing →
              </button>
            )}
          </div>
          <div className="border border-border bg-surface p-6">
            <p className="text-xs uppercase tracking-widest text-text-tertiary mb-2">Executions</p>
            <p className="text-lg font-semibold text-text-primary">{limits.executions}</p>
            <p className="mt-2 text-xs text-text-tertiary">
              {isPaid ? 'Metered billing' : 'Hard cap'}
            </p>
          </div>
          <div className="border border-border bg-surface p-6">
            <p className="text-xs uppercase tracking-widest text-text-tertiary mb-2">Limits</p>
            <div className="space-y-1.5 text-xs text-text-secondary">
              <p>{limits.sessions} sessions · {limits.workers} fork workers</p>
              <p>{limits.storage} storage · {limits.retention} retention</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/playground" className="border border-border bg-surface p-6 hover:border-border-strong transition-colors group">
          <p className="text-sm font-medium text-text-primary mb-1 group-hover:text-accent transition-colors">Playground →</p>
          <p className="text-xs text-text-secondary">Run Python in your browser against a live session</p>
        </a>
        {isPaid ? (
          <button onClick={openBilling} className="border border-border bg-surface p-6 hover:border-border-strong transition-colors group text-left">
            <p className="text-sm font-medium text-text-primary mb-1 group-hover:text-accent transition-colors">Manage plan →</p>
            <p className="text-xs text-text-secondary">View billing, invoices, and subscription details</p>
          </button>
        ) : (
          <a href="/upgrade" className="border border-border bg-surface p-6 hover:border-border-strong transition-colors group">
            <p className="text-sm font-medium text-text-primary mb-1 group-hover:text-accent transition-colors">Upgrade plan →</p>
            <p className="text-xs text-text-secondary">More storage, higher rate limits, longer retention</p>
          </a>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <main>
      <Nav />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </main>
  )
}
