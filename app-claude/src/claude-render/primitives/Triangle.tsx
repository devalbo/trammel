import React from 'react';
import { useRenderPhase, useSolver } from './SolverContext';

export interface Point2DValue {
  x: number;
  y: number;
}

export interface TriangleProps {
  id?: string;
  kind?: 'equilateral' | 'right' | 'isosceles' | 'scalene';
  sideLength?: number;
  base?: number;
  height?: number;
  legs?: number;
  a?: number;
  b?: number;
  c?: number;
  vertices?: [Point2DValue, Point2DValue, Point2DValue];
  x?: number;
  y?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
}

interface Verts {
  points: string;
  cx: number;
  cy: number;
  vertices: [Point2DValue, Point2DValue, Point2DValue];
}

function computeEquilateral(sideLength: number, x: number, y: number): Verts {
  const h = sideLength * Math.sqrt(3) / 2;
  return toVerts(x, y + h, x + sideLength, y + h, x + sideLength / 2, y);
}

function computeRight(base: number, height: number, x: number, y: number): Verts {
  return toVerts(x, y + height, x + base, y + height, x, y);
}

function computeIsosceles(base: number, height: number, x: number, y: number): Verts {
  return toVerts(x, y + height, x + base, y + height, x + base / 2, y);
}

function computeScalene(a: number, b: number, c: number, x: number, y: number): Verts {
  // a = v0→v1 (base), b = v1→v2, c = v2→v0
  // Angle at v0 via law of cosines: cos(A) = (a² + c² - b²) / (2ac)
  const cosA = (a * a + c * c - b * b) / (2 * a * c);
  const sinA = Math.sqrt(1 - cosA * cosA);
  const v2y_raw = c * sinA;
  return toVerts(x, y + v2y_raw, x + a, y + v2y_raw, x + c * cosA, y);
}

function computeFromVertices(vertices: [Point2DValue, Point2DValue, Point2DValue]): Verts {
  const [v0, v1, v2] = vertices;
  return toVerts(v0.x, v0.y, v1.x, v1.y, v2.x, v2.y);
}

function toVerts(v0x: number, v0y: number, v1x: number, v1y: number, v2x: number, v2y: number): Verts {
  const vertices: [Point2DValue, Point2DValue, Point2DValue] = [
    { x: round(v0x), y: round(v0y) },
    { x: round(v1x), y: round(v1y) },
    { x: round(v2x), y: round(v2y) },
  ];
  return {
    points: `${vertices[0].x},${vertices[0].y} ${vertices[1].x},${vertices[1].y} ${vertices[2].x},${vertices[2].y}`,
    cx: round((v0x + v1x + v2x) / 3),
    cy: round((v0y + v1y + v2y) / 3),
    vertices,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function rotatePoint(pt: Point2DValue, pivot: Point2DValue, rotationDeg: number): Point2DValue {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = pt.x - pivot.x;
  const dy = pt.y - pivot.y;
  return {
    x: round(pivot.x + dx * cos - dy * sin),
    y: round(pivot.y + dx * sin + dy * cos),
  };
}

export const Triangle: React.FC<TriangleProps> = ({
  id,
  kind = 'equilateral',
  sideLength = 80,
  base,
  height,
  legs,
  a,
  b,
  c,
  vertices,
  x = 0,
  y = 0,
  fill,
  stroke,
  strokeWidth,
  rotation,
}) => {
  const solver = useSolver();
  const phase = useRenderPhase();
  let verts: Verts;

  if (vertices) {
    verts = computeFromVertices(vertices);
  } else if (kind === 'scalene' && a != null && b != null && c != null) {
    verts = computeScalene(a, b, c, x, y);
  } else if (kind === 'right') {
    verts = computeRight(base ?? sideLength, height ?? sideLength, x, y);
  } else if (kind === 'isosceles') {
    const bv = base ?? sideLength;
    let h: number;
    if (height != null) {
      h = height;
    } else if (legs != null) {
      h = Math.sqrt(legs * legs - (bv / 2) * (bv / 2));
    } else {
      h = bv * Math.sqrt(3) / 2;
    }
    verts = computeIsosceles(bv, h, x, y);
  } else {
    verts = computeEquilateral(sideLength, x, y);
  }

  const transform = rotation
    ? `rotate(${rotation}, ${verts.cx}, ${verts.cy})`
    : undefined;

  if (solver && id) {
    const baseVertices = verts.vertices;
    const pivot = { x: verts.cx, y: verts.cy };
    const [v0, v1, v2] = rotation
      ? baseVertices.map(v => rotatePoint(v, pivot, rotation)) as [Point2DValue, Point2DValue, Point2DValue]
      : baseVertices;
    solver.register(id, {
      v0,
      v1,
      v2,
      'v0.x': v0.x,
      'v0.y': v0.y,
      'v1.x': v1.x,
      'v1.y': v1.y,
      'v2.x': v2.x,
      'v2.y': v2.y,
      centerX: verts.cx,
      centerY: verts.cy,
      center: { x: verts.cx, y: verts.cy },
    });
  }

  if (phase === 'register') {
    return null;
  }

  return (
    <polygon
      id={id}
      points={verts.points}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={transform}
    />
  );
};
