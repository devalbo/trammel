import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@app-codex': path.resolve(__dirname, '../app-codex/src'),
      '@app-claude': path.resolve(__dirname, '../app-claude/src'),
      '@app-storybook': path.resolve(__dirname, '../app-storybook/src'),
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  server: {
    port: 5173,
    fs: {
      allow: ['..'],
    },
  },
});
