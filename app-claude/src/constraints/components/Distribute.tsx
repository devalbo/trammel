import React from 'react';
import type { Point, Line } from '../types';
import { lineLength, lineAngle } from '../query';

type Props = {
  count: number;
  along: Line;
  itemSize: number;
  children: (pos: Point, index: number) => React.ReactNode;
};

export function Distribute({ count, along, itemSize, children }: Props) {
  if (count <= 0) return null;
  const total = lineLength(along);
  const gap = (total - count * itemSize) / (count + 1);
  const angle = lineAngle(along);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const t = gap + i * (itemSize + gap) + itemSize / 2;
        const pos: Point = {
          x: along.from.x + t * cos,
          y: along.from.y + t * sin,
        };
        return <React.Fragment key={i}>{children(pos, i)}</React.Fragment>;
      })}
    </>
  );
}
