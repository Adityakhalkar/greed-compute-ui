# greed-compute — Full Context Export
*Generated from session 01ViNupq21ru288KPDpqsqk2*
 
---
 
## What Is This
 
**greed-compute** — stateful Python execution engine for AI agents.
- Checkpoint interpreter state, fork N parallel workers in <100ms
- REST API, no SDK required
- Live at: `https://compute.deep-ml.com` (API)
- UI live at: `https://greed-compute-ui.vercel.app` (or custom domain TBD)
 
---
 
## Repos
 
| Repo | Branch | Purpose |
|------|--------|---------|
| `Adityakhalkar/greed-compute` | `claude/analyze-architecture-YOVTD` | Rust backend |
| `Adityakhalkar/greed-compute-ui` | `main` | Next.js frontend |
 
---
 
## VPS
 
- **Host**: Greed-Compute (Ubuntu)
- **App dir**: `/opt/greed-compute`
- **Service**: `greed-compute.service` (systemd)
- **Nginx**: SSL termination → port 8080
- **SSL**: certbot, auto-renewed
- **DB**: SQLite at `/opt/greed-compute/greed-compute.db`
 
### Env vars in `/etc/systemd/system/greed-compute.service`:
```ini
Environment=RUST_LOG=greed_compute=info,tower_http=info
Environment="GITHUB_CLIENT_ID=Ov23liBAzoncI41iIxpo"
Environment="GITHUB_CLIENT_SECRET=<rotated_secret>"
Environment="FRONTEND_URL=https://greed-compute-ui.vercel.app"   ← NEEDS UPDATE to actual Vercel URL
```
 
---
 
## Backend Architecture (`src/`)
 
```
src/
  main.rs          — app startup, warm pool fill, TTL sweeper
  api/
    routes.rs      — all HTTP handlers
    auth.rs        — auth middleware (X-API-Key + rate limits)
    swarm.rs       — swarm/parallel execution
    mcp.rs         — MCP protocol handler
  db/
    mod.rs         — SQLite: api_keys, users, usage, checkpoints, jobs, swarms
  sandbox/
    mod.rs         — SessionManager, warm pool, session templates
  runtime/
    mod.rs         — Python worker spawning (nsjail sandboxed)
```
 
### Key API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/health` | public | Health + warm pool status |
| POST | `/v1/auth/register` | public | Email+password (legacy, unused) |
| POST | `/v1/auth/login` | public | Email+password (legacy, unused) |
| GET | `/v1/auth/github` | public | GitHub OAuth redirect |
| GET | `/v1/auth/github/callback` | public | OAuth callback → issues API key |
| POST | `/v1/session/create` | API key | Create Python session |
| POST | `/v1/session/{id}/execute` | API key | Run code in session |
| POST | `/v1/session/{id}/checkpoint` | API key | Save interpreter state |
| POST | `/v1/session/{id}/restore/{ckpt}` | API key | Restore checkpoint |
| GET | `/v1/checkpoints` | API key | List checkpoints |
| POST | `/v1/swarm` | API key | Create parallel swarm |
| POST | `/v1/admin/keys` | X-Admin-Key | Create API key manually |
| GET | `/v1/admin/keys` | X-Admin-Key | List API keys |
 
### Session Templates
- `blank` — bare Python
- `data-science` — numpy, pandas, matplotlib, scikit-learn, scipy
- `machine-learning` — torch, transformers, datasets, accelerate
- `web-scraping` — requests, httpx, beautifulsoup4, lxml
 
### Auth System
- GitHub OAuth only (email+password endpoints exist but unused)
- Users keyed on `github_user_id` (not email) — 1 account per GitHub account
- GitHub accounts < 30 days old are blocked
- API key format: `gc_<uuid>`
- Rate limits: free=100/hr, pro=5000/hr, enterprise=unlimited
 
### DB Schema (SQLite)
- `api_keys` — key, name, tier, created_at, is_active
- `users` — id, email, password_hash, github_user_id, github_login, api_key, created_at
- `usage` — api_key, endpoint, duration_ms, timestamp
- `checkpoints` — id, api_key, name, path, created_at, size_bytes
- `jobs` — async execution records
- `swarms` + `swarm_workers` — parallel execution
 
---
 
## Frontend Architecture (`greed-compute-ui/`)
 
```
app/
  page.tsx            — Landing: Nav→Hero→Stats→Problem(illus)→CALF(illus)→Primitives→API→Pricing→Footer
  login/page.tsx      — "Sign in with GitHub" (single CTA)
  dashboard/page.tsx  — Shows API key once after OAuth, usage stats
  playground/page.tsx — Live code editor, session management, Ctrl+Enter to run
  upgrade/page.tsx    — Pricing page
  auth/error/page.tsx — OAuth error (account_too_new, etc.)
components/
  nav.tsx             — Sticky nav, shows Dashboard vs Sign in based on localStorage
  hero.tsx            — GSAP terminal animation (cold-start → checkpoint → fork)
  stats.tsx           — 500×, <100ms, ∞, 0 with ScrollTrigger
  primitives.tsx      — Sessions/Checkpoints/Fork/Execute cards
  api-reference.tsx   — Tabbed curl+response panel with copy
  pricing.tsx         — Free/$0, Pro/$29, Enterprise/Custom
  footer.tsx
lib/
  api.ts              — Typed REST client for all endpoints
  utils.ts            — cn() helper
```
 
### Brand
- Background: `#0A0A08` (warm near-black)
- Accent: `#C8F135` (acid green)
- Font: Geist (sans + mono)
- Radius: 2px everywhere
- Animations: Framer Motion + GSAP, NO lucide-react
 
### Vercel Env Vars
```
NEXT_PUBLIC_API_URL=https://compute.deep-ml.com
```
 
---
 
## Pending Issues (known bugs)
 
1. **FRONTEND_URL wrong on VPS** — currently `https://compute.deep-ml.com` (the API). After OAuth, redirects to API instead of UI. Fix: update to actual Vercel URL in systemd service, then `daemon-reload && restart`.
 
2. **Login page doesn't redirect if already signed in** — add `useEffect` to check `localStorage.getItem('greed_api_key')` → `router.push('/dashboard')`.
 
3. **Nav doesn't update immediately after login** — needs storage event listener or re-check on route change.
 
4. **`/v1/usage` endpoint missing** — `lib/api.ts` calls it but it doesn't exist in `routes.rs`. Dashboard usage stats will always error. Need to implement it.
 
5. **`ui-scaffold-export/` and `ui-auth-export/` dirs in greed-compute** — leftover temp dirs used to transfer files, should be cleaned up and removed from the repo.
 
---
 
## GitHub OAuth App
- **Client ID**: `Ov23liBAzoncI41iIxpo`
- **Homepage URL**: `https://compute.deep-ml.com`
- **Callback URL**: `https://compute.deep-ml.com/v1/auth/github/callback`
- ⚠️ Secret was exposed in chat — **rotate it** at github.com → Settings → Developer settings → OAuth Apps
 
---
 
## What Still Needs Building
- [ ] Fix the 3 auth flow bugs above
- [ ] Implement `GET /v1/usage` endpoint on backend
- [ ] DNS split: `compute.deep-ml.com` → Vercel UI, `api.compute.deep-ml.com` → VPS
- [ ] Stripe billing (payment → plan upgrade enforcement)
- [ ] Figma SVG illustrations for Problem + CALF sections on landing page
- [ ] Python SDK (`pip install greed-compute`)
- [ ] Launch: HN post drafted in `docs/hn-launch.md`
- [ ] Set `GREED_ADMIN_KEY` env var on VPS
- [ ] Clean up temp export dirs from greed-compute repo
 
---
 
## How to Deploy Changes
 
**Backend:**
```bash
# On VPS
cd /opt/greed-compute
git pull origin claude/analyze-architecture-YOVTD
cargo build --release
sudo systemctl restart greed-compute
sleep 12 && curl http://localhost:8080/v1/health
```
 
**Frontend:**
```bash
# On Mac
cd greed-compute-ui
# make changes
git add . && git commit -m "..." && git push
# Vercel auto-deploys on push to main
```