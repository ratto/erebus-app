import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

/**
 * Test configuration. Merges `vite.config.ts` so the `@` alias and the Sass
 * options are inherited rather than duplicated (LLD §2.5, §10.6).
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      // config.ts validates the environment at module load (LLD §12.2), so the
      // suite must provide it explicitly — vitest runs in the 'test' mode and
      // would not read .env.development.
      env: {
        VITE_API_BASE_URL: '/v1',
        VITE_REQUEST_TIMEOUT_MS: '8000',
      },
      globals: true,
      setupFiles: ['./tests/helpers/setup.ts'],
      include: ['src/**/*.spec.{ts,tsx}', 'tests/**/*.spec.{ts,tsx}'],
      exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/main.tsx',
          'src/routes.tsx',
          'src/styles/**',
          '**/*.d.ts',
          '**/*.spec.{ts,tsx}',
        ],
        thresholds: {
          // Global floor (LLD §10.6).
          statements: 85,
          branches: 80,
          // Re-enabled by US-03, the first entity US: `skill.mapper.ts` and
          // `skill.filter.ts` are the first files these globs match, so both rows
          // of LLD §10.6 are live again (closes LLD §15 item 9).
          'src/models/*.mapper.ts': { statements: 100, branches: 100 },
          'src/models/*.filter.ts': { statements: 100, branches: 100 },
          'src/models/api-error.ts': { statements: 100, branches: 95 },
          'src/models/*.gateway.ts': { statements: 100, branches: 95 },
          'src/hooks/**': { statements: 95, branches: 90 },
          'src/components/**': { statements: 85, branches: 80 },
        },
      },
    },
  }),
);
