import React from 'react';
import { useSolver } from './SolverContext';

export interface RectProps {
  id?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number;
  ry?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  left?: number | string;
  right?: number | string;
  top?: number | string;
  bottom?: number | string;
  centerX?: number | string;
  centerY?: number | string;
}

function resolveScalar(value: number | string | undefined, solver: ReturnType<typeof useSolver>): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  if (!solver) throw new Error(`Cannot resolve reference "${value}": no SolverProvider found.`);
  return solver.resolve(value);
}

export const Rect: React.FC<RectProps> = ({
  id,
  x: xProp,
  y: yProp,
  width = 0,
  height = 0,
  rx,
  ry,
  fill,
  stroke,
  strokeWidth,
  rotation,
  left: leftProp,
  right: rightProp,
  top: topProp,
  bottom: bottomProp,
  centerX: centerXProp,
  centerY: centerYProp,
}) => {
  const solver = useSolver();

  // Resolve virtual props
  const left = resolveScalar(leftProp, solver);
  const right = resolveScalar(rightProp, solver);
  const top = resolveScalar(topProp, solver);
  const bottom = resolveScalar(bottomProp, solver);
  const centerX = resolveScalar(centerXProp, solver);
  const centerY = resolveScalar(centerYProp, solver);

  // Derive x: explicit x wins, then left, right, centerX
  let x: number;
  if (xProp !== undefined) {
    x = xProp;
  } else if (left !== undefined) {
    x = left;
  } else if (right !== undefined) {
    x = right - width;
  } else if (centerX !== undefined) {
    x = centerX - width / 2;
  } else {
    x = 0;
  }

  // Derive y: explicit y wins, then top, bottom, centerY
  let y: number;
  if (yProp !== undefined) {
    y = yProp;
  } else if (top !== undefined) {
    y = top;
  } else if (bottom !== undefined) {
    y = bottom - height;
  } else if (centerY !== undefined) {
    y = centerY - height / 2;
  } else {
    y = 0;
  }

  // Register anchors and check bounds if this shape has an id
  if (id && solver) {
    const bounds = { left: x, right: x + width, top: y, bottom: y + height };
    solver.register(id, {
      ...bounds,
      centerX: x + width / 2,
      centerY: y + height / 2,
      center: { x: x + width / 2, y: y + height / 2 },
    });
    solver.checkBounds(id, bounds);
  }

  const transform = rotation
    ? `rotate(${rotation}, ${x + width / 2}, ${y + height / 2})`
    : undefined;

  return (
    <rect
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      rx={rx}
      ry={ry}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={transform}
    />
  );
};
