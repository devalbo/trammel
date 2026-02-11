import { defineConfig } from 'vitest/config';
import path from 'node:path';
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@app-codex': path.resolve(__dirname, '../app-codex/src'),
      '@app-claude': path.resolve(__dirname, '../app-claude/src'),
      '@app-storybook': path.resolve(__dirname, '../app-storybook/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
    coverage: {
      exclude: [
        'public/app-storybook/**',
      ],
    },
  },
});
