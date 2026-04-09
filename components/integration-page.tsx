'use client'

import Link from 'next/link'
import { Nav } from '@/components/nav'
import { toast } from 'sonner'

interface IntegrationPageProps {
  framework: string
  tagline: string
  description: string
  children: React.ReactNode
}

export function Code({ children, lang, copyable = true }: { children: string; lang?: string; copyable?: boolean }) {
  return (
    <div className="relative group my-4">
      {lang && (
        <div className="text-xs text-text-tertiary font-mono mb-2">{lang}</div>
      )}
      <pre className="bg-background border border-border p-4 text-xs font-mono text-text-secondary overflow-x-auto leading-relaxed">
        <code>{children}</code>
      </pre>
      {copyable && (
        <button
          onClick={() => { navigator.clipboard.writeText(children); toast.success('Copied') }}
          className="absolute top-2 right-2 text-xs text-text-tertiary hover:text-text-secondary transition-colors opacity-0 group-hover:opacity-100 font-mono"
        >
          copy
        </button>
      )}
    </div>
  )
}

export function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-xs font-mono text-text-tertiary">step {n}</span>
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="text-sm text-text-secondary leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

const INTEGRATIONS = [
  { slug: 'crewai', label: 'CrewAI' },
  { slug: 'langgraph', label: 'LangGraph' },
  { slug: 'openclaw', label: 'OpenClaw' },
  { slug: 'autogen', label: 'AutoGen' },
  { slug: 'anthropic', label: 'Claude tool use' },
  { slug: 'openai', label: 'OpenAI functions' },
]

export function IntegrationPage({ framework, tagline, description, children }: IntegrationPageProps) {
  return (
    <main className="h-screen flex flex-col">
      <Nav />
      <div className="flex-1 flex overflow-hidden">
        <div className="mx-auto max-w-7xl w-full px-6 md:px-12 flex gap-12">
          {/* Sidebar */}
          <nav className="hidden lg:block w-56 shrink-0 py-16">
            <p className="text-xs tracking-widest uppercase text-text-tertiary mb-4 font-mono">Integrations</p>
            <ul className="space-y-1">
              {INTEGRATIONS.map(i => (
                <li key={i.slug}>
                  <Link
                    href={`/docs/integrations/${i.slug}`}
                    className={`block text-xs font-mono py-1 transition-colors ${
                      i.slug === framework
                        ? 'text-accent'
                        : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-4 border-t border-border">
              <Link
                href="/docs"
                className="text-xs font-mono text-text-tertiary hover:text-text-secondary transition-colors"
              >
                ← API reference
              </Link>
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-y-auto py-16">
            <div className="mb-12">
              <p className="text-xs tracking-widest uppercase text-text-tertiary mb-3 font-mono">
                Integration
              </p>
              <h1 className="text-4xl font-semibold text-text-primary mb-4">
                {tagline}
              </h1>
              <p className="text-text-secondary max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
