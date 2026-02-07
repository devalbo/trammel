import React from 'react';
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

function CodexNotWorking({ message }: { message: string }) {
  return (
    <section style={{ padding: 16, border: '1px solid #fecaca', borderRadius: 12 }}>
      <h2 style={{ marginTop: 0 }}>Codex App Unavailable</h2>
      <p>The Codex bundle failed to load. Other routes should still work.</p>
      <pre style={{ whiteSpace: 'pre-wrap', color: '#7f1d1d' }}>{message}</pre>
    </section>
  );
}

function CodexRoute() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const isDev = import.meta.env.DEV;
  const hostOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  React.useEffect(() => {
    let mounted = true;
    const element = containerRef.current;

    if (!element) return;

    const mountCodex = () => {
      const api = (window as Window & { TrammelCodex?: { mount: (o: { element: HTMLElement }) => void } })
        .TrammelCodex;
      if (!api) {
        throw new Error('TrammelCodex bundle did not register.');
      }
      api.mount({ element });
    };

    const unmountCodex = () => {
      const api = (window as Window & { TrammelCodex?: { unmount: (el: HTMLElement) => void } })
        .TrammelCodex;
      api?.unmount?.(element);
    };

    const onLoad = () => {
      try {
        if (!mounted) return;
        mountCodex();
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    };

    if ((window as Window & { TrammelCodex?: unknown }).TrammelCodex) {
      onLoad();
      return () => {
        mounted = false;
        unmountCodex();
      };
    }

    const script = document.createElement('script');
    if (isDev) {
      script.type = 'module';
      script.src = 'http://localhost:5174/src/bundle.tsx';
    } else {
      script.src = `${import.meta.env.BASE_URL}app-codex/trammel-codex.iife.js`;
    }
    script.async = true;
    script.onload = onLoad;
    script.onerror = () => {
      setError('Failed to load trammel-codex bundle.');
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      mounted = false;
      unmountCodex();
    };
  }, []);

  if (error) return <CodexNotWorking message={error} />;

  return (
    <div style={{ border: '1px solid #e4e7eb', borderRadius: 12, padding: 16 }}>
      {isDev ? (
        <div
          style={{
            display: 'inline-block',
            background: '#e0f2fe',
            color: '#075985',
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 999,
            marginBottom: 12,
          }}
        >
          Dev loader: host {hostOrigin} · bundle http://localhost:5174
        </div>
      ) : null}
      {loading ? <div>Loading Codex…</div> : null}
      <div ref={containerRef} />
    </div>
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
  component: CodexRoute,
});

const routeTree = rootRoute.addChildren([indexRoute, codexRoute]);

export const router = createRouter({
  routeTree,
  basepath: (import.meta.env.BASE_URL ?? '/').replace(/\/$/, ''),
});

export function AppRouter() {
  return <RouterProvider router={router} />;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
