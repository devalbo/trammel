import type { Circle, Point, Rect, RectCorner } from './types';

type RectInset =
  | number
  | { top: number; right: number; bottom: number; left: number };

function rectCenter(rect: Rect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

function circleCenter(circle: Circle): Point {
  return { x: circle.cx, y: circle.cy };
}

function rectCorner(rect: Rect, corner: RectCorner): Point {
  switch (corner) {
    case 'topLeft':
      return { x: rect.x, y: rect.y };
    case 'topRight':
      return { x: rect.x + rect.width, y: rect.y };
    case 'bottomLeft':
      return { x: rect.x, y: rect.y + rect.height };
    case 'bottomRight':
      return { x: rect.x + rect.width, y: rect.y + rect.height };
    default:
      return { x: rect.x, y: rect.y };
  }
}

function insetRect(rect: Rect, inset: RectInset): Rect {
  if (typeof inset === 'number') {
    return {
      x: rect.x + inset,
      y: rect.y + inset,
      width: rect.width - inset * 2,
      height: rect.height - inset * 2,
    };
  }
  return {
    x: rect.x + inset.left,
    y: rect.y + inset.top,
    width: rect.width - inset.left - inset.right,
    height: rect.height - inset.top - inset.bottom,
  };
}

function alignCenterX(a: Rect | Circle, b: Rect | Circle): Point {
  const aCenter = 'width' in a ? rectCenter(a) : circleCenter(a);
  const bCenter = 'width' in b ? rectCenter(b) : circleCenter(b);
  return { x: aCenter.x, y: bCenter.y };
}

function alignCenterY(a: Rect | Circle, b: Rect | Circle): Point {
  const aCenter = 'width' in a ? rectCenter(a) : circleCenter(a);
  const bCenter = 'width' in b ? rectCenter(b) : circleCenter(b);
  return { x: bCenter.x, y: aCenter.y };
}

function distributeEvenly(count: number, itemWidth: number, totalWidth: number): number[] {
  if (count <= 0) return [];
  const gap = (totalWidth - count * itemWidth) / (count + 1);
  return Array.from({ length: count }, (_, i) => gap + i * (itemWidth + gap));
}

export {
  rectCenter,
  rectCorner,
  insetRect,
  alignCenterX,
  alignCenterY,
  distributeEvenly,
};
