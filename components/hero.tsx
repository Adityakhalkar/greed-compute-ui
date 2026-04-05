'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'

const CODE = `# Without greed-compute: every tool call burns ~5,000 tokens on setup
# With greed-compute: setup once, reuse forever

import requests

API = "https://compute.deep-ml.com/v1"
KEY = {"X-API-Key": "gc-your-key"}

# Session remembers everything between calls
s = requests.post(f"{API}/session/create",
    headers=KEY, json={"template": "data-science"}).json()

# First call: agent imports and loads (happens once)
requests.post(f"{API}/session/{s['session_id']}/execute",
    headers=KEY, json={"code": "import torch; model = load('llama-70b')"})

# Every future call: model is already there. no re-import. no re-explain.
requests.post(f"{API}/session/{s['session_id']}/execute",
    headers=KEY, json={"code": "model.predict(new_data)"})`

export function Hero() {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(CODE)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="px-6 py-24 md:px-12 lg:px-24 border-b border-border">
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xs tracking-widest uppercase text-text-tertiary mb-4 font-mono"
          >
            Code execution engine for AI agents
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary leading-tight mb-6"
          >
            Your agents are<br />
            <span className="text-accent">burning</span> tokens.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-text-secondary leading-relaxed mb-8 max-w-md"
          >
            Every time your agent runs code, it re-reads API docs, re-imports libraries,
            re-explains what it already did. That's thousands of tokens wasted per call.
            greed-compute gives agents stateful Python sessions, so they set up once and
            just keep working.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/playground"
              className="px-6 py-2.5 bg-accent text-background text-sm font-medium hover:bg-accent-dim transition-colors text-center"
            >
              Try it free →
            </Link>
            <a
              href="/docs"
              className="px-6 py-2.5 border border-border text-text-secondary text-sm hover:border-border-strong hover:text-text-primary transition-colors text-center"
            >
              Read the docs
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-surface border border-border font-mono text-sm"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
              <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
              <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
              <span className="ml-2 text-xs text-text-tertiary">quickstart.py</span>
            </div>
            <button
              onClick={copyCode}
              className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
            >
              {copied ? 'copied!' : 'copy'}
            </button>
          </div>
          <pre className="p-5 overflow-x-auto text-xs leading-relaxed max-h-[380px] overflow-y-auto">
            <code className="text-text-secondary">{CODE}</code>
          </pre>
        </motion.div>
      </div>
    </section>
  )
}
