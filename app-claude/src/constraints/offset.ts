import type { Point, Rect, Circle, Line } from './types';
import { lineAngle, lineLength } from './query';

export function offsetPoint(from: Point, distance: number, angle: number): Point {
  return {
    x: from.x + distance * Math.cos(angle),
    y: from.y + distance * Math.sin(angle),
  };
}

export function parallelLine(line: Line, offset: number): Line {
  const angle = lineAngle(line) + Math.PI / 2;
  const dx = offset * Math.cos(angle);
  const dy = offset * Math.sin(angle);
  return {
    from: { x: line.from.x + dx, y: line.from.y + dy },
    to: { x: line.to.x + dx, y: line.to.y + dy },
  };
}

type RectInsets = { top: number; right: number; bottom: number; left: number };

export function insetRect(rect: Rect, inset: number | RectInsets): Rect {
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

export function offsetCircle(circle: Circle, offset: number): Circle {
  return { cx: circle.cx, cy: circle.cy, r: circle.r + offset };
}
