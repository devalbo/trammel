import type { Point, Rect, Circle, Line, RectEdge, RectCorner } from './types';

export function rectCenter(rect: Rect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

export function rectCorner(rect: Rect, corner: RectCorner): Point {
  switch (corner) {
    case 'topLeft':
      return { x: rect.x, y: rect.y };
    case 'topRight':
      return { x: rect.x + rect.width, y: rect.y };
    case 'bottomLeft':
      return { x: rect.x, y: rect.y + rect.height };
    case 'bottomRight':
      return { x: rect.x + rect.width, y: rect.y + rect.height };
  }
}

export function rectEdgeMidpoint(rect: Rect, edge: RectEdge): Point {
  switch (edge) {
    case 'top':
      return { x: rect.x + rect.width / 2, y: rect.y };
    case 'bottom':
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height };
    case 'left':
      return { x: rect.x, y: rect.y + rect.height / 2 };
    case 'right':
      return { x: rect.x + rect.width, y: rect.y + rect.height / 2 };
  }
}

export function rectEdge(rect: Rect, edge: RectEdge): Line {
  switch (edge) {
    case 'top':
      return { from: { x: rect.x, y: rect.y }, to: { x: rect.x + rect.width, y: rect.y } };
    case 'bottom':
      return { from: { x: rect.x, y: rect.y + rect.height }, to: { x: rect.x + rect.width, y: rect.y + rect.height } };
    case 'left':
      return { from: { x: rect.x, y: rect.y }, to: { x: rect.x, y: rect.y + rect.height } };
    case 'right':
      return { from: { x: rect.x + rect.width, y: rect.y }, to: { x: rect.x + rect.width, y: rect.y + rect.height } };
  }
}

export function circleCenter(circle: Circle): Point {
  return { x: circle.cx, y: circle.cy };
}

export function circleBoundingBox(circle: Circle): Rect {
  return {
    x: circle.cx - circle.r,
    y: circle.cy - circle.r,
    width: circle.r * 2,
    height: circle.r * 2,
  };
}

export function lineLength(line: Line): number {
  const dx = line.to.x - line.from.x;
  const dy = line.to.y - line.from.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function lineAngle(line: Line): number {
  return Math.atan2(line.to.y - line.from.y, line.to.x - line.from.x);
}

export function lineDirection(line: Line): Point {
  const len = lineLength(line);
  if (len === 0) return { x: 0, y: 0 };
  return { x: (line.to.x - line.from.x) / len, y: (line.to.y - line.from.y) / len };
}

export function distanceBetween(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distancePointToLine(point: Point, line: Line): number {
  const dx = line.to.x - line.from.x;
  const dy = line.to.y - line.from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return distanceBetween(point, line.from);
  return Math.abs(dx * (line.from.y - point.y) - dy * (line.from.x - point.x)) / len;
}

export function distancePointToCircle(point: Point, circle: Circle): number {
  return Math.abs(distanceBetween(point, { x: circle.cx, y: circle.cy }) - circle.r);
}

export function lineLineIntersection(a: Line, b: Line): Point | null {
  const x1 = a.from.x, y1 = a.from.y, x2 = a.to.x, y2 = a.to.y;
  const x3 = b.from.x, y3 = b.from.y, x4 = b.to.x, y4 = b.to.y;
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return null;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
}

export function lineCircleIntersection(line: Line, circle: Circle): Point[] {
  const dx = line.to.x - line.from.x;
  const dy = line.to.y - line.from.y;
  const fx = line.from.x - circle.cx;
  const fy = line.from.y - circle.cy;
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - circle.r * circle.r;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  const results: Point[] = [];
  const sqrtDisc = Math.sqrt(disc);
  for (const sign of [-1, 1]) {
    const t = (-b + sign * sqrtDisc) / (2 * a);
    if (t >= 0 && t <= 1) {
      results.push({ x: line.from.x + t * dx, y: line.from.y + t * dy });
    }
  }
  return results;
}

export function circleCircleIntersection(a: Circle, b: Circle): Point[] {
  const d = distanceBetween({ x: a.cx, y: a.cy }, { x: b.cx, y: b.cy });
  if (d > a.r + b.r || d < Math.abs(a.r - b.r) || d === 0) return [];
  const aa = (a.r * a.r - b.r * b.r + d * d) / (2 * d);
  const h = Math.sqrt(a.r * a.r - aa * aa);
  const px = a.cx + aa * (b.cx - a.cx) / d;
  const py = a.cy + aa * (b.cy - a.cy) / d;
  const rx = -h * (b.cy - a.cy) / d;
  const ry = h * (b.cx - a.cx) / d;
  return [
    { x: px + rx, y: py + ry },
    { x: px - rx, y: py - ry },
  ];
}

export function lineRectIntersection(line: Line, rect: Rect): Point[] {
  const edges: Line[] = [
    rectEdge(rect, 'top'),
    rectEdge(rect, 'bottom'),
    rectEdge(rect, 'left'),
    rectEdge(rect, 'right'),
  ];
  const results: Point[] = [];
  for (const edge of edges) {
    const pt = lineLineIntersection(line, edge);
    if (pt) {
      const minX = Math.min(edge.from.x, edge.to.x) - 1e-10;
      const maxX = Math.max(edge.from.x, edge.to.x) + 1e-10;
      const minY = Math.min(edge.from.y, edge.to.y) - 1e-10;
      const maxY = Math.max(edge.from.y, edge.to.y) + 1e-10;
      if (pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY) {
        results.push(pt);
      }
    }
  }
  return results;
}
