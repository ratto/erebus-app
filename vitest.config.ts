import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
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
      exclude: ['src/boot/**', 'src/css/**', 'src/assets/**'],
      // TODO: ativar thresholds após Sprint 1 (src/ ainda com stubs do template)
      // thresholds: {
      //   lines: 70,
      //   functions: 70,
      //   branches: 70,
      // },
    },
  },
})
