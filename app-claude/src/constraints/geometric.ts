import type { Point, Rect, Circle, Arc, Line, RectCorner, RectEdge } from './types';
import { rectCenter, rectCorner as queryRectCorner, rectEdgeMidpoint, circleCenter, lineAngle, lineLength, distanceBetween } from './query';

export function coincident(a: Point, _b: Point): Point {
  return { x: a.x, y: a.y };
}

export function centerAtPoint(shape: Circle | Rect, point: Point): Circle | Rect {
  if ('r' in shape) {
    return { cx: point.x, cy: point.y, r: shape.r };
  }
  return { x: point.x - shape.width / 2, y: point.y - shape.height / 2, width: shape.width, height: shape.height };
}

export function centerAtCorner(shape: Circle, rect: Rect, corner: RectCorner): Circle {
  const pt = queryRectCorner(rect, corner);
  return { cx: pt.x, cy: pt.y, r: shape.r };
}

export function centerAtEdgeMidpoint(shape: Circle, rect: Rect, edge: RectEdge): Circle {
  const pt = rectEdgeMidpoint(rect, edge);
  return { cx: pt.x, cy: pt.y, r: shape.r };
}

export function concentric(a: Circle | Arc, b: Circle | Arc): Circle | Arc {
  if ('r' in b && !('startAngle' in b)) {
    return { cx: a.cx, cy: a.cy, r: (b as Circle).r };
  }
  const bArc = b as Arc;
  return { cx: a.cx, cy: a.cy, r: bArc.r, startAngle: bArc.startAngle, endAngle: bArc.endAngle };
}

export function collinear(fixed: Line, movable: Line): Line {
  const angle = lineAngle(fixed);
  const len = lineLength(movable);
  const mid = {
    x: (movable.from.x + movable.to.x) / 2,
    y: (movable.from.y + movable.to.y) / 2,
  };
  // Project midpoint onto the fixed line
  const fx = fixed.from.x, fy = fixed.from.y;
  const dx = fixed.to.x - fx, dy = fixed.to.y - fy;
  const fLen = Math.sqrt(dx * dx + dy * dy);
  if (fLen === 0) return movable;
  const t = ((mid.x - fx) * dx + (mid.y - fy) * dy) / (fLen * fLen);
  const projX = fx + t * dx;
  const projY = fy + t * dy;
  const halfLen = len / 2;
  const ux = dx / fLen;
  const uy = dy / fLen;
  return {
    from: { x: projX - halfLen * ux, y: projY - halfLen * uy },
    to: { x: projX + halfLen * ux, y: projY + halfLen * uy },
  };
}

export function parallel(fixed: Line, movable: Line, offset?: number): Line {
  const angle = lineAngle(fixed);
  const len = lineLength(movable);
  const mid = {
    x: (movable.from.x + movable.to.x) / 2,
    y: (movable.from.y + movable.to.y) / 2,
  };
  if (offset !== undefined) {
    const perpAngle = angle + Math.PI / 2;
    mid.x += offset * Math.cos(perpAngle);
    mid.y += offset * Math.sin(perpAngle);
  }
  const halfLen = len / 2;
  return {
    from: { x: mid.x - halfLen * Math.cos(angle), y: mid.y - halfLen * Math.sin(angle) },
    to: { x: mid.x + halfLen * Math.cos(angle), y: mid.y + halfLen * Math.sin(angle) },
  };
}

export function parallelThrough(fixed: Line, point: Point, length: number): Line {
  const angle = lineAngle(fixed);
  const halfLen = length / 2;
  return {
    from: { x: point.x - halfLen * Math.cos(angle), y: point.y - halfLen * Math.sin(angle) },
    to: { x: point.x + halfLen * Math.cos(angle), y: point.y + halfLen * Math.sin(angle) },
  };
}

export function perpendicular(fixed: Line, movable: Line): Line {
  const angle = lineAngle(fixed) + Math.PI / 2;
  const len = lineLength(movable);
  const mid = {
    x: (movable.from.x + movable.to.x) / 2,
    y: (movable.from.y + movable.to.y) / 2,
  };
  const halfLen = len / 2;
  return {
    from: { x: mid.x - halfLen * Math.cos(angle), y: mid.y - halfLen * Math.sin(angle) },
    to: { x: mid.x + halfLen * Math.cos(angle), y: mid.y + halfLen * Math.sin(angle) },
  };
}

export function perpendicularThrough(line: Line, point: Point, length: number): Line {
  const angle = lineAngle(line) + Math.PI / 2;
  const halfLen = length / 2;
  return {
    from: { x: point.x - halfLen * Math.cos(angle), y: point.y - halfLen * Math.sin(angle) },
    to: { x: point.x + halfLen * Math.cos(angle), y: point.y + halfLen * Math.sin(angle) },
  };
}

export function perpendicularAt(line: Line, t: number, length: number): Line {
  const px = line.from.x + t * (line.to.x - line.from.x);
  const py = line.from.y + t * (line.to.y - line.from.y);
  return perpendicularThrough(line, { x: px, y: py }, length);
}

export function horizontal(line: Line): Line {
  const y = (line.from.y + line.to.y) / 2;
  return { from: { x: line.from.x, y }, to: { x: line.to.x, y } };
}

export function vertical(line: Line): Line {
  const x = (line.from.x + line.to.x) / 2;
  return { from: { x, y: line.from.y }, to: { x, y: line.to.y } };
}

export function horizontalDistance(a: Point, b: Point): number {
  return Math.abs(b.x - a.x);
}

export function verticalDistance(a: Point, b: Point): number {
  return Math.abs(b.y - a.y);
}

export function midpoint(a: Point | Line, b?: Point): Point {
  if ('from' in a) {
    const line = a as Line;
    return { x: (line.from.x + line.to.x) / 2, y: (line.from.y + line.to.y) / 2 };
  }
  const p1 = a as Point;
  const p2 = b!;
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

export function nearestPointOnLine(point: Point, line: Line): Point {
  const dx = line.to.x - line.from.x;
  const dy = line.to.y - line.from.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { x: line.from.x, y: line.from.y };
  const t = Math.max(0, Math.min(1,
    ((point.x - line.from.x) * dx + (point.y - line.from.y) * dy) / lenSq
  ));
  return { x: line.from.x + t * dx, y: line.from.y + t * dy };
}

export function nearestPointOnCircle(point: Point, circle: Circle): Point {
  const dx = point.x - circle.cx;
  const dy = point.y - circle.cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return { x: circle.cx + circle.r, y: circle.cy };
  return {
    x: circle.cx + (dx / dist) * circle.r,
    y: circle.cy + (dy / dist) * circle.r,
  };
}

export function pointOnLineAt(line: Line, t: number): Point {
  return {
    x: line.from.x + t * (line.to.x - line.from.x),
    y: line.from.y + t * (line.to.y - line.from.y),
  };
}

export function pointOnCircleAt(circle: Circle, angle: number): Point {
  return {
    x: circle.cx + circle.r * Math.cos(angle),
    y: circle.cy + circle.r * Math.sin(angle),
  };
}

export function pointOnArcAt(arc: Arc, t: number): Point {
  const angle = arc.startAngle + t * (arc.endAngle - arc.startAngle);
  return {
    x: arc.cx + arc.r * Math.cos(angle),
    y: arc.cy + arc.r * Math.sin(angle),
  };
}

export function angleBetween(a: Line, b: Line): number {
  return lineAngle(b) - lineAngle(a);
}

export function rotateToAngle(fixed: Line, movable: Line, angle: number): Line {
  const targetAngle = lineAngle(fixed) + angle;
  const len = lineLength(movable);
  const mid = {
    x: (movable.from.x + movable.to.x) / 2,
    y: (movable.from.y + movable.to.y) / 2,
  };
  const halfLen = len / 2;
  return {
    from: { x: mid.x - halfLen * Math.cos(targetAngle), y: mid.y - halfLen * Math.sin(targetAngle) },
    to: { x: mid.x + halfLen * Math.cos(targetAngle), y: mid.y + halfLen * Math.sin(targetAngle) },
  };
}
