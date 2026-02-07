import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const base = process.env.BASE_PATH ?? '/';
const isBundle = process.env.BUNDLE === '1';
const isCi = process.env.CI === 'true';

export default defineConfig({
  base,
  plugins: [react()],
  build: isBundle
    ? {
        outDir: isCi
          ? path.resolve(__dirname, '../app-ref/public/app-claude')
          : 'dist-bundle',
        emptyOutDir: true,
        lib: {
          entry: path.resolve(__dirname, 'src/bundle.tsx'),
          name: 'TrammelClaude',
          formats: ['iife'],
          fileName: () => 'trammel-claude',
        },
      }
    : undefined,
  server: {
    port: 5175,
    cors: true,
  },
});
