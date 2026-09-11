import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:4173';

/**
 * The skills suite (`tests/e2e/skills.e2e.spec.ts`) needs a real backend to
 * exercise the assembled application, but `erebus-api` registers no CORS
 * middleware yet (`chore/erebus-api-cors`, `erebus-app` LLD §15 item 8) — a
 * `vite preview` build would call it cross-origin and fail in a real browser.
 * `tests/e2e/helpers/skills-api-stub.mjs` is the "stub server" LLD §10.5
 * explicitly allows as an alternative to a running `erebus-api`: a second,
 * independent preview build points `VITE_API_BASE_URL` at it instead.
 *
 * The skills suite gets its own Playwright *project* (below), scoped to it by
 * `testMatch`, so its own `baseURL` is set here — in this Node-only config
 * file — rather than the spec importing this module itself: every spec under
 * `tests/e2e/**` also falls inside `tsconfig.app.json`'s file set (its
 * `"types"` is `["vite/client"]`, not `["node"]`), so a spec importing this
 * config would pull `process.env` into a program with no Node ambient types.
 */
const skillsE2eBaseURL = process.env.SKILLS_E2E_BASE_URL ?? 'http://localhost:4174';
const skillsApiStubURL = 'http://localhost:4001';

/**
 * End-to-end configuration. Specs are owned by `javascript-qa-engineer`
 * (LLD §10.1, §10.5) and run against a built preview, never against a dev
 * server and never against live production data.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: '**/skills.e2e.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-skills',
      testMatch: '**/skills.e2e.spec.ts',
      use: { ...devices['Desktop Chrome'], baseURL: skillsE2eBaseURL },
    },
  ],
  webServer: [
    {
      // `VITE_*` is inlined at build time (LLD §12.2), so `npm run preview`
      // alone serves whatever `dist/` last had — or nothing runnable at all if
      // no build ever set `VITE_API_BASE_URL` (dev report §6.9). Building here
      // makes `npm run test:e2e` self-sufficient. The URL points at a closed
      // loopback port on purpose: `erebus-api` is not running in this
      // environment (no CORS yet, ADR-003), and the smoke spec asserts the
      // graceful-degradation path, never a live API.
      command: 'npm run build && npm run preview',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { VITE_API_BASE_URL: 'http://127.0.0.1:9/v1' },
    },
    {
      // The plain-Node fixture server `tests/e2e/skills.e2e.spec.ts` drives.
      command: `node tests/e2e/helpers/skills-api-stub.mjs`,
      url: `${skillsApiStubURL}/v1/skills`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      // A second, independent preview build (own `outDir`, own port) so it
      // never races the smoke server's `npm run build` over a shared `dist/`.
      // Uses the Vite build directly (not the `npm run build` = `tsc -b &&
      // vite build` chain the smoke server uses): `tsc -b`'s type-check is a
      // separate CI gate from "does the bundle run", and is unrelated to
      // whether this preview serves a working app for Playwright to drive.
      command: `vite build --outDir dist-e2e-skills && vite preview --outDir dist-e2e-skills --port 4174 --strictPort`,
      url: skillsE2eBaseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { VITE_API_BASE_URL: `${skillsApiStubURL}/v1` },
    },
  ],
});
