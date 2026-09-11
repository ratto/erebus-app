import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // LLD §2.5 asks for `css.preprocessorOptions.scss.api = 'modern-compiler'`.
  // Vite 8 removed the legacy Sass API altogether, so the option no longer
  // exists in `SassPreprocessorOptions` and stating it is a type error. The
  // modern compiler is now the only path — plain `sass` is used (PLAN D9).
  server: {
    // Local dev reaches erebus-api through this proxy — see ADR-003.
    proxy: { '/v1': { target: 'http://localhost:3000', changeOrigin: true } },
  },
});
