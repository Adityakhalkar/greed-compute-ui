'use client'

import { useEffect, useRef } from 'react'

const STATS = [
  { value: '90%', label: 'fewer tokens on API docs', sub: 'cuntext: 500 tokens vs 15,000 for OpenAPI' },
  { value: '47ms', label: 'session creation', sub: 'warm pool, zero cold starts' },
  { value: '80ms', label: 'fork 50 workers', sub: 'from a single checkpoint' },
  { value: '$0', label: 'monthly minimum', sub: 'pay per execution, nothing else' },
]

export function Stats() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rootRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-visible', '')
          observer.disconnect()
        }
      },
      { threshold: 0, rootMargin: '0px 0px -20% 0px' }
    )
    observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={rootRef} className="border-b border-border px-6 py-16 md:px-12 lg:px-24 bg-surface">
      <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((stat, i) => (
          <div key={stat.value} data-stat style={{ transitionDelay: `${i * 0.1}s` }}>
            <p className="text-3xl md:text-4xl font-semibold text-accent tabular-nums mb-1">{stat.value}</p>
            <p className="text-sm text-text-secondary leading-snug mb-1">{stat.label}</p>
            <p className="text-xs text-text-tertiary font-mono">{stat.sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
