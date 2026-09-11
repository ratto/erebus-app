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
          // The `src/models/*.mapper.ts` and `src/models/*.filter.ts` rows of
          // LLD §10.6 are deliberately absent: a V8 threshold glob matching zero
          // files fails the run. The first entity US (EP02) re-enables them in
          // the same increment that creates the first mapper/filter.
          'src/models/api-error.ts': { statements: 100, branches: 95 },
          'src/models/*.gateway.ts': { statements: 100, branches: 95 },
          'src/hooks/**': { statements: 95, branches: 90 },
          'src/components/**': { statements: 85, branches: 80 },
        },
      },
    },
  }),
);
