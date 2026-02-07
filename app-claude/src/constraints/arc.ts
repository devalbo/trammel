import type { Point, Rect, Line, Arc, RectCorner } from './types';
import { lineLineIntersection, lineAngle } from './query';

export function arcTangentToLines(radius: number, line1: Line, line2: Line): Arc {
  const intersection = lineLineIntersection(line1, line2);
  if (!intersection) {
    return { cx: 0, cy: 0, r: radius, startAngle: 0, endAngle: Math.PI / 2 };
  }
  const a1 = lineAngle(line1);
  const a2 = lineAngle(line2);
  const bisector = (a1 + a2) / 2;
  const halfAngle = Math.abs(a2 - a1) / 2;
  const dist = radius / Math.sin(halfAngle || 0.001);
  const cx = intersection.x + dist * Math.cos(bisector);
  const cy = intersection.y + dist * Math.sin(bisector);
  return { cx, cy, r: radius, startAngle: a1 - Math.PI / 2, endAngle: a2 - Math.PI / 2 };
}

export function arcInCorner(
  radius: number,
  rect: Rect,
  corner: RectCorner,
): Arc {
  let cx: number, cy: number, startAngle: number, endAngle: number;
  switch (corner) {
    case 'topLeft':
      cx = rect.x + radius;
      cy = rect.y + radius;
      startAngle = Math.PI;
      endAngle = 1.5 * Math.PI;
      break;
    case 'topRight':
      cx = rect.x + rect.width - radius;
      cy = rect.y + radius;
      startAngle = 1.5 * Math.PI;
      endAngle = 2 * Math.PI;
      break;
    case 'bottomLeft':
      cx = rect.x + radius;
      cy = rect.y + rect.height - radius;
      startAngle = 0.5 * Math.PI;
      endAngle = Math.PI;
      break;
    case 'bottomRight':
      cx = rect.x + rect.width - radius;
      cy = rect.y + rect.height - radius;
      startAngle = 0;
      endAngle = 0.5 * Math.PI;
      break;
  }
  return { cx, cy, r: radius, startAngle, endAngle };
}

export function arcBetween(
  from: Point,
  to: Point,
  radius: number,
  direction: 'cw' | 'ccw' = 'ccw',
): Arc {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const halfChord = Math.sqrt(dx * dx + dy * dy) / 2;
  const sagitta = Math.sqrt(Math.max(0, radius * radius - halfChord * halfChord));
  const sign = direction === 'ccw' ? 1 : -1;
  const cx = mx + sign * sagitta * (-dy / (2 * halfChord));
  const cy = my + sign * sagitta * (dx / (2 * halfChord));
  const startAngle = Math.atan2(from.y - cy, from.x - cx);
  const endAngle = Math.atan2(to.y - cy, to.x - cx);
  return { cx, cy, r: radius, startAngle, endAngle };
}

export function filletArc(radius: number, edge1: Line, edge2: Line): Arc {
  return arcTangentToLines(radius, edge1, edge2);
}
