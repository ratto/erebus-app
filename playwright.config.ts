import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:4173';

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
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
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
});
