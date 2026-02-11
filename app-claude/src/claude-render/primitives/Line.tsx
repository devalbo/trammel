import React, { useId } from 'react';
import { useRenderPhase, useSolver } from './SolverContext';

export interface Point2D {
  x: number;
  y: number;
}

export interface LineProps {
  id?: string;
  start?: Point2D | string;
  end?: Point2D | string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number | string;
  style?: React.CSSProperties;
}

function resolvePoint(
  value: Point2D | string | undefined,
  solver: ReturnType<typeof useSolver>,
  shapeId?: string,
): Point2D | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return value;
  if (!solver) throw new Error(`Cannot resolve reference "${value}": no SolverProvider found.`);
  return solver.resolvePoint(value, shapeId);
}

function rotatePoint(pt: Point2D, pivotX: number, pivotY: number, rotationDeg: number): Point2D {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = pt.x - pivotX;
  const dy = pt.y - pivotY;
  return {
    x: Math.round((pivotX + dx * cos - dy * sin) * 100) / 100,
    y: Math.round((pivotY + dx * sin + dy * cos) * 100) / 100,
  };
}

export const Line: React.FC<LineProps> = ({
  id: idProp,
  start: startProp,
  end: endProp,
  stroke,
  strokeWidth,
  rotation,
  style,
}) => {
  const solver = useSolver();
  const phase = useRenderPhase();
  const autoId = useId();
  const id = idProp ?? autoId;
  const isAutoId = idProp === undefined;

  const start = resolvePoint(startProp, solver, id);
  const end = resolvePoint(endProp, solver, id);
  const rot = rotation !== undefined
    ? (typeof rotation === 'number' ? rotation : (solver ? solver.resolve(rotation, id, id) : undefined))
    : undefined;
  if (rotation !== undefined && typeof rotation === 'string' && !solver) {
    throw new Error(`Cannot resolve reference "${rotation}": no SolverProvider found.`);
  }

  // Register anchors, bounds, and shape (always, not just when id is explicit)
  if (solver && start && end) {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const bounds = {
      left: Math.min(start.x, end.x),
      right: Math.max(start.x, end.x),
      top: Math.min(start.y, end.y),
      bottom: Math.max(start.y, end.y),
    };
    const s = rot ? rotatePoint(start, midX, midY, rot) : start;
    const e = rot ? rotatePoint(end, midX, midY, rot) : end;
    solver.register(id, {
      startX: s.x,
      startY: s.y,
      endX: e.x,
      endY: e.y,
      centerX: (s.x + e.x) / 2,
      centerY: (s.y + e.y) / 2,
      center: { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 },
      start: { x: s.x, y: s.y },
      end: { x: e.x, y: e.y },
      rotation: rot ?? 0,
    });

    if (rot) {
      const corners = [
        { x: start.x, y: start.y },
        { x: end.x, y: end.y },
      ];
      solver.checkRotatedBounds(id, corners, rot, midX, midY);
    } else {
      solver.checkBounds(id, bounds);
    }

    solver.registerShape(id, {
      type: 'line',
      id,
      autoId: isAutoId,
      props: { x1: start.x, y1: start.y, x2: end.x, y2: end.y, stroke, strokeWidth, rotation: rot ?? rotation },
    });
  }

  const cx = start && end ? (start.x + end.x) / 2 : 0;
  const cy = start && end ? (start.y + end.y) / 2 : 0;
  const transform = rot
    ? `rotate(${rot}, ${cx}, ${cy})`
    : undefined;

  if (phase === 'register') {
    return null;
  }

  return (
    <line
      id={idProp}
      x1={start?.x}
      y1={start?.y}
      x2={end?.x}
      y2={end?.y}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={transform}
      style={style}
    />
  );
};
