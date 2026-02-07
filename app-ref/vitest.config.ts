import { defineConfig } from 'vitest/config';
import path from 'node:path';
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@codex': path.resolve(__dirname, '../app-codex/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
  },
});
