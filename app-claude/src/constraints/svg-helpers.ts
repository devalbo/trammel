import type { Point, Rect, Circle, Line, Arc } from './types';

export function arcToSVGPath(arc: Arc): string {
  const startX = arc.cx + arc.r * Math.cos(arc.startAngle);
  const startY = arc.cy + arc.r * Math.sin(arc.startAngle);
  const endX = arc.cx + arc.r * Math.cos(arc.endAngle);
  const endY = arc.cy + arc.r * Math.sin(arc.endAngle);

  let angleDiff = arc.endAngle - arc.startAngle;
  if (angleDiff < 0) angleDiff += 2 * Math.PI;
  const largeArc = angleDiff > Math.PI ? 1 : 0;
  const sweep = 1;

  return `M ${startX} ${startY} A ${arc.r} ${arc.r} 0 ${largeArc} ${sweep} ${endX} ${endY}`;
}

export function lineToSVGPath(line: Line): string {
  return `M ${line.from.x} ${line.from.y} L ${line.to.x} ${line.to.y}`;
}

export function rectToSVGPath(rect: Rect, cornerRadius?: number): string {
  const r = cornerRadius ?? 0;
  if (r <= 0) {
    return `M ${rect.x} ${rect.y} h ${rect.width} v ${rect.height} h ${-rect.width} Z`;
  }
  const cr = Math.min(r, rect.width / 2, rect.height / 2);
  const x = rect.x, y = rect.y, w = rect.width, h = rect.height;
  return [
    `M ${x + cr} ${y}`,
    `H ${x + w - cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + w} ${y + cr}`,
    `V ${y + h - cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + w - cr} ${y + h}`,
    `H ${x + cr}`,
    `A ${cr} ${cr} 0 0 1 ${x} ${y + h - cr}`,
    `V ${y + cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + cr} ${y}`,
    'Z',
  ].join(' ');
}

export function circleToSVGPath(circle: Circle): string {
  const { cx, cy, r } = circle;
  return [
    `M ${cx - r} ${cy}`,
    `A ${r} ${r} 0 1 0 ${cx + r} ${cy}`,
    `A ${r} ${r} 0 1 0 ${cx - r} ${cy}`,
    'Z',
  ].join(' ');
}

export function pathFromPoints(points: Point[], closed: boolean = false): string {
  if (points.length === 0) return '';
  const parts = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 1; i < points.length; i++) {
    parts.push(`L ${points[i].x} ${points[i].y}`);
  }
  if (closed) parts.push('Z');
  return parts.join(' ');
}
