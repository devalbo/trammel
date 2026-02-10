import React from 'react';

export interface ArcProps {
  id?: string;
  center?: { x: number; y: number };
  r?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  // Angles in degrees, 0 = right (+x), counterclockwise positive (standard math)
  // SVG y-down: negate sin
  const startRad = toRad(startAngle);
  const endRad = toRad(endAngle);

  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy - r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy - r * Math.sin(endRad);

  let sweep = endAngle - startAngle;
  if (sweep < 0) sweep += 360;
  const largeArc = sweep > 180 ? 1 : 0;
  // SVG sweep-flag 0 = counterclockwise in SVG coords (which is clockwise in math coords)
  // We want counterclockwise in math = clockwise in SVG = sweep-flag 0
  const sweepFlag = 0;

  return `M ${round(x1)} ${round(y1)} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${round(x2)} ${round(y2)}`;
}

export const Arc: React.FC<ArcProps> = ({
  id,
  center = { x: 0, y: 0 },
  r = 60,
  startAngle = 0,
  endAngle = 270,
  fill,
  stroke,
  strokeWidth,
  rotation,
}) => {
  const d = arcPath(center.x, center.y, r, startAngle, endAngle);
  const transform = rotation
    ? `rotate(${rotation}, ${center.x}, ${center.y})`
    : undefined;

  return (
    <path
      id={id}
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={transform}
    />
  );
};
