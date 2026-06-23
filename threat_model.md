# Threat Model

## Project Overview

This repository is a pnpm monorepo for a public-facing Studio11 digital lookbook. The production deployment consists of a Vite React SPA in `artifacts/studio11` and an Express API in `artifacts/api-server`, with shared OpenAPI/Zod/client libraries under `lib/`. The current production backend exposure is minimal and appears limited to a health-check endpoint.

Production scoping assumptions for this project:
- `artifacts/mockup-sandbox` is development-only and is not deployed to production.
- `NODE_ENV` is `production` in deployed environments.
- Replit terminates TLS for deployed traffic.
- Deployment visibility is public, so any production endpoint must be treated as internet-reachable.

## Assets

- **Deployment availability** — the main asset currently exposed by the backend is service availability, because the API surface is very small and public.
- **User-entered profile details in the SPA** — the frontend collects name, phone number, birthday, anniversary, and preference data in client memory. Even without backend persistence, this is still user data that should not be exposed to unintended parties.
- **Application secrets and infrastructure credentials** — `DATABASE_URL`, future auth tokens, and any server-side API keys would be high-impact if leaked through logs, client bundles, or unsafe server routes.
- **Future API contracts and shared client code** — the OpenAPI spec and generated client libraries are reused across artifacts, so insecure patterns here can propagate quickly when new endpoints are added.

## Trust Boundaries

- **Browser → API** — any request from the public SPA to the Express server crosses from an untrusted client into trusted server code. All future non-public endpoints must authenticate and authorize on the server.
- **API → Database** — the server has direct database access through Drizzle/Postgres. Any future injection flaw at the API boundary would directly impact confidentiality and integrity of stored data.
- **Browser → Third-party navigation** — the SPA opens a WhatsApp booking link. Any user data included in outbound URLs crosses into a third-party service and may appear in browser history, referrers, or provider logs.
- **Production → Dev-only code boundary** — `artifacts/mockup-sandbox` and similar prototyping code must be kept out of production scope unless a deployment path proves otherwise.

## Scan Anchors

- Production entry points: `artifacts/studio11/src/main.tsx`, `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`
- Current server routes: `artifacts/api-server/src/routes/**`, with OpenAPI source in `lib/api-spec/openapi.yaml`
- Highest-risk shared code areas when the API grows: `lib/api-client-react/src/custom-fetch.ts`, `lib/db/src/**`
- Public surface today: SPA pages and `GET /api/healthz`
- Dev-only areas to usually ignore: `artifacts/mockup-sandbox/**`, `scripts/**`, attached design/media assets

## Threat Categories

### Tampering

The client is untrusted. Any future booking, pricing, profile, or rewards workflow added behind the current SPA must treat all client-supplied fields as attacker-controlled and must recalculate any business-sensitive values server-side. Shared API contracts and generated clients do not provide security by themselves; enforcement must happen in server handlers.

Required guarantees:
- All future state-changing API endpoints MUST validate request bodies server-side.
- Any pricing, discounts, eligibility rules, or booking decisions MUST be derived or revalidated on the server.
- Database access MUST continue to use parameterized ORM/query APIs rather than string-built SQL.

### Information Disclosure

The project already handles user profile fields in the browser and may later expand to persist them. The main disclosure risks are accidental logging, exposing secrets in client bundles, or leaking user data through outbound URLs or verbose API responses.

Required guarantees:
- Secrets such as `DATABASE_URL` and future API keys MUST remain server-only and MUST NOT be embedded in frontend bundles.
- Server logs MUST redact credentials and cookies, and future sensitive fields MUST not be logged by default.
- Future API responses MUST return only the fields the caller is authorized to see.
- Any outbound third-party booking or messaging flow MUST avoid unnecessarily including sensitive user data in URLs.

### Denial of Service

Because the current public backend surface is internet-reachable, even a small API can become a DoS target if future endpoints perform expensive work or accept unbounded payloads.

Required guarantees:
- Public endpoints MUST keep request processing bounded in CPU, memory, and payload size.
- Any future expensive or authenticated workflows MUST introduce rate limits, timeouts, or equivalent backpressure controls appropriate to the route.
- Health and readiness routes MUST remain side-effect free and inexpensive.

### Elevation of Privilege

The codebase contains shared client auth support and a database layer, even though the current backend does not yet enforce authenticated user flows. The main privilege-escalation risk is that future protected endpoints are added without server-side authorization because the current API is so minimal.

Required guarantees:
- Any future endpoint that reads or mutates user-specific or admin data MUST enforce authentication and authorization on the server.
- Client-side state, hidden UI, and generated client helpers MUST NOT be treated as authorization boundaries.
- Dev-only sandbox code MUST NOT be exposed through production routing or builds.
