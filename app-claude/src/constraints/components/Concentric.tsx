import React from 'react';
import type { Circle, Rect } from '../types';
import { rectCenter, circleCenter } from '../query';

type Props = {
  reference: Circle | Rect;
  children: React.ReactNode;
};

export function Concentric({ reference, children }: Props) {
  const center = 'width' in reference ? rectCenter(reference) : circleCenter(reference);
  return <g transform={`translate(${center.x}, ${center.y})`}>{children}</g>;
}
