import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/error-boundary'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://greed-compute-ui.vercel.app'),
  title: 'greed-compute — Code execution engine for AI agents',
  description: 'Your agents are burning tokens on code execution overhead. greed-compute fixes that with stateful Python sessions and cuntext-powered docs that cut context usage by 90%.',
  openGraph: {
    title: 'greed-compute',
    description: 'Code execution engine for AI agents. Stateful sessions + cuntext docs = 90% less token overhead.',
    url: 'https://greed-compute-ui.vercel.app',
    type: 'website',
    siteName: 'greed-compute',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'greed-compute — Code execution engine for AI agents',
    description: 'Your agents are burning tokens. Stateful Python sessions + cuntext docs = 90% less overhead.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-background text-text-primary font-sans">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              borderRadius: '2px',
            },
          }}
        />
      </body>
    </html>
  )
}
