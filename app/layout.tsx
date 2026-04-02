import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/error-boundary'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://greed-compute-ui.vercel.app'),
  title: 'greed-compute — Stateful Python for AI agents',
  description: 'Checkpoint interpreter state, fork N parallel workers, share across any model. Zero cold starts.',
  openGraph: {
    title: 'greed-compute',
    description: 'Stateful Python for AI agents. 500× faster warm starts.',
    url: 'https://greed-compute-ui.vercel.app',
    type: 'website',
    siteName: 'greed-compute',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'greed-compute — Stateful Python for AI agents',
    description: 'Checkpoint interpreter state, fork N parallel workers, share across any model. Zero cold starts.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
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
