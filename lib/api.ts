// All requests go through /api/* which the server-side proxy route
// handles — it reads the httpOnly session cookie and injects X-API-Key.
// No API key is ever exposed to client-side JavaScript.

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'same-origin',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  createSession: (body: { template?: string }) =>
    request<{ session_id: string; template?: string }>('/v1/session/create', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  execute: (sessionId: string, code: string) =>
    request<{ stdout?: string; result?: unknown; error?: string; duration_ms?: number }>(
      `/v1/session/${sessionId}/execute`,
      { method: 'POST', body: JSON.stringify({ code }) },
    ),

  getSession: (sessionId: string) =>
    request<{ session_id: string; created_at: number; last_active: number; template?: string }>(
      `/v1/session/${sessionId}`,
    ),

  deleteSession: (sessionId: string) =>
    request<{ deleted: boolean }>(`/v1/session/${sessionId}`, { method: 'DELETE' }),

  checkpoint: (sessionId: string, name: string) =>
    request<{ checkpoint_id: string; name: string }>(
      `/v1/session/${sessionId}/checkpoint`,
      { method: 'POST', body: JSON.stringify({ name }) },
    ),

  restoreCheckpoint: (sessionId: string, checkpointId: string) =>
    request<{ session_id: string }>(`/v1/session/${sessionId}/restore/${checkpointId}`, {
      method: 'POST',
    }),

  listCheckpoints: () =>
    request<{ checkpoint_id: string; name: string; created_at: number; size_bytes: number }[]>(
      '/v1/checkpoints',
    ),

  forkCheckpoint: (checkpointId: string, count: number) =>
    request<{ session_ids: string[] }>('/v1/checkpoints/fork', {
      method: 'POST',
      body: JSON.stringify({ checkpoint_id: checkpointId, count }),
    }),

  getUsage: () =>
    request<{
      plan: string
      requests: { used: number; limit: number; remaining: number }
      storage: { used_mb: number; limit_mb: number; remaining_mb: number }
      checkpoint_retention_days: number
    }>('/v1/usage'),
}

// Session management — used by dashboard on OAuth callback and sign-out
export const session = {
  set: (key: string, login: string) =>
    fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, login }),
      credentials: 'same-origin',
    }),

  check: () =>
    fetch('/api/auth/session', { credentials: 'same-origin' })
      .then(r => r.json() as Promise<{ authenticated: boolean; login: string | null }>),

  clear: () =>
    fetch('/api/auth/session', { method: 'DELETE', credentials: 'same-origin' }),
}
