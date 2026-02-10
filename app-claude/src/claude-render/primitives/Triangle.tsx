import React from 'react';

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
  return {
    points: `${round(v0x)},${round(v0y)} ${round(v1x)},${round(v1y)} ${round(v2x)},${round(v2y)}`,
    cx: round((v0x + v1x + v2x) / 3),
    cy: round((v0y + v1y + v2y) / 3),
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
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
