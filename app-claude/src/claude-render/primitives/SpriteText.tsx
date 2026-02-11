import React from 'react';
import { useRenderPhase } from './SolverContext';

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
  rotation?: number;
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
  const transform = rotation
    ? `rotate(${rotation}, ${x}, ${y})`
    : undefined;

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
