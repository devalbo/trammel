# General purpose boostrap backlog

## Get github pages building infrastructure in place

## Changes performed (2026-02-07)
- Added minimal Vite + React + TanStack router scaffold under `app-ref`.
- Added route `/codex` that renders the Codex hello world component from `app-codex`.
- Added `BASE_PATH` support in `vite.config.ts` for GitHub Pages base path.
- Aligned Codex + Claude routes to the same lazy-import + `Suspense` pattern (no Codex script loader).
- Switched Pages deploy workflow to official Pages actions (configure/upload/deploy) with `environment: github-pages`.
