import React, { useId } from 'react';
import { useRenderPhase, useSolver } from './SolverContext';

export interface CircleProps {
  id?: string;
  centerX?: number | string;
  centerY?: number | string;
  r?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number | string;
}

function resolveScalar(
  value: number | string | undefined,
  solver: ReturnType<typeof useSolver>,
  shapeId?: string,
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  if (!solver) throw new Error(`Cannot resolve reference "${value}": no SolverProvider found.`);
  return solver.resolve(value, shapeId, shapeId);
}

export const Circle: React.FC<CircleProps> = ({
  id: idProp,
  centerX: centerXProp = 0,
  centerY: centerYProp = 0,
  r = 0,
  fill,
  stroke,
  strokeWidth,
  rotation,
}) => {
  const solver = useSolver();
  const autoId = useId();
  const id = idProp ?? autoId;
  const isAutoId = idProp === undefined;

  const phase = useRenderPhase();
  const cx = resolveScalar(centerXProp, solver, id) ?? 0;
  const cy = resolveScalar(centerYProp, solver, id) ?? 0;
  const rot = resolveScalar(rotation, solver, id);

  // Register anchors, bounds, and shape (always, not just when id is explicit)
  if (solver) {
    const bounds = { left: cx - r, right: cx + r, top: cy - r, bottom: cy + r };
    solver.register(id, {
      centerX: cx,
      centerY: cy,
      rotation: rot ?? 0,
      ...bounds,
      center: { x: cx, y: cy },
    });
    // Rotation around center doesn't change bounds for a circle
    solver.checkBounds(id, bounds);

    solver.registerShape(id, {
      type: 'circle',
      id,
      autoId: isAutoId,
      props: { cx, cy, r, fill, stroke, strokeWidth, rotation: rot ?? rotation },
    });
  }

  const transform = rot
    ? `rotate(${rot}, ${cx}, ${cy})`
    : undefined;

  if (phase === 'register') {
    return null;
  }

  return (
    <circle
      id={idProp}
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={transform}
    />
  );
};
