'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { session } from '@/lib/api'

const NAV_LINKS = [
  { href: '/docs',       label: 'Docs'       },
  { href: '/#pricing',   label: 'Pricing'    },
  { href: '/playground', label: 'Playground' },
]

export function Nav() {
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    session.check().then(s => setAuthed(s.authenticated))
  }, [pathname])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close on click outside
  useEffect(() => {
    if (!mobileOpen) return

    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [mobileOpen])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  const signOut = async () => {
    await session.clear()
    window.location.href = '/login'
  }

  return (
    <nav className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 md:px-12 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold text-text-primary tracking-tight hover:text-accent transition-colors"
        >
          greed<span className="text-accent">.</span>compute
        </Link>

        {/* Desktop nav */}
        <div className="flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-xs font-mono transition-colors hidden sm:block',
                pathname === link.href
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {link.label}
            </Link>
          ))}

          {authed ? (
            <>
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-xs font-mono border border-border text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors hidden sm:block"
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="text-xs font-mono text-text-secondary hover:text-text-primary transition-colors hidden sm:block"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-mono bg-accent text-background hover:bg-accent-dim transition-colors hidden sm:block"
            >
              Sign in
            </Link>
          )}

          {/* Hamburger button — mobile only */}
          <button
            ref={buttonRef}
            onClick={() => setMobileOpen(prev => !prev)}
            className="sm:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px]"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span
              className={cn(
                'block h-px w-4 bg-text-secondary transition-all duration-200',
                mobileOpen && 'translate-y-[3px] rotate-45'
              )}
            />
            <span
              className={cn(
                'block h-px w-4 bg-text-secondary transition-all duration-200',
                mobileOpen && '-translate-y-[3px] -rotate-45'
              )}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        ref={menuRef}
        className={cn(
          'sm:hidden overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out border-t border-border bg-surface',
          mobileOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 border-t-0'
        )}
      >
        <div className="flex flex-col px-6 py-3 gap-3">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className={cn(
                'text-xs font-mono transition-colors',
                pathname === link.href
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {link.label}
            </Link>
          ))}

          {authed ? (
            <>
              <Link
                href="/dashboard"
                onClick={closeMobile}
                className="text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { closeMobile(); signOut() }}
                className="text-xs font-mono text-text-secondary hover:text-text-primary transition-colors text-left"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={closeMobile}
              className="text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
