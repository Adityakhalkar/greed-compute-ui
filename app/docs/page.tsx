'use client'

import { useState } from 'react'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const BASE = 'https://compute.deep-ml.com'

const SECTIONS = [
  { id: 'quickstart', label: 'Quickstart' },
  { id: 'auth', label: 'Authentication' },
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

  return (
    <main className="min-h-screen">
      <Nav />
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-16">
        <div className="flex gap-12">
          {/* Sidebar */}
          <nav className="hidden lg:block w-48 shrink-0 sticky top-20 self-start">
            <p className="text-xs tracking-widest uppercase text-text-tertiary mb-4 font-mono">Documentation</p>
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
          <div className="flex-1 min-w-0">
            <div className="mb-12">
              <p className="text-xs tracking-widest uppercase text-text-tertiary mb-3 font-mono">API Reference</p>
              <h1 className="text-4xl font-semibold text-text-primary mb-4">Documentation</h1>
              <p className="text-text-secondary max-w-xl">
                Stateful Python execution for AI agents. Create sessions, run code, checkpoint state,
                fork workers — all via REST.
              </p>
              <p className="text-xs text-text-tertiary mt-3 font-mono">
                Base URL: <code className="text-accent">{BASE}</code>
              </p>
            </div>

            {/* Quickstart */}
            <Section id="quickstart" title="Quickstart">
              <p className="mb-4">Three API calls to go from zero to running Python:</p>

              <p className="text-xs text-text-tertiary font-mono mb-2">1. Create a session</p>
              <Code>{`curl -X POST ${BASE}/v1/session/create \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"template": "data-science"}'

# → {"session_id": "abc123...", "expires_at": "..."}`}</Code>

              <p className="text-xs text-text-tertiary font-mono mb-2 mt-6">2. Execute code</p>
              <Code>{`curl -X POST ${BASE}/v1/session/SESSION_ID/execute \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"code": "import numpy as np; np.random.randn(5).tolist()"}'

# → {"stdout": "", "result": "[0.12, -1.3, ...]", "duration_ms": 12}`}</Code>

              <p className="text-xs text-text-tertiary font-mono mb-2 mt-6">3. State persists — run again</p>
              <Code>{`curl -X POST ${BASE}/v1/session/SESSION_ID/execute \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"code": "x = 42"}'

# Later...
curl -X POST ${BASE}/v1/session/SESSION_ID/execute \\
  -H "X-API-Key: YOUR_KEY" \\
  -d '{"code": "print(x)"}'

# → {"stdout": "42", "duration_ms": 1}`}</Code>

              <div className="mt-6 border border-border bg-surface p-4">
                <p className="text-xs text-accent font-mono mb-2">Python SDK (coming soon)</p>
                <Code copyable={false}>{`import greed

session = greed.Session(api_key="YOUR_KEY", template="data-science")
result = session.execute("import pandas as pd; pd.DataFrame({'a': [1,2,3]})")
print(result.stdout)`}</Code>
              </div>
            </Section>

            {/* Auth */}
            <Section id="auth" title="Authentication">
              <p className="mb-4">All API requests require an <code className="text-accent font-mono text-xs">X-API-Key</code> header.</p>
              <p className="mb-4">Get your key by signing in with GitHub at <a href="/login" className="text-accent hover:text-accent-dim transition-colors">/login</a>.</p>

              <Code>{`# Every request includes this header
curl -H "X-API-Key: gc_your_key_here" ${BASE}/v1/health`}</Code>

              <div className="mt-6">
                <p className="text-sm font-semibold text-text-primary mb-2">Rate limits</p>
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
                    <span className="p-3">unlimited</span>
                    <span className="p-3">unlimited</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Sessions */}
            <Section id="sessions" title="Sessions">
              <p className="mb-4">Sessions are isolated Python environments. Variables, imports, and state persist between executions.</p>

              <Endpoint method="POST" path="/v1/session/create" auth>
                <p>Create a new Python session.</p>
                <p className="text-xs text-text-tertiary font-mono mt-2">Request body:</p>
                <Code>{`{
  "template": "data-science",     // optional: blank | data-science | machine-learning | web-scraping
  "ttl_seconds": 300,             // optional: session lifetime (default: 120s)
  "packages": ["requests"],       // optional: pip install before ready
  "checkpoint_id": "ckpt_..."     // optional: restore checkpoint into new session
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
                <p>Get session TTL and status.</p>
              </Endpoint>

              <Endpoint method="DELETE" path="/v1/session/{id}">
                <p>Terminate session and free resources.</p>
              </Endpoint>
            </Section>

            {/* Execute */}
            <Section id="execute" title="Execute Code">
              <Endpoint method="POST" path="/v1/session/{id}/execute" auth>
                <p>Run Python code synchronously. Returns stdout, the last expression result, and any errors.</p>
                <p className="text-xs text-text-tertiary font-mono mt-2">Request:</p>
                <Code>{`{"code": "import numpy as np; np.mean([1, 2, 3])"}`}</Code>
                <p className="text-xs text-text-tertiary font-mono mt-3">Response:</p>
                <Code>{`{
  "stdout": "",
  "result": "2.0",
  "error": null,
  "duration_ms": 3,
  "plots": [],          // base64 PNGs from plt.show()
  "html": null           // HTML table for DataFrames
}`}</Code>
                <p className="text-xs text-text-tertiary mt-3">Returns <code className="text-error">423</code> if the session is already executing.</p>
              </Endpoint>

              <Endpoint method="POST" path="/v1/session/{id}/execute/stream" auth>
                <p>Same as execute, but streams output via Server-Sent Events. Useful for long-running code.</p>
              </Endpoint>

              <Endpoint method="POST" path="/v1/session/{id}/install">
                <p>Install pip packages into a running session.</p>
                <Code>{`{"packages": ["requests", "beautifulsoup4"]}`}</Code>
              </Endpoint>
            </Section>

            {/* Checkpoints */}
            <Section id="checkpoints" title="Checkpoints">
              <p className="mb-4">Snapshot the full interpreter state — all variables, imports, loaded models. Restore or fork anytime.</p>

              <Endpoint method="POST" path="/v1/session/{id}/checkpoint" auth>
                <p>Save a checkpoint of the current session state.</p>
                <Code>{`{"name": "model-loaded"}

// → {"checkpoint_id": "ckpt_...", "name": "model-loaded", "size_bytes": 142000}`}</Code>
              </Endpoint>

              <Endpoint method="POST" path="/v1/session/{id}/restore/{checkpoint_id}" auth>
                <p>Load a checkpoint into a running session. All variables are restored.</p>
                <Code>{`// → {"restored": true, "vars": ["model", "tokenizer", "config"]}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/checkpoints" auth>
                <p>List all your checkpoints.</p>
              </Endpoint>

              <Endpoint method="DELETE" path="/v1/checkpoints/{id}" auth>
                <p>Delete a checkpoint and free storage.</p>
              </Endpoint>
            </Section>

            {/* Swarm */}
            <Section id="swarm" title="Swarm (MapReduce)">
              <p className="mb-4">
                Distribute work across N workers with a single API call. Optionally run setup code once (template),
                then clone the state to all workers.
              </p>

              <Endpoint method="POST" path="/v1/swarm" auth>
                <p>Launch a MapReduce swarm.</p>
                <Code>{`{
  "template_code": "import torch; model = load('llama')",  // optional: run once, clone to all
  "map_fn": "result = model.predict(partition)",            // runs on each worker
  "data": [                                                  // one partition per worker
    {"batch": [1, 2, 3]},
    {"batch": [4, 5, 6]},
    {"batch": [7, 8, 9]}
  ],
  "reduce_fn": "final = sum(r['score'] for r in results)",  // optional: aggregate
  "webhook_url": "https://your.app/callback"                 // optional: notify on completion
}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/swarm/{id}" auth>
                <p>Poll swarm status and results.</p>
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
            <Section id="workspaces" title="Shared Workspaces">
              <p className="mb-4">
                Persistent execution environments that multiple API keys can access.
                State auto-saves after every execution.
              </p>

              <Endpoint method="POST" path="/v1/workspaces" auth>
                <p>Create a shared workspace.</p>
                <Code>{`{"name": "team-analysis"}
// → {"id": "ws_...", "name": "team-analysis", "live": false}`}</Code>
              </Endpoint>

              <Endpoint method="POST" path="/v1/workspaces/{id}/execute" auth>
                <p>Run code in the workspace. All members see the same state.</p>
              </Endpoint>

              <Endpoint method="POST" path="/v1/workspaces/{id}/invite" auth>
                <p>Invite another API key to the workspace. Owner only.</p>
                <Code>{`{"api_key": "gc_their_key"}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/workspaces" auth>
                <p>List your workspaces.</p>
              </Endpoint>

              <Endpoint method="DELETE" path="/v1/workspaces/{id}" auth>
                <p>Delete workspace. Owner only.</p>
              </Endpoint>
            </Section>

            {/* Files */}
            <Section id="files" title="File Operations">
              <Endpoint method="POST" path="/v1/session/{id}/files">
                <p>Upload a file to the session workspace. Content must be base64-encoded.</p>
                <Code>{`{"filename": "data.csv", "content": "base64_encoded_content"}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/session/{id}/output/{filename}">
                <p>Download a file from the session workspace. Returns base64-encoded content.</p>
              </Endpoint>
            </Section>

            {/* Async */}
            <Section id="async" title="Async Jobs">
              <p className="mb-4">Queue long-running code for background execution. Optionally receive a webhook when done.</p>

              <Endpoint method="POST" path="/v1/session/{id}/execute/async" auth>
                <p>Queue code for background execution.</p>
                <Code>{`{
  "code": "train_model(epochs=100)",
  "webhook_url": "https://your.app/callback"   // optional
}

// → {"job_id": "job_...", "status": "queued"}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/jobs/{id}" auth>
                <p>Poll job status and retrieve results.</p>
              </Endpoint>

              <Endpoint method="GET" path="/v1/session/{id}/jobs" auth>
                <p>List all jobs for a session.</p>
              </Endpoint>
            </Section>

            {/* Billing */}
            <Section id="billing" title="Billing & Usage">
              <Endpoint method="GET" path="/v1/usage" auth>
                <p>Get your current usage and plan limits.</p>
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
                <p>Create a Stripe checkout session to upgrade your plan.</p>
                <Code>{`{"plan": "pro", "success_url": "https://...", "cancel_url": "https://..."}`}</Code>
              </Endpoint>

              <Endpoint method="POST" path="/v1/billing/portal" auth>
                <p>Open the Stripe billing portal to manage your subscription.</p>
              </Endpoint>
            </Section>

            {/* For LLMs */}
            <Section id="llm" title="For LLMs">
              <p className="mb-4">
                greed-compute serves its API documentation in <a href="https://github.com/Adityakhalkar/cuntext" target="_blank" rel="noreferrer" className="text-accent hover:text-accent-dim transition-colors">cuntext format</a> —
                a file format designed for LLM context efficiency. Load the full API reference in ~600 tokens.
              </p>

              <Endpoint method="GET" path="/v1/llms.cuntext">
                <p>The cuntext index file. Always load this first — it maps goals to documentation fragments.</p>
                <Code>{`curl ${BASE}/v1/llms.cuntext

# Returns ~200 tokens of goal-indexed documentation
# Goals like "run-code", "checkpoint", "fork-workers" → link to fragments`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/cuntext/fragments/{name}">
                <p>Load a specific documentation fragment on demand.</p>
                <p className="text-xs text-text-tertiary font-mono mt-2">Available fragments:</p>
                <ul className="text-xs text-text-secondary space-y-1 mt-1 font-mono">
                  <li>exec.cuntext — session creation + code execution</li>
                  <li>checkpoint.cuntext — save/restore/fork state</li>
                  <li>swarm.cuntext — MapReduce across workers</li>
                  <li>workspace.cuntext — shared workspaces</li>
                  <li>billing.cuntext — plans and usage</li>
                  <li>errors.cuntext — error codes and troubleshooting</li>
                </ul>
              </Endpoint>

              <div className="mt-6 border border-accent bg-surface p-4">
                <p className="text-xs text-accent font-mono mb-2">Why cuntext?</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  OpenAPI specs cost 3,000–15,000 tokens. cuntext costs ~600 tokens for the full API.
                  Your agent loads the index (~200t), finds the goal it needs, and loads only the relevant
                  fragment (~300-400t). 95% cheaper context than traditional API docs.
                </p>
              </div>
            </Section>

          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
