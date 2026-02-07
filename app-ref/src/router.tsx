import React from 'react';
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { CodexApp } from '@codex/CodexApp';

function RootLayout() {
  return (
    <div style={{ fontFamily: '"Times New Roman", serif', padding: 24 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>trammel app-ref</h1>
        <nav style={{ marginTop: 12, display: 'flex', gap: 12 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            Home
          </Link>
          <Link to="/app-codex" style={{ textDecoration: 'none' }}>
            Codex
          </Link>
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
  component: CodexApp,
});

const routeTree = rootRoute.addChildren([indexRoute, codexRoute]);

export const router = createRouter({
  routeTree,
});

export function AppRouter() {
  return <RouterProvider router={router} />;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
