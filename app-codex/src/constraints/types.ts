export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type Circle = { cx: number; cy: number; r: number };
export type Line = { from: Point; to: Point };
export type Arc = {
  cx: number;
  cy: number;
  r: number;
  startAngle: number;
  endAngle: number;
};

export type RectCorner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
export type RectEdge = 'top' | 'bottom' | 'left' | 'right';
