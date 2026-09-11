# ADR-004 — React Compiler lint rules vs. the async primitive: a file-scoped exemption, not a layer-wide one

- **Status:** Accepted
- **Date:** 2026-09-10
- **Deciders:** `tech-lead` (escalated by `javascript-developer` during the US-02 increment, dev report §6.5)
- **Scope:** `erebus-app` only
- **Context US:** US-02 — Estruturar boilerplate do erebus-app
- **Amends:** `erebus-app/docs/lld-erebus-app.md` §7.5 (LLD v1.1 → v1.2)
- **Related:** ADR-003 (the health slice this primitive first served)

---

## 1. Context

The scaffold pins `eslint-plugin-react-hooks@7`, whose flat `recommended` set now
includes the React Compiler rules. Two of them reject the LLD §7.5 `useAsyncResource`
snippet — the normative async primitive — as written:

- **`react-hooks/refs`** — *Cannot update ref during render*, on `fetcherRef.current = fetcher`
  (the "latest ref" pattern).
- **`react-hooks/set-state-in-effect`** — *Avoid calling setState() directly within an
  effect*, on `setStatus('loading')`.

A third, `react-hooks/exhaustive-deps`, was already suppressed in the snippet: `deps` is
a caller-supplied array spread into the dependency list, which the rule cannot see
through.

The developer kept the snippet's behaviour verbatim and added two narrowly-scoped,
commented `eslint-disable-next-line` directives rather than improvising a different
primitive (LLD §0 forbids inventing a pattern). That was the correct call at
implementation time, but it leaves a decision open with unusual leverage: **every future
entity hook is built on this primitive**, so whatever is decided here propagates to all
six entity USs.

## 2. Decision

**The two directives stand, and the exemption is scoped to exactly one file:
`src/hooks/use-async-resource.ts`.**

1. `react-hooks/refs` and `react-hooks/set-state-in-effect` remain **enabled** for
   `src/hooks/**` and everywhere else. They are not scoped out of the flat recommended
   set, and no override block is added for the `hooks/` directory.
2. `src/hooks/use-async-resource.ts` is the **only** file in the application permitted to
   disable either rule, via `eslint-disable-next-line` with a rationale comment — never a
   file-level `/* eslint-disable */`.
3. **No other hook may carry either directive.** An entity hook built on the primitive
   writes no ref during render and calls no `setState` inside an effect: it composes
   `useAsyncResource`, `useFilterState`, `useMemo` and `useCallback`.
4. A directive appearing in any other hook is treated as the signal that the file is
   re-implementing the primitive. The reviewer **stops and escalates to `tech-lead`**
   rather than approving a second async pattern.
5. LLD §7.5 is amended so the normative snippet shows the directives, keeping the
   document identical to the shipped code.

## 3. Alternatives considered

| Alternative | Why rejected |
| --- | --- |
| **Scope both rules out for `src/hooks/**`** (the other option put to the tech lead) | This is the expedient answer and the wrong one. `src/hooks/**` is where *all* React state and effect logic in the application lives — disabling two correctness rules across that whole directory removes the signal from precisely the files most likely to need it, to accommodate one file. The cost is paid six more times, invisibly, in the entity USs. |
| **Rewrite §7.5 into a shape v7 accepts** — assign the ref inside a preceding effect, and derive `status` instead of setting it | The most attractive option on paper, and still the eventual goal (§15 item 11). Rejected **now** because it is a behavioural rewrite of a primitive that six future hooks will depend on, proposed at the end of an increment, with only a passing lint run as evidence. Deriving `status` without losing the `active`/`aborted` guard, and reordering ref assignment against the fetch effect, are both subtle enough to warrant their own increment with its own tests — not a same-day edit to make a linter quiet. |
| **Drop the `deps`/latest-ref indirection entirely** and depend on `fetcher` directly | Plausible: every current caller already wraps `fetcher` in `useCallback` and passes `[fetcher]`, so the ref is arguably redundant. But it changes the primitive's public contract (the `deps` parameter loses its meaning) and silently re-fires the request for any caller that passes an inline fetcher. Same objection as above: a real design change, not a lint fix. |
| **Disable the React Compiler rule family globally** | Throws away the whole benefit of `react-hooks@7` for the entire codebase to serve one file. |
| **Pin `eslint-plugin-react-hooks` back to v6** | A version rollback to avoid a warning, in a project whose LLD forbids widening or weakening the toolchain to make a gate pass. |

## 4. Consequences

**Positive**

- The rules keep working where they have the most value: the entity hooks, written six
  more times, largely by agents.
- The exemption is greppable — two lines in one file — rather than an invisible config
  override that future readers would have to discover.
- The primitive's tested behaviour is untouched at the end of an increment.
- The rule in §2 point 4 turns a lint directive into an **architectural tripwire**: the
  cheapest possible detector for "someone is writing a second async pattern".

**Negative / accepted**

- Two suppressed rules remain in the codebase, and suppressions invite copying. Mitigated
  by §2 point 4 and by the §7.5 note being explicit that the exemption is file-scoped.
- The underlying tension is deferred, not resolved — recorded as LLD §15 item 11 with a
  concrete trigger (a React Compiler upgrade that makes the rules non-suppressible, or a
  *validated* alternative formulation).

## 5. Compliance

- LLD §7.5 amended with the directive table and the file-scoping rule; §15 item 11 opened;
  §16 v1.2 row; `lld-erebus-app.html` regenerated.
- **Review test, applicable from the first entity US onward:**
  `grep -rn "react-hooks/refs\|react-hooks/set-state-in-effect" src/` MUST return matches
  in `src/hooks/use-async-resource.ts` and **nowhere else**.
