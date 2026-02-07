import React, { Suspense } from 'react';
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { appConfig } from './config';

function RootLayout() {
  const baseUrl = import.meta.env.BASE_URL ?? '/';
  return (
    <div style={{ fontFamily: '"Times New Roman", serif', padding: 24 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>trammel app-ref</h1>
        <nav style={{ marginTop: 12, display: 'flex', gap: 12 }}>
          <a href={baseUrl} style={{ textDecoration: 'none' }}>
            Home
          </a>
          <a href={`${baseUrl}app-codex/`} style={{ textDecoration: 'none' }}>
            Codex
          </a>
          <a href={`${baseUrl}app-claude/`} style={{ textDecoration: 'none' }}>
            Claude
          </a>
          <a
            href={appConfig.githubRepoUrl}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            GitHub
          </a>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

function Home() {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Routing shell</h2>
      <p>
        This is the minimal app-ref host. Use the app-codex route to load the hello world app.
      </p>
    </section>
  );
}

function NotFound() {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Page not found</h2>
      <p>The requested route does not exist.</p>
    </section>
  );
}
const LazyCodexRoute = React.lazy(() => import('@app-codex/CodexApp'));

function CodexRouteWrapper() {
  return (
    <Suspense fallback={<div>Loading Codex…</div>}>
      <LazyCodexRoute />
    </Suspense>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const codexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'app-codex',
  component: CodexRouteWrapper,
});

const LazyClaudeRoute = React.lazy(() => import('@app-claude/ClaudeRoute'));

function ClaudeRouteWrapper() {
  return (
    <Suspense fallback={<div>Loading Claude…</div>}>
      <LazyClaudeRoute />
    </Suspense>
  );
}

const claudeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'app-claude',
  component: ClaudeRouteWrapper,
});

const routeTree = rootRoute.addChildren([indexRoute, codexRoute, claudeRoute]);

export const router = createRouter({
  routeTree,
  basepath: (import.meta.env.BASE_URL ?? '/').replace(/\/$/, ''),
  defaultNotFoundComponent: NotFound,
  notFoundMode: 'root',
});

export function AppRouter() {
  React.useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#/')) return;
    const target = hash.slice(1);
    window.history.replaceState({}, '', (import.meta.env.BASE_URL ?? '/') + target.replace(/^\//, ''));
    router.navigate({ to: target, replace: true });
  }, []);

  return <RouterProvider router={router} />;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
