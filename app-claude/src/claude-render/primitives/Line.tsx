import React from 'react';

export interface Point2D {
  x: number;
  y: number;
}

export interface LineProps {
  id?: string;
  start?: Point2D;
  end?: Point2D;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
}

export const Line: React.FC<LineProps> = ({
  id,
  start,
  end,
  stroke,
  strokeWidth,
  rotation,
}) => {
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
