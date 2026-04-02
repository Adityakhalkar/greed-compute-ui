'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const publicLinks = [
  { href: '/#api', label: 'API' },
  { href: '/#pricing', label: 'Pricing' },
]

const authLinks = [
  { href: '/playground', label: 'Playground' },
  { href: '/dashboard', label: 'Dashboard' },
]

export function Nav() {
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('greed_api_key'))

    const onStorage = () => setLoggedIn(!!localStorage.getItem('greed_api_key'))
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Re-check on route change (covers same-tab login/logout)
  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('greed_api_key'))
  }, [pathname])

  const signOut = () => {
    localStorage.removeItem('greed_api_key')
    localStorage.removeItem('greed_login')
    setLoggedIn(false)
    window.location.href = '/login'
  }

  const links = loggedIn
    ? [...publicLinks, ...authLinks]
    : publicLinks

  return (
    <nav className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 md:px-12 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-text-primary tracking-tight hover:text-accent transition-colors">
          greed<span className="text-accent">.</span>compute
        </Link>

        <div className="flex items-center gap-6">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-xs font-mono transition-colors',
                pathname === link.href || (pathname.startsWith(link.href.split('#')[0] + '/') && link.href !== '/')
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {link.label}
            </Link>
          ))}

          {loggedIn ? (
            <>
              <Link
                href="/upgrade"
                className="px-3 py-1.5 text-xs font-mono bg-accent text-background hover:bg-accent-dim transition-colors"
              >
                Upgrade
              </Link>
              <button
                onClick={signOut}
                className="text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-mono bg-accent text-background hover:bg-accent-dim transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
