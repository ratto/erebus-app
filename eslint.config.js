import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // `import/order` is DISABLED, not removed. eslint-plugin-import@2.32 crashes
      // under ESLint 10 (`sourceCode.getTokenOrCommentBefore is not a function`),
      // which is exactly risk R4 of the US-02 PLAN: ship the layer boundaries
      // without import ordering and escalate, rather than swapping the plugin
      // (a dependency-set change requiring an ADR). Every boundary below uses a
      // CORE ESLint rule, so ordering is the only thing degraded (LLD §2.6).
      // 'import/order': ['error', { ... }],
      'no-console': ['error', { allow: ['error', 'warn'] }],
    },
  },

  // ── MODEL: must not know React, must not import upward (LLD §4.1) ────────────
  {
    files: ['src/models/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'react-router-dom', 'styled-components'],
              message: 'The Model layer MUST NOT know React exists (LLD §4.1).',
            },
            {
              group: ['@/hooks/*', '@/pages/*', '@/components/*', '@/layouts/*'],
              message: 'The Model layer MUST NOT import upward (LLD §4.1).',
            },
          ],
        },
      ],
    },
  },

  // ── VIEW: must not perform I/O, must not reach the toast library ─────────────
  {
    files: ['src/pages/**/*.tsx', 'src/components/**/*.tsx', 'src/layouts/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['axios', '@/services/http', '@/models/*.gateway'],
              message: 'The View MUST NOT perform I/O — consume a hook (LLD §4.1, §8.1).',
            },
            {
              group: ['react-hot-toast'],
              message: 'Use @/services/notification, never the toast library directly (LLD §12.3).',
            },
          ],
        },
      ],
    },
  },

  // ── VIEWMODEL: the hook never knows who renders it (LLD §4.1, §8.8) ──────────
  {
    files: ['src/hooks/**/*.ts', 'src/hooks/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/pages/*', '@/components/*', '@/layouts/*'],
              message: 'The ViewModel MUST NOT import the View (LLD §4.1).',
            },
          ],
        },
      ],
    },
  },

  // ── Configuration is read in exactly one file (LLD §12.2) ────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/services/config.ts', 'src/vite-env.d.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.type='MetaProperty'][property.name='env']",
          message: 'import.meta.env is read only in src/services/config.ts (LLD §12.2).',
        },
      ],
    },
  },
]);
