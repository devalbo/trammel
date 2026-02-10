import React from 'react';

export interface CircleProps {
  id?: string;
  centerX?: number;
  centerY?: number;
  r?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
}

export const Circle: React.FC<CircleProps> = ({
  id,
  centerX = 0,
  centerY = 0,
  r,
  fill,
  stroke,
  strokeWidth,
  rotation,
}) => {
  const transform = rotation
    ? `rotate(${rotation}, ${centerX}, ${centerY})`
    : undefined;

  return (
    <circle
      id={id}
      cx={centerX}
      cy={centerY}
      r={r}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={transform}
    />
  );
};
