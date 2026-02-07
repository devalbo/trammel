import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@codex': path.resolve(__dirname, '../app-codex/src'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
});
