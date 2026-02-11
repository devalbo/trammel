import React from 'react';
import { useRenderPhase, useSolver } from './SolverContext';

export interface SpriteTextProps {
  id?: string;
  x?: number;
  y?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fill?: string;
  textAnchor?: string;
  children?: React.ReactNode;
  rotation?: number | string;
}

export const SpriteText: React.FC<SpriteTextProps> = ({
  id,
  x = 0,
  y = 0,
  fontSize,
  fontFamily,
  fontWeight,
  fill,
  textAnchor,
  children,
  rotation,
}) => {
  const phase = useRenderPhase();
  const solver = useSolver();
  if (rotation !== undefined && typeof rotation === 'string' && !solver) {
    throw new Error(`Cannot resolve reference "${rotation}": no SolverProvider found.`);
  }
  const rot = rotation !== undefined
    ? (typeof rotation === 'number' ? rotation : (solver ? solver.resolve(rotation, id, id) : undefined))
    : undefined;
  const transform = rotation
    ? `rotate(${rot ?? rotation}, ${x}, ${y})`
    : undefined;

  if (solver && id) {
    solver.register(id, {
      x,
      y,
      centerX: x,
      centerY: y,
      center: { x, y },
      rotation: rot ?? 0,
    });
  }

  if (phase === 'register') {
    return null;
  }

  return (
    <text
      id={id}
      x={x}
      y={y}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
      fill={fill}
      textAnchor={textAnchor}
      transform={transform}
    >
      {children}
    </text>
  );
};
