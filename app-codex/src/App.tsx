import React, { useEffect, useMemo, useState } from 'react';
import { transform } from 'sucrase';
import { createTrammelPersister, createTrammelStore } from './store';
import * as constraints from './constraints';
import { initReplicad } from './replicad/init';

const styles = {
  app: {
    fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
    color: '#1f2933',
    background: '#f5f7fa',
    minHeight: '100vh',
  },
  header: {
    padding: '16px 24px 8px',
    display: 'flex',
    alignItems: 'baseline',
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 22,
  },
  subtitle: {
    margin: 0,
    fontSize: 13,
    color: '#52606d',
  },
  main: {
    display: 'grid',
    gridTemplateColumns: 'minmax(280px, 420px) minmax(360px, 1fr)',
    gap: 16,
    padding: '12px 24px 24px',
  },
  panel: {
    background: '#fff',
    borderRadius: 10,
    border: '1px solid #e4e7eb',
    padding: 16,
    minHeight: 520,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  panelTitle: {
    margin: 0,
    fontSize: 13,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    color: '#52606d',
  },
  errorBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    color: '#b91c1c',
    cursor: 'pointer',
  },
  errorDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#ef4444',
    boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)',
  },
  editor: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    border: '1px solid #cbd2d9',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
    fontSize: 12.5,
    lineHeight: 1.6,
    background: '#f8f9fa',
    color: '#102a43',
    boxSizing: 'border-box' as const,
  },
  actions: {
    display: 'flex',
    gap: 8,
    marginTop: 10,
  },
  button: {
    border: '1px solid #1f2933',
    background: '#1f2933',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
  },
  viewport: {
    flex: 1,
    border: '1px dashed #cbd2d9',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fdfdfc',
    padding: 8,
  },
  footer: {
    marginTop: 8,
    fontSize: 12,
    color: '#7b8794',
  },
  diagnostics: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    border: '1px solid #e4e7eb',
    background: '#f8fafc',
    fontSize: 12,
    color: '#334e68',
  },
  diagTitle: {
    margin: '0 0 8px',
    fontSize: 12,
    color: '#52606d',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  diagRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    padding: '2px 0',
  },
  diagTabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 8,
  },
  diagTab: {
    border: '1px solid #cbd2d9',
    background: '#fff',
    color: '#1f2933',
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 11,
    cursor: 'pointer',
  },
  diagTabActive: {
    border: '1px solid #1f2933',
    background: '#1f2933',
    color: '#fff',
  },
  diagErrorBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    border: '1px solid #fecaca',
    background: '#fff5f5',
    color: '#7f1d1d',
    whiteSpace: 'pre-wrap' as const,
  },
  tabs: {
    display: 'flex',
    gap: 8,
  },
  tabButton: {
    border: '1px solid #cbd2d9',
    background: '#f8f9fa',
    color: '#1f2933',
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    cursor: 'pointer',
  },
  tabButtonActive: {
    border: '1px solid #1f2933',
    background: '#1f2933',
    color: '#fff',
  },
  source: {
    width: '100%',
    height: '100%',
    padding: 12,
    borderRadius: 8,
    background: '#0b1215',
    color: '#e5e7eb',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
    fontSize: 12,
    overflow: 'auto' as const,
    whiteSpace: 'pre',
  },
  error: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    border: '1px solid #fecaca',
    background: '#fff5f5',
    color: '#7f1d1d',
    fontSize: 12,
    whiteSpace: 'pre-wrap' as const,
  },
};

const defaultCode = `// trammel codex demo\nconst vars = {\n  width: 320,\n  height: 160,\n  cornerRadius: 18,\n  panel: '#f2f4f7',\n  accent: '#2563eb',\n  inset: 14,\n};\n\nconst panel: Rect = { x: 0, y: 0, width: vars.width, height: vars.height };\nconst inner = insetRect(panel, vars.inset);\nconst badge = rectCorner(inner, 'topRight');\n\nconst Panel = () => (\n  <g>\n    <rect\n      x={panel.x}\n      y={panel.y}\n      width={panel.width}\n      height={panel.height}\n      rx={vars.cornerRadius}\n      fill={vars.panel}\n      stroke="#0f172a"\n      strokeWidth={2}\n    />\n    <circle cx={panel.width * 0.18} cy={panel.height * 0.5} r={22} fill={vars.accent} />\n    <rect\n      x={inner.x + 12}\n      y={inner.y + 28}\n      width={inner.width * 0.6}\n      height={inner.height * 0.4}\n      rx={12}\n      fill="#e2e8f0"\n      stroke="#0f172a"\n      strokeWidth={1.5}\n    />\n    <circle cx={badge.x - 16} cy={badge.y + 16} r={8} fill={vars.accent} />\n  </g>\n);\n\nconst Root = () => (\n  <svg viewBox={\`-10 -10 \${vars.width + 20} \${vars.height + 20}\`}>\n    <Panel />\n  </svg>\n);\n`;

type EvalResult = {
  element: React.ReactElement | null;
  error: string | null;
  vars: Record<string, unknown>;
  evalMs: number;
};

function prettyPrintXml(source: string) {
  try {
    const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
    const root = parsed.documentElement;
    const lines: string[] = [];

    const serializeNode = (node: Element, indent: number) => {
      const pad = '  '.repeat(indent);
      const attrs = Array.from(node.attributes)
        .map((attr) => ` ${attr.name}="${attr.value}"`)
        .join('');
      const children = Array.from(node.children);
      if (children.length === 0) {
        lines.push(`${pad}<${node.tagName}${attrs} />`);
        return;
      }
      lines.push(`${pad}<${node.tagName}${attrs}>`);
      children.forEach((child) => serializeNode(child, indent + 1));
      lines.push(`${pad}</${node.tagName}>`);
    };

    serializeNode(root, 0);
    return lines.join('\n');
  } catch {
    return source;
  }
}

function evaluateTsx(source: string, overrides: Record<string, unknown>): EvalResult {
  try {
    const start = performance.now();
    const { code } = transform(source, {
      transforms: ['typescript', 'jsx'],
    });

    const wrapped = `
      const { useMemo, useState, useEffect, useRef } = React;
      const {
        rectCenter,
        rectCorner,
        insetRect,
        alignCenterX,
        alignCenterY,
        distributeEvenly,
      } = constraints;
      ${code}
      if (typeof vars === 'object' && vars !== null) {
        Object.assign(vars, overrides ?? {});
      }
      const rootValue = typeof Root !== 'undefined' ? Root : null;
      const element = React.isValidElement(rootValue)
        ? rootValue
        : typeof rootValue === 'function'
          ? React.createElement(rootValue)
          : null;
      const capturedVars = typeof vars === 'object' && vars !== null ? vars : {};
      return { element, vars: capturedVars };
    `;

    const factory = new Function(
      'React',
      'constraints',
      'overrides',
      wrapped
    ) as (
      react: typeof React,
      helpers: typeof constraints,
      overrides: Record<string, unknown>
    ) => { element: React.ReactElement | null; vars: Record<string, unknown> };
    const result = factory(React, constraints, overrides);
    const evalMs = performance.now() - start;
    return { element: result.element, vars: result.vars, error: null, evalMs };
  } catch (err) {
    const evalMs = 0;
    if (err instanceof Error) {
      const stack = err.stack ? `\n${err.stack}` : '';
      return { element: null, vars: {}, error: `${err.message}${stack}`, evalMs };
    }
    return { element: null, vars: {}, error: String(err), evalMs };
  }
}

export default function App() {
  const store = useMemo(() => createTrammelStore(), []);
  const persister = useMemo(() => createTrammelPersister(store), [store]);
  const [code, setCode] = useState(defaultCode);
  const [overrides, setOverrides] = useState<Record<string, unknown>>({});
  const [output, setOutput] = useState<EvalResult>(() => evaluateTsx(defaultCode, {}));
  const [activeTab, setActiveTab] = useState<'visual' | 'source'>('visual');
  const [svgSource, setSvgSource] = useState('');
  const [svgStats, setSvgStats] = useState({ nodes: 0, bytes: 0 });
  const [serializeMs, setSerializeMs] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [diagnosticsTab, setDiagnosticsTab] = useState<'info' | 'error'>('info');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [replicadStatus, setReplicadStatus] = useState<{
    state: 'idle' | 'loading' | 'ready' | 'error';
    ms: number;
    error?: string;
  }>({ state: 'idle', ms: 0 });
  const lastErrorRef = React.useRef<string | null>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const run = () => {
    setOutput(evaluateTsx(code, overrides));
    setLogs((prev) => [`Ran eval (${code.length} chars)`, ...prev].slice(0, 6));
  };
  const resetToDefault = () => {
    setCode(defaultCode);
    setOverrides({});
    setOutput(evaluateTsx(defaultCode, {}));
  };
  const triggerImport = () => fileInputRef.current?.click();
  const exportTsx = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trammel-codex.tsx';
    link.click();
    URL.revokeObjectURL(url);
  };
  const exportSvg = () => {
    const source = svgSource || '';
    if (!source) return;
    const blob = new Blob([source], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trammel-codex.svg';
    link.click();
    URL.revokeObjectURL(url);
  };
  const onImportFile: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCode(text);
    setOverrides({});
    setOutput(evaluateTsx(text, {}));
    setLogs((prev) => [`Imported ${file.name} (${file.size} bytes)`, ...prev].slice(0, 6));
    event.target.value = '';
  };
  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      run();
    }
  };

  const rendered = useMemo(() => output.element, [output.element]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      await persister.startAutoLoad();
      const stored = store.getCell('files', 'default', 'content');
      if (!cancelled && typeof stored === 'string' && stored.length > 0) {
        setCode(stored);
        setOutput(evaluateTsx(stored, overrides));
        setLogs((prev) => ['Loaded saved file', ...prev].slice(0, 6));
      } else if (!cancelled) {
        store.setRow('files', 'default', { name: 'main.tsx', content: defaultCode });
        setCode(defaultCode);
        setOutput(evaluateTsx(defaultCode, overrides));
        setLogs((prev) => ['Initialized default file', ...prev].slice(0, 6));
      }
      persister.startAutoSave();
    };

    load();

    return () => {
      cancelled = true;
      persister.stopAutoSave();
    };
  }, [persister, store]);

  useEffect(() => {
    store.setRow('files', 'default', { name: 'main.tsx', content: code });
  }, [code, store]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const svg = viewport.querySelector('svg');
    if (!svg) {
      setSvgSource('');
      setSvgStats({ nodes: 0, bytes: 0 });
      return;
    }
    const serializeStart = performance.now();
    const serializer = new XMLSerializer();
    const raw = serializer.serializeToString(svg);
    setSvgSource(prettyPrintXml(raw));
    setSerializeMs(performance.now() - serializeStart);
    setSvgStats({ nodes: svg.querySelectorAll('*').length + 1, bytes: raw.length });
    setLogs((prev) => [
      `Serialized SVG (${raw.length} bytes, ${svg.querySelectorAll('*').length + 1} nodes)`,
      ...prev,
    ].slice(0, 6));
  }, [rendered, output.error]);

  useEffect(() => {
    if (!output.error || output.error === lastErrorRef.current) return;
    lastErrorRef.current = output.error;
    setLogs((prev) => [`Eval error: ${output.error.split('\n')[0]}`, ...prev].slice(0, 6));
    setErrorDetails(output.error);
    setDiagnosticsTab('error');
  }, [output.error]);

  useEffect(() => {
    let mounted = true;
    setReplicadStatus((prev) => ({ ...prev, state: 'loading' }));
    setLogs((prev) => ['Replicad init: starting', ...prev].slice(0, 6));
    initReplicad().then((result) => {
      if (!mounted) return;
      if (result.ok) {
        setReplicadStatus({ state: 'ready', ms: result.ms });
        setLogs((prev) => [`Replicad init: ok (${result.ms.toFixed(1)} ms)`, ...prev].slice(0, 6));
      } else {
        setReplicadStatus({ state: 'error', ms: result.ms, error: result.error });
        setLogs((prev) => [`Replicad init: error (${result.error ?? 'unknown'})`, ...prev].slice(0, 6));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (output.error) return;
    if (lastErrorRef.current) {
      lastErrorRef.current = null;
      setErrorDetails(null);
      setDiagnosticsTab('info');
      setLogs((prev) => prev.filter((entry) => !entry.startsWith('Eval error: ')));
    }
  }, [output.error]);

  const varsEntries = Object.entries(output.vars ?? {});

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>trammel codex</h1>
        <p style={styles.subtitle}>Editor left, SVG viewport right.</p>
      </header>
      <main style={styles.main}>
        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Editor</h2>
            {errorDetails ? (
              <button
                type="button"
                onClick={() => setDiagnosticsTab('error')}
                style={styles.errorBadge}
                title="View error details"
              >
                <span style={styles.errorDot} />
                Error
              </button>
            ) : null}
          </div>
          <textarea
            style={styles.editor}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <div style={styles.actions}>
            <button style={styles.button} type="button" onClick={run}>
              Run (Ctrl+Enter)
            </button>
            <button
              style={{ ...styles.button, background: '#e4e7eb', color: '#1f2933' }}
              type="button"
              onClick={resetToDefault}
            >
              Reset Demo
            </button>
            <button
              style={{ ...styles.button, background: '#fff', color: '#1f2933' }}
              type="button"
              onClick={triggerImport}
            >
              Import .tsx
            </button>
            <button
              style={{ ...styles.button, background: '#fff', color: '#1f2933' }}
              type="button"
              onClick={exportTsx}
            >
              Export .tsx
            </button>
            <button
              style={{ ...styles.button, background: '#fff', color: '#1f2933' }}
              type="button"
              onClick={exportSvg}
              disabled={!svgSource}
            >
              Export .svg
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".tsx,.ts,.txt"
            style={{ display: 'none' }}
            onChange={onImportFile}
          />
          {varsEntries.length > 0 ? (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 12, color: '#52606d' }}>Variables</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {varsEntries.map(([key, value]) => {
                  const id = `var-${key}`;
                  const type = typeof value;
                  const isColor = type === 'string' && String(value).startsWith('#');
                  const inputType = isColor ? 'color' : type === 'number' ? 'number' : 'text';
                  return (
                    <label key={key} htmlFor={id} style={{ display: 'grid', gap: 4 }}>
                      <span style={{ fontSize: 12, color: '#52606d' }}>{key}</span>
                      <input
                        id={id}
                        type={inputType}
                        value={String(overrides[key] ?? value)}
                        onChange={(event) => {
                          const nextValue =
                            inputType === 'number' ? Number(event.target.value) : event.target.value;
                          const nextOverrides = { ...overrides, [key]: nextValue };
                          setOverrides(nextOverrides);
                          setOutput(evaluateTsx(code, nextOverrides));
                        }}
                        style={{
                          border: '1px solid #cbd2d9',
                          borderRadius: 6,
                          padding: '6px 8px',
                          fontSize: 12,
                        }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>
        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Viewport</h2>
            <div style={styles.tabs}>
              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === 'visual' ? styles.tabButtonActive : null),
                }}
              >
                Visual
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('source')}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === 'source' ? styles.tabButtonActive : null),
                }}
              >
                Source
              </button>
            </div>
          </div>
          <div style={styles.viewport} ref={viewportRef}>
            {activeTab === 'visual' ? (
              rendered
            ) : (
              <pre style={styles.source}>{svgSource || 'No SVG rendered yet.'}</pre>
            )}
          </div>
          <div style={styles.footer}>
            {activeTab === 'visual' ? 'Rendered from eval output.' : 'Serialized SVG source.'}
          </div>
          <div style={styles.diagnostics}>
            <h3 style={styles.diagTitle}>Diagnostics</h3>
            <div style={styles.diagTabs}>
              <button
                type="button"
                onClick={() => setDiagnosticsTab('info')}
                style={{
                  ...styles.diagTab,
                  ...(diagnosticsTab === 'info' ? styles.diagTabActive : null),
                }}
              >
                Info
              </button>
              <button
                type="button"
                onClick={() => setDiagnosticsTab('error')}
                style={{
                  ...styles.diagTab,
                  ...(diagnosticsTab === 'error' ? styles.diagTabActive : null),
                }}
              >
                Error
              </button>
            </div>
            {diagnosticsTab === 'info' ? (
              <>
                <div style={styles.diagRow}>
                  <span>Eval time</span>
                  <span>{output.evalMs.toFixed(1)} ms</span>
                </div>
                <div style={styles.diagRow}>
                  <span>Serialize time</span>
                  <span>{serializeMs.toFixed(1)} ms</span>
                </div>
                <div style={styles.diagRow}>
                  <span>SVG nodes</span>
                  <span>{svgStats.nodes}</span>
                </div>
                <div style={styles.diagRow}>
                  <span>SVG size</span>
                  <span>{(svgStats.bytes / 1024).toFixed(1)} KB</span>
                </div>
                <div style={styles.diagRow}>
                  <span>Replicad</span>
                  <span>
                    {replicadStatus.state === 'ready'
                      ? `Ready (${replicadStatus.ms.toFixed(1)} ms)`
                      : replicadStatus.state === 'loading'
                        ? 'Loading'
                        : replicadStatus.state === 'error'
                          ? 'Error'
                          : 'Idle'}
                  </span>
                </div>
                {replicadStatus.state === 'error' && replicadStatus.error ? (
                  <div style={styles.diagRow}>
                    <span>Replicad error</span>
                    <span>{replicadStatus.error}</span>
                  </div>
                ) : null}
                <div style={styles.diagRow}>
                  <span>Last error</span>
                  <span>{errorDetails ? errorDetails.split('\n')[0] : 'None'}</span>
                </div>
                {logs.length > 0 ? (
                  <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
                    {logs.map((entry, index) => (
                      <div key={`${entry}-${index}`} style={{ color: '#52606d' }}>
                        {entry}
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div style={styles.diagErrorBox}>
                {errorDetails ? errorDetails : 'No errors.'}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
