import type { Point, Rect, Circle, RectEdge } from './types';
import { rectEdgeMidpoint } from './query';

export function distributeEvenly(
  count: number,
  itemWidth: number,
  totalWidth: number,
): number[] {
  if (count <= 0) return [];
  const gap = (totalWidth - count * itemWidth) / (count + 1);
  return Array.from({ length: count }, (_, i) => gap + i * (itemWidth + gap));
}

export function distributeAlongEdge(
  count: number,
  itemSize: number,
  rect: Rect,
  edge: RectEdge,
): Point[] {
  if (count <= 0) return [];
  const isHorizontal = edge === 'top' || edge === 'bottom';
  const totalLength = isHorizontal ? rect.width : rect.height;
  const positions = distributeEvenly(count, itemSize, totalLength);
  const mid = rectEdgeMidpoint(rect, edge);

  if (isHorizontal) {
    const y = mid.y;
    return positions.map((x) => ({ x: rect.x + x, y }));
  }
  const x = mid.x;
  return positions.map((yOff) => ({ x, y: rect.y + yOff }));
}

export function gridPositions(
  cols: number,
  rows: number,
  cellWidth: number,
  cellHeight: number,
  gap: number,
): Point[] {
  const points: Point[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      points.push({
        x: col * (cellWidth + gap),
        y: row * (cellHeight + gap),
      });
    }
  }
  return points;
}

export function distributeOnCircle(
  count: number,
  circle: Circle,
  startAngle: number = 0,
): Point[] {
  if (count <= 0) return [];
  const step = (2 * Math.PI) / count;
  return Array.from({ length: count }, (_, i) => {
    const angle = startAngle + i * step;
    return {
      x: circle.cx + circle.r * Math.cos(angle),
      y: circle.cy + circle.r * Math.sin(angle),
    };
  });
}
