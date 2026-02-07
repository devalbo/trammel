import React from 'react';
import type { Rect } from '../types';
import { insetRect } from '../offset';

type Props = {
  rect: Rect;
  inset: number | { top: number; right: number; bottom: number; left: number };
  children: (innerRect: Rect) => React.ReactNode;
};

export function Inset({ rect, inset, children }: Props) {
  const inner = insetRect(rect, inset);
  return <>{children(inner)}</>;
}
