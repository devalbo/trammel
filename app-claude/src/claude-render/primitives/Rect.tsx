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
  rotation?: number;
}

export const Rect: React.FC<RectProps> = ({
  id,
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  rx,
  ry,
  fill,
  stroke,
  strokeWidth,
  rotation,
}) => {
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
