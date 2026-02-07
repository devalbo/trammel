import type { Point, Line, Circle, Rect } from './types';
import { lineAngle } from './query';

function reflectPoint(point: Point, axis: Line): Point {
  const dx = axis.to.x - axis.from.x;
  const dy = axis.to.y - axis.from.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return point;
  const t = ((point.x - axis.from.x) * dx + (point.y - axis.from.y) * dy) / lenSq;
  const projX = axis.from.x + t * dx;
  const projY = axis.from.y + t * dy;
  return {
    x: 2 * projX - point.x,
    y: 2 * projY - point.y,
  };
}

export function mirrorPoint(point: Point, axis: Line): Point {
  return reflectPoint(point, axis);
}

export function mirrorLine(line: Line, axis: Line): Line {
  return {
    from: reflectPoint(line.from, axis),
    to: reflectPoint(line.to, axis),
  };
}

export function mirrorCircle(circle: Circle, axis: Line): Circle {
  const center = reflectPoint({ x: circle.cx, y: circle.cy }, axis);
  return { cx: center.x, cy: center.y, r: circle.r };
}

export function mirrorRect(rect: Rect, axis: Line): Rect {
  const tl = reflectPoint({ x: rect.x, y: rect.y }, axis);
  const br = reflectPoint({ x: rect.x + rect.width, y: rect.y + rect.height }, axis);
  const x = Math.min(tl.x, br.x);
  const y = Math.min(tl.y, br.y);
  return {
    x,
    y,
    width: Math.abs(br.x - tl.x),
    height: Math.abs(br.y - tl.y),
  };
}

export function mirrorPointAbout(point: Point, center: Point): Point {
  return {
    x: 2 * center.x - point.x,
    y: 2 * center.y - point.y,
  };
}
