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
                Stateful Python execution for AI agents. Your agent creates a session, runs code in it, and the
                variables are still there next time it calls. No cold starts. If you've ever watched an agent
                re-import torch for the 50th time, you already know why this exists.
              </p>
              <p className="text-xs text-text-tertiary mt-3 font-mono">
                Base URL: <code className="text-accent">{BASE}</code>
              </p>
            </div>

            {/* Quickstart */}
            <Section id="quickstart" title="Quickstart">
              <p className="mb-4">
                You need three API calls to go from nothing to running Python. Genuinely, that's it.
              </p>

              <p className="text-xs text-text-tertiary font-mono mb-2">1. create a session</p>
              <Code>{`curl -X POST ${BASE}/v1/session/create \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"template": "data-science"}'

# → {"session_id": "abc123...", "expires_at": "..."}`}</Code>

              <p className="text-xs text-text-tertiary font-mono mb-2 mt-6">2. run code in it</p>
              <Code>{`curl -X POST ${BASE}/v1/session/SESSION_ID/execute \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"code": "import numpy as np; np.random.randn(5).tolist()"}'

# → {"stdout": "", "result": "[0.12, -1.3, ...]", "duration_ms": 12}`}</Code>

              <p className="text-xs text-text-tertiary font-mono mb-2 mt-6">3. run more code, state is still there</p>
              <Code>{`curl -X POST ${BASE}/v1/session/SESSION_ID/execute \\
  -H "X-API-Key: YOUR_KEY" \\
  -d '{"code": "x = 42"}'

# come back five minutes later

curl -X POST ${BASE}/v1/session/SESSION_ID/execute \\
  -H "X-API-Key: YOUR_KEY" \\
  -d '{"code": "print(x)"}'

# → {"stdout": "42", "duration_ms": 1}
# x is still there. numpy is still imported. nothing was re-loaded.`}</Code>

              <div className="mt-6 border border-border bg-surface p-4">
                <p className="text-xs text-accent font-mono mb-2">python sdk (cooking)</p>
                <Code copyable={false}>{`import greed

session = greed.Session(api_key="YOUR_KEY", template="data-science")
result = session.execute("import pandas as pd; pd.DataFrame({'a': [1,2,3]})")
print(result.stdout)`}</Code>
              </div>
            </Section>

            {/* Auth */}
            <Section id="auth" title="Auth">
              <p className="mb-4">
                Every request needs an <code className="text-accent font-mono text-xs">X-API-Key</code> header.
                You get a key when you <a href="/login" className="text-accent hover:text-accent-dim transition-colors">sign in with GitHub</a>,
                we only read your username and email, we don't touch your repos.
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
                A session is basically a Python process that stays alive between your API calls. You import something,
                define a variable, load a model, whatever. It's all still there the next time you call execute.
                Your agents don't need to re-do setup work every single time anymore.
              </p>

              <Endpoint method="POST" path="/v1/session/create" auth>
                <p>
                  Creates a new session. You can pick a template that comes with libraries pre-loaded (numpy, pandas, sklearn, etc)
                  so your agent doesn't waste time on imports. Or go blank and install whatever you want.
                </p>
                <p className="text-xs text-text-tertiary font-mono mt-2">Request body:</p>
                <Code>{`{
  "template": "data-science",     // blank | data-science | machine-learning | web-scraping
  "ttl_seconds": 300,             // how long it stays alive (default: 120s)
  "packages": ["requests"],       // pip install these before the session is ready
  "checkpoint_id": "ckpt_..."     // start from a previously saved state
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
                <p>Check how much TTL your session has left. Also shows how many calls it's handled.</p>
              </Endpoint>

              <Endpoint method="DELETE" path="/v1/session/{id}">
                <p>Terminate the session and clean up its workspace. You'll stop getting billed for it immediately.</p>
              </Endpoint>
            </Section>

            {/* Execute */}
            <Section id="execute" title="Execute Code">

              <Endpoint method="POST" path="/v1/session/{id}/execute" auth>
                <p>
                  The main thing. Send Python code, get back stdout, the return value of the last expression, and any errors.
                  If your code makes matplotlib plots, you get those back too as base64 PNGs.
                </p>
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
                  You'll get a <code className="text-error">423</code> if the session is already running something.
                  Sessions handle one execution at a time. If you need parallel work, that's what swarm is for.
                </p>
              </Endpoint>

              <Endpoint method="POST" path="/v1/session/{id}/execute/stream" auth>
                <p>
                  Same as execute but streams output line by line via SSE. Useful when your code takes a while
                  and you want to show progress instead of staring at a loading spinner.
                </p>
              </Endpoint>

              <Endpoint method="POST" path="/v1/session/{id}/install">
                <p>Install pip packages into a running session without restarting it. The packages persist for the session's lifetime.</p>
                <Code>{`{"packages": ["requests", "beautifulsoup4"]}`}</Code>
              </Endpoint>
            </Section>

            {/* Checkpoints */}
            <Section id="checkpoints" title="Checkpoints">
              <p className="mb-4">
                So you've loaded a model, imported your libraries, set up your data. That took 30 seconds.
                Now you want 50 agents to start from that exact state. You could re-do the setup 50 times
                (cooked) or you could checkpoint it once and restore it everywhere (not cooked).
                Checkpoints snapshot the entire interpreter state, every variable, every import, everything.
              </p>

              <Endpoint method="POST" path="/v1/session/{id}/checkpoint" auth>
                <p>Save the current state. Name it something useful so future-you knows what's in there.</p>
                <Code>{`{"name": "model-loaded"}

// → {"checkpoint_id": "ckpt_...", "name": "model-loaded", "size_bytes": 142000}`}</Code>
              </Endpoint>

              <Endpoint method="POST" path="/v1/session/{id}/restore/{checkpoint_id}" auth>
                <p>Load a saved checkpoint into a session. All the variables from when you saved it are back.</p>
                <Code>{`// → {"restored": true, "vars": ["model", "tokenizer", "config"]}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/checkpoints" auth>
                <p>List all your saved checkpoints with size and creation time.</p>
              </Endpoint>

              <Endpoint method="DELETE" path="/v1/checkpoints/{id}" auth>
                <p>Delete a checkpoint and free up the storage it was using.</p>
              </Endpoint>
            </Section>

            {/* Swarm */}
            <Section id="swarm" title="Swarm">
              <p className="mb-4">
                This is where it gets fun. You give us setup code, a map function, a list of data partitions,
                and optionally a reduce function. We run the setup once, clone that state to N workers,
                each worker processes its partition, and we collect all the results. It's MapReduce
                but you didn't have to provision a single server for it.
              </p>

              <Endpoint method="POST" path="/v1/swarm" auth>
                <p>
                  Launch a swarm. The template_code runs once and gets cloned to every worker, so you're not
                  re-loading your model N times. Each worker gets one item from the data array as its partition variable.
                </p>
                <Code>{`{
  "template_code": "import torch; model = load('llama')",  // runs once, cloned to all workers
  "map_fn": "result = model.predict(partition)",            // each worker runs this
  "data": [                                                  // one item per worker
    {"batch": [1, 2, 3]},
    {"batch": [4, 5, 6]},
    {"batch": [7, 8, 9]}
  ],
  "reduce_fn": "final = sum(r['score'] for r in results)",  // optional: combine results
  "webhook_url": "https://your.app/callback"                 // optional: we'll POST when done
}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/swarm/{id}" auth>
                <p>Poll the swarm to see progress and get results once it's done.</p>
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
                Workspaces are like sessions but persistent and shareable. Multiple API keys can execute code
                in the same workspace, and they all see the same variables. State auto-saves after every execution
                so nothing gets lost if the runtime shuts down.
              </p>

              <Endpoint method="POST" path="/v1/workspaces" auth>
                <p>Create a new workspace. You become the owner.</p>
                <Code>{`{"name": "team-analysis"}
// → {"id": "ws_...", "name": "team-analysis", "live": false}`}</Code>
              </Endpoint>

              <Endpoint method="POST" path="/v1/workspaces/{id}/execute" auth>
                <p>Run code in the workspace. Everyone with access sees the same state.</p>
              </Endpoint>

              <Endpoint method="POST" path="/v1/workspaces/{id}/invite" auth>
                <p>Give another API key access to this workspace. Only the owner can do this.</p>
                <Code>{`{"api_key": "gc_their_key"}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/workspaces" auth>
                <p>List all workspaces you own or have been invited to.</p>
              </Endpoint>

              <Endpoint method="DELETE" path="/v1/workspaces/{id}" auth>
                <p>Delete the workspace entirely. Kills the runtime, deletes the saved state, removes all members. Owner only.</p>
              </Endpoint>
            </Section>

            {/* Files */}
            <Section id="files" title="Files">
              <p className="mb-4">
                Sometimes your code needs input files, or it produces output files you want to grab.
                Upload and download are both base64 encoded because that's just how you send binary over JSON.
              </p>

              <Endpoint method="POST" path="/v1/session/{id}/files">
                <p>Upload a file to the session's workspace. Your code can then read it normally by filename.</p>
                <Code>{`{"filename": "data.csv", "content": "base64_encoded_content"}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/session/{id}/output/{filename}">
                <p>Download a file that your code wrote to disk during execution.</p>
              </Endpoint>
            </Section>

            {/* Async */}
            <Section id="async" title="Async Jobs">
              <p className="mb-4">
                Not everything finishes in milliseconds. If you're training a model or doing something heavy,
                you can queue it as an async job. You get a job ID back immediately, and you can either poll
                for the result or give us a webhook URL and we'll let you know when it's done.
              </p>

              <Endpoint method="POST" path="/v1/session/{id}/execute/async" auth>
                <p>Queue code for background execution. Returns immediately with a job ID.</p>
                <Code>{`{
  "code": "train_model(epochs=100)",
  "webhook_url": "https://your.app/callback"   // optional
}

// → {"job_id": "job_...", "status": "queued"}`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/jobs/{id}" auth>
                <p>Check the status of an async job and grab the result when it's finished.</p>
              </Endpoint>

              <Endpoint method="GET" path="/v1/session/{id}/jobs" auth>
                <p>List all async jobs that ran in this session.</p>
              </Endpoint>
            </Section>

            {/* Billing */}
            <Section id="billing" title="Billing">
              <p className="mb-4">
                The free tier gives you enough to try things out properly. When you need more, add a payment
                method and you only pay for what you actually use. No monthly minimums, no "contact sales" for basic features.
              </p>

              <Endpoint method="GET" path="/v1/usage" auth>
                <p>See your current usage against your plan's limits. Useful for knowing when you're about to hit a wall.</p>
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
                <p>Get a Stripe checkout link to upgrade your plan.</p>
                <Code>{`{"plan": "pro", "success_url": "https://...", "cancel_url": "https://..."}`}</Code>
              </Endpoint>

              <Endpoint method="POST" path="/v1/billing/portal" auth>
                <p>Opens the Stripe customer portal where you can manage your subscription, update payment methods, or download invoices.</p>
              </Endpoint>
            </Section>

            {/* For LLMs */}
            <Section id="llm" title="For LLMs">
              <p className="mb-4">
                If you're an LLM reading this, we built something specifically for you.
                The entire greed-compute API documentation is available
                in <a href="https://github.com/Adityakhalkar/cuntext" target="_blank" rel="noreferrer" className="text-accent hover:text-accent-dim transition-colors">cuntext format</a>,
                which is basically API docs optimized for context windows. Instead of loading a 10,000 token
                OpenAPI spec every time you need to make an API call, you load a ~200 token index, figure out
                which operation you need, and then load just that one fragment (~300 tokens). The whole thing
                costs you about 500-600 tokens. That's 95% less than what you'd normally burn through.
              </p>

              <Endpoint method="GET" path="/v1/llms.cuntext">
                <p>
                  The cuntext index file. This is what you should load first. It maps goals (like "run code" or
                  "save a checkpoint") to specific documentation fragments that you load on demand.
                </p>
                <Code>{`curl ${BASE}/v1/llms.cuntext

# ~200 tokens. maps goals to fragments.
# your context window will thank you.`}</Code>
              </Endpoint>

              <Endpoint method="GET" path="/v1/cuntext/fragments/{name}">
                <p>Load a specific documentation fragment. Each one covers one feature area in 100-400 tokens.</p>
                <p className="text-xs text-text-tertiary font-mono mt-2">Available fragments:</p>
                <ul className="text-xs text-text-secondary space-y-1 mt-1 font-mono">
                  <li>exec.cuntext - sessions and code execution</li>
                  <li>checkpoint.cuntext - save, restore, fork state</li>
                  <li>swarm.cuntext - parallel MapReduce</li>
                  <li>workspace.cuntext - shared environments</li>
                  <li>billing.cuntext - plans and usage</li>
                  <li>errors.cuntext - error codes and what to do about them</li>
                </ul>
              </Endpoint>

              <div className="mt-6 border border-accent bg-surface p-4">
                <p className="text-xs text-accent font-mono mb-2">why cuntext though</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  An OpenAPI spec for this API would be somewhere around 5,000 to 15,000 tokens.
                  Every single API call your agent makes, that's the tax it pays for knowing what endpoints exist.
                  With cuntext, you load the index once (~200 tokens), find the goal you need, pull one fragment
                  (~300 tokens), and you're done. About 500 tokens total. The rest of your context window
                  can go towards actually doing useful work instead of re-reading documentation.
                </p>
              </div>
            </Section>

          </div>
        </div>
      </div>
    </main>
  )
}
