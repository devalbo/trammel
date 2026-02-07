import React from 'react';
import type { Rect, Circle } from '../types';
import { rectCenter, circleCenter } from '../query';

type Props = {
  reference: Rect | Circle;
  children: React.ReactNode;
};

export function AlignCenter({ reference, children }: Props) {
  const center = 'width' in reference ? rectCenter(reference) : circleCenter(reference);
  return <g transform={`translate(${center.x}, ${center.y})`}>{children}</g>;
}
