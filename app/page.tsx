import { Nav } from '@/components/nav'
import { Hero } from '@/components/hero'
import { Stats } from '@/components/stats'
import { Primitives } from '@/components/primitives'
import { ApiReference } from '@/components/api-reference'
import { Pricing } from '@/components/pricing'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'greed-compute',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Cloud',
            description:
              'Code execution engine for AI agents. Stateful Python sessions with checkpoints, forking, and cuntext-powered docs that cut token usage by 90%.',
            url: 'https://greed-compute-ui.vercel.app',
            offers: [
              { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free — 500 executions/day' },
              { '@type': 'Offer', price: '0.001', priceCurrency: 'USD', name: 'Pay as you go — per execution' },
            ],
          }),
        }}
      />
      <Nav />
      <Hero />

      {/* Benchmark video */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-24 py-16">
          <div className="mb-8 text-center">
            <p className="text-xs tracking-widest uppercase text-text-tertiary mb-3 font-mono">the benchmark</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-text-primary">
              Same task. Same model. <span className="text-accent">65% fewer tokens.</span>
            </h2>
          </div>
          <div className="border border-border overflow-hidden bg-surface">
            <video
              src="/hero.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto block"
            />
          </div>
        </div>
      </section>

      <Stats />

      {/* The token problem */}
      <section className="border-t border-border px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs tracking-widest uppercase text-text-tertiary mb-4 font-mono">The problem</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-text-primary leading-tight mb-6">
              Agents waste 40% of<br />tokens on overhead.
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Every time your agent needs to execute code, it re-reads the tool's API docs
              (3,000-15,000 tokens), re-explains what it imported last time, re-describes
              the state it already built. The actual work takes 200 tokens. The overhead takes 5,000.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Now multiply that by 100 tool calls per session, 50 sessions per day, across
              a fleet of agents. You're paying for your agents to read the same documentation
              over and over again. That's not compute cost, that's a context window tax.
            </p>
          </div>
          <div className="border border-border bg-surface p-6">
            <p className="text-xs tracking-widest uppercase text-text-tertiary mb-4 font-mono">Token cost per tool call</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-text-secondary">Traditional (OpenAPI + ephemeral)</span>
                  <span className="text-error">~8,000 tokens</span>
                </div>
                <div className="h-2 bg-border-strong">
                  <div className="h-full bg-error" style={{ width: '100%' }} />
                </div>
                <div className="flex text-xs text-text-tertiary mt-1 gap-2">
                  <span>API docs: 5,000t</span>
                  <span>·</span>
                  <span>Re-setup: 2,500t</span>
                  <span>·</span>
                  <span>Actual work: 500t</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-text-secondary">greed-compute (cuntext + stateful)</span>
                  <span className="text-accent">~800 tokens</span>
                </div>
                <div className="h-2 bg-border-strong">
                  <div className="h-full bg-accent" style={{ width: '10%' }} />
                </div>
                <div className="flex text-xs text-text-tertiary mt-1 gap-2">
                  <span>cuntext fragment: 300t</span>
                  <span>·</span>
                  <span>No re-setup: 0t</span>
                  <span>·</span>
                  <span>Actual work: 500t</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-accent font-mono mt-6">90% reduction in context overhead</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border px-6 py-24 md:px-12 lg:px-24 bg-surface">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-last md:order-first">
            <div className="border border-border bg-background p-6 space-y-6">
              <div>
                <p className="text-xs text-accent font-mono mb-2">1. cuntext files</p>
                <p className="text-sm text-text-secondary">
                  API docs in 500 tokens instead of 15,000. Your agent loads a tiny index,
                  finds the operation it needs, and pulls just that fragment. The rest of the
                  context window goes to actual work.
                </p>
              </div>
              <div className="border-t border-border pt-6">
                <p className="text-xs text-accent font-mono mb-2">2. stateful sessions</p>
                <p className="text-sm text-text-secondary">
                  Variables, imports, loaded models persist between calls. Your agent doesn't
                  need to re-explain "previously I imported pandas and loaded the dataset" on
                  every turn. It's already there.
                </p>
              </div>
              <div className="border-t border-border pt-6">
                <p className="text-xs text-accent font-mono mb-2">3. checkpoint and fork</p>
                <p className="text-sm text-text-secondary">
                  Expensive setup done once? Checkpoint it. Need 50 agents to work from
                  that state? Fork it in 80ms. Nobody re-loads anything. Nobody re-describes anything.
                  Just compute.
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-text-tertiary mb-4 font-mono">How it works</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-text-primary leading-tight mb-6">
              Less context overhead,<br />more actual work.
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              greed-compute attacks the token waste problem from two angles. cuntext files
              make API docs 90% smaller. Stateful sessions eliminate the need to re-describe
              previous work. Together, your agents spend their context window on solving the
              problem instead of remembering where they left off.
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-semibold text-accent tabular-nums">10×</span>
              <span className="text-text-secondary">more efficient agent tool calls</span>
            </div>
          </div>
        </div>
      </section>

      <Primitives />
      <ApiReference />
      <Pricing />
      <Footer />
    </main>
  )
}
