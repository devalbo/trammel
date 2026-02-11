import React from 'react';
import { useSolver } from './SolverContext';

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
  rotation?: number;
}

function resolvePoint(value: Point2D | string | undefined, solver: ReturnType<typeof useSolver>): Point2D | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return value;
  if (!solver) throw new Error(`Cannot resolve reference "${value}": no SolverProvider found.`);
  return solver.resolvePoint(value);
}

export const Line: React.FC<LineProps> = ({
  id,
  start: startProp,
  end: endProp,
  stroke,
  strokeWidth,
  rotation,
}) => {
  const solver = useSolver();

  const start = resolvePoint(startProp, solver);
  const end = resolvePoint(endProp, solver);

  // Register anchors and check bounds if this shape has an id
  if (id && solver && start && end) {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const bounds = {
      left: Math.min(start.x, end.x),
      right: Math.max(start.x, end.x),
      top: Math.min(start.y, end.y),
      bottom: Math.max(start.y, end.y),
    };
    solver.register(id, {
      startX: start.x,
      startY: start.y,
      endX: end.x,
      endY: end.y,
      centerX: midX,
      centerY: midY,
      center: { x: midX, y: midY },
    });
    solver.checkBounds(id, bounds);
  }

  const cx = start && end ? (start.x + end.x) / 2 : 0;
  const cy = start && end ? (start.y + end.y) / 2 : 0;
  const transform = rotation
    ? `rotate(${rotation}, ${cx}, ${cy})`
    : undefined;

  return (
    <line
      id={id}
      x1={start?.x}
      y1={start?.y}
      x2={end?.x}
      y2={end?.y}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={transform}
    />
  );
};
