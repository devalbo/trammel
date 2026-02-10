import React from 'react';

export interface TriangleProps {
  id?: string;
  kind?: 'equilateral' | 'right' | 'isosceles' | 'scalene';
  sideLength?: number;
  x?: number;
  y?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
}

interface Vertices {
  points: string;
  cx: number;
  cy: number;
}

function computeEquilateral(sideLength: number, x: number, y: number): Vertices {
  const height = sideLength * Math.sqrt(3) / 2;
  const v0x = x;
  const v0y = y + height;
  const v1x = x + sideLength;
  const v1y = y + height;
  const v2x = x + sideLength / 2;
  const v2y = y;
  return {
    points: `${round(v0x)},${round(v0y)} ${round(v1x)},${round(v1y)} ${round(v2x)},${round(v2y)}`,
    cx: round((v0x + v1x + v2x) / 3),
    cy: round((v0y + v1y + v2y) / 3),
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export const Triangle: React.FC<TriangleProps> = ({
  id,
  kind = 'equilateral',
  sideLength = 80,
  x = 0,
  y = 0,
  fill,
  stroke,
  strokeWidth,
  rotation,
}) => {
  let verts: Vertices;
  if (kind === 'equilateral') {
    verts = computeEquilateral(sideLength, x, y);
  } else {
    // Other kinds will be implemented later
    verts = computeEquilateral(sideLength, x, y);
  }

  const transform = rotation
    ? `rotate(${rotation}, ${verts.cx}, ${verts.cy})`
    : undefined;

  return (
    <polygon
      id={id}
      points={verts.points}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={transform}
    />
  );
};
