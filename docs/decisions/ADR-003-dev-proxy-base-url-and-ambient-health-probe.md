# ADR-003 — Dev proxy with a root-relative API base URL, and the ambient health probe as the non-entity wiring reference

- **Status:** Accepted
- **Date:** 2026-09-10
- **Deciders:** `tech-lead`, with the product owner (technical interview Q1–Q5 of US-02)
- **Scope:** `erebus-app` only
- **Context US:** US-02 — Estruturar boilerplate do erebus-app
  (`docs/user stories/us02-erebus-app-boilerplate/`, Trello https://trello.com/c/0EACfgZO)
- **Amends:** `erebus-app/docs/lld-erebus-app.md` §2.5, §12.2, §12.3, and adds §12.5 (LLD v1.0 → v1.1)
- **Related:** `erebus-api/docs/decisions/ADR-002-health-check-non-entity-reference-slice.md`
  (the backend's parallel decision), ADR-001 (weapon taxonomy — unaffected)

---

## 1. Context

US-02 turns the stock Vite scaffold into the MVVM skeleton of `erebus-app`. Its central
requirement is to prove the whole chain — View → ViewModel → Model → Axios → `erebus-api` —
**without** modelling a catalogue entity, because entity modelling belongs to the EP02+
Feature USs and doing it inside an Infra US is the "boilerplate creep" risk both this US
and US-01 explicitly reject.

Three facts shaped the decision:

1. **`erebus-api` registers no CORS middleware.** Its `createApp()` wires
   `express.json → requestLogger → swagger → routes → errorHandler` and nothing else.
   A browser at `http://localhost:5173` calling `http://localhost:3000/v1/health` is
   blocked, so the health badge would render its error state permanently and the wiring
   this US exists to prove would be unverifiable.
2. **LLD §12.2 validated the base URL as `z.string().url()`**, which rejects any
   relative value — so a dev proxy could not be configured without touching the
   normative config schema.
3. **LLD §12.3 requires one toast per failure.** The health badge is mounted in both
   layouts, i.e. on every page, so with the API down that rule fires a toast on every
   navigation.

`erebus-api` work of any kind is out of scope for US-02 (separate repository, separate
branch, separate PR), so adding CORS there was not available as the answer.

## 2. Decision

### 2.1 Local development reaches `erebus-api` through a Vite dev proxy

`vite.config.ts` gains
`server.proxy = { '/v1': { target: 'http://localhost:3000', changeOrigin: true } }`.
`.env.development` sets `VITE_API_BASE_URL=/v1`; preview and production set an absolute
URL that includes `/v1`.

### 2.2 The configuration schema accepts an absolute URL **or** a root-relative path

```ts
VITE_API_BASE_URL: z.union([z.url(), z.string().regex(/^\/[^\s]*$/)])
```

The relative form is kept deliberately narrow — it must begin with `/` and contain no
whitespace — so the fail-fast property of §12.2 survives. (`z.url()` is also the Zod 4
spelling; `z.string().url()` was removed in v4, which US-02 installs.)

### 2.3 The health slice has no mapper

`health.schema.ts`'s parse output *is* the `HealthStatus` entity. There is no
API-vocabulary/app-vocabulary divergence to absorb, no derived field, no null to
normalise and no provenance to carry. This mirrors US-01's D3 on the backend.

### 2.4 Ambient status indicators are exempt from the one-toast rule

`useApiHealth` renders an inline error state and emits exactly one `logger.error`. It
emits **no** toast. The exemption is scoped to components that are (a) mounted in a
layout and (b) driven by no user action.

### 2.5 The probe fires once on mount

No polling, no interval, no automatic retry — consistent with §12.4 and with every
entity hook. `reload()` is exposed for contract uniformity; `ApiStatusBadge` offers no
retry affordance.

## 3. Alternatives considered

| Alternative | Why rejected |
| --- | --- |
| **Add CORS to `erebus-api` in this US** | Correct long-term, but a second repository and a second PR inside an Infra US whose SPEC explicitly excludes `erebus-api` work. Deferred to `chore/erebus-api-cors`, which now **blocks the first deploy** (LLD §15 item 8). |
| **Accept the permanent error state locally** | Cheapest, but the reference slice would never be proven end to end in the increment that exists to prove it. |
| **A second env var for the dev base URL** | Widens the configuration surface and creates two code paths for one value; the union keeps a single variable with a single meaning ("where the API is"). |
| **Skip validation in dev** | Destroys the fail-fast property §12.2 exists for, in exactly the environment where a misconfiguration is most likely. |
| **Give the health slice a mapper for consistency** | Ceremony with zero information content, and it would teach that a mapper is a formality rather than the contract seam §4.3 describes. |
| **Honour the one-toast rule for the badge** | A toast per navigation whenever the API is down; the rule's intent is to tell a user that *the thing they asked for* failed. |
| **Poll the health endpoint** | A pattern no entity hook uses, contradicting §1 priority 6 (predictability for agents), and a standing background request for an indicator nobody is watching. |

## 4. Consequences

**Positive**

- The wiring chain is provable end to end on a developer machine today, with one
  repository and one PR.
- Configuration keeps one variable, one meaning and its boot-time failure.
- No catalogue entity was created inside an Infra increment.
- The error path of the slice is a *tested behaviour* (badge degrades, layout survives),
  which is also the §4.7 non-blocking-failure posture future detail pages need.

**Negative / risks accepted**

- **The proxy masks the missing CORS.** A deployed `erebus-app` will fail in a way local
  dev never reproduces. Mitigated by naming `chore/erebus-api-cors` a blocking
  prerequisite of the deploy US and recording it as LLD §15 item 8 — not by any code in
  `erebus-app`.
- The config schema is marginally more permissive: a typo'd path like `/v` now passes
  validation and fails later as a 404. Judged acceptable against losing the dev proxy.
- Two exemptions (no mapper, no toast) now exist in the codebase and could be copied.

**The containment rule, which is the point of this ADR:**

> **LLD §7 (the melee-weapon vertical slice) remains the only reference for adding an
> entity.** The health slice is a reference for *wiring* — for how a View consumes a
> hook, how a hook consumes a gateway, how a gateway validates and how an error becomes
> an `ApiError`. Its missing mapper and its toast exemption are consequences of it being
> a non-entity, operational payload. Copying either into a catalogue entity is a review
> rejection (LLD §12.5, §14 items 3–5).

## 5. Compliance

- LLD §2.5, §12.2, §12.3 amended and §12.5 added in the same increment (v1.1, §16 row).
- `lld-erebus-app.html` regenerated from the `.md`.
- `docs/user stories/us02-erebus-app-boilerplate/PLAN.md` D1, D2, D5, D6, D7 and
  `CONTRACT.md` §2.1, §3.1, §4.1 restate this decision at implementation level.
- Reviewers verify: no `health.mapper.ts` exists; `notify` is never called from
  `useApiHealth`; `gateway.check` is asserted to be called exactly once on mount; the
  PR description repeats the containment rule of §4.
