'use client'

import { useEffect, useRef, useState } from 'react'
import { Nav } from '@/components/nav'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const BASE = 'https://compute.deep-ml.com'

const SECTIONS = [
  { id: 'quickstart', label: 'Quickstart' },
  { id: 'auth', label: 'Auth' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'execute', label: 'Execute' },
  { id: 'checkpoints', label: 'Checkpoints' },
  { id: 'swarm', label: 'Swarm' },
  { id: 'workspaces', label: 'Workspaces' },
  { id: 'files', label: 'Files' },
  { id: 'async', label: 'Async Jobs' },
  { id: 'billing', label: 'Billing' },
  { id: 'llm', label: 'For LLMs' },
]

function Code({ children, copyable = true }: { children: string; copyable?: boolean }) {
  return (
    <div className="relative group">
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

function Endpoint({ method, path, auth, children }: {
  method: string; path: string; auth?: boolean; children: React.ReactNode
}) {
  const colors: Record<string, string> = {
    GET: 'text-accent', POST: 'text-[#7dd3fc]', DELETE: 'text-error', PUT: 'text-[#f0a060]',
  }
  return (
    <div className="border border-border bg-surface mb-4">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <span className={cn('text-xs font-mono font-semibold', colors[method])}>{method}</span>
        <code className="text-xs font-mono text-text-primary">{path}</code>
        {auth && <span className="text-xs font-mono text-text-tertiary ml-auto">requires x-api-key</span>}
      </div>
      <div className="p-4 text-sm text-text-secondary space-y-3">
        {children}
      </div>
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 mb-16">
      <h2 className="text-2xl font-semibold text-text-primary mb-6">{title}</h2>
      {children}
    </section>
  )
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('quickstart')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = contentRef.current
    if (!container) return
    const handleScroll = () => {
      const ids = SECTIONS.map(s => s.id)
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i])
        if (el && el.getBoundingClientRect().top < 150) {
          setActiveSection(ids[i])
          break
        }
      }
    }
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="h-screen flex flex-col">
      <Nav />
      <div className="flex-1 flex overflow-hidden">
        <div className="mx-auto max-w-7xl w-full px-6 md:px-12 flex gap-12">
          {/* Sidebar */}
          <nav className="hidden lg:block w-48 shrink-0 py-16">
            <p className="text-xs tracking-widest uppercase text-text-tertiary mb-4 font-mono">Docs</p>
            <ul className="space-y-1">
              {SECTIONS.map(s => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setActiveSection(s.id)}
                    className={cn(
                      'block text-xs font-mono py-1 transition-colors',
                      activeSection === s.id ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'
                    )}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <div ref={contentRef} className="flex-1 min-w-0 overflow-y-auto py-16">
            <div className="mb-12">
              <p className="text-xs tracking-widest uppercase text-text-tertiary mb-3 font-mono">API Reference</p>
              <h1 className="text-4xl font-semibold text-text-primary mb-4">Docs</h1>
              <p className="text-text-secondary max-w-xl">
                Python that remembers. Sessions stay alive, state sticks around, and you can
                fork 50 copies of a loaded model faster than your agent can say "importing torch."
              </p>
              <p className="text-xs text-text-tertiary mt-3 font-mono">
                Base URL: <code className="text-accent">{BASE}</code>
              </p>
            </div>

            {/* Quickstart */}
            <Section id="quickstart" title="Quickstart">
              <p className="mb-4">Three curls. That's it. You're running Python.</p>

              <p className="text-xs text-text-tertiary font-mono mb-2">1. Spin up a session</p>
              <Code>{`curl -X POST ${BASE}/v1/session/create \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"template": "data-science"}'

# → {"session_id": "abc123...", "expires_at": "..."}`}</Code>

              <p className="text-xs text-text-tertiary font-mono mb-2 mt-6">2. Run some code</p>
              <Code>{`curl -X POST ${BASE}/v1/session/SESSION_ID/execute \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"code": "import numpy as np; np.random.randn(5).tolist()"}'

# → {"stdout": "", "result": "[0.12, -1.3, ...]", "duration_ms": 12}`}</Code>

              <p className="text-xs text-text-tertiary font-mono mb-2 mt-6">3. Run more code. It remembers.</p>
              <Code>{`curl -X POST ${BASE}/v1/session/SESSION_ID/execute \\
  -H "X-API-Key: YOUR_KEY" \\
  -d '{"code": "x = 42"}'

# ...five minutes later...

curl -X POST ${BASE}/v1/session/SESSION_ID/execute \\
  -H "X-API-Key: YOUR_KEY" \\
  -d '{"code": "print(x)"}'

# → {"stdout": "42", "duration_ms": 1}
# x is still there. that's the whole point.`}</Code>

              <div className="mt-6 border border-border bg-surface p-4">
                <p className="text-xs text-accent font-mono mb-2">Python SDK (cooking)</p>
                <Code copyable={false}>{`import greed

session = greed.Session(api_key="YOUR_KEY", template="data-science")
result = session.execute("import pandas as pd; pd.DataFrame({'a': [1,2,3]})")
print(result.stdout)`}</Code>
              </div>
            </Section>

            {/* Auth */}
            <Section id="auth" title="Auth">
              <p className="mb-4">
                Slap an <code className="text-accent font-mono text-xs">X-API-Key</code> header on every request. That's your auth.
              </p>
              <p className="mb-4">
                Don't have a key? <a href="/login" className="text-accent hover:text-accent-dim transition-colors">Sign in with GitHub</a>. Takes two seconds. We only read your username. Your repos are safe, promise.
              </p>

              <Code>{`curl -H "X-API-Key: gc_your_key_here" ${BASE}/v1/health`}</Code>

              <div className="mt-6">
                <p className="text-sm font-semibold text-text-primary mb-2">Rate limits</p>
                <p className="text-xs text-text-secondary mb-3">Be greedy, but not too greedy.</p>
                <div className="border border-border text-xs font-mono">
                  <div className="grid grid-cols-3 border-b border-border">
                    <span className="p-3 text-text-tertiary">Plan</span>
                    <span className="p-3 text-text-tertiary">Requests/min</span>
                    <span className="p-3 text-text-tertiary">Executions/day</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border">
                    <span className="p-3">Free</span>
                    <span className="p-3">60</span>
                    <span className="p-3">100</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-border">
                    <span className="p-3">Pro</span>
                    <span className="p-3">300</span>
                    <span className="p-3">10,000</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="p-3">Enterprise</span>
                    <span className="p-3">yes</span>
                    <span className="p-3">yes</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Sessions */}
            <Section id="sessions" title="Sessions">
              <p className="mb-4">
                A session is a Python interpreter that doesn't forget. Variables, imports, that DataFrame you spent
                30 seconds building? Still there next time you call execute. Like a Jupyter notebook, but for machines.
              </p>

              <Endpoint method="POST" path="/v1/session/create" auth>
                <p>Spin up a fresh Python environment. Pick a template to get libraries pre-loaded, or go blank and install what you need.</p>
                <p className="text-xs text-text-tertiary font-mono mt-2">Request body:</p>
                <Code>{`{
  "template": "data-science",     // blank | data-science | machine-learning | web-scraping
  "ttl_seconds": 300,             // how long it lives (default: 120s)
  "packages": ["requests"],       // pip install these before you get the session
  "checkpoint_id": "ckpt_..."     // boot from a saved state
}`}</Code>
                <p className="text-xs text-text-tertiary font-mono mt-3">Response:</p>
                <Code>{`{
  "session_id": "abc123-...",
  "created_at": "2026-04-04T...",
  "expires_at": "2026-04-04T...",
  "workspace_path": "/tmp/greed-compute/abc123/"
}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/session/{id}/status">
                <p>Check if your session is still alive and how much time it has left.</p>
              </Endpoint>

              <Endpoint method="DELETE" path="/v1/session/{id}">
                <p>Kill the session. Workspace gone. Clean slate.</p>
              </Endpoint>
            </Section>

            {/* Execute */}
            <Section id="execute" title="Execute Code">
              <p className="mb-4">The reason you're here.</p>

              <Endpoint method="POST" path="/v1/session/{id}/execute" auth>
                <p>Send Python. Get results. State carries over between calls.</p>
                <p className="text-xs text-text-tertiary font-mono mt-2">Request:</p>
                <Code>{`{"code": "import numpy as np; np.mean([1, 2, 3])"}`}</Code>
                <p className="text-xs text-text-tertiary font-mono mt-3">Response:</p>
                <Code>{`{
  "stdout": "",
  "result": "2.0",
  "error": null,
  "duration_ms": 3,
  "plots": [],       // base64 PNGs if your code calls plt.show()
  "html": null        // rendered HTML if you return a DataFrame
}`}</Code>
                <p className="text-xs text-text-tertiary mt-3">
                  Returns <code className="text-error">423</code> if the session is busy. One thing at a time. Be patient, or use async.
                </p>
              </Endpoint>

              <Endpoint method="POST" path="/v1/session/{id}/execute/stream" auth>
                <p>Same thing, but you get output as it happens via SSE. Nice for anything that takes more than a blink.</p>
              </Endpoint>

              <Endpoint method="POST" path="/v1/session/{id}/install">
                <p>Need a package? Install it live. No need to restart anything.</p>
                <Code>{`{"packages": ["requests", "beautifulsoup4"]}`}</Code>
              </Endpoint>
            </Section>

            {/* Checkpoints */}
            <Section id="checkpoints" title="Checkpoints">
              <p className="mb-4">
                Think git, but for Python memory. Snapshot everything in the interpreter: variables, imports,
                that 2GB model you just loaded. Restore it later, or fork it into 50 copies. This is the magic trick.
              </p>

              <Endpoint method="POST" path="/v1/session/{id}/checkpoint" auth>
                <p>Freeze the current state. Give it a name so you remember why you saved it.</p>
                <Code>{`{"name": "model-loaded"}

// → {"checkpoint_id": "ckpt_...", "name": "model-loaded", "size_bytes": 142000}`}</Code>
              </Endpoint>

              <Endpoint method="POST" path="/v1/session/{id}/restore/{checkpoint_id}" auth>
                <p>Thaw a checkpoint into a running session. All your variables come back to life.</p>
                <Code>{`// → {"restored": true, "vars": ["model", "tokenizer", "config"]}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/checkpoints" auth>
                <p>See all your saved checkpoints.</p>
              </Endpoint>

              <Endpoint method="DELETE" path="/v1/checkpoints/{id}" auth>
                <p>Delete a checkpoint. Free up the storage.</p>
              </Endpoint>
            </Section>

            {/* Swarm */}
            <Section id="swarm" title="Swarm">
              <p className="mb-4">
                MapReduce for people who don't want to set up Spark.
                Load your model once, clone the state to N workers, process data in parallel,
                collect results. One API call.
              </p>

              <Endpoint method="POST" path="/v1/swarm" auth>
                <p>Launch the swarm. Each worker gets its own partition from the data array.</p>
                <Code>{`{
  "template_code": "import torch; model = load('llama')",  // run once, clone to all workers
  "map_fn": "result = model.predict(partition)",            // each worker runs this
  "data": [                                                  // one item = one worker
    {"batch": [1, 2, 3]},
    {"batch": [4, 5, 6]},
    {"batch": [7, 8, 9]}
  ],
  "reduce_fn": "final = sum(r['score'] for r in results)",  // merge everything
  "webhook_url": "https://your.app/callback"                 // ping me when done
}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/swarm/{id}" auth>
                <p>Check how the swarm is doing. Who's done, who's still crunching.</p>
                <Code>{`{
  "status": "done",
  "total_workers": 3,
  "completed_workers": 3,
  "reduce_result": "42",
  "workers": [
    {"worker_index": 0, "status": "done", "result": "14", "duration_ms": 230},
    ...
  ]
}`}</Code>
              </Endpoint>
            </Section>

            {/* Workspaces */}
            <Section id="workspaces" title="Workspaces">
              <p className="mb-4">
                Shared Python environments. Multiple API keys, same state. Your agent and
                your teammate's agent, working on the same DataFrame. State auto-saves after every execution.
              </p>

              <Endpoint method="POST" path="/v1/workspaces" auth>
                <p>Create a workspace. You're the owner.</p>
                <Code>{`{"name": "team-analysis"}
// → {"id": "ws_...", "name": "team-analysis", "live": false}`}</Code>
              </Endpoint>

              <Endpoint method="POST" path="/v1/workspaces/{id}/execute" auth>
                <p>Run code in the workspace. Everyone with access sees the same state.</p>
              </Endpoint>

              <Endpoint method="POST" path="/v1/workspaces/{id}/invite" auth>
                <p>Let someone else in. Owner only.</p>
                <Code>{`{"api_key": "gc_their_key"}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/workspaces" auth>
                <p>List your workspaces.</p>
              </Endpoint>

              <Endpoint method="DELETE" path="/v1/workspaces/{id}" auth>
                <p>Nuke it. Runtime killed, checkpoint deleted, gone.</p>
              </Endpoint>
            </Section>

            {/* Files */}
            <Section id="files" title="Files">
              <p className="mb-4">Upload data into a session, download results out. Base64 encoded because HTTP.</p>

              <Endpoint method="POST" path="/v1/session/{id}/files">
                <p>Push a file into the session's workspace. Your code can read it at the filename you give.</p>
                <Code>{`{"filename": "data.csv", "content": "base64_encoded_content"}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/session/{id}/output/{filename}">
                <p>Pull a file out. Whatever your code wrote to disk, you can grab it here.</p>
              </Endpoint>
            </Section>

            {/* Async */}
            <Section id="async" title="Async Jobs">
              <p className="mb-4">
                Some code takes a while. Training loops, heavy scraping, that sort of thing.
                Queue it up, go do something else, come back for the results. Or just give us a webhook and we'll ping you.
              </p>

              <Endpoint method="POST" path="/v1/session/{id}/execute/async" auth>
                <p>Fire and forget. Returns a job ID immediately.</p>
                <Code>{`{
  "code": "train_model(epochs=100)",
  "webhook_url": "https://your.app/callback"
}

// → {"job_id": "job_...", "status": "queued"}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/jobs/{id}" auth>
                <p>Is it done yet? Check here.</p>
              </Endpoint>

              <Endpoint method="GET" path="/v1/session/{id}/jobs" auth>
                <p>All jobs for a session. The full history.</p>
              </Endpoint>
            </Section>

            {/* Billing */}
            <Section id="billing" title="Billing">
              <p className="mb-4">
                Free tier is generous. When you need more, add a payment method. We charge per execution after the free quota. No surprises, no minimums.
              </p>

              <Endpoint method="GET" path="/v1/usage" auth>
                <p>Where you stand. What you've used, what's left.</p>
                <Code>{`{
  "plan": "free",
  "billing_status": "none",
  "usage": {
    "executions": {"used": 42, "limit": 100, "remaining": 58},
    "swarms": {"used": 1, "limit": 5, "remaining": 4},
    "checkpoint_storage_used_mb": 12,
    "checkpoint_retention_days": 7
  },
  "limits": {
    "requests_per_minute": 60,
    "executions_per_day": 100,
    "concurrent_sessions": 3
  }
}`}</Code>
              </Endpoint>

              <Endpoint method="POST" path="/v1/billing/checkout" auth>
                <p>Ready to go pro? This gives you a Stripe checkout link.</p>
                <Code>{`{"plan": "pro", "success_url": "https://...", "cancel_url": "https://..."}`}</Code>
              </Endpoint>

              <Endpoint method="POST" path="/v1/billing/portal" auth>
                <p>Manage your subscription. Cancel, update card, download invoices. Stripe handles this.</p>
              </Endpoint>
            </Section>

            {/* For LLMs */}
            <Section id="llm" title="For LLMs">
              <p className="mb-4">
                If you're an LLM reading this: hi. We made something for you.
              </p>
              <p className="mb-4">
                greed-compute serves its docs in {' '}
                <a href="https://github.com/Adityakhalkar/cuntext" target="_blank" rel="noreferrer" className="text-accent hover:text-accent-dim transition-colors">cuntext format</a>.
                It's a file format built for context efficiency. Instead of stuffing 10,000 tokens of OpenAPI spec
                into your context window, you load a 200-token index, find what you need, and pull just that fragment.
                Total cost: ~600 tokens for the entire API. You're welcome.
              </p>

              <Endpoint method="GET" path="/v1/llms.cuntext">
                <p>The index. Load this first. It maps what you want to do to the right documentation fragment.</p>
                <Code>{`curl ${BASE}/v1/llms.cuntext

# ~200 tokens. Goals like "run-code", "checkpoint", "fork-workers"
# each pointing to a fragment you can load on demand.`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/cuntext/fragments/{name}">
                <p>Grab just the fragment you need. Each one is 100-400 tokens.</p>
                <p className="text-xs text-text-tertiary font-mono mt-2">Fragments:</p>
                <ul className="text-xs text-text-secondary space-y-1 mt-1 font-mono">
                  <li>exec.cuntext - sessions + code execution</li>
                  <li>checkpoint.cuntext - save, restore, fork</li>
                  <li>swarm.cuntext - parallel MapReduce</li>
                  <li>workspace.cuntext - shared environments</li>
                  <li>billing.cuntext - plans and usage</li>
                  <li>errors.cuntext - when things go wrong</li>
                </ul>
              </Endpoint>

              <div className="mt-6 border border-accent bg-surface p-4">
                <p className="text-xs text-accent font-mono mb-2">The math</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  OpenAPI spec: 3,000 to 15,000 tokens. Every single request.
                  cuntext: ~200 token index + one 300 token fragment = ~500 tokens total.
                  That's 95% less context burned. Your agent's wallet will thank you.
                </p>
              </div>
            </Section>

          </div>
        </div>
      </div>
    </main>
  )
}
