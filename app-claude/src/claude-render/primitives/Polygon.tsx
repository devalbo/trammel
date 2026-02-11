import React from 'react';
import { useRenderPhase, useSolver } from './SolverContext';

export interface PolygonProps {
  id?: string;
  sides?: number;
  sideLength?: number;
  r?: number;
  centerX?: number;
  centerY?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

interface Vertex {
  x: number;
  y: number;
}

function rotatePoint(pt: Vertex, pivotX: number, pivotY: number, rotationDeg: number): Vertex {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = pt.x - pivotX;
  const dy = pt.y - pivotY;
  return {
    x: Math.round((pivotX + dx * cos - dy * sin) * 100) / 100,
    y: Math.round((pivotY + dx * sin + dy * cos) * 100) / 100,
  };
}

function computeRegularPolygon(
  sides: number,
  circumradius: number,
  centerX: number,
  centerY: number,
): { points: string; vertices: Vertex[] } {
  const points: string[] = [];
  const vertices: Vertex[] = [];
  for (let i = 0; i < sides; i++) {
    // Flat-bottom orientation: first vertex at angle -π/2 + π/n
    const angle = (2 * Math.PI * i) / sides - Math.PI / 2 + Math.PI / sides;
    const px = centerX + circumradius * Math.cos(angle);
    // SVG y-down: negate sin
    const py = centerY - circumradius * Math.sin(angle);
    const v = { x: round(px), y: round(py) };
    vertices.push(v);
    points.push(`${v.x},${v.y}`);
  }
  return { points: points.join(' '), vertices };
}

export const Polygon: React.FC<PolygonProps> = ({
  id,
  sides = 6,
  sideLength,
  r,
  centerX = 0,
  centerY = 0,
  fill,
  stroke,
  strokeWidth,
  rotation,
}) => {
  const solver = useSolver();
  const phase = useRenderPhase();
  // r (circumradius) takes precedence; otherwise derive from sideLength
  const circumradius = r ?? (sideLength ?? 40) / (2 * Math.sin(Math.PI / sides));
  const { points, vertices } = computeRegularPolygon(sides, circumradius, centerX, centerY);
  const transform = rotation
    ? `rotate(${rotation}, ${centerX}, ${centerY})`
    : undefined;

  if (solver && id) {
    const anchorRecord: Record<string, number | { x: number; y: number }> = {
      centerX,
      centerY,
      center: { x: centerX, y: centerY },
    };
    const verts = rotation ? vertices.map(v => rotatePoint(v, centerX, centerY, rotation)) : vertices;
    verts.forEach((v, i) => {
      anchorRecord[`v${i}`] = v;
      anchorRecord[`v${i}.x`] = v.x;
      anchorRecord[`v${i}.y`] = v.y;
    });
    solver.register(id, anchorRecord);
  }

  if (phase === 'register') {
    return null;
  }

  return (
    <polygon
      id={id}
      points={points}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={transform}
    />
  );
};
