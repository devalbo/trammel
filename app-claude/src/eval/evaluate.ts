import React from 'react';
import { transform } from 'sucrase';
import * as constraints from '../constraints';
import { draw } from 'replicad';
import { ErrorCollector } from '../errors/collector';
import type { TrammelError } from '../errors/types';

export type EvalResult = {
  element: React.ReactElement | null;
  error: string | null;
  vars: Record<string, unknown>;
  evalMs: number;
  collectedErrors: TrammelError[];
};

export const defaultCode = `// trammel claude demo
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

export function prettyPrintXml(source: string): string {
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

export function evaluateTsx(
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
