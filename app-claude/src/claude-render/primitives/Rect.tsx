import React from 'react';

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
}

export const Rect: React.FC<RectProps> = ({
  id,
  x,
  y,
  width,
  height,
  rx,
  ry,
  fill,
  stroke,
  strokeWidth,
}) => (
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
  />
);
