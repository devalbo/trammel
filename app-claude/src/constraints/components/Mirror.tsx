import React from 'react';
import type { Line } from '../types';
import { lineAngle } from '../query';

type Props = {
  axis: Line;
  children: React.ReactNode;
};

export function Mirror({ axis, children }: Props) {
  const mx = (axis.from.x + axis.to.x) / 2;
  const my = (axis.from.y + axis.to.y) / 2;
  const angle = lineAngle(axis);
  const angleDeg = (angle * 180) / Math.PI;

  return (
    <g>
      {children}
      <g transform={`translate(${mx}, ${my}) rotate(${angleDeg}) scale(1, -1) rotate(${-angleDeg}) translate(${-mx}, ${-my})`}>
        {children}
      </g>
    </g>
  );
}
