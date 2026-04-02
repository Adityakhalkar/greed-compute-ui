'use client'

import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="font-mono text-sm text-text-secondary">
              Something went wrong.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="font-mono text-xs text-accent underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
