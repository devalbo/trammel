import React from 'react';

export interface PolygonProps {
  id?: string;
  sides?: number;
  sideLength?: number;
  r?: number;
  centerX?: number;
  centerY?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function computeRegularPolygon(
  sides: number,
  circumradius: number,
  centerX: number,
  centerY: number,
): string {
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    // Flat-bottom orientation: first vertex at angle -π/2 + π/n
    const angle = (2 * Math.PI * i) / sides - Math.PI / 2 + Math.PI / sides;
    const px = centerX + circumradius * Math.cos(angle);
    // SVG y-down: negate sin
    const py = centerY - circumradius * Math.sin(angle);
    points.push(`${round(px)},${round(py)}`);
  }
  return points.join(' ');
}

export const Polygon: React.FC<PolygonProps> = ({
  id,
  sides = 6,
  sideLength,
  r,
  centerX = 0,
  centerY = 0,
  fill,
  stroke,
  strokeWidth,
  rotation,
}) => {
  // r (circumradius) takes precedence; otherwise derive from sideLength
  const circumradius = r ?? (sideLength ?? 40) / (2 * Math.sin(Math.PI / sides));
  const points = computeRegularPolygon(sides, circumradius, centerX, centerY);
  const transform = rotation
    ? `rotate(${rotation}, ${centerX}, ${centerY})`
    : undefined;

  return (
    <polygon
      id={id}
      points={points}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={transform}
    />
  );
};
