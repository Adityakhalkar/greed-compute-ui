'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'

const CODE = `import requests

API = "https://compute.deep-ml.com/v1"
KEY = {"X-API-Key": "gc-your-key"}

# Create a session — Python stays warm between calls
s = requests.post(f"{API}/session/create",
    headers=KEY, json={"template": "data-science"}).json()

# Execute code — state persists
requests.post(f"{API}/session/{s['session_id']}/execute",
    headers=KEY, json={"code": "import torch; model = load('llama-70b')"})

# Checkpoint — snapshot the interpreter
ckpt = requests.post(f"{API}/session/{s['session_id']}/checkpoint",
    headers=KEY, json={"name": "model-loaded"}).json()

# Fork — 50 workers with model pre-loaded, in <100ms
requests.post(f"{API}/checkpoints/fork",
    headers=KEY, json={"checkpoint_id": ckpt["checkpoint_id"], "count": 50})`

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
        {/* Copy */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xs tracking-widest uppercase text-text-tertiary mb-4 font-mono"
          >
            Stateful Python for AI agents
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary leading-tight mb-6"
          >
            Python sessions<br />
            that <span className="text-accent">never</span> die.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-text-secondary leading-relaxed mb-8 max-w-md"
          >
            Checkpoint interpreter state. Fork N parallel workers in milliseconds.
            Share sessions across any model. Zero cold starts.
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
              Try playground →
            </Link>
            <a
              href="#api"
              className="px-6 py-2.5 border border-border text-text-secondary text-sm hover:border-border-strong hover:text-text-primary transition-colors text-center"
            >
              View API
            </a>
          </motion.div>
        </div>

        {/* Code snippet */}
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
