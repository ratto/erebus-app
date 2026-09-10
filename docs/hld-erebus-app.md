### HLD: erebus-app (Phase 1 — Search Service)

Version: 1.1
Date: 2026-09-10 (v1.0: 2026-09-09)
Owner: rattopedro@gmail.com

Changes in 1.1: weapon pages, hooks, gateways, and models re-split into melee / ranged / firearms per ADR-001 (`docs/decisions/ADR-001-weapon-taxonomy-melee-ranged-firearms.md`).

---

### Technical Objective
Structure `erebus-app`, currently a standard Vite+React scaffold without domain logic, as an MVVM application that consumes `erebus-api` to provide read-only query (listing, search, filter, and detail) access to Daemon System tables: melee weapons, ranged weapons, firearms, protections, skills, and enhancements. This document covers exclusively the technical how of the solution (architecture, components, flows, data, interfaces, stack, scalability, security, and observability); the design system (visual tokens, UI components) is documented separately in `erebus-app/docs/design`.

Dependencies with other systems
- `erebus-api`: sole external integration, consumed via REST/JSON read-only.

---

### General Architecture
Single-page application (SPA) in React built with Vite and TypeScript, organized in MVVM. The Model layer concentrates Gateways (Axios) per entity and pure TypeScript types, agnostic of React or any UI library. The ViewModel layer is implemented as domain hooks (one per entity) that consume Gateways and expose state and methods to the View via destructuring. The View layer comprises layouts, pages, and React components (tsx), without direct HTTP calls. Routing via React Router DOM, with two layouts (landing and main) containing nested pages.

Deployment Environment
- Cloud (static hosting/CDN).
- Static SPA build published on Netlify; `erebus-api` URL configured via Vite environment variable (`VITE_API_BASE_URL`), injected in build per environment.

Main Technologies
- React + Vite + TypeScript
- React Router DOM (routing)
- Axios (HTTP client)
- Styled Components + Sass (styling)
- Vitest (unit and integration tests)
- Playwright (E2E tests)

Adopted Patterns
- MVVM (Model / ViewModel / View)
- Gateway pattern in Model layer (one Axios Gateway per entity, faithfully mirroring `erebus-api` endpoints)
- Domain hooks as ViewModel (e.g., `useSkills`, `useMeleeWeapons`)
- REST/JSON as integration protocol with `erebus-api`
- Client-side filter and search over complete dataset loaded per entity

---

### Components and Responsibilities
| Component | Responsibilities | Dependencies |
| ----------- | ----------------- | ------------ |
| `LandingLayout` | Home page layout (`HomePage`) | React Router |
| `MainLayout` | Navigation shell for other pages (`AboutPage` and 6 listing pages) | React Router |
| `HomePage` | Institutional home page | `LandingLayout` |
| `AboutPage` | Institutional "About" page | `MainLayout` |
| `MeleeWeaponsListPage` | Listing, search, and filter of melee weapons | `useMeleeWeapons`, `MeleeWeaponDetail` |
| `RangedWeaponsListPage` | Listing, search, and filter of non-firearm ranged weapons (bows, crossbows) and thrown weapons; displays a note that these are canonically tested under `Armas Brancas*` | `useRangedWeapons`, `RangedWeaponDetail` |
| `FirearmsListPage` | Listing, search, and filter of firearms | `useFirearms`, `FirearmDetail` |
| `ProtectionsListPage` | Listing, search, and filter of protections/armor | `useProtections`, `ProtectionDetail` |
| `SkillsListPage` | Listing, search, and filter of skills | `useSkills`, `SkillDetail` |
| `EnhancementsListPage` | Listing, search, and filter of enhancements | `useEnhancements`, `EnhancementDetail` |
| `MeleeWeaponDetail` / `RangedWeaponDetail` / `FirearmDetail` / `ProtectionDetail` / `SkillDetail` / `EnhancementDetail` | Modal detail components per entity, displaying all fields and source/source level origin; weapon details additionally display the governing Daemon skill (`skillGroup`) as a first-class field | Corresponding Gateway (request by id) |
| Domain hooks (`useMeleeWeapons`, `useRangedWeapons`, `useFirearms`, `useProtections`, `useSkills`, `useEnhancements`) | ViewModel: orchestrate calls to Gateways, maintain state (data, loading, error), expose in-memory search/filter | Corresponding Gateway |
| Gateways (`meleeWeaponsGateway`, `rangedWeaponsGateway`, `firearmsGateway`, `protectionsGateway`, `skillsGateway`, `enhancementsGateway`) | Encapsulate Axios calls to `erebus-api`, map response to Models | Axios, `erebus-api` |
| Models (pure TS types) | Represent entities from API (`MeleeWeapon`, `RangedWeapon`, `Firearm`, `Protection`, `Skill`, `Enhancement`), including provenance fields | None (pure TypeScript) |
| Shared UI components (`/src/components`) | Search, filter by source level, generic modal, loading/error indicators | Used by pages and their exclusive components |

---

### Request and Data Flow
**Request Flow (Listing)**
- User navigates to a listing page (e.g., `SkillsListPage`) within `MainLayout`.
- Domain hook (`useSkills`) fires on mount, calling `skillsGateway.list()`.
- Gateway executes `GET /skills` on `erebus-api`, receiving all records at once.
- Response is mapped to `Skill[]` (pure TypeScript Model).
- Hook maintains complete list in state and exposes data, loading, error, and search/filter methods.
- Search and filter are applied in-memory, without new request.
- Loading displayed via spinner/skeleton; error or empty result displayed inline on page, with complementary global notification (toast/snackbar).

**Request Flow (Detail)**
- User clicks on a list item, opening the corresponding modal (e.g., `SkillDetail`).
- Hook fires `GET /skills/:id` on `erebus-api`.
- Response mapped to Model, displayed in modal, including source and source level origin.
- Loading via spinner/skeleton inside modal; error inline in modal with complementary global notification; no automatic retry.

**Data Flow**
- SQLite (`erebus-api`) → REST JSON response → Gateway (Axios) → Model (pure TypeScript) → domain hook state (ViewModel) → View (props via destructuring) → rendering.

---

### Data Model (High Level)
Main Entities
- `MeleeWeapon` (knives, daggers, swords, axes, clubs, spears; includes unarmed combat)
- `RangedWeapon` (bows and crossbows, plus thrown weapons — the latter are the same records returned by `MeleeWeapon` with `isThrown: true`, not duplicates)
- `Firearm` (firearms: pistols, submachine guns, shotguns)
- `Protection` (armor/protections)
- `Skill` (skill, with nested `subgroups` and `baseAttribute`)
- `Enhancement` (enhancement, with nested `levels`/`costs`/`effects`)

All entities include common provenance fields defined by `erebus-api`: `sourceLevel`, `source`, and, when applicable, `editionOrVersion`.

Relations
- No cross-entity relations are navigated by the application in this phase; each entity is queried in isolation. The `skillGroup` field on weapon models is displayed as text, not as a navigable link to the corresponding skill.

Source of Truth
- `erebus-api` (SQLite). `erebus-app` does not persist or cache data between sessions (no localStorage/IndexedDB); each page load triggers a new request.

---

### Public Interfaces
| Name | Type | Protocol | Exposure | SLAs/Limits |
| ---- | ---- | ---------- | --------- | ------------- |
| `erebus-app` (web application) | Web App | HTTPS | External | Initial load < 2s (hypothesis); in-memory search/filter < 50ms (hypothesis) |
| `GET /melee-weapons`, `/melee-weapons/:id` | API | REST/JSON | Consumed (`erebus-api`) | p95 < 200ms (defined in `erebus-api` PRD) |
| `GET /ranged-weapons`, `/ranged-weapons/:id` | API | REST/JSON | Consumed (`erebus-api`) | p95 < 200ms |
| `GET /firearms`, `/firearms/:id` | API | REST/JSON | Consumed (`erebus-api`) | p95 < 200ms |
| `GET /protections`, `/protections/:id` | API | REST/JSON | Consumed (`erebus-api`) | p95 < 200ms |
| `GET /skills`, `/skills/:id` | API | REST/JSON | Consumed (`erebus-api`) | p95 < 200ms |
| `GET /enhancements`, `/enhancements/:id` | API | REST/JSON | Consumed (`erebus-api`) | p95 < 200ms |

---

### Scalability and Availability Considerations
General Approach
- Static SPA served via CDN (Netlify); horizontal scaling managed by the platform, no own server to scale.

Applied Techniques
- Static build distributed via CDN; no automatic retry on `erebus-api` failure in this phase; Axios timeout configured; error handled via inline state on page/modal, complemented by global notification.

Availability Target
- 99.9% for web application (hypothesis, Netlify platform), also dependent on `erebus-api` availability, outside direct control of `erebus-app`.

---

### Security
Authentication
- Not applicable in this phase: public application, read-only, without user login.

Authorization
- Not applicable in this phase: all queried data is public.

Data Protection
- HTTPS communication between `erebus-app`, Netlify, and `erebus-api`. No sensitive or personal data (PII) is collected, displayed, or processed. No data persistence on client (no local cache).

Secrets Management
- No true secrets in `erebus-app`; the `VITE_API_BASE_URL` environment variable exposes only the public API URL, not a credential. No secrets are embedded in the client bundle.

---

### Observability
Logs
- Structured `console.error` for request failures, without sending to external service in this phase.

Metrics
- None collected in this phase.

Tracing
- None in this phase.

Dashboards and Alerts
- Limited to Netlify build/deploy panel.

Future Recommendation (Hypothesis)
- Evaluate adoption of a lightweight error tracking service (e.g., Sentry) and basic usage metrics without cookies (e.g., Plausible, Umami) in a later phase, when the user base justifies the investment.

---

### Architectural Risks and Mitigation
#### Catalog Growth Degrades Client-Side Filter
- **Probability:** medium
- **Impact:** in-memory search and filter become slow if Level 2/3 curation significantly expands lists
- **Mitigation:**
  - Monitor payload size per entity
  - Migrate to server-side pagination/filter if necessary
- **Contingency Plan:** review domain hooks to adopt server-side filter reusing search parameters already foreseen in `erebus-api` endpoints

#### Lack of Automatic Retry on Momentary Network Failures
- **Probability:** medium
- **Impact:** transient API instability appears as visible error to user, without automatic recovery
- **Mitigation:**
  - User can manually try again
- **Contingency Plan:** reevaluate retry with backoff if problem proves recurrent in production

#### Absence of Production Observability
- **Probability:** high
- **Impact:** real production failures may go unnoticed, complicating diagnosis
- **Mitigation:**
  - Adopt lightweight error tracking recommendation described in Observability
- **Contingency Plan:** manual monitoring via user reports until adoption of dedicated tool

#### Ranged Weapons Menu Implies a Skill That Does Not Exist in the Daemon System
- **Probability:** medium
- **Impact:** user infers bows and crossbows are tested under a "ranged weapons" skill, when they are canonically tested under `Armas Brancas*`
- **Mitigation:**
  - `skillGroup` displayed as a first-class field on every weapon detail modal
  - Explanatory note in the header of `RangedWeaponsListPage`
  - Thrown weapons visibly flagged as also appearing in the melee listing (same record, same id)
- **Contingency Plan:** merge the melee and ranged listings behind a single "Weapons" entry with a category filter, should the confusion be reported in use

#### Direct Coupling Between erebus-app Models and erebus-api Response Contract
- **Probability:** medium
- **Impact:** API schema change without versioning breaks Gateways/Models without warning
- **Mitigation:**
  - Validate contract via integration tests (Vitest) with mock responses faithful to real schema
  - Monitor `erebus-api` endpoint versioning
- **Contingency Plan:** adjust Gateways and Models in isolation, without View/ViewModel impact, given MVVM isolation

---

### ADRs and Next Steps
Associated ADRs
- ADR-001 — Three-way weapon taxonomy (melee / ranged / firearms) as the product-facing category (`docs/decisions/ADR-001-weapon-taxonomy-melee-ranged-firearms.md`)
- Decisions below are candidates for formal recording.

Pending Decisions
- Future need for server-side pagination/filter, should catalog grow
- Adoption of error tracking tool (e.g., Sentry)

Next Steps
- Structure project in `/src/pages`, `/src/components`, `/src/models` (Models + Gateways), `/src/hooks` (ViewModels), `/src/layouts`
- Implement routing with React Router DOM (`LandingLayout` → `HomePage`; `MainLayout` → `AboutPage` + 6 listing pages)
- Implement Axios Gateways per entity and corresponding domain hooks
- Configure `VITE_API_BASE_URL` per environment and deploy pipeline on Netlify
- Write unit/integration tests (Vitest) for Gateways and hooks, and E2E tests (Playwright) for search/filter/detail flows
- Detail design system in `erebus-app/docs/design` (outside this HLD)
- Formalize candidate ADRs listed above
