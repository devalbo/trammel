import React, { useId } from 'react';
import { useSolver } from './SolverContext';

export interface CircleProps {
  id?: string;
  centerX?: number | string;
  centerY?: number | string;
  r?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
}

function resolveScalar(value: number | string | undefined, solver: ReturnType<typeof useSolver>): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  if (!solver) throw new Error(`Cannot resolve reference "${value}": no SolverProvider found.`);
  return solver.resolve(value);
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

  const cx = resolveScalar(centerXProp, solver) ?? 0;
  const cy = resolveScalar(centerYProp, solver) ?? 0;

  // Register anchors, bounds, and shape (always, not just when id is explicit)
  if (solver) {
    const bounds = { left: cx - r, right: cx + r, top: cy - r, bottom: cy + r };
    solver.register(id, {
      centerX: cx,
      centerY: cy,
      ...bounds,
      center: { x: cx, y: cy },
    });
    // Rotation around center doesn't change bounds for a circle
    solver.checkBounds(id, bounds);

    solver.registerShape(id, {
      type: 'circle',
      id,
      autoId: isAutoId,
      props: { cx, cy, r, fill, stroke, strokeWidth, rotation },
    });
  }

  const transform = rotation
    ? `rotate(${rotation}, ${cx}, ${cy})`
    : undefined;

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
