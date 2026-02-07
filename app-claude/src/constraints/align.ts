import type { Point, Rect, Circle, RectEdge } from './types';
import { rectCenter, circleCenter } from './query';

function getCenter(shape: Rect | Circle): Point {
  return 'width' in shape ? rectCenter(shape) : circleCenter(shape);
}

export function alignCenterX(a: Rect | Circle, b: Rect | Circle): Point {
  const ac = getCenter(a);
  const bc = getCenter(b);
  return { x: ac.x, y: bc.y };
}

export function alignCenterY(a: Rect | Circle, b: Rect | Circle): Point {
  const ac = getCenter(a);
  const bc = getCenter(b);
  return { x: bc.x, y: ac.y };
}

function getEdgeCoord(rect: Rect, edge: RectEdge): number {
  switch (edge) {
    case 'top': return rect.y;
    case 'bottom': return rect.y + rect.height;
    case 'left': return rect.x;
    case 'right': return rect.x + rect.width;
  }
}

export function alignEdge(
  a: Rect,
  aEdge: RectEdge,
  b: Rect,
  bEdge: RectEdge,
): Point {
  const aCoord = getEdgeCoord(a, aEdge);
  const bCoord = getEdgeCoord(b, bEdge);
  const isHorizontal = bEdge === 'top' || bEdge === 'bottom';
  if (isHorizontal) {
    return { x: b.x, y: b.y + (aCoord - bCoord) };
  }
  return { x: b.x + (aCoord - bCoord), y: b.y };
}

export function alignFlush(
  a: Rect,
  aEdge: RectEdge,
  b: Rect,
  bEdge: RectEdge,
): number {
  return getEdgeCoord(a, aEdge) - getEdgeCoord(b, bEdge);
}
