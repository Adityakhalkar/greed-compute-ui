'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'

const CODE = `import requests

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

function highlightPython(code: string) {
  return code.split('\n').map((line, i) => {
    // Comments
    if (line.trimStart().startsWith('#')) {
      return <span key={i}><span className="token-comment">{line}</span>{'\n'}</span>
    }

    // Process the line token by token
    const parts: React.ReactNode[] = []
    let remaining = line
    let partKey = 0

    while (remaining.length > 0) {
      let matched = false

      // Strings (f-strings, regular strings)
      const strMatch = remaining.match(/^(f?"[^"]*"|f?'[^']*')/)
      if (strMatch) {
        parts.push(<span key={partKey++} className="token-string">{strMatch[0]}</span>)
        remaining = remaining.slice(strMatch[0].length)
        matched = true
        continue
      }

      // Keywords
      const kwMatch = remaining.match(/^(import|from|as|def|class|return|if|else|for|in|with|try|except|raise|not|and|or|is|None|True|False)\b/)
      if (kwMatch) {
        parts.push(<span key={partKey++} className="token-keyword">{kwMatch[0]}</span>)
        remaining = remaining.slice(kwMatch[0].length)
        matched = true
        continue
      }

      // Function calls
      const fnMatch = remaining.match(/^([a-zA-Z_]\w*)\s*(?=\()/)
      if (fnMatch) {
        parts.push(<span key={partKey++} className="token-function">{fnMatch[1]}</span>)
        remaining = remaining.slice(fnMatch[1].length)
        matched = true
        continue
      }

      // Numbers
      const numMatch = remaining.match(/^\d+\.?\d*/)
      if (numMatch) {
        parts.push(<span key={partKey++} className="token-number">{numMatch[0]}</span>)
        remaining = remaining.slice(numMatch[0].length)
        matched = true
        continue
      }

      // Punctuation
      const punctMatch = remaining.match(/^[{}()\[\].,;:=+\-*/<>!@%&|^~]/)
      if (punctMatch) {
        parts.push(<span key={partKey++} className="token-punct">{punctMatch[0]}</span>)
        remaining = remaining.slice(1)
        matched = true
        continue
      }

      if (!matched) {
        // Regular text
        const nextSpecial = remaining.search(/[#"'()\[\]{},.:;=+\-*/<>!@%&|^~\d\s]/)
        if (nextSpecial <= 0) {
          parts.push(<span key={partKey++} className="text-text-primary">{remaining}</span>)
          remaining = ''
        } else {
          const chunk = remaining.slice(0, nextSpecial || 1)
          parts.push(<span key={partKey++} className="text-text-primary">{chunk}</span>)
          remaining = remaining.slice(chunk.length)
        }
      }
    }

    return <span key={i}>{parts}{'\n'}</span>
  })
}

export function Hero() {
  const [copied, setCopied] = useState(false)
  const highlightedCode = highlightPython(CODE)

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
            <span className="burning-text">burning</span> tokens.
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
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
            <code>{highlightedCode}</code>
          </pre>
        </motion.div>
      </div>
    </section>
  )
}
