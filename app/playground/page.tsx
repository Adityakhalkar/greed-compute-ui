'use client'

import { useState, useRef, useEffect } from 'react'
import { Nav } from '@/components/nav'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface OutputLine {
  type: 'stdout' | 'result' | 'error' | 'system'
  content: string
}

const EXAMPLES: Record<string, { label: string; code: string }[]> = {
  blank: [
    { label: 'Hello world', code: `print("Hello from greed-compute")` },
    { label: 'State persists', code: `# Run this, then run "print(x)" — it remembers\nx = 42\nprint(f"x is now {x}")` },
  ],
  'data-science': [
    { label: 'DataFrame', code: `import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\n    'name': ['Alice', 'Bob', 'Charlie'],\n    'score': np.random.randint(60, 100, 3)\n})\nprint(df.to_string())` },
    { label: 'NumPy stats', code: `import numpy as np\n\narr = np.random.randn(10000)\nprint(f"mean: {arr.mean():.4f}")\nprint(f"std:  {arr.std():.4f}")\nprint(f"p95:  {np.percentile(arr, 95):.4f}")` },
  ],
  'machine-learning': [
    { label: 'Train model', code: `from sklearn.datasets import load_iris\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import cross_val_score\n\nX, y = load_iris(return_X_y=True)\nclf = RandomForestClassifier(n_estimators=100)\nscores = cross_val_score(clf, X, y, cv=5)\nprint(f"Accuracy: {scores.mean():.3f} ± {scores.std():.3f}")` },
  ],
  'web-scraping': [
    { label: 'Parse HTML', code: `html = "<div><h1>Hello</h1><p>World</p></div>"\n\nimport re\ntags = re.findall(r'<(\\w+)>', html)\nprint(f"Tags found: {tags}")` },
  ],
}

const STARTER_CODE = `# greed-compute playground
# State persists between runs — variables stay in memory
# Pick a template ↑ for pre-loaded libraries

import sys
print(f"Python {sys.version}")
`

export default function Playground() {
  const [code, setCode] = useState(STARTER_CODE)
  const [output, setOutput] = useState<OutputLine[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [template, setTemplate] = useState<string>('blank')
  const [lastDuration, setLastDuration] = useState<number | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  const addOutput = (line: OutputLine) => {
    setOutput(prev => [...prev, line])
  }

  const runCode = async () => {
    let sid = sessionId
    if (!sid) {
      addOutput({ type: 'system', content: `Creating ${template} session...` })
      try {
        const session = await api.createSession({ template })
        sid = session.session_id
        setSessionId(sid)
        addOutput({ type: 'system', content: `Session ${sid.slice(0, 8)}... ready` })
      } catch (e) {
        addOutput({ type: 'error', content: `${e}` }); return
      }
    }

    setRunning(true)
    const t0 = performance.now()
    try {
      const result = await api.execute(sid, code)
      const wallMs = Math.round(performance.now() - t0)
      setLastDuration(result.duration_ms || wallMs)

      if (result.stdout) {
        result.stdout.split('\n').filter(Boolean).forEach((line: string) => {
          addOutput({ type: 'stdout', content: line })
        })
      }
      if (result.result !== null && result.result !== undefined) {
        addOutput({ type: 'result', content: JSON.stringify(result.result) })
      }
      if (result.error) {
        addOutput({ type: 'error', content: result.error })
      }
      if (!result.stdout && !result.error && (result.result === null || result.result === undefined)) {
        addOutput({ type: 'system', content: `Done (${result.duration_ms || wallMs}ms)` })
      }
    } catch (e) {
      addOutput({ type: 'error', content: `${e}` })
    } finally {
      setRunning(false)
    }
  }

  const clearOutput = () => { setOutput([]); setLastDuration(null) }
  const newSession = () => {
    setSessionId(null)
    setLastDuration(null)
    addOutput({ type: 'system', content: 'Session cleared. Next run creates a fresh one.' })
  }

  const copyApiCall = () => {
    const curl = `curl -X POST https://compute.deep-ml.com/v1/session/create \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"template": "${template}"}'\n\n# Then execute:\ncurl -X POST https://compute.deep-ml.com/v1/session/SESSION_ID/execute \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({ code })}'`
    navigator.clipboard.writeText(curl)
    toast.success('API call copied')
  }

  const examples = EXAMPLES[template] || EXAMPLES.blank

  return (
    <main className="h-screen flex flex-col">
      <Nav />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-border bg-surface px-4 py-2 flex items-center gap-3 overflow-x-auto">
          <select
            value={template}
            onChange={e => { setTemplate(e.target.value); setSessionId(null) }}
            aria-label="Session template"
            className="bg-background border border-border px-2 py-1 text-xs font-mono text-text-secondary focus:outline-none focus:border-accent shrink-0"
          >
            <option value="blank">blank</option>
            <option value="data-science">data-science</option>
            <option value="machine-learning">machine-learning</option>
            <option value="web-scraping">web-scraping</option>
          </select>

          {/* Example snippets */}
          <div className="hidden sm:flex items-center gap-1 border-l border-border pl-3">
            {examples.map(ex => (
              <button
                key={ex.label}
                onClick={() => setCode(ex.code)}
                className="px-2 py-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors font-mono whitespace-nowrap"
              >
                {ex.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 ml-auto shrink-0">
            {sessionId && (
              <span className="text-xs font-mono text-text-tertiary mr-2 hidden sm:inline">
                {sessionId.slice(0, 8)}...
              </span>
            )}
            {lastDuration !== null && (
              <span className="text-xs font-mono text-accent mr-2 hidden sm:inline">
                {lastDuration}ms
              </span>
            )}
            <button onClick={copyApiCall} className="px-3 py-1 text-xs border border-border text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors hidden sm:block" title="Copy equivalent API call">
              cURL
            </button>
            <button onClick={newSession} className="px-3 py-1 text-xs border border-border text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors">
              New
            </button>
            <button onClick={clearOutput} className="px-3 py-1 text-xs border border-border text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors">
              Clear
            </button>
            <button
              onClick={runCode}
              disabled={running}
              className="px-4 py-1 text-xs bg-accent text-background font-medium hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {running ? 'Running...' : 'Run ▶'}
            </button>
          </div>
        </div>

        {/* Editor + Output split */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
          {/* Editor */}
          <div className="border-r border-border flex flex-col min-h-0">
            <div className="px-3 py-1.5 border-b border-border flex items-center justify-between">
              <span className="text-xs text-text-tertiary font-mono">editor</span>
              <span className="text-xs text-text-tertiary font-mono">
                {sessionId ? `session: ${sessionId.slice(0, 8)}` : 'no session'}
              </span>
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              aria-label="Python code editor"
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  runCode()
                }
                if (e.key === 'Tab') {
                  e.preventDefault()
                  const start = e.currentTarget.selectionStart
                  const end = e.currentTarget.selectionEnd
                  const newCode = code.substring(0, start) + '    ' + code.substring(end)
                  setCode(newCode)
                  setTimeout(() => e.currentTarget.setSelectionRange(start + 4, start + 4), 0)
                }
              }}
              className="flex-1 bg-background text-text-primary font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />
            <div className="px-3 py-1.5 border-t border-border text-xs text-text-tertiary font-mono flex justify-between">
              <span>{navigator?.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to run</span>
              <span>state persists between runs</span>
            </div>
          </div>

          {/* Output */}
          <div className="flex flex-col min-h-0">
            <div className="px-3 py-1.5 border-b border-border flex items-center justify-between">
              <span className="text-xs text-text-tertiary font-mono">output</span>
              {lastDuration !== null && (
                <span className="text-xs text-accent font-mono">{lastDuration}ms</span>
              )}
            </div>
            <div ref={outputRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1">
              {output.length === 0 && (
                <div className="text-text-tertiary space-y-2">
                  <p>Run code to see output here.</p>
                  <p className="text-xs">Try an example from the toolbar, or write your own.</p>
                </div>
              )}
              {output.map((line, i) => (
                <p key={i} className={
                  line.type === 'error'  ? 'text-error' :
                  line.type === 'result' ? 'text-accent' :
                  line.type === 'system' ? 'text-text-tertiary' :
                  'text-text-primary'
                }>
                  {line.type === 'result' && <span className="text-text-tertiary">→ </span>}
                  {line.type === 'system' && <span className="text-text-tertiary"># </span>}
                  {line.content}
                </p>
              ))}
              {running && (
                <p className="text-text-tertiary animate-pulse">▋</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
