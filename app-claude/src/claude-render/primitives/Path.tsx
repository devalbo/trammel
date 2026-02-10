import React from 'react';

export interface PathProps {
  id?: string;
  d?: string;
  normalized?: boolean;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
}

/** Extract numeric coordinates from a path `d` string and return the bounding box center. */
function pathCenter(d: string): { cx: number; cy: number } {
  const nums = d.match(/-?\d+(?:\.\d+)?/g);
  if (!nums || nums.length < 2) return { cx: 0, cy: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = Number(nums[i]);
    const y = Number(nums[i + 1]);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

export const Path: React.FC<PathProps> = ({
  id,
  d,
  fill,
  stroke,
  strokeWidth,
  rotation,
}) => {
  const transform = rotation && d
    ? (() => { const { cx, cy } = pathCenter(d); return `rotate(${rotation}, ${cx}, ${cy})`; })()
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
