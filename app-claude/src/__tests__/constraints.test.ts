import { describe, it, expect } from 'vitest';
import {
  rectCenter, rectCorner, rectEdgeMidpoint, rectEdge,
  circleCenter, circleBoundingBox,
  lineLength, lineAngle, lineDirection,
  distanceBetween, distancePointToLine, distancePointToCircle,
  lineLineIntersection, lineCircleIntersection, circleCircleIntersection, lineRectIntersection,
} from '../constraints/query';
import { alignCenterX, alignCenterY, alignEdge, alignFlush } from '../constraints/align';
import { distributeEvenly, distributeAlongEdge, gridPositions, distributeOnCircle } from '../constraints/distribute';
import { offsetPoint, parallelLine, insetRect, offsetCircle } from '../constraints/offset';
import { arcInCorner, arcBetween, arcTangentToLines, filletArc } from '../constraints/arc';
import {
  coincident, centerAtPoint, centerAtCorner, centerAtEdgeMidpoint,
  concentric, collinear, parallel, parallelThrough,
  perpendicular, perpendicularThrough, perpendicularAt,
  horizontal, vertical, horizontalDistance, verticalDistance,
  midpoint, nearestPointOnLine, nearestPointOnCircle,
  pointOnLineAt, pointOnCircleAt, pointOnArcAt,
  angleBetween, rotateToAngle,
} from '../constraints/geometric';
import { mirrorPoint, mirrorLine, mirrorCircle, mirrorRect, mirrorPointAbout } from '../constraints/mirror';
import { arcToSVGPath, lineToSVGPath, rectToSVGPath, circleToSVGPath, pathFromPoints } from '../constraints/svg-helpers';
import type { Point, Rect, Circle, Line, Arc } from '../constraints/types';

const close = (a: number, b: number, eps = 1e-6) => expect(a).toBeCloseTo(b, 5);
const closePoint = (a: Point, b: Point) => { close(a.x, b.x); close(a.y, b.y); };

// ── query ──

describe('query', () => {
  const rect: Rect = { x: 10, y: 20, width: 100, height: 50 };
  const circle: Circle = { cx: 50, cy: 50, r: 25 };

  it('rectCenter', () => {
    closePoint(rectCenter(rect), { x: 60, y: 45 });
  });

  it('rectCorner all corners', () => {
    closePoint(rectCorner(rect, 'topLeft'), { x: 10, y: 20 });
    closePoint(rectCorner(rect, 'topRight'), { x: 110, y: 20 });
    closePoint(rectCorner(rect, 'bottomLeft'), { x: 10, y: 70 });
    closePoint(rectCorner(rect, 'bottomRight'), { x: 110, y: 70 });
  });

  it('rectEdgeMidpoint all edges', () => {
    closePoint(rectEdgeMidpoint(rect, 'top'), { x: 60, y: 20 });
    closePoint(rectEdgeMidpoint(rect, 'bottom'), { x: 60, y: 70 });
    closePoint(rectEdgeMidpoint(rect, 'left'), { x: 10, y: 45 });
    closePoint(rectEdgeMidpoint(rect, 'right'), { x: 110, y: 45 });
  });

  it('rectEdge returns correct line segments', () => {
    const top = rectEdge(rect, 'top');
    closePoint(top.from, { x: 10, y: 20 });
    closePoint(top.to, { x: 110, y: 20 });
    const right = rectEdge(rect, 'right');
    closePoint(right.from, { x: 110, y: 20 });
    closePoint(right.to, { x: 110, y: 70 });
  });

  it('circleCenter', () => {
    closePoint(circleCenter(circle), { x: 50, y: 50 });
  });

  it('circleBoundingBox', () => {
    const bb = circleBoundingBox(circle);
    expect(bb).toEqual({ x: 25, y: 25, width: 50, height: 50 });
  });

  it('lineLength', () => {
    close(lineLength({ from: { x: 0, y: 0 }, to: { x: 3, y: 4 } }), 5);
  });

  it('lineLength zero-length line', () => {
    close(lineLength({ from: { x: 5, y: 5 }, to: { x: 5, y: 5 } }), 0);
  });

  it('lineAngle horizontal', () => {
    close(lineAngle({ from: { x: 0, y: 0 }, to: { x: 10, y: 0 } }), 0);
  });

  it('lineAngle vertical', () => {
    close(lineAngle({ from: { x: 0, y: 0 }, to: { x: 0, y: 10 } }), Math.PI / 2);
  });

  it('lineDirection', () => {
    const dir = lineDirection({ from: { x: 0, y: 0 }, to: { x: 10, y: 0 } });
    closePoint(dir, { x: 1, y: 0 });
  });

  it('lineDirection zero-length returns origin', () => {
    const dir = lineDirection({ from: { x: 5, y: 5 }, to: { x: 5, y: 5 } });
    closePoint(dir, { x: 0, y: 0 });
  });

  it('distanceBetween', () => {
    close(distanceBetween({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
  });

  it('distancePointToLine', () => {
    const line: Line = { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } };
    close(distancePointToLine({ x: 5, y: 7 }, line), 7);
  });

  it('distancePointToLine zero-length line', () => {
    const line: Line = { from: { x: 3, y: 4 }, to: { x: 3, y: 4 } };
    close(distancePointToLine({ x: 0, y: 0 }, line), 5);
  });

  it('distancePointToCircle on circle returns 0', () => {
    close(distancePointToCircle({ x: 75, y: 50 }, circle), 0);
  });

  it('distancePointToCircle outside', () => {
    close(distancePointToCircle({ x: 80, y: 50 }, circle), 5);
  });

  it('lineLineIntersection perpendicular lines', () => {
    const a: Line = { from: { x: 0, y: 5 }, to: { x: 10, y: 5 } };
    const b: Line = { from: { x: 5, y: 0 }, to: { x: 5, y: 10 } };
    const pt = lineLineIntersection(a, b);
    expect(pt).not.toBeNull();
    closePoint(pt!, { x: 5, y: 5 });
  });

  it('lineLineIntersection parallel lines returns null', () => {
    const a: Line = { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } };
    const b: Line = { from: { x: 0, y: 5 }, to: { x: 10, y: 5 } };
    expect(lineLineIntersection(a, b)).toBeNull();
  });

  it('lineCircleIntersection through center', () => {
    const line: Line = { from: { x: 0, y: 50 }, to: { x: 100, y: 50 } };
    const pts = lineCircleIntersection(line, circle);
    expect(pts.length).toBe(2);
    const xs = pts.map(p => p.x).sort((a, b) => a - b);
    close(xs[0], 25);
    close(xs[1], 75);
  });

  it('lineCircleIntersection miss', () => {
    const line: Line = { from: { x: 0, y: 200 }, to: { x: 100, y: 200 } };
    expect(lineCircleIntersection(line, circle)).toEqual([]);
  });

  it('circleCircleIntersection two points', () => {
    const c1: Circle = { cx: 0, cy: 0, r: 5 };
    const c2: Circle = { cx: 6, cy: 0, r: 5 };
    const pts = circleCircleIntersection(c1, c2);
    expect(pts.length).toBe(2);
  });

  it('circleCircleIntersection no overlap', () => {
    const c1: Circle = { cx: 0, cy: 0, r: 1 };
    const c2: Circle = { cx: 10, cy: 0, r: 1 };
    expect(circleCircleIntersection(c1, c2)).toEqual([]);
  });

  it('lineRectIntersection diagonal through rect', () => {
    const r: Rect = { x: 0, y: 0, width: 10, height: 10 };
    const line: Line = { from: { x: -5, y: 5 }, to: { x: 15, y: 5 } };
    const pts = lineRectIntersection(line, r);
    expect(pts.length).toBe(2);
  });
});

// ── align ──

describe('align', () => {
  const a: Rect = { x: 0, y: 0, width: 100, height: 50 };
  const b: Rect = { x: 200, y: 200, width: 60, height: 30 };

  it('alignCenterX returns a.center.x with b.center.y', () => {
    const pt = alignCenterX(a, b);
    close(pt.x, 50);   // a center x
    close(pt.y, 215);   // b center y
  });

  it('alignCenterY returns b.center.x with a.center.y', () => {
    const pt = alignCenterY(a, b);
    close(pt.x, 230);   // b center x
    close(pt.y, 25);    // a center y
  });

  it('alignEdge moves b to match a edge', () => {
    const pt = alignEdge(a, 'bottom', b, 'top');
    // a bottom = 50, b top = 200, shift = 50-200 = -150
    close(pt.y, 200 + (50 - 200));
  });

  it('alignFlush returns edge difference', () => {
    const diff = alignFlush(a, 'right', b, 'left');
    close(diff, 100 - 200);
  });
});

// ── distribute ──

describe('distribute', () => {
  it('distributeEvenly basic', () => {
    const positions = distributeEvenly(3, 10, 100);
    expect(positions.length).toBe(3);
    // gap = (100 - 30) / 4 = 17.5
    close(positions[0], 17.5);
    close(positions[1], 45);
    close(positions[2], 72.5);
  });

  it('distributeEvenly zero count', () => {
    expect(distributeEvenly(0, 10, 100)).toEqual([]);
  });

  it('distributeEvenly single item centered', () => {
    const positions = distributeEvenly(1, 20, 100);
    // gap = (100-20)/2 = 40
    close(positions[0], 40);
  });

  it('distributeAlongEdge top edge', () => {
    const rect: Rect = { x: 0, y: 0, width: 100, height: 50 };
    const pts = distributeAlongEdge(2, 10, rect, 'top');
    expect(pts.length).toBe(2);
    // All y should be 0 (top edge)
    close(pts[0].y, 0);
    close(pts[1].y, 0);
  });

  it('distributeAlongEdge left edge', () => {
    const rect: Rect = { x: 0, y: 0, width: 100, height: 60 };
    const pts = distributeAlongEdge(2, 10, rect, 'left');
    expect(pts.length).toBe(2);
    close(pts[0].x, 0);
    close(pts[1].x, 0);
  });

  it('gridPositions', () => {
    const pts = gridPositions(2, 3, 10, 10, 5);
    expect(pts.length).toBe(6);
    closePoint(pts[0], { x: 0, y: 0 });
    closePoint(pts[1], { x: 15, y: 0 });
    closePoint(pts[2], { x: 0, y: 15 });
  });

  it('distributeOnCircle', () => {
    const circle: Circle = { cx: 0, cy: 0, r: 10 };
    const pts = distributeOnCircle(4, circle);
    expect(pts.length).toBe(4);
    closePoint(pts[0], { x: 10, y: 0 });
    closePoint(pts[1], { x: 0, y: 10 });
    closePoint(pts[2], { x: -10, y: 0 });
    closePoint(pts[3], { x: 0, y: -10 });
  });

  it('distributeOnCircle zero count', () => {
    expect(distributeOnCircle(0, { cx: 0, cy: 0, r: 10 })).toEqual([]);
  });
});

// ── offset ──

describe('offset', () => {
  it('offsetPoint', () => {
    const pt = offsetPoint({ x: 0, y: 0 }, 10, 0);
    closePoint(pt, { x: 10, y: 0 });
  });

  it('offsetPoint at angle', () => {
    const pt = offsetPoint({ x: 0, y: 0 }, 10, Math.PI / 2);
    closePoint(pt, { x: 0, y: 10 });
  });

  it('parallelLine offsets perpendicular', () => {
    const line: Line = { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } };
    const result = parallelLine(line, 5);
    close(result.from.y, 5);
    close(result.to.y, 5);
    close(result.from.x, 0);
    close(result.to.x, 10);
  });

  it('insetRect uniform', () => {
    const r = insetRect({ x: 0, y: 0, width: 100, height: 50 }, 10);
    expect(r).toEqual({ x: 10, y: 10, width: 80, height: 30 });
  });

  it('insetRect per-side', () => {
    const r = insetRect({ x: 0, y: 0, width: 100, height: 50 }, { top: 5, right: 10, bottom: 15, left: 20 });
    expect(r).toEqual({ x: 20, y: 5, width: 70, height: 30 });
  });

  it('offsetCircle', () => {
    const c = offsetCircle({ cx: 10, cy: 20, r: 5 }, 3);
    expect(c).toEqual({ cx: 10, cy: 20, r: 8 });
  });
});

// ── arc ──

describe('arc', () => {
  it('arcInCorner topLeft', () => {
    const rect: Rect = { x: 0, y: 0, width: 100, height: 50 };
    const arc = arcInCorner(10, rect, 'topLeft');
    close(arc.cx, 10);
    close(arc.cy, 10);
    close(arc.r, 10);
    close(arc.startAngle, Math.PI);
    close(arc.endAngle, 1.5 * Math.PI);
  });

  it('arcInCorner bottomRight', () => {
    const rect: Rect = { x: 0, y: 0, width: 100, height: 50 };
    const arc = arcInCorner(10, rect, 'bottomRight');
    close(arc.cx, 90);
    close(arc.cy, 40);
    close(arc.r, 10);
  });

  it('arcBetween produces correct radius', () => {
    const arc = arcBetween({ x: 0, y: 0 }, { x: 10, y: 0 }, 10);
    close(arc.r, 10);
  });

  it('filletArc delegates to arcTangentToLines', () => {
    const e1: Line = { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } };
    const e2: Line = { from: { x: 10, y: 0 }, to: { x: 10, y: 10 } };
    const a = filletArc(5, e1, e2);
    const b = arcTangentToLines(5, e1, e2);
    expect(a).toEqual(b);
  });
});

// ── geometric ──

describe('geometric', () => {
  it('coincident returns first point', () => {
    closePoint(coincident({ x: 1, y: 2 }, { x: 99, y: 99 }), { x: 1, y: 2 });
  });

  it('centerAtPoint circle', () => {
    const c = centerAtPoint({ cx: 0, cy: 0, r: 5 }, { x: 10, y: 20 });
    expect(c).toEqual({ cx: 10, cy: 20, r: 5 });
  });

  it('centerAtPoint rect', () => {
    const r = centerAtPoint({ x: 0, y: 0, width: 20, height: 10 } as Rect, { x: 50, y: 50 });
    expect(r).toEqual({ x: 40, y: 45, width: 20, height: 10 });
  });

  it('centerAtCorner', () => {
    const rect: Rect = { x: 0, y: 0, width: 100, height: 50 };
    const c = centerAtCorner({ cx: 0, cy: 0, r: 5 }, rect, 'topRight');
    expect(c).toEqual({ cx: 100, cy: 0, r: 5 });
  });

  it('centerAtEdgeMidpoint', () => {
    const rect: Rect = { x: 0, y: 0, width: 100, height: 50 };
    const c = centerAtEdgeMidpoint({ cx: 0, cy: 0, r: 5 }, rect, 'bottom');
    expect(c).toEqual({ cx: 50, cy: 50, r: 5 });
  });

  it('concentric circle', () => {
    const a: Circle = { cx: 10, cy: 20, r: 5 };
    const b: Circle = { cx: 99, cy: 99, r: 15 };
    const result = concentric(a, b) as Circle;
    expect(result).toEqual({ cx: 10, cy: 20, r: 15 });
  });

  it('horizontal flattens y', () => {
    const line: Line = { from: { x: 0, y: 3 }, to: { x: 10, y: 7 } };
    const h = horizontal(line);
    close(h.from.y, 5);
    close(h.to.y, 5);
    close(h.from.x, 0);
    close(h.to.x, 10);
  });

  it('vertical flattens x', () => {
    const line: Line = { from: { x: 3, y: 0 }, to: { x: 7, y: 10 } };
    const v = vertical(line);
    close(v.from.x, 5);
    close(v.to.x, 5);
  });

  it('horizontalDistance', () => {
    close(horizontalDistance({ x: 10, y: 0 }, { x: 25, y: 100 }), 15);
  });

  it('verticalDistance', () => {
    close(verticalDistance({ x: 0, y: 10 }, { x: 100, y: 35 }), 25);
  });

  it('midpoint of two points', () => {
    closePoint(midpoint({ x: 0, y: 0 }, { x: 10, y: 10 }), { x: 5, y: 5 });
  });

  it('midpoint of line', () => {
    const line: Line = { from: { x: 0, y: 0 }, to: { x: 10, y: 10 } };
    closePoint(midpoint(line), { x: 5, y: 5 });
  });

  it('nearestPointOnLine clamped to segment', () => {
    const line: Line = { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } };
    closePoint(nearestPointOnLine({ x: -5, y: 3 }, line), { x: 0, y: 0 });
    closePoint(nearestPointOnLine({ x: 15, y: 3 }, line), { x: 10, y: 0 });
    closePoint(nearestPointOnLine({ x: 5, y: 3 }, line), { x: 5, y: 0 });
  });

  it('nearestPointOnCircle', () => {
    const circle: Circle = { cx: 0, cy: 0, r: 10 };
    const pt = nearestPointOnCircle({ x: 20, y: 0 }, circle);
    closePoint(pt, { x: 10, y: 0 });
  });

  it('nearestPointOnCircle from center', () => {
    const circle: Circle = { cx: 0, cy: 0, r: 10 };
    const pt = nearestPointOnCircle({ x: 0, y: 0 }, circle);
    closePoint(pt, { x: 10, y: 0 });
  });

  it('pointOnLineAt', () => {
    const line: Line = { from: { x: 0, y: 0 }, to: { x: 10, y: 10 } };
    closePoint(pointOnLineAt(line, 0.5), { x: 5, y: 5 });
    closePoint(pointOnLineAt(line, 0), { x: 0, y: 0 });
    closePoint(pointOnLineAt(line, 1), { x: 10, y: 10 });
  });

  it('pointOnCircleAt', () => {
    const circle: Circle = { cx: 0, cy: 0, r: 10 };
    closePoint(pointOnCircleAt(circle, 0), { x: 10, y: 0 });
    closePoint(pointOnCircleAt(circle, Math.PI / 2), { x: 0, y: 10 });
  });

  it('pointOnArcAt', () => {
    const arc: Arc = { cx: 0, cy: 0, r: 10, startAngle: 0, endAngle: Math.PI };
    closePoint(pointOnArcAt(arc, 0), { x: 10, y: 0 });
    closePoint(pointOnArcAt(arc, 0.5), { x: 0, y: 10 });
    closePoint(pointOnArcAt(arc, 1), { x: -10, y: 0 });
  });

  it('parallelThrough', () => {
    const fixed: Line = { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } };
    const result = parallelThrough(fixed, { x: 5, y: 20 }, 8);
    close(result.from.y, 20);
    close(result.to.y, 20);
    close(lineLength(result), 8);
  });

  it('perpendicular', () => {
    const fixed: Line = { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } };
    const movable: Line = { from: { x: 5, y: 5 }, to: { x: 5, y: 15 } };
    const result = perpendicular(fixed, movable);
    // Should be vertical (perpendicular to horizontal)
    close(result.from.x, result.to.x);
  });

  it('perpendicularAt', () => {
    const line: Line = { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } };
    const result = perpendicularAt(line, 0.5, 6);
    // midpoint of line at t=0.5 is (5, 0)
    close((result.from.x + result.to.x) / 2, 5);
    close(lineLength(result), 6);
  });

  it('angleBetween parallel lines is 0', () => {
    const a: Line = { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } };
    const b: Line = { from: { x: 0, y: 5 }, to: { x: 10, y: 5 } };
    close(angleBetween(a, b), 0);
  });

  it('angleBetween perpendicular lines', () => {
    const a: Line = { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } };
    const b: Line = { from: { x: 0, y: 0 }, to: { x: 0, y: 10 } };
    close(angleBetween(a, b), Math.PI / 2);
  });
});

// ── mirror ──

describe('mirror', () => {
  // Vertical axis at x=5
  const vAxis: Line = { from: { x: 5, y: 0 }, to: { x: 5, y: 10 } };
  // Horizontal axis at y=5
  const hAxis: Line = { from: { x: 0, y: 5 }, to: { x: 10, y: 5 } };

  it('mirrorPoint across vertical axis', () => {
    closePoint(mirrorPoint({ x: 3, y: 7 }, vAxis), { x: 7, y: 7 });
  });

  it('mirrorPoint across horizontal axis', () => {
    closePoint(mirrorPoint({ x: 3, y: 3 }, hAxis), { x: 3, y: 7 });
  });

  it('mirrorPoint on axis stays', () => {
    closePoint(mirrorPoint({ x: 5, y: 7 }, vAxis), { x: 5, y: 7 });
  });

  it('mirrorLine', () => {
    const line: Line = { from: { x: 1, y: 2 }, to: { x: 3, y: 4 } };
    const result = mirrorLine(line, vAxis);
    closePoint(result.from, { x: 9, y: 2 });
    closePoint(result.to, { x: 7, y: 4 });
  });

  it('mirrorCircle', () => {
    const c = mirrorCircle({ cx: 2, cy: 3, r: 5 }, vAxis);
    close(c.cx, 8);
    close(c.cy, 3);
    close(c.r, 5);
  });

  it('mirrorRect across vertical axis', () => {
    const r = mirrorRect({ x: 1, y: 2, width: 3, height: 4 }, vAxis);
    close(r.width, 3);
    close(r.height, 4);
    close(r.x, 6); // reflected topLeft.x = 9, reflected bottomRight.x = 7, min = 6
  });

  it('mirrorPointAbout center', () => {
    closePoint(mirrorPointAbout({ x: 3, y: 4 }, { x: 5, y: 5 }), { x: 7, y: 6 });
  });
});

// ── svg-helpers ──

describe('svg-helpers', () => {
  it('arcToSVGPath starts with M', () => {
    const arc: Arc = { cx: 0, cy: 0, r: 10, startAngle: 0, endAngle: Math.PI / 2 };
    const path = arcToSVGPath(arc);
    expect(path).toMatch(/^M /);
    expect(path).toContain('A 10 10');
  });

  it('lineToSVGPath', () => {
    const path = lineToSVGPath({ from: { x: 1, y: 2 }, to: { x: 3, y: 4 } });
    expect(path).toBe('M 1 2 L 3 4');
  });

  it('rectToSVGPath no radius', () => {
    const path = rectToSVGPath({ x: 0, y: 0, width: 10, height: 5 });
    expect(path).toContain('M 0 0');
    expect(path).toContain('Z');
  });

  it('rectToSVGPath with radius', () => {
    const path = rectToSVGPath({ x: 0, y: 0, width: 100, height: 50 }, 10);
    expect(path).toContain('A 10 10');
  });

  it('circleToSVGPath', () => {
    const path = circleToSVGPath({ cx: 10, cy: 20, r: 5 });
    expect(path).toContain('A 5 5');
    expect(path).toContain('Z');
  });

  it('pathFromPoints open', () => {
    const path = pathFromPoints([{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 0 }]);
    expect(path).toBe('M 0 0 L 10 10 L 20 0');
  });

  it('pathFromPoints closed', () => {
    const path = pathFromPoints([{ x: 0, y: 0 }, { x: 10, y: 10 }], true);
    expect(path).toBe('M 0 0 L 10 10 Z');
  });

  it('pathFromPoints empty', () => {
    expect(pathFromPoints([])).toBe('');
  });
});
