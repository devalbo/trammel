# trammel

![CI and Deploy](https://github.com/<OWNER>/<REPO>/actions/workflows/deploy.yml/badge.svg)

## Running/hosting this project
This repo is intended to run as a single, coordinated project. `app-ref` is the logical starting point, but all packages and dependencies should be installed and run together as a single deployable instance.

## Local setup
1. Install Node.js 20.19+ (required by Vite 7).
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
3. Use the `Codex` link in the header or navigate to `/app-codex` to see the Codex app.

If you only want to run the host app:

```bash
npm run dev:ref
```


## Configuration
- `VITE_GITHUB_REPO_URL` (optional): sets the GitHub link in the app-ref header.
- `VITE_CODEX_APP_URL` (optional): sets the URL loaded by the app-ref iframe.
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

## Coverage
Generate a single merged HTML coverage report (per folder and per file):

```bash
npm run test:coverage:all
```

The report is written to `coverage/index.html`. Coverage excludes `app-ref/public/app-storybook/**`.

## Build for GitHub Pages
Local builds use the copy step. CI builds write the bundle directly into `app-ref/public/app-codex`.

```bash
npm run build
```

CI build (GitHub Actions uses this):

```bash
REPO_NAME=trammel npm run build:ci
```

## GitHub Pages
After a push to `main`, the workflow publishes to the `gh-pages` branch. The site is served from:

```
https://devalbo.github.io/trammel/
```
