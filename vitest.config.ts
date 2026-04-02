import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
      components: fileURLToPath(new URL('./src/components', import.meta.url)),
      layouts: fileURLToPath(new URL('./src/layouts', import.meta.url)),
      pages: fileURLToPath(new URL('./src/pages', import.meta.url)),
      assets: fileURLToPath(new URL('./src/assets', import.meta.url)),
      boot: fileURLToPath(new URL('./src/boot', import.meta.url)),
      stores: fileURLToPath(new URL('./src/stores', import.meta.url)),
      router: fileURLToPath(new URL('./src/router', import.meta.url)),
    },
  },
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ sassVariables: 'src/css/quasar.variables.scss' }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/vitest/**/*.test.ts', 'tests/vitest/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/boot/**', 'src/css/**', 'src/i18n/**', 'src/assets/**'],
      // TODO: ativar thresholds após Sprint 1 (src/ ainda com stubs do template)
      // thresholds: {
      //   lines: 70,
      //   functions: 70,
      //   branches: 70,
      // },
    },
  },
});
