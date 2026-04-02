// Use local rewrite proxy to avoid CORS preflight issues
const BASE_URL = '/api'

async function request<T>(path: string, apiKey: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  createSession: (apiKey: string, body: { template?: string }) =>
    request<{ session_id: string; template?: string }>('/v1/session/create', apiKey, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  execute: (apiKey: string, sessionId: string, code: string) =>
    request<{ stdout?: string; result?: unknown; error?: string }>(
      `/v1/session/${sessionId}/execute`,
      apiKey,
      { method: 'POST', body: JSON.stringify({ code }) }
    ),

  getSession: (apiKey: string, sessionId: string) =>
    request<{ session_id: string; created_at: number; last_active: number; template?: string }>(
      `/v1/session/${sessionId}`,
      apiKey
    ),

  deleteSession: (apiKey: string, sessionId: string) =>
    request<{ deleted: boolean }>(`/v1/session/${sessionId}`, apiKey, { method: 'DELETE' }),

  checkpoint: (apiKey: string, sessionId: string, name: string) =>
    request<{ checkpoint_id: string; name: string }>(
      `/v1/session/${sessionId}/checkpoint`,
      apiKey,
      { method: 'POST', body: JSON.stringify({ name }) }
    ),

  restoreCheckpoint: (apiKey: string, sessionId: string, checkpointId: string) =>
    request<{ session_id: string }>(`/v1/session/${sessionId}/restore/${checkpointId}`, apiKey, {
      method: 'POST',
    }),

  listCheckpoints: (apiKey: string) =>
    request<{ checkpoint_id: string; name: string; created_at: number; size_bytes: number }[]>(
      '/v1/checkpoints',
      apiKey
    ),

  forkCheckpoint: (apiKey: string, checkpointId: string, count: number) =>
    request<{ session_ids: string[] }>('/v1/checkpoints/fork', apiKey, {
      method: 'POST',
      body: JSON.stringify({ checkpoint_id: checkpointId, count }),
    }),

  getUsage: (apiKey: string) =>
    request<{
      plan: string
      requests: { used: number; limit: number; remaining: number }
      storage: { used_mb: number; limit_mb: number; remaining_mb: number }
      checkpoint_retention_days: number
    }>('/v1/usage', apiKey),
}
