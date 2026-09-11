# erebus-app

Frontend of the Erebus catalogue: a read-only SPA over `erebus-api`, built as a
React + TypeScript + Vite application with an MVVM architecture.

`erebus-app` is an independent project with its own repository, dependencies and
tooling. Never assume a command or convention from `erebus-api` applies here.

## Normative documents

| Document | Path |
| --- | --- |
| **LLD (normative)** | `docs/lld-erebus-app.md` |
| HLD | `docs/hld-erebus-app.md` |
| Design system (Códice v1) | `docs/design/design-system.md` |
| Decisions | `docs/decisions/` |

Read the LLD **in full** before writing a line of code here, and verify your work
against its §14 Definition of Done checklist.

## Requirements

- Node.js 24+
- A running `erebus-api` on `http://localhost:3000` for the API-dependent paths.

## Getting started

```bash
npm ci
npm run dev
```

**Run `erebus-api` first.** In the `erebus-api` project, `npm run dev` (which
chains its database bootstrap). Without it the app still boots and every page
renders — the ambient API badge simply shows `API unreachable`. That degraded
state is expected behaviour, not a broken build.

Local development reaches the API through the Vite dev proxy declared in
`vite.config.ts` (`/v1` → `http://localhost:3000`), because `erebus-api` does not
yet serve CORS headers. See `docs/decisions/ADR-003-dev-proxy-base-url-and-ambient-health-probe.md`.

## Environment

Copy `.env.example` and adjust per environment. `.env.development` is committed
and already points at the dev proxy.

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | yes | Absolute URL **including** `/v1`, or the root-relative `/v1` in development |
| `VITE_REQUEST_TIMEOUT_MS` | no | Axios timeout, defaults to `8000` |

`VITE_*` variables are compiled into the public bundle — never place a credential
in one. An invalid environment fails the boot on purpose (LLD §12.2).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b` + production build |
| `npm run preview` | Serve the built bundle (requires `VITE_API_BASE_URL` at build time) |
| `npm run test` | Unit, component and integration tests (Vitest) |
| `npm run test:watch` | The same suite in watch mode |
| `npm run test:coverage` | The suite with the §10.6 coverage gates |
| `npm run test:e2e` | Playwright end-to-end suite |
| `npm run lint` | ESLint with `--max-warnings=0`, including the MVVM layer boundaries |
| `npm run format` | Prettier |

## Architecture in one paragraph

Dependencies point downward only: **View** (`src/layouts`, `src/pages`,
`src/components`) → **ViewModel** (`src/hooks`) → **Model** (`src/models`,
`src/services`). The View never performs I/O and never imports Axios or a
gateway; the Model never imports React. Both boundaries are enforced
mechanically by ESLint, not by convention (LLD §2.6, §4.1).
