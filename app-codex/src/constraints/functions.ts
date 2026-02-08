import type {
  Arc,
  Circle,
  Line,
  Point,
  Rect,
  RectCorner,
  RectEdge,
} from './types';

type RectInset =
  | number
  | { top: number; right: number; bottom: number; left: number };

function rectCenter(rect: Rect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

function circleCenter(circle: Circle): Point {
  return { x: circle.cx, y: circle.cy };
}

function circleBoundingBox(circle: Circle): Rect {
  return {
    x: circle.cx - circle.r,
    y: circle.cy - circle.r,
    width: circle.r * 2,
    height: circle.r * 2,
  };
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

function rectEdge(rect: Rect, edge: RectEdge): Line {
  switch (edge) {
    case 'top':
      return { from: { x: rect.x, y: rect.y }, to: { x: rect.x + rect.width, y: rect.y } };
    case 'bottom':
      return {
        from: { x: rect.x, y: rect.y + rect.height },
        to: { x: rect.x + rect.width, y: rect.y + rect.height },
      };
    case 'left':
      return { from: { x: rect.x, y: rect.y }, to: { x: rect.x, y: rect.y + rect.height } };
    case 'right':
      return {
        from: { x: rect.x + rect.width, y: rect.y },
        to: { x: rect.x + rect.width, y: rect.y + rect.height },
      };
    default:
      return rectEdge(rect, 'top');
  }
}

function rectEdgeMidpoint(rect: Rect, edge: RectEdge): Point {
  const e = rectEdge(rect, edge);
  return midpoint(e);
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

function lineLength(line: Line): number {
  return distanceBetween(line.from, line.to);
}

function lineAngle(line: Line): number {
  return Math.atan2(line.to.y - line.from.y, line.to.x - line.from.x);
}

function lineDirection(line: Line): Point {
  const len = lineLength(line);
  if (len === 0) return { x: 0, y: 0 };
  return { x: (line.to.x - line.from.x) / len, y: (line.to.y - line.from.y) / len };
}

function distanceBetween(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function distancePointToLine(point: Point, line: Line): number {
  const proj = nearestPointOnLine(point, line);
  return distanceBetween(point, proj);
}

function distancePointToCircle(point: Point, circle: Circle): number {
  return Math.abs(distanceBetween(point, circleCenter(circle)) - circle.r);
}

function lineLineIntersection(a: Line, b: Line): Point | null {
  const x1 = a.from.x;
  const y1 = a.from.y;
  const x2 = a.to.x;
  const y2 = a.to.y;
  const x3 = b.from.x;
  const y3 = b.from.y;
  const x4 = b.to.x;
  const y4 = b.to.y;
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denom === 0) return null;
  const px =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
  const py =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;
  return { x: px, y: py };
}

function lineCircleIntersection(line: Line, circle: Circle): Point[] {
  const { cx, cy, r } = circle;
  const dx = line.to.x - line.from.x;
  const dy = line.to.y - line.from.y;
  const fx = line.from.x - cx;
  const fy = line.from.y - cy;
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];
  const sqrt = Math.sqrt(discriminant);
  const t1 = (-b - sqrt) / (2 * a);
  const t2 = (-b + sqrt) / (2 * a);
  const p1 = { x: line.from.x + dx * t1, y: line.from.y + dy * t1 };
  if (discriminant === 0) return [p1];
  const p2 = { x: line.from.x + dx * t2, y: line.from.y + dy * t2 };
  return [p1, p2];
}

function circleCircleIntersection(a: Circle, b: Circle): Point[] {
  const d = distanceBetween(circleCenter(a), circleCenter(b));
  if (d === 0 || d > a.r + b.r || d < Math.abs(a.r - b.r)) return [];
  const aLen = (a.r * a.r - b.r * b.r + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(a.r * a.r - aLen * aLen, 0));
  const p2 = {
    x: a.cx + (aLen * (b.cx - a.cx)) / d,
    y: a.cy + (aLen * (b.cy - a.cy)) / d,
  };
  const rx = -(b.cy - a.cy) * (h / d);
  const ry = (b.cx - a.cx) * (h / d);
  if (h === 0) return [p2];
  return [
    { x: p2.x + rx, y: p2.y + ry },
    { x: p2.x - rx, y: p2.y - ry },
  ];
}

function lineRectIntersection(line: Line, rect: Rect): Point[] {
  const edges: Line[] = [
    rectEdge(rect, 'top'),
    rectEdge(rect, 'right'),
    rectEdge(rect, 'bottom'),
    rectEdge(rect, 'left'),
  ];
  const points: Point[] = [];
  for (const edge of edges) {
    const hit = lineLineIntersection(line, edge);
    if (!hit) continue;
    const within =
      Math.min(edge.from.x, edge.to.x) - 1e-9 <= hit.x &&
      hit.x <= Math.max(edge.from.x, edge.to.x) + 1e-9 &&
      Math.min(edge.from.y, edge.to.y) - 1e-9 <= hit.y &&
      hit.y <= Math.max(edge.from.y, edge.to.y) + 1e-9;
    if (within) points.push(hit);
  }
  return points;
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

function alignEdge(a: Rect, aEdge: RectEdge, b: Rect, bEdge: RectEdge): Point {
  const aLine = rectEdge(a, aEdge);
  const bLine = rectEdge(b, bEdge);
  const dx = aLine.from.x - bLine.from.x;
  const dy = aLine.from.y - bLine.from.y;
  return { x: b.x + dx, y: b.y + dy };
}

function alignFlush(a: Rect, aEdge: RectEdge, b: Rect, bEdge: RectEdge): number {
  const aLine = rectEdge(a, aEdge);
  const bLine = rectEdge(b, bEdge);
  if (aEdge === 'left' || aEdge === 'right') {
    return aLine.from.x - bLine.from.x;
  }
  return aLine.from.y - bLine.from.y;
}

function distributeEvenly(count: number, itemWidth: number, totalWidth: number): number[] {
  if (count <= 0) return [];
  const gap = (totalWidth - count * itemWidth) / (count + 1);
  return Array.from({ length: count }, (_, i) => gap + i * (itemWidth + gap));
}

function distributeAlongEdge(rect: Rect, edge: RectEdge, count: number): Point[] {
  if (count <= 0) return [];
  const line = rectEdge(rect, edge);
  return Array.from({ length: count }, (_, i) => pointOnLineAt(line, (i + 1) / (count + 1)));
}

function gridPositions(
  rows: number,
  cols: number,
  cellWidth: number,
  cellHeight: number,
  gapX = 0,
  gapY = 0,
  origin: Point = { x: 0, y: 0 }
): Point[] {
  const points: Point[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      points.push({
        x: origin.x + c * (cellWidth + gapX),
        y: origin.y + r * (cellHeight + gapY),
      });
    }
  }
  return points;
}

function distributeOnCircle(center: Point, radius: number, count: number, startAngle = 0): Point[] {
  if (count <= 0) return [];
  const step = (Math.PI * 2) / count;
  return Array.from({ length: count }, (_, i) => pointOnCircleAt({ cx: center.x, cy: center.y, r: radius }, startAngle + i * step));
}

function offsetPoint(point: Point, dx: number, dy: number): Point {
  return { x: point.x + dx, y: point.y + dy };
}

function parallelLine(line: Line, offset: number): Line {
  const dir = lineDirection(line);
  const normal = { x: -dir.y, y: dir.x };
  return {
    from: { x: line.from.x + normal.x * offset, y: line.from.y + normal.y * offset },
    to: { x: line.to.x + normal.x * offset, y: line.to.y + normal.y * offset },
  };
}

function offsetCircle(circle: Circle, dr: number): Circle {
  return { ...circle, r: circle.r + dr };
}

function coincident(a: Point, _b: Point): Point {
  return { x: a.x, y: a.y };
}

function centerAtPoint(shape: Circle | Rect, point: Point): Circle | Rect {
  if ('r' in shape) {
    return { ...shape, cx: point.x, cy: point.y };
  }
  return {
    ...shape,
    x: point.x - shape.width / 2,
    y: point.y - shape.height / 2,
  };
}

function centerAtCorner(circle: Circle, rect: Rect, corner: RectCorner): Circle {
  const p = rectCorner(rect, corner);
  return { ...circle, cx: p.x, cy: p.y };
}

function centerAtEdgeMidpoint(circle: Circle, rect: Rect, edge: RectEdge): Circle {
  const p = rectEdgeMidpoint(rect, edge);
  return { ...circle, cx: p.x, cy: p.y };
}

function concentric(a: Circle | Arc, b: Circle | Arc): Circle | Arc {
  if ('r' in b) {
    return { ...b, cx: a.cx, cy: a.cy };
  }
  return { ...b, cx: a.cx, cy: a.cy };
}

function collinear(fixed: Line, movable: Line): Line {
  const dir = lineDirection(fixed);
  const len = lineLength(movable);
  const start = nearestPointOnLine(movable.from, fixed);
  return { from: start, to: { x: start.x + dir.x * len, y: start.y + dir.y * len } };
}

function parallel(fixed: Line, movable: Line, offset = 0): Line {
  const dir = lineDirection(fixed);
  const len = lineLength(movable);
  const normal = { x: -dir.y, y: dir.x };
  const start = {
    x: movable.from.x + normal.x * offset,
    y: movable.from.y + normal.y * offset,
  };
  return { from: start, to: { x: start.x + dir.x * len, y: start.y + dir.y * len } };
}

function parallelThrough(fixed: Line, point: Point, length: number): Line {
  const dir = lineDirection(fixed);
  return { from: point, to: { x: point.x + dir.x * length, y: point.y + dir.y * length } };
}

function perpendicular(fixed: Line, movable: Line): Line {
  const dir = lineDirection(fixed);
  const perp = { x: -dir.y, y: dir.x };
  const len = lineLength(movable);
  return { from: movable.from, to: { x: movable.from.x + perp.x * len, y: movable.from.y + perp.y * len } };
}

function perpendicularThrough(line: Line, point: Point, length: number): Line {
  const dir = lineDirection(line);
  const perp = { x: -dir.y, y: dir.x };
  return { from: point, to: { x: point.x + perp.x * length, y: point.y + perp.y * length } };
}

function perpendicularAt(line: Line, t: number, length: number): Line {
  const p = pointOnLineAt(line, t);
  return perpendicularThrough(line, p, length);
}

function horizontal(line: Line): Line {
  return { from: line.from, to: { x: line.to.x, y: line.from.y } };
}

function vertical(line: Line): Line {
  return { from: line.from, to: { x: line.from.x, y: line.to.y } };
}

function horizontalDistance(a: Point, b: Point): number {
  return Math.abs(b.x - a.x);
}

function verticalDistance(a: Point, b: Point): number {
  return Math.abs(b.y - a.y);
}

function midpoint(a: Line | Point, b?: Point): Point {
  if ('from' in a) {
    return { x: (a.from.x + a.to.x) / 2, y: (a.from.y + a.to.y) / 2 };
  }
  if (!b) return { x: a.x, y: a.y };
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function nearestPointOnLine(point: Point, line: Line): Point {
  const dx = line.to.x - line.from.x;
  const dy = line.to.y - line.from.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { ...line.from };
  const t = ((point.x - line.from.x) * dx + (point.y - line.from.y) * dy) / lenSq;
  return { x: line.from.x + t * dx, y: line.from.y + t * dy };
}

function nearestPointOnCircle(point: Point, circle: Circle): Point {
  const center = circleCenter(circle);
  const angle = Math.atan2(point.y - center.y, point.x - center.x);
  return pointOnCircleAt(circle, angle);
}

function nearestPointOnArc(point: Point, arc: Arc): Point {
  const angle = Math.atan2(point.y - arc.cy, point.x - arc.cx);
  return pointOnArcAt(arc, angleToT(arc, angle));
}

function pointOnLineAt(line: Line, t: number): Point {
  return { x: line.from.x + (line.to.x - line.from.x) * t, y: line.from.y + (line.to.y - line.from.y) * t };
}

function pointOnCircleAt(circle: Circle, angle: number): Point {
  return { x: circle.cx + Math.cos(angle) * circle.r, y: circle.cy + Math.sin(angle) * circle.r };
}

function pointOnArcAt(arc: Arc, t: number): Point {
  const angle = arc.startAngle + (arc.endAngle - arc.startAngle) * t;
  return { x: arc.cx + Math.cos(angle) * arc.r, y: arc.cy + Math.sin(angle) * arc.r };
}

function angleBetween(a: Line, b: Line): number {
  const da = lineDirection(a);
  const db = lineDirection(b);
  const dot = da.x * db.x + da.y * db.y;
  return Math.acos(Math.min(1, Math.max(-1, dot)));
}

function rotateToAngle(fixed: Line, movable: Line, angle: number): Line {
  const baseAngle = lineAngle(fixed);
  const len = lineLength(movable);
  const start = movable.from;
  return {
    from: start,
    to: { x: start.x + Math.cos(baseAngle + angle) * len, y: start.y + Math.sin(baseAngle + angle) * len },
  };
}

function arcInCorner(radius: number, rect: Rect, corner: RectCorner): Arc {
  const c = rectCorner(rect, corner);
  switch (corner) {
    case 'topLeft':
      return { cx: c.x + radius, cy: c.y + radius, r: radius, startAngle: Math.PI, endAngle: 1.5 * Math.PI };
    case 'topRight':
      return { cx: c.x - radius, cy: c.y + radius, r: radius, startAngle: 1.5 * Math.PI, endAngle: 0 };
    case 'bottomRight':
      return { cx: c.x - radius, cy: c.y - radius, r: radius, startAngle: 0, endAngle: 0.5 * Math.PI };
    case 'bottomLeft':
      return { cx: c.x + radius, cy: c.y - radius, r: radius, startAngle: 0.5 * Math.PI, endAngle: Math.PI };
    default:
      return { cx: c.x, cy: c.y, r: radius, startAngle: 0, endAngle: 0 };
  }
}

function arcBetween(from: Point, to: Point, radius: number, direction: 'cw' | 'ccw'): Arc {
  const mid = midpoint(from, to);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d = Math.hypot(dx, dy);
  const h = Math.sqrt(Math.max(radius * radius - (d / 2) * (d / 2), 0));
  const nx = -dy / d;
  const ny = dx / d;
  const sign = direction === 'ccw' ? 1 : -1;
  const cx = mid.x + nx * h * sign;
  const cy = mid.y + ny * h * sign;
  return {
    cx,
    cy,
    r: radius,
    startAngle: Math.atan2(from.y - cy, from.x - cx),
    endAngle: Math.atan2(to.y - cy, to.x - cx),
  };
}

function arcTangentToLines(radius: number, line1: Line, line2: Line): Arc {
  return filletArc(radius, line1, line2);
}

function filletArc(radius: number, edge1: Line, edge2: Line): Arc {
  const intersection = lineLineIntersection(edge1, edge2);
  if (!intersection) {
    return { cx: 0, cy: 0, r: radius, startAngle: 0, endAngle: 0 };
  }
  const a1 = lineAngle(edge1);
  const a2 = lineAngle(edge2);
  const angle = (a1 + a2) / 2;
  const theta = Math.abs(a2 - a1);
  const dist = radius / Math.sin(theta / 2);
  const cx = intersection.x + Math.cos(angle) * dist;
  const cy = intersection.y + Math.sin(angle) * dist;
  const start = pointOnLineAt(edge1, 0.5);
  const end = pointOnLineAt(edge2, 0.5);
  return {
    cx,
    cy,
    r: radius,
    startAngle: Math.atan2(start.y - cy, start.x - cx),
    endAngle: Math.atan2(end.y - cy, end.x - cx),
  };
}

function tangentLineToCircle(circle: Circle, point: Point): Line[] {
  const center = circleCenter(circle);
  const d = distanceBetween(center, point);
  if (d < circle.r) return [];
  const base = Math.atan2(point.y - center.y, point.x - center.x);
  if (d === circle.r) {
    const p = pointOnCircleAt(circle, base);
    return [{ from: point, to: p }];
  }
  const alpha = Math.acos(circle.r / d);
  const t1 = pointOnCircleAt(circle, base + alpha);
  const t2 = pointOnCircleAt(circle, base - alpha);
  return [
    { from: point, to: t1 },
    { from: point, to: t2 },
  ];
}

function tangentLineBetweenCircles(a: Circle, b: Circle, outer: boolean): Line[] {
  const c1 = circleCenter(a);
  const c2 = circleCenter(b);
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;
  const d = Math.hypot(dx, dy);
  if (d === 0) return [];
  const r2 = outer ? b.r : -b.r;
  const angle = Math.atan2(dy, dx);
  const cos = (a.r - r2) / d;
  if (cos < -1 || cos > 1) return [];
  const alpha = Math.acos(cos);
  const lines: Line[] = [];
  for (const sign of [1, -1]) {
    const theta = angle + sign * alpha;
    const p1 = { x: c1.x + Math.cos(theta) * a.r, y: c1.y + Math.sin(theta) * a.r };
    const p2 = { x: c2.x + Math.cos(theta) * r2, y: c2.y + Math.sin(theta) * r2 };
    lines.push({ from: p1, to: p2 });
  }
  return lines;
}

function tangentCircleToLine(radius: number, line: Line, side: 'left' | 'right'): Circle[] {
  const mid = midpoint(line);
  const dir = lineDirection(line);
  const normal = side === 'left' ? { x: -dir.y, y: dir.x } : { x: dir.y, y: -dir.x };
  return [{ cx: mid.x + normal.x * radius, cy: mid.y + normal.y * radius, r: radius }];
}

function tangentCircleToCircles(radius: number, a: Circle, b: Circle): Circle[] {
  const inflatedA = { ...a, r: a.r + radius };
  const inflatedB = { ...b, r: b.r + radius };
  return circleCircleIntersection(inflatedA, inflatedB).map((p) => ({
    cx: p.x,
    cy: p.y,
    r: radius,
  }));
}

function pointOfTangency(circle: Circle, externalPoint: Point): Point[] {
  const center = circleCenter(circle);
  const d = distanceBetween(center, externalPoint);
  if (d < circle.r) return [];
  const base = Math.atan2(externalPoint.y - center.y, externalPoint.x - center.x);
  if (d === circle.r) return [pointOnCircleAt(circle, base)];
  const alpha = Math.acos(circle.r / d);
  return [pointOnCircleAt(circle, base + alpha), pointOnCircleAt(circle, base - alpha)];
}

function equalLength(fixed: Line, movable: Line): Line {
  const len = lineLength(fixed);
  const dir = lineDirection(movable);
  return { from: movable.from, to: { x: movable.from.x + dir.x * len, y: movable.from.y + dir.y * len } };
}

function equalRadius(fixed: Circle, movable: Circle): Circle {
  return { ...movable, r: fixed.r };
}

function mirrorPoint(point: Point, axis: Line): Point {
  const proj = nearestPointOnLine(point, axis);
  return { x: proj.x * 2 - point.x, y: proj.y * 2 - point.y };
}

function mirrorLine(line: Line, axis: Line): Line {
  return { from: mirrorPoint(line.from, axis), to: mirrorPoint(line.to, axis) };
}

function mirrorCircle(circle: Circle, axis: Line): Circle {
  const center = mirrorPoint(circleCenter(circle), axis);
  return { ...circle, cx: center.x, cy: center.y };
}

function mirrorRect(rect: Rect, axis: Line): Rect {
  const center = mirrorPoint(rectCenter(rect), axis);
  return { ...rect, x: center.x - rect.width / 2, y: center.y - rect.height / 2 };
}

function mirrorPointAbout(point: Point, center: Point): Point {
  return { x: center.x * 2 - point.x, y: center.y * 2 - point.y };
}

function arcToSVGPath(arc: Arc): string {
  const start = pointOnArcAt(arc, 0);
  const end = pointOnArcAt(arc, 1);
  const delta = arc.endAngle - arc.startAngle;
  const largeArc = Math.abs(delta) > Math.PI ? 1 : 0;
  const sweep = delta >= 0 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${arc.r} ${arc.r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

function lineToSVGPath(line: Line): string {
  return `M ${line.from.x} ${line.from.y} L ${line.to.x} ${line.to.y}`;
}

function rectToSVGPath(rect: Rect): string {
  return `M ${rect.x} ${rect.y} h ${rect.width} v ${rect.height} h ${-rect.width} Z`;
}

function circleToSVGPath(circle: Circle): string {
  return `M ${circle.cx + circle.r} ${circle.cy} A ${circle.r} ${circle.r} 0 1 0 ${circle.cx - circle.r} ${circle.cy} A ${circle.r} ${circle.r} 0 1 0 ${circle.cx + circle.r} ${circle.cy}`;
}

function pathFromPoints(points: Point[], close = false): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  const body = rest.map((p) => `L ${p.x} ${p.y}`).join(' ');
  return `M ${first.x} ${first.y} ${body}${close ? ' Z' : ''}`;
}

function angleToT(arc: Arc, angle: number): number {
  const total = arc.endAngle - arc.startAngle;
  if (total === 0) return 0;
  const t = (angle - arc.startAngle) / total;
  return Math.min(1, Math.max(0, t));
}

export {
  rectCenter,
  circleCenter,
  circleBoundingBox,
  rectCorner,
  rectEdge,
  rectEdgeMidpoint,
  insetRect,
  alignCenterX,
  alignCenterY,
  alignEdge,
  alignFlush,
  distributeEvenly,
  distributeAlongEdge,
  gridPositions,
  distributeOnCircle,
  offsetPoint,
  parallelLine,
  offsetCircle,
  coincident,
  centerAtPoint,
  centerAtCorner,
  centerAtEdgeMidpoint,
  concentric,
  collinear,
  parallel,
  parallelThrough,
  perpendicular,
  perpendicularThrough,
  perpendicularAt,
  horizontal,
  vertical,
  horizontalDistance,
  verticalDistance,
  midpoint,
  nearestPointOnLine,
  nearestPointOnCircle,
  nearestPointOnArc,
  pointOnLineAt,
  pointOnCircleAt,
  pointOnArcAt,
  angleBetween,
  rotateToAngle,
  arcTangentToLines,
  arcInCorner,
  arcBetween,
  filletArc,
  tangentLineToCircle,
  tangentLineBetweenCircles,
  tangentCircleToLine,
  tangentCircleToCircles,
  pointOfTangency,
  equalLength,
  equalRadius,
  mirrorPoint,
  mirrorLine,
  mirrorCircle,
  mirrorRect,
  mirrorPointAbout,
  distanceBetween,
  distancePointToLine,
  distancePointToCircle,
  lineLength,
  lineAngle,
  lineDirection,
  lineLineIntersection,
  lineCircleIntersection,
  circleCircleIntersection,
  lineRectIntersection,
  arcToSVGPath,
  lineToSVGPath,
  rectToSVGPath,
  circleToSVGPath,
  pathFromPoints,
};
