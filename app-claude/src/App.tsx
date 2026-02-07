import React, { useEffect, useMemo, useState } from 'react';
import { transform } from 'sucrase';
import { createTrammelStore, createTrammelPersister } from './store/store';
import * as constraints from './constraints';
import { initReplicad } from './replicad/init';
import { draw } from 'replicad';
import { ErrorCollector } from './errors/collector';
import { ErrorContext } from './errors/context';
import type { TrammelError } from './errors/types';
import { ErrorBoundary } from './errors/boundary';

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
  title: { margin: 0, fontSize: 22 },
  subtitle: { margin: 0, fontSize: 13, color: '#52606d' },
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
  actions: { display: 'flex', gap: 8, marginTop: 10 },
  button: {
    border: '1px solid #1f2933',
    background: '#1f2933',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
  },
  buttonSecondary: {
    border: '1px solid #1f2933',
    background: '#e4e7eb',
    color: '#1f2933',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
  },
  buttonGhost: {
    border: '1px solid #cbd2d9',
    background: '#fff',
    color: '#1f2933',
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
  tabs: { display: 'flex', gap: 8 },
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
    whiteSpace: 'pre' as const,
  },
  errorPanel: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    border: '1px solid #fecaca',
    background: '#fff5f5',
    color: '#7f1d1d',
    fontSize: 12,
    whiteSpace: 'pre-wrap' as const,
  },
  errorBadge: {
    display: 'inline-block',
    padding: '1px 6px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    marginRight: 6,
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
};

const defaultCode = `// trammel claude demo
const vars = {
  panelWidth: 300,
  panelHeight: 100,
  cornerRadius: 15,
  mountHoleRadius: 5,
  mountHoleInset: 12,
  knobCount: 4,
  knobSize: 20,
  panelColor: '#e2e8f0',
  holeColor: '#333',
  knobColor: '#3b82f6',
};

const panel: Rect = { x: 0, y: 0, width: vars.panelWidth, height: vars.panelHeight };
const inner = insetRect(panel, vars.mountHoleInset);

const mountPositions = [
  rectCorner(inner, 'topLeft'),
  rectCorner(inner, 'topRight'),
  rectCorner(inner, 'bottomLeft'),
  rectCorner(inner, 'bottomRight'),
];

const cornerArc = arcInCorner(vars.cornerRadius, panel, 'topLeft');
const knobXPositions = distributeEvenly(vars.knobCount, vars.knobSize, vars.panelWidth);

const MountHole = ({ pos }: { pos: Point }) => (
  <circle cx={pos.x} cy={pos.y} r={vars.mountHoleRadius} fill={vars.holeColor} />
);

const Knob = ({ x }: { x: number }) => (
  <rect
    x={x}
    y={-vars.knobSize}
    width={vars.knobSize}
    height={vars.knobSize}
    rx={3}
    fill={vars.knobColor}
    stroke="#1e40af"
    strokeWidth={1.5}
  />
);

const Root = () => (
  <svg viewBox={\`-10 -\${vars.knobSize + 10} \${vars.panelWidth + 20} \${vars.panelHeight + vars.knobSize + 20}\`}>
    <rect
      x={panel.x} y={panel.y}
      width={panel.width} height={panel.height}
      rx={vars.cornerRadius}
      fill={vars.panelColor}
      stroke="#0f172a"
      strokeWidth={2}
    />
    <path d={arcToSVGPath(cornerArc)} fill="none" stroke="#0f172a" strokeWidth={1} />
    {mountPositions.map((pos, i) => <MountHole key={i} pos={pos} />)}
    {knobXPositions.map((x, i) => <Knob key={i} x={x} />)}
  </svg>
);
`;

type EvalResult = {
  element: React.ReactElement | null;
  error: string | null;
  vars: Record<string, unknown>;
  evalMs: number;
  collectedErrors: TrammelError[];
};

function prettyPrintXml(source: string): string {
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

function evaluateTsx(
  source: string,
  overrides: Record<string, unknown>,
  collector: ErrorCollector
): EvalResult {
  collector.clear();
  const start = performance.now();

  // Step 1: Sucrase transform
  let code: string;
  try {
    const result = transform(source, { transforms: ['typescript', 'jsx'] });
    code = result.code;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    collector.report({
      kind: 'syntax',
      message,
      line: 0,
      column: 0,
      source: source.slice(0, 200),
    });
    return {
      element: null,
      error: message,
      vars: {},
      evalMs: performance.now() - start,
      collectedErrors: collector.getErrors(),
    };
  }

  // Step 2: Execute
  try {
    const wrapped = `
      const { useMemo, useState, useEffect, useRef } = React;
      const {
        rectCenter, rectCorner, rectEdgeMidpoint, rectEdge,
        circleCenter, circleBoundingBox,
        lineLength, lineAngle, lineDirection,
        distanceBetween, distancePointToLine, distancePointToCircle,
        lineLineIntersection, lineCircleIntersection, circleCircleIntersection, lineRectIntersection,
        alignCenterX, alignCenterY, alignEdge, alignFlush,
        distributeEvenly, distributeAlongEdge, gridPositions, distributeOnCircle,
        offsetPoint, parallelLine, insetRect, offsetCircle,
        arcTangentToLines, arcInCorner, arcBetween, filletArc,
        coincident, centerAtPoint, centerAtCorner, centerAtEdgeMidpoint,
        concentric, collinear,
        parallel, parallelThrough, perpendicular, perpendicularThrough, perpendicularAt,
        horizontal, vertical, horizontalDistance, verticalDistance,
        midpoint, nearestPointOnLine, nearestPointOnCircle,
        pointOnLineAt, pointOnCircleAt, pointOnArcAt,
        angleBetween, rotateToAngle,
        mirrorPoint, mirrorLine, mirrorCircle, mirrorRect, mirrorPointAbout,
        arcToSVGPath, lineToSVGPath, rectToSVGPath, circleToSVGPath, pathFromPoints,
      } = constraints;
      const draw = replicad.draw;
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
      'replicad',
      'overrides',
      'errorCollector',
      wrapped
    ) as (
      react: typeof React,
      helpers: typeof constraints,
      replicad: { draw: typeof draw },
      overrides: Record<string, unknown>,
      errorCollector: ErrorCollector
    ) => { element: React.ReactElement | null; vars: Record<string, unknown> };

    const result = factory(React, constraints, { draw }, overrides, collector);
    const evalMs = performance.now() - start;
    return {
      element: result.element,
      vars: result.vars,
      error: null,
      evalMs,
      collectedErrors: collector.getErrors(),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error && err.stack ? err.stack : '';
    collector.report({ kind: 'eval', message, stack });
    return {
      element: null,
      vars: {},
      error: `${message}\n${stack}`,
      evalMs: performance.now() - start,
      collectedErrors: collector.getErrors(),
    };
  }
}

const errorKindColors: Record<string, string> = {
  syntax: '#dc2626',
  eval: '#ea580c',
  constraint: '#d97706',
  geometry: '#7c3aed',
  variable: '#0891b2',
  render: '#be185d',
};

export default function App() {
  const store = useMemo(() => createTrammelStore(), []);
  const persister = useMemo(() => createTrammelPersister(store), [store]);
  const collector = useMemo(() => new ErrorCollector(), []);

  const [code, setCode] = useState(defaultCode);
  const [overrides, setOverrides] = useState<Record<string, unknown>>({});
  const [output, setOutput] = useState<EvalResult>(() =>
    evaluateTsx(defaultCode, {}, collector)
  );
  const [activeTab, setActiveTab] = useState<'visual' | 'source'>('visual');
  const [svgSource, setSvgSource] = useState('');
  const [svgStats, setSvgStats] = useState({ nodes: 0, bytes: 0 });
  const [serializeMs, setSerializeMs] = useState(0);
  const [replicadStatus, setReplicadStatus] = useState<{
    state: 'idle' | 'loading' | 'ready' | 'error';
    ms: number;
    error?: string;
  }>({ state: 'idle', ms: 0 });

  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const run = () => setOutput(evaluateTsx(code, overrides, collector));
  const resetToDefault = () => {
    setCode(defaultCode);
    setOverrides({});
    setOutput(evaluateTsx(defaultCode, {}, collector));
  };

  const exportTsx = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trammel-claude.tsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSvg = () => {
    if (!svgSource) return;
    const blob = new Blob([svgSource], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trammel-claude.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCode(text);
    setOverrides({});
    setOutput(evaluateTsx(text, {}, collector));
    e.target.value = '';
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      run();
    }
  };

  const rendered = useMemo(() => output.element, [output.element]);

  // Load persisted code
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await persister.startAutoLoad();
      const stored = store.getCell('files', 'default', 'content');
      if (!cancelled && typeof stored === 'string' && stored.length > 0) {
        setCode(stored);
        setOutput(evaluateTsx(stored, overrides, collector));
      } else if (!cancelled) {
        store.setRow('files', 'default', { name: 'main.tsx', content: defaultCode });
      }
      persister.startAutoSave();
    };
    load();
    return () => {
      cancelled = true;
      persister.stopAutoSave();
    };
  }, [persister, store]);

  // Persist code changes
  useEffect(() => {
    store.setRow('files', 'default', { name: 'main.tsx', content: code });
  }, [code, store]);

  // Serialize SVG
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const svg = viewport.querySelector('svg');
    if (!svg) {
      setSvgSource('');
      setSvgStats({ nodes: 0, bytes: 0 });
      return;
    }
    const t0 = performance.now();
    const raw = new XMLSerializer().serializeToString(svg);
    setSvgSource(prettyPrintXml(raw));
    setSerializeMs(performance.now() - t0);
    setSvgStats({ nodes: svg.querySelectorAll('*').length + 1, bytes: raw.length });
  }, [rendered, output.error]);

  // Init replicad
  useEffect(() => {
    let mounted = true;
    setReplicadStatus({ state: 'loading', ms: 0 });
    initReplicad().then((result) => {
      if (!mounted) return;
      if (result.ok) {
        setReplicadStatus({ state: 'ready', ms: result.ms });
      } else {
        setReplicadStatus({ state: 'error', ms: result.ms, error: result.error });
      }
    });
    return () => { mounted = false; };
  }, []);

  const varsEntries = Object.entries(output.vars ?? {});
  const errors = output.collectedErrors;

  return (
    <ErrorContext.Provider value={collector}>
      <div style={styles.app}>
        <header style={styles.header}>
          <h1 style={styles.title}>trammel claude</h1>
          <p style={styles.subtitle}>Parametric art tool — editor + SVG viewport</p>
        </header>
        <main style={styles.main}>
          {/* Left: Editor + Variables */}
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Editor</h2>
              {errors.length > 0 && (
                <span style={{ fontSize: 11, color: '#b91c1c' }}>
                  {errors.length} error{errors.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <textarea
              style={styles.editor}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <div style={styles.actions}>
              <button style={styles.button} type="button" onClick={run}>
                Run (Ctrl+Enter)
              </button>
              <button style={styles.buttonSecondary} type="button" onClick={resetToDefault}>
                Reset Demo
              </button>
              <button style={styles.buttonGhost} type="button" onClick={() => fileInputRef.current?.click()}>
                Import .tsx
              </button>
              <button style={styles.buttonGhost} type="button" onClick={exportTsx}>
                Export .tsx
              </button>
              <button style={styles.buttonGhost} type="button" onClick={exportSvg} disabled={!svgSource}>
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

            {/* Variable controls */}
            {varsEntries.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 12, color: '#52606d' }}>Variables</h3>
                <div style={{ display: 'grid', gap: 6 }}>
                  {varsEntries.map(([key, value]) => {
                    const id = `var-${key}`;
                    const type = typeof value;
                    const isColor = type === 'string' && String(value).startsWith('#');
                    const inputType = isColor ? 'color' : type === 'number' ? 'number' : type === 'boolean' ? 'checkbox' : 'text';
                    return (
                      <label key={key} htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#52606d', minWidth: 100 }}>{key}</span>
                        {inputType === 'checkbox' ? (
                          <input
                            id={id}
                            type="checkbox"
                            checked={Boolean(overrides[key] ?? value)}
                            onChange={(e) => {
                              const next = { ...overrides, [key]: e.target.checked };
                              setOverrides(next);
                              setOutput(evaluateTsx(code, next, collector));
                            }}
                          />
                        ) : (
                          <input
                            id={id}
                            type={inputType}
                            value={String(overrides[key] ?? value)}
                            onChange={(e) => {
                              const v = inputType === 'number' ? Number(e.target.value) : e.target.value;
                              const next = { ...overrides, [key]: v };
                              setOverrides(next);
                              setOutput(evaluateTsx(code, next, collector));
                            }}
                            style={{
                              flex: 1,
                              border: '1px solid #cbd2d9',
                              borderRadius: 6,
                              padding: '4px 8px',
                              fontSize: 12,
                            }}
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Right: Viewport + Errors + Diagnostics */}
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Viewport</h2>
              <div style={styles.tabs}>
                <button
                  type="button"
                  onClick={() => setActiveTab('visual')}
                  style={{
                    ...styles.tabButton,
                    ...(activeTab === 'visual' ? styles.tabButtonActive : {}),
                  }}
                >
                  Visual
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('source')}
                  style={{
                    ...styles.tabButton,
                    ...(activeTab === 'source' ? styles.tabButtonActive : {}),
                  }}
                >
                  Source
                </button>
              </div>
            </div>
            <div style={styles.viewport} ref={viewportRef}>
              <ErrorBoundary collector={collector}>
                {activeTab === 'visual' ? (
                  rendered ?? <span style={{ color: '#94a3b8' }}>No SVG rendered.</span>
                ) : (
                  <pre style={styles.source}>{svgSource || 'No SVG rendered yet.'}</pre>
                )}
              </ErrorBoundary>
            </div>

            {/* Error Panel */}
            {errors.length > 0 && (
              <div style={styles.errorPanel}>
                <strong>Errors ({errors.length})</strong>
                {errors.map((err, i) => (
                  <div key={i} style={{ marginTop: 6 }}>
                    <span
                      style={{
                        ...styles.errorBadge,
                        background: errorKindColors[err.kind] ?? '#666',
                        color: '#fff',
                      }}
                    >
                      {err.kind}
                    </span>
                    <span>{err.message}</span>
                    {'suggestion' in err && err.suggestion && (
                      <div style={{ marginTop: 2, color: '#4a5568', fontSize: 11 }}>
                        Suggestion: {err.suggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Diagnostics */}
            <div style={styles.diagnostics}>
              <h3 style={styles.diagTitle}>Diagnostics</h3>
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
                      ? 'Loading...'
                      : replicadStatus.state === 'error'
                        ? `Error: ${replicadStatus.error}`
                        : 'Idle'}
                </span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </ErrorContext.Provider>
  );
}
