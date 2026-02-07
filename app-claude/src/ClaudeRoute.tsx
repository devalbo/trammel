import React from 'react';
import App from './App';

function ClaudeNotWorking({ message }: { message: string }) {
  return (
    <section style={{ padding: 16, border: '1px solid #fecaca', borderRadius: 12 }}>
      <h2 style={{ marginTop: 0 }}>Claude App Unavailable</h2>
      <p>The Claude bundle failed to load. Other routes should still work.</p>
      <pre style={{ whiteSpace: 'pre-wrap', color: '#7f1d1d' }}>{message}</pre>
    </section>
  );
}

export default function ClaudeRoute() {
  const isDev = import.meta.env.DEV;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const hostOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  React.useEffect(() => {
    if (isDev) return;
    let mounted = true;
    const element = containerRef.current;
    if (!element) return;

    const mountClaude = () => {
      const api = (window as Window & { TrammelClaude?: { mount: (o: { element: HTMLElement }) => void } })
        .TrammelClaude;
      if (!api) throw new Error('TrammelClaude bundle did not register.');
      api.mount({ element });
    };

    const unmountClaude = () => {
      const api = (window as Window & { TrammelClaude?: { unmount: (el: HTMLElement) => void } })
        .TrammelClaude;
      api?.unmount?.(element);
    };

    const onLoad = () => {
      try {
        if (!mounted) return;
        mountClaude();
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    };

    if ((window as Window & { TrammelClaude?: unknown }).TrammelClaude) {
      onLoad();
      return () => { mounted = false; unmountClaude(); };
    }

    const script = document.createElement('script');
    script.src = `${import.meta.env.BASE_URL}app-claude/trammel-claude.iife.js`;
    script.async = true;
    script.onload = onLoad;
    script.onerror = () => { setError('Failed to load trammel-claude bundle.'); setLoading(false); };
    document.body.appendChild(script);

    return () => { mounted = false; unmountClaude(); };
  }, []);

  if (error) return <ClaudeNotWorking message={error} />;

  return (
    <div style={{ border: '1px solid #e4e7eb', borderRadius: 12, padding: 16 }}>
      {isDev ? (
        <>
          <div
            style={{
              display: 'inline-block',
              background: '#fef3c7',
              color: '#92400e',
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 999,
              marginBottom: 12,
            }}
          >
            Dev loader: host {hostOrigin} · source via app-ref
          </div>
          <App />
        </>
      ) : (
        <>
          {loading ? <div>Loading Claude…</div> : null}
          <div ref={containerRef} />
        </>
      )}
    </div>
  );
}
