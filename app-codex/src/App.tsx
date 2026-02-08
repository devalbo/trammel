import React, { useEffect, useMemo, useState } from 'react';
import { transform } from 'sucrase';
import * as ReactJsxRuntime from 'react/jsx-runtime';
import * as esbuild from 'esbuild-wasm';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';
import { createTrammelPersister, createTrammelStore } from './store';
import * as constraints from './constraints';
import { initReplicad } from './replicad/init';
import { draw, drawRectangle, drawRoundedRectangle } from 'replicad';
import { ErrorBoundary, ErrorCollector, ErrorProvider } from './errors';

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

const defaultCode = `// trammel codex demo
const vars = {
  width: 320,
  height: 160,
  cornerRadius: 18,
  panel: '#f2f4f7',
  accent: '#2563eb',
  inset: 14,
};

const panel: Rect = { x: 0, y: 0, width: vars.width, height: vars.height };
const inner = insetRect(panel, vars.inset);
const badge = rectCorner(inner, 'topRight');

const Panel = () => (
  <g>
    <rect
      x={panel.x}
      y={panel.y}
      width={panel.width}
      height={panel.height}
      rx={vars.cornerRadius}
      fill={vars.panel}
      stroke="#0f172a"
      strokeWidth={2}
    />
    <circle cx={panel.width * 0.18} cy={panel.height * 0.5} r={22} fill={vars.accent} />
    <rect
      x={inner.x + 12}
      y={inner.y + 28}
      width={inner.width * 0.6}
      height={inner.height * 0.4}
      rx={12}
      fill="#e2e8f0"
      stroke="#0f172a"
      strokeWidth={1.5}
    />
    <circle cx={badge.x - 16} cy={badge.y + 16} r={8} fill={vars.accent} />
  </g>
);

const ReplicadPanel = () => {
  const path = drawRoundedRectangle(vars.width, vars.height, 6).toSVGPaths()[0];
  return <path d={path} fill="none" stroke="#0f172a" strokeWidth={2} />;
};

const Root = () => (
  <svg viewBox={\`-10 -10 \${vars.width + 20} \${vars.height + 20}\`}>
    <Panel />
    <ReplicadPanel />
  </svg>
);
`;

const demoLibrary = [
  {
    id: 'basic-panel',
    label: 'Basic Panel',
    code: defaultCode,
  },
  {
    id: 'align-distribute',
    label: 'Align + Distribute',
    code: `const vars = { width: 360, height: 160 };

const panel: Rect = { x: 0, y: 0, width: vars.width, height: vars.height };
const dots = distributeAlongEdge(panel, 'top', 5);

const Root = () => (
  <svg viewBox={\`-10 -10 \${vars.width + 20} \${vars.height + 20}\`}>
    <rect {...panel} fill="#f1f5f9" stroke="#0f172a" strokeWidth={2} />
    {dots.map((p, i) => (
      <circle key={i} cx={p.x} cy={p.y - 12} r={6} fill="#2563eb" />
    ))}
  </svg>
);
`,
  },
  {
    id: 'concentric-mirror',
    label: 'Concentric + Mirror',
    code: `const vars = { width: 280, height: 180 };

const panel: Rect = { x: 0, y: 0, width: vars.width, height: vars.height };
const center = rectCenter(panel);
const baseCircle: Circle = { cx: center.x - 40, cy: center.y, r: 20 };
const axis: Line = { from: { x: center.x, y: 0 }, to: { x: center.x, y: vars.height } };
const mirror = mirrorCircle(baseCircle, axis);

const Root = () => (
  <svg viewBox={\`-10 -10 \${vars.width + 20} \${vars.height + 20}\`}>
    <rect {...panel} fill="#fff7ed" stroke="#7c2d12" strokeWidth={2} />
    <circle cx={baseCircle.cx} cy={baseCircle.cy} r={baseCircle.r} fill="#fb923c" />
    <circle cx={mirror.cx} cy={mirror.cy} r={mirror.r} fill="#fb923c" />
  </svg>
);
`,
  },
  {
    id: 'grid-positions',
    label: 'Grid Positions',
    code: `const vars = { cols: 4, rows: 3, cell: 36 };

const points = gridPositions(vars.rows, vars.cols, vars.cell, vars.cell, 10, 10, { x: 20, y: 20 });

const Root = () => (
  <svg viewBox="0 0 220 160">
    {points.map((p, i) => (
      <rect key={i} x={p.x} y={p.y} width={vars.cell} height={vars.cell} fill="#e2e8f0" stroke="#0f172a" />
    ))}
  </svg>
);
`,
  },
  {
    id: 'arc-corner',
    label: 'Arc In Corner',
    code: `const vars = { width: 260, height: 160, r: 24 };
const panel: Rect = { x: 0, y: 0, width: vars.width, height: vars.height };
const arc = arcInCorner(vars.r, panel, 'topRight');

const Root = () => (
  <svg viewBox={\`-10 -10 \${vars.width + 20} \${vars.height + 20}\`}>
    <rect {...panel} fill="#f8fafc" stroke="#0f172a" strokeWidth={2} />
    <path d={arcToSVGPath(arc)} stroke="#2563eb" strokeWidth={3} fill="none" />
  </svg>
);
`,
  },
  {
    id: 'tangent-lines',
    label: 'Tangent Lines',
    code: `const vars = { cx: 120, cy: 90, r: 30 };
const circle: Circle = { cx: vars.cx, cy: vars.cy, r: vars.r };
const point: Point = { x: 220, y: 40 };
const tangents = tangentLineToCircle(circle, point);

const Root = () => (
  <svg viewBox="0 0 260 180">
    <circle cx={circle.cx} cy={circle.cy} r={circle.r} fill="#e0f2fe" stroke="#0f172a" />
    <circle cx={point.x} cy={point.y} r={4} fill="#ef4444" />
    {tangents.map((l, i) => (
      <path key={i} d={lineToSVGPath(l)} stroke="#ef4444" strokeWidth={2} fill="none" />
    ))}
  </svg>
);
`,
  },
];


type EvalResult = {
  element: React.ReactElement | null;
  error: string | null;
  vars: Record<string, unknown>;
  evalMs: number;
};

const useEsbuildEval = import.meta.env.VITE_USE_ESBUILD_EVAL === '1';
let esbuildInit: Promise<void> | null = null;

async function ensureEsbuildReady() {
  if (!esbuildInit) {
    esbuildInit = esbuild.initialize({
      wasmURL: esbuildWasmUrl,
      worker: true,
    });
  }
  await esbuildInit;
}

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

function evaluateTsx(
  source: string,
  overrides: Record<string, unknown>,
  collector: ErrorCollector | null,
  replicadReady: boolean
): EvalResult {
  try {
    const start = performance.now();
    collector?.clear();
    let code: string;
    try {
      code = transform(source, {
        transforms: ['typescript', 'jsx'],
        jsxRuntime: 'automatic',
        production: true,
      }).code;
      const importMatch = code.match(
        /^\s*import\s*\{([^}]+)\}\s*from\s*['"]react\/jsx-runtime['"];?/
      );
      if (importMatch) {
        const bindings = importMatch[1]
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean)
          .map((part) => part.replace(/\s+as\s+/g, ': '))
          .join(', ');
        code = code.replace(importMatch[0], `const { ${bindings} } = ReactJsxRuntime;`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      collector?.report({ kind: 'syntax', message, stack: err instanceof Error ? err.stack : undefined });
      return { element: null, vars: {}, error: message, evalMs: 0 };
    }

    const wrapped = `
      const { useMemo, useState, useEffect, useRef } = React;
      const {
        rectCenter,
        rectCorner,
        rectEdge,
        rectEdgeMidpoint,
        insetRect,
        alignCenterX,
        alignCenterY,
        alignEdge,
        alignFlush,
        distributeEvenly,
        distributeAlongEdge,
        gridPositions,
        distributeOnCircle,
        offsetPoint,
        parallelLine,
        offsetCircle,
        coincident,
        centerAtPoint,
        centerAtCorner,
        centerAtEdgeMidpoint,
        concentric,
        collinear,
        parallel,
        parallelThrough,
        perpendicular,
        perpendicularThrough,
        perpendicularAt,
        horizontal,
        vertical,
        horizontalDistance,
        verticalDistance,
        midpoint,
        nearestPointOnLine,
        nearestPointOnCircle,
        nearestPointOnArc,
        pointOnLineAt,
        pointOnCircleAt,
        pointOnArcAt,
        angleBetween,
        rotateToAngle,
        arcTangentToLines,
        arcInCorner,
        arcBetween,
        filletArc,
        tangentLineToCircle,
        tangentLineBetweenCircles,
        tangentCircleToLine,
        tangentCircleToCircles,
        pointOfTangency,
        equalLength,
        equalRadius,
        mirrorPoint,
        mirrorLine,
        mirrorCircle,
        mirrorRect,
        mirrorPointAbout,
        distanceBetween,
        distancePointToLine,
        distancePointToCircle,
        lineLength,
        lineAngle,
        lineDirection,
        lineLineIntersection,
        lineCircleIntersection,
        circleCircleIntersection,
        lineRectIntersection,
        arcToSVGPath,
        lineToSVGPath,
        rectToSVGPath,
        circleToSVGPath,
        pathFromPoints,
      } = constraints;
      const __trammelDraw = ${replicadReady ? 'replicad.draw' : 'null'};
      const drawRoundedRectangle = ${replicadReady ? '(typeof replicad.drawRoundedRectangle === "function" ? replicad.drawRoundedRectangle : (() => ({ toSVGPaths() { return [""]; } })))' : '(() => ({ toSVGPaths() { return [""]; } }))'};
      const drawRectangle = ${replicadReady ? '(typeof replicad.drawRectangle === "function" ? replicad.drawRectangle : (() => ({ toSVGPaths() { return [""]; } })))' : '(() => ({ toSVGPaths() { return [""]; } }))'};
      const draw = () => {
        const stub = () => ({
          rect() {
            return {
              chamfer() {
                return {
                  toSVGPaths() {
                    return [""];
                  },
                };
              },
            };
          },
        });
        if (typeof __trammelDraw !== 'function') return stub();
        try {
          const result = __trammelDraw();
          if (!result || typeof result.rect !== 'function') return stub();
          return result;
        } catch {
          return stub();
        }
      };
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
        'ReactJsxRuntime',
        'constraints',
        'replicad',
        'overrides',
      wrapped
    ) as (
      react: typeof React,
      jsxRuntime: typeof ReactJsxRuntime,
      helpers: typeof constraints,
      replicad: {
        draw: typeof draw;
        drawRectangle: typeof drawRectangle;
        drawRoundedRectangle: typeof drawRoundedRectangle;
      },
      overrides: Record<string, unknown>
    ) => { element: React.ReactElement | null; vars: Record<string, unknown> };
    const result = factory(
      React,
      ReactJsxRuntime,
      constraints,
      { draw, drawRectangle, drawRoundedRectangle },
      overrides
    );
    const evalMs = performance.now() - start;
    return { element: result.element, vars: result.vars, error: null, evalMs };
  } catch (err) {
    const evalMs = 0;
    if (err instanceof Error) {
      const stack = err.stack ? `\n${err.stack}` : '';
      collector?.report({ kind: 'eval', message: err.message, stack: err.stack });
      return { element: null, vars: {}, error: `${err.message}${stack}`, evalMs };
    }
    collector?.report({ kind: 'eval', message: String(err) });
    return { element: null, vars: {}, error: String(err), evalMs };
  }
}

async function evaluateTsxEsbuild(
  source: string,
  overrides: Record<string, unknown>,
  collector: ErrorCollector | null,
  replicadReady: boolean
): Promise<EvalResult> {
  const start = performance.now();
  collector?.clear();
  try {
    await ensureEsbuildReady();
    (window as Window & { __TRAMMEL_REACT__?: typeof React }).__TRAMMEL_REACT__ = React;
    (window as Window & { __TRAMMEL_JSX__?: typeof ReactJsxRuntime }).__TRAMMEL_JSX__ =
      ReactJsxRuntime;
    (window as Window & { __TRAMMEL_CONSTRAINTS__?: typeof constraints }).__TRAMMEL_CONSTRAINTS__ =
      constraints;
    (window as Window & {
      __TRAMMEL_REPLICAD__?: {
        draw: typeof draw;
        drawRectangle: typeof drawRectangle;
        drawRoundedRectangle: typeof drawRoundedRectangle;
      };
    }).__TRAMMEL_REPLICAD__ = {
      draw,
      drawRectangle,
      drawRoundedRectangle,
    };
    (window as Window & { __TRAMMEL_OVERRIDES__?: Record<string, unknown> }).__TRAMMEL_OVERRIDES__ =
      overrides;

    const prelude = `
const React = window.__TRAMMEL_REACT__;
const constraints = window.__TRAMMEL_CONSTRAINTS__;
const replicad = window.__TRAMMEL_REPLICAD__;
const __trammelDraw = ${replicadReady ? 'replicad.draw' : 'null'};
const drawRoundedRectangle = ${replicadReady ? '(typeof replicad.drawRoundedRectangle === "function" ? replicad.drawRoundedRectangle : (() => ({ toSVGPaths() { return [""]; } })))' : '(() => ({ toSVGPaths() { return [""]; } }))'};
const drawRectangle = ${replicadReady ? '(typeof replicad.drawRectangle === "function" ? replicad.drawRectangle : (() => ({ toSVGPaths() { return [""]; } })))' : '(() => ({ toSVGPaths() { return [""]; } }))'};
const draw = () => {
  const stub = () => ({
    rect() {
      return {
        chamfer() {
          return {
            toSVGPaths() {
              return [""];
            },
          };
        },
      };
    },
  });
  if (typeof __trammelDraw !== 'function') return stub();
  try {
    const result = __trammelDraw();
    if (!result || typeof result.rect !== 'function') return stub();
    return result;
  } catch {
    return stub();
  }
};
const overrides = window.__TRAMMEL_OVERRIDES__;
const {
  rectCenter,
  rectCorner,
  rectEdge,
  rectEdgeMidpoint,
  insetRect,
  alignCenterX,
  alignCenterY,
  alignEdge,
  alignFlush,
  distributeEvenly,
  distributeAlongEdge,
  gridPositions,
  distributeOnCircle,
  offsetPoint,
  parallelLine,
  offsetCircle,
  coincident,
  centerAtPoint,
  centerAtCorner,
  centerAtEdgeMidpoint,
  concentric,
  collinear,
  parallel,
  parallelThrough,
  perpendicular,
  perpendicularThrough,
  perpendicularAt,
  horizontal,
  vertical,
  horizontalDistance,
  verticalDistance,
  midpoint,
  nearestPointOnLine,
  nearestPointOnCircle,
  nearestPointOnArc,
  pointOnLineAt,
  pointOnCircleAt,
  pointOnArcAt,
  angleBetween,
  rotateToAngle,
  arcTangentToLines,
  arcInCorner,
  arcBetween,
  filletArc,
  tangentLineToCircle,
  tangentLineBetweenCircles,
  tangentCircleToLine,
  tangentCircleToCircles,
  pointOfTangency,
  equalLength,
  equalRadius,
  mirrorPoint,
  mirrorLine,
  mirrorCircle,
  mirrorRect,
  mirrorPointAbout,
  distanceBetween,
  distancePointToLine,
  distancePointToCircle,
  lineLength,
  lineAngle,
  lineDirection,
  lineLineIntersection,
  lineCircleIntersection,
  circleCircleIntersection,
  lineRectIntersection,
  arcToSVGPath,
  lineToSVGPath,
  rectToSVGPath,
  circleToSVGPath,
  pathFromPoints,
} = constraints;
    `.trim();
    const postlude = `
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
export const __TRAMMEL_RESULT__ = { element, vars: capturedVars };
    `.trim();

    const { outputFiles } = await esbuild.build({
      bundle: true,
      write: false,
      format: 'esm',
      target: 'es2020',
      sourcemap: 'inline',
      jsx: 'automatic',
      jsxDev: false,
      stdin: {
        contents: [prelude, source, postlude].join('\n\n'),
        loader: 'tsx',
        resolveDir: '/',
        sourcefile: 'trammel-codex.tsx',
      },
      plugins: [
        {
          name: 'trammel-jsx-runtime',
          setup(build) {
            build.onResolve({ filter: /^react\/jsx-runtime$/ }, () => ({
              path: 'react/jsx-runtime',
              namespace: 'trammel-jsx-runtime',
            }));
            build.onResolve({ filter: /^react\/jsx-dev-runtime$/ }, () => ({
              path: 'react/jsx-dev-runtime',
              namespace: 'trammel-jsx-runtime',
            }));
            build.onLoad({ filter: /.*/, namespace: 'trammel-jsx-runtime' }, () => ({
              contents: `
export const jsx = window.__TRAMMEL_JSX__.jsx;
export const jsxs = window.__TRAMMEL_JSX__.jsxs;
export const Fragment = window.__TRAMMEL_JSX__.Fragment;
export const jsxDEV = window.__TRAMMEL_JSX__.jsx;
              `,
              loader: 'js',
            }));
          },
        },
      ],
    });

    const code = outputFiles?.[0]?.text ?? '';

    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    try {
      const mod = await import(/* @vite-ignore */ url);
      const result = mod.__TRAMMEL_RESULT__ ?? { element: null, vars: {} };
      const evalMs = performance.now() - start;
      return { element: result.element, vars: result.vars, error: null, evalMs };
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    collector?.report({
      kind: 'eval',
      message,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return { element: null, vars: {}, error: message, evalMs: 0 };
  }
}

export default function App() {
  const errorCollector = useMemo(() => new ErrorCollector(), []);
  const store = useMemo(() => createTrammelStore(), []);
  const persister = useMemo(() => createTrammelPersister(store), [store]);
  const [code, setCode] = useState(defaultCode);
  const [overrides, setOverrides] = useState<Record<string, unknown>>({});
  const [output, setOutput] = useState<EvalResult>(() =>
    useEsbuildEval
      ? { element: null, vars: {}, error: null, evalMs: 0 }
      : evaluateTsx(defaultCode, {}, errorCollector, false)
  );
  const [selectedDemoId, setSelectedDemoId] = useState(demoLibrary[0]?.id ?? 'basic-panel');
  const evalTokenRef = React.useRef(0);
  const lastEvalReplicadReady = React.useRef(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'source'>('visual');
  const [svgSource, setSvgSource] = useState('');
  const [svgStats, setSvgStats] = useState({ nodes: 0, bytes: 0 });
  const [serializeMs, setSerializeMs] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [diagnosticsTab, setDiagnosticsTab] = useState<'info' | 'error'>('info');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [replicadStatus, setReplicadStatus] = useState<{
    state: 'idle' | 'loading' | 'ready' | 'error';
    ms: number;
    error?: string;
  }>({ state: 'idle', ms: 0 });
  const lastErrorRef = React.useRef<string | null>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [dropActive, setDropActive] = useState(false);

  const evaluateAndSet = async (
    source: string,
    nextOverrides: Record<string, unknown>,
    replicadReady = false
  ) => {
    lastEvalReplicadReady.current = replicadReady;
    const token = evalTokenRef.current + 1;
    evalTokenRef.current = token;
    if (useEsbuildEval) {
      setIsEvaluating(true);
      const result = await evaluateTsxEsbuild(source, nextOverrides, errorCollector, replicadReady);
      if (evalTokenRef.current === token) {
        setOutput(result);
        setIsEvaluating(false);
      }
      return;
    }
    setOutput(evaluateTsx(source, nextOverrides, errorCollector, replicadReady));
  };

  const run = async () => {
    await evaluateAndSet(code, overrides, replicadStatus.state === 'ready');
    setLogs((prev) => [`Ran eval (${code.length} chars)`, ...prev].slice(0, 6));
  };
  const loadDemo = async (demoId = selectedDemoId) => {
    if (demoId === 'basic-panel') {
      await resetToDefault();
      return;
    }
    const demo = demoLibrary.find((entry) => entry.id === demoId);
    if (!demo) return;
    await runImport(demo.code, `${demo.label}.tsx`, demo.code.length);
  };
  const runImport = async (text: string, name?: string, size?: number) => {
    setCode(text);
    setOverrides({});
    await evaluateAndSet(text, {}, replicadStatus.state === 'ready');
    if (name && typeof size === 'number') {
      setLogs((prev) => [`Imported ${name} (${size} bytes)`, ...prev].slice(0, 6));
    } else {
      setLogs((prev) => ['Imported file', ...prev].slice(0, 6));
    }
  };
  const resetToDefault = async () => {
    setCode(defaultCode);
    setOverrides({});
    await evaluateAndSet(defaultCode, {}, replicadStatus.state === 'ready');
  };
  const triggerImport = () => fileInputRef.current?.click();
  const exportTsx = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const name = window.prompt('Export filename', 'trammel-codex.tsx') || 'trammel-codex.tsx';
    link.download = name.endsWith('.tsx') ? name : `${name}.tsx`;
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
    const name = window.prompt('Export filename', 'trammel-codex.svg') || 'trammel-codex.svg';
    link.download = name.endsWith('.svg') ? name : `${name}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const onImportFile: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await runImport(text, file.name, file.size);
    event.target.value = '';
  };

  const onDrop: React.DragEventHandler<HTMLTextAreaElement> = async (event) => {
    event.preventDefault();
    setDropActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (!/\.(tsx|ts|txt)$/i.test(file.name)) return;
    const text = await file.text();
    await runImport(text, file.name, file.size);
  };

  const onDragOver: React.DragEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.dataTransfer?.types?.includes('Files')) {
      event.preventDefault();
      setDropActive(true);
    }
  };

  const onDragLeave: React.DragEventHandler<HTMLTextAreaElement> = () => {
    setDropActive(false);
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
        await evaluateAndSet(stored, overrides, replicadStatus.state === 'ready');
        setLogs((prev) => ['Loaded saved file', ...prev].slice(0, 6));
      } else if (!cancelled) {
        store.setRow('files', 'default', { name: 'main.tsx', content: defaultCode });
        setCode(defaultCode);
        await evaluateAndSet(defaultCode, overrides, replicadStatus.state === 'ready');
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
    (async () => {
      const result = await initReplicad();
      if (!mounted) return;
      if (result.ok) {
        setReplicadStatus({ state: 'ready', ms: result.ms });
        setLogs((prev) => [`Replicad init: ok (${result.ms.toFixed(1)} ms)`, ...prev].slice(0, 6));
      } else {
        setReplicadStatus({ state: 'error', ms: result.ms, error: result.error });
        setLogs((prev) => [`Replicad init: error (${result.error ?? 'unknown'})`, ...prev].slice(0, 6));
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (replicadStatus.state !== 'ready') return;
    if (lastEvalReplicadReady.current) return;
    evaluateAndSet(code, overrides, true);
  }, [replicadStatus.state, code, overrides]);

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

  const getVarMeta = (value: unknown) => {
    if (
      value &&
      typeof value === 'object' &&
      'value' in (value as Record<string, unknown>)
    ) {
      const meta = value as {
        value: unknown;
        options?: unknown[];
        min?: number;
        max?: number;
        step?: number;
      };
      return {
        value: meta.value,
        options: Array.isArray(meta.options) ? meta.options : undefined,
        min: typeof meta.min === 'number' ? meta.min : undefined,
        max: typeof meta.max === 'number' ? meta.max : undefined,
        step: typeof meta.step === 'number' ? meta.step : undefined,
      };
    }
    return { value };
  };

  return (
    <ErrorProvider collector={errorCollector}>
      <div style={styles.app}>
        <style>
          {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
        </style>
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
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          />
          <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
            <label htmlFor="demo-select" style={{ fontSize: 12, color: '#52606d' }}>
              Demo
            </label>
            <select
              id="demo-select"
              value={selectedDemoId}
              onChange={(event) => {
                const next = event.target.value;
                setSelectedDemoId(next);
                loadDemo(next);
              }}
              style={{
                border: '1px solid #cbd2d9',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 12,
              }}
            >
              {demoLibrary.map((demo) => (
                <option key={demo.id} value={demo.id}>
                  {demo.label}
                </option>
              ))}
            </select>
          </div>
          {dropActive ? (
            <div
              style={{
                marginTop: 8,
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px dashed #94a3b8',
                color: '#475569',
                fontSize: 12,
                background: '#f8fafc',
              }}
            >
              Drop a .tsx, .ts, or .txt file to import.
            </div>
          ) : null}
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
                  const meta = getVarMeta(value);
                  const currentValue = overrides[key] ?? meta.value;
                  const type = typeof currentValue;
                  const isColor = type === 'string' && String(currentValue).startsWith('#');
                  const hasOptions = Array.isArray(meta.options) && meta.options.length > 0;
                  const inputType =
                    type === 'boolean'
                      ? 'checkbox'
                      : hasOptions
                        ? 'select'
                        : isColor
                          ? 'color'
                          : type === 'number'
                            ? 'number'
                            : 'text';
                  return (
                    <label key={key} htmlFor={id} style={{ display: 'grid', gap: 4 }}>
                      <span style={{ fontSize: 12, color: '#52606d' }}>{key}</span>
                      {inputType === 'select' ? (
                        <select
                          id={id}
                          value={String(currentValue)}
                          onChange={(event) => {
                            const selected = meta.options?.find(
                              (option) => String(option) === event.target.value
                            );
                            const nextOverrides = { ...overrides, [key]: selected };
                            setOverrides(nextOverrides);
                            evaluateAndSet(code, nextOverrides, replicadStatus.state === 'ready');
                          }}
                          style={{
                            border: '1px solid #cbd2d9',
                            borderRadius: 6,
                            padding: '6px 8px',
                            fontSize: 12,
                          }}
                        >
                          {(meta.options ?? []).map((option) => (
                            <option key={String(option)} value={String(option)}>
                              {String(option)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={id}
                          type={inputType}
                          value={
                            inputType === 'checkbox' ? undefined : String(currentValue ?? '')
                          }
                          checked={
                            inputType === 'checkbox' ? Boolean(currentValue) : undefined
                          }
                          min={inputType === 'number' ? meta.min : undefined}
                          max={inputType === 'number' ? meta.max : undefined}
                          step={inputType === 'number' ? meta.step : undefined}
                          onChange={(event) => {
                            let nextValue: unknown;
                            if (inputType === 'number') {
                              nextValue = Number(event.target.value);
                            } else if (inputType === 'checkbox') {
                              nextValue = event.target.checked;
                            } else {
                              nextValue = event.target.value;
                            }
                            const nextOverrides = { ...overrides, [key]: nextValue };
                            setOverrides(nextOverrides);
                            evaluateAndSet(code, nextOverrides, replicadStatus.state === 'ready');
                          }}
                          style={{
                            border: '1px solid #cbd2d9',
                            borderRadius: 6,
                            padding: '6px 8px',
                            fontSize: 12,
                          }}
                        />
                      )}
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
                <ErrorBoundary
                  fallback={<div>Render error.</div>}
                  onError={(err) => {
                    setErrorDetails(err.message);
                    setDiagnosticsTab('error');
                  }}
                  resetKey={code}
                >
                  {rendered}
                </ErrorBoundary>
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
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!errorDetails) return;
                      try {
                        await navigator.clipboard.writeText(errorDetails);
                        setLogs((prev) => ['Copied error to clipboard', ...prev].slice(0, 6));
                        setCopyStatus('success');
                      } catch {
                        setLogs((prev) => ['Clipboard copy failed', ...prev].slice(0, 6));
                        setCopyStatus('error');
                      }
                      window.setTimeout(() => setCopyStatus('idle'), 1500);
                    }}
                    style={{
                      ...styles.button,
                      background: '#fff',
                      color: '#1f2933',
                      padding: '4px 8px',
                      fontSize: 11,
                    }}
                    disabled={!errorDetails}
                  >
                    {copyStatus === 'success'
                      ? 'Copied'
                      : copyStatus === 'error'
                        ? 'Copy failed'
                        : 'Copy error'}
                  </button>
                </div>
                <div style={styles.diagErrorBox}>
                  {errorDetails ? errorDetails : 'No errors.'}
                </div>
              </div>
            )}
          </div>
          </section>
        </main>
      </div>
    </ErrorProvider>
  );
}
