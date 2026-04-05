'use client'

import Link from 'next/link'
import { useMemo } from 'react'

const LINKS = [
  { label: 'Playground', href: '/playground' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Docs', href: '/docs' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Health', href: 'https://compute.deep-ml.com/v1/health' },
  { label: 'llms.cuntext', href: 'https://compute.deep-ml.com/v1/llms.cuntext' },
]

const COLS = 40
const ROWS = 30

export function Footer() {
  // Generate the grid blocks with decreasing density from top to bottom
  // Top rows: most blocks visible (hiding the image)
  // Bottom rows: fewer blocks (revealing the image)
  const blocks = useMemo(() => {
    const cells: { row: number; col: number; visible: boolean }[] = []
    for (let row = 0; row < ROWS; row++) {
      // Probability of a block being visible decreases with row
      // Row 0: ~95% covered, Row 11: ~5% covered
      const density = 1 - (row / (ROWS - 1))
      const threshold = density * density // quadratic falloff for a natural dissolve

      for (let col = 0; col < COLS; col++) {
        // Use deterministic "random" based on position so it doesn't shift on re-render
        const hash = Math.sin(row * 127.1 + col * 311.7) * 43758.5453
        const rand = hash - Math.floor(hash)
        cells.push({ row, col, visible: rand < threshold })
      }
    }
    return cells
  }, [])

  return (
    <footer className="relative overflow-hidden">
      {/* Server image behind everything */}
      <div
        className="absolute inset-0 bg-no-repeat"
        style={{ backgroundImage: "url('/server.png')", backgroundSize: '100% auto', backgroundPosition: 'center 60%' }}
      />

      {/* Grid overlay: blocks that dissolve from top to bottom */}
      <div
        className="absolute inset-0"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {blocks.map(({ row, col, visible }) => (
          <div
            key={`${row}-${col}`}
            style={{
              gridRow: row + 1,
              gridColumn: col + 1,
              backgroundColor: visible ? 'var(--background)' : 'transparent',
            }}
          />
        ))}
      </div>

      {/* Links bar - above the dissolve, on solid background */}
      <div className="relative z-10 border-b border-border bg-background px-6 py-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-text-tertiary hover:text-text-secondary transition-colors font-mono"
                {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-text-tertiary font-mono">
            &copy; {new Date().getFullYear()} deep-ml.com
          </p>
        </div>
      </div>

      {/* greed.compute branding - over the image */}
      <div className="relative z-10 px-6 md:px-12 lg:px-24" style={{ marginTop: '250px', paddingBottom: '40px' }}>
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-text-primary">
            greed<span className="text-accent">.</span>compute
          </p>
        </div>
      </div>
    </footer>
  )
}
