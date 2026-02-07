# trammel

![CI and Deploy](https://github.com/<OWNER>/<REPO>/actions/workflows/deploy.yml/badge.svg)

## Running/hosting this project
This repo is intended to run as a single, coordinated project. `app-ref` is the logical starting point, but all packages and dependencies should be installed and run together as a single deployable instance.

## Local setup
1. Install Node.js 18+.
2. From the repo root, install all workspace dependencies.

```bash
npm install
```

## Run locally
1. Start the dev server.

```bash
npm run dev
```

2. Open the dev URL shown in the terminal.
3. Use the `Codex` link in the header or navigate to `/app-codex` to see the hello world app.

## Configuration
- All app-ref runtime config is centralized in `app-ref/src/config.ts`.

## Tests
Run all workspace tests:

```bash
npm --workspaces --if-present test
```

Run a single workspace test:

```bash
npm --workspace app-ref test
```

## Build for GitHub Pages
Set the base path to your repo name.

```bash
BASE_PATH=/trammel/ npm run build
```

## GitHub Pages
After a push to `main`, the workflow publishes to the `gh-pages` branch. The site is served from:

```
https://devalbo.github.io/trammel/
```
