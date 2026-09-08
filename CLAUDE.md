# link-shortener

Personal URL shortener at `m.adamfirda.us`. Single-user tool — one shared passcode gates link creation, everything else is public.

## Tech Stack

- Next.js 15.5.23 (App Router)
- React 18.2, plain JSX (no TypeScript)
- Tailwind CSS
- `better-sqlite3` — single SQLite file, no separate DB service
- No auth library — a stateless HMAC-signed session cookie, hand-rolled (see `src/lib/session.js`)

## Naming Convention

General → specific. The shared domain concept here is `url`, so it leads every compound identifier:

- DB columns: `url_code`, `url_destination`
- Functions: `urlCodeGenerate()`, `urlCodeValidate()`, `urlDestinationValidate()`
- Components: `FormUrl.jsx`, `FormLogin.jsx` (not `UrlForm`/`LoginForm`)
- Request/response fields: `urlCode`, `urlDestination`, `urlShort`

Applies to variables, functions, files, and DB columns alike.

## Routes

- `/` — redirects to `/link`
- `/link` — **public**, no auth. Index of every link, each with a button to open it in a new tab.
- `/link/create` — **gated**. Shows `FormLogin` (`src/app/auth/FormLogin.jsx`) if there's no valid session cookie, or `FormUrl` (`src/app/link/create/components/FormUrl.jsx`) once logged in.
- `/[urlCode]` — public redirect: looks up the code, `302`s to the destination, `404` if unknown.

Auth-related UI lives under `src/app/auth/` regardless of which route renders it — it's not a route itself, just a components grouping (no `page.js` there).

## Auth Model

Login-once, not a passcode-per-action:

1. `POST /api/session` — verifies the passcode (constant-time compare) and a Cloudflare Turnstile token, then sets a signed, `HttpOnly` session cookie. No session table — the cookie is `<expiry>.<hmac>`, verified by recomputing the HMAC with `SESSION_SECRET`.
2. `POST /api/links` — only checks the session cookie; passcode/Turnstile aren't re-verified per link. Still rate-limited by IP regardless of session.
3. `GET /link` — no auth at all, by design.

Cloudflare Turnstile is a captcha *provider*, not the shape of the code — `src/lib/captcha.js` exports `captchaVerify()` so swapping providers later doesn't touch call sites.

## Database

Single table, `links`:

```sql
CREATE TABLE links (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  url_code        TEXT NOT NULL UNIQUE,
  url_destination TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  hit_count       INTEGER NOT NULL DEFAULT 0,
  hit_at          TEXT
);
```

`DB_PATH` env var points at the file — in production it's outside the deploy directory (see Deploy below) so redeploys never wipe it.

## Deploy

Staging + production, mirroring `gawai`/`oxvlo`'s flat-deploy pattern exactly: `staging` branch → `deploy-staging.yml`, `main` → `deploy-production.yml`. Both do SCP → build → PM2 restart. **Never place app files on the server by hand** — everything goes through these pipelines. Push to `staging` and verify before merging to `main` — this is the actual safety net, since flat-deploy has no rollback (the old build gets wiped before the new one even compiles, so a failed build leaves the site broken until the next green deploy).

**No `beta.m.adamfirda.us` subdomain** — staging has no public hostname or nginx block, verified by hitting its port directly.

Server layout (all under the `muhammadadamfirdaus.com` system user on oxv-01):

```
/home/muhammadadamfirdaus.com/web/link-shortener/app/            production deploy target — wiped + rewritten every push to main
/home/muhammadadamfirdaus.com/web/link-shortener/data/            production DB, sibling to app/, never touched by the deploy
/home/muhammadadamfirdaus.com/web/link-shortener-staging/app/     staging deploy target — wiped + rewritten every push to staging
/home/muhammadadamfirdaus.com/web/link-shortener-staging/data/    staging DB, entirely separate file from production's
```

| | Staging | Production |
|---|---|---|
| PM2 name | `link-shortener-staging` | `link-shortener` |
| Port | 3001 | 3002 |
| Access | via SSH tunnel only (see below) | `https://m.adamfirda.us` |

Staging's port isn't reachable from outside the server — the firewall only allows public traffic on 80/443/2020. To browse staging yourself: `ssh -p 2020 -i ~/.ssh/oxv-01 -L 3001:localhost:3001 muhammadadamfirdaus.com@103.175.216.196`, then open `http://localhost:3001` locally while that SSH session stays open. `curl`-based checks from the server itself (`http://localhost:3001/...` over SSH) work fine without a tunnel.

### Env Vars

| Variable | Scope | Staging | Production |
|---|---|---|---|
| `PORT`, `DB_PATH`, `LINK_PASSCODE`, `SESSION_SECRET` | server-only, written to `.env` by the deploy workflow | from GH secrets | from GH secrets |
| `TURNSTILE_SECRET_KEY` | server-only | hardcoded test key | from GH secret |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | public — CI-injected at build time only | hardcoded test key | from GH secret |

Staging hardcodes Cloudflare's published always-pass test keys directly in `deploy-staging.yml` (they're public constants, not secrets) rather than pulling from GitHub secrets — a real Turnstile widget refuses to render on a hostname it isn't registered for, and staging has no domain (accessed via raw IP:port).

## Dev

```bash
cp .env.local.example .env.local   # fill in LINK_PASSCODE and SESSION_SECRET; Turnstile test keys already set
npm install
npm run dev
```

The `.env.local.example` Turnstile keys are Cloudflare's published always-pass test keys — the widget works in dev without a real Cloudflare registration.