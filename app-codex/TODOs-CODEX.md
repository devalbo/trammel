# Codex version project backlog

## Notes For app-ref Planning
- app-ref is a minimal bootstrap app for static hosting + routing that exposes per-agent routes.
- Any edits to app-ref require explicit permission and a rationale (per CODING_AGENT_INSTRUCTIONS).
- app-ref should provide core infra only: Vite, React, TanStack router, TinyBase persistence.
- The Codex/Claude apps should own their own routing; app-ref only wires top-level routes.
- trammel app architecture expects three packages: constraints, core, app; app-ref should be the host shell.
- The app needs two SVG modes (Visual + Source), CodeMirror editor, error panel, TinyBase store, and eval pipeline (per DESIGN).

## Plan For app-ref Build (No Changes Made Yet)
1. Confirm required app-ref scope and routing model.
2. Scaffold app-ref as a minimal host shell with Vite + React + TanStack router.
3. Add top-level routes to mount agent apps (e.g., `/codex/*`, `/claude/*`) without coupling their internal routes.
4. Provide shared static hosting utilities (base path config for GH Pages, asset handling).
5. Add minimal TinyBase setup only if app-ref needs shared persistence; otherwise keep it out and let agent apps own it.
6. Define build + deploy workflow for app-ref that does not interfere with agent app build outputs.
7. Document integration points for agent apps: expected route prefixes, build artifacts, and environment flags.
8. Validate that app-ref stays minimal: no editor, no eval pipeline, no constraint code; those live in agent apps.
9. Add smoke test checklist: routes resolve, static assets load, base path works on GH Pages.

## Recent work
- Added `app-codex/src/CodexApp.tsx` with hello world UI for the `/codex` route.

## Replan trigger
- Once the app-ref technical shim is in place, pause and replan the CODEX-optimal path forward.

## Replan (Post app-ref Shim)
Goal: deliver a working Codex trammel app quickly, then expand to full spec.
1. Scaffold `app-codex` as the primary Vite + React app (single-package first).
2. Implement a minimal editor + SVG viewport loop (hardcoded TSX -> React render).
3. Add Sucrase transform + `new Function` eval with a tiny scope (React + basic vars).
4. Wire TinyBase for `files` storage and persistence (one project, one file).
5. Add error collection + Error Panel for syntax/eval errors (constraint errors later).
6. Add SVG Source tab via `XMLSerializer`.
7. Add constraints library as an internal module, then split into packages if/when needed.
8. Add replicad integration only after the basic eval pipeline is stable.
9. Implement variable extraction + simple control panel.
10. Validate export/import of `.svg` and `.tsx`.
