import React, { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import {
  Rect,
  Line,
  Polygon,
  Triangle,
  Arc,
  Path,
  SpriteText,
  SolverProvider,
  useRenderPhase,
  useSolver,
} from '../claude-render';

function ResolveProbe({ onRead }: { onRead: (data: Record<string, { x: number; y: number }>) => void }) {
  const solver = useSolver();
  const phase = useRenderPhase();
  useEffect(() => {
    if (!solver || phase !== 'render') return;
    onRead({
      rectTopLeft: solver.resolvePoint('#r.topLeft'),
      rectTopRight: solver.resolvePoint('#r.topRight'),
      rectBottomRight: solver.resolvePoint('#r.bottomRight'),
      rectBottomLeft: solver.resolvePoint('#r.bottomLeft'),
      lineStart: solver.resolvePoint('#l.start'),
      lineEnd: solver.resolvePoint('#l.end'),
      polyV0: solver.resolvePoint('#p0.v0'),
      polyV0Rot: solver.resolvePoint('#p1.v0'),
      triV0: solver.resolvePoint('#t0.v0'),
      triV0Rot: solver.resolvePoint('#t1.v0'),
      rect2TopLeft: solver.resolvePoint('#r2.topLeft'),
      rect3TopLeft: solver.resolvePoint('#r3.topLeft'),
      arcRotation: { x: solver.resolve('#arc.rotation'), y: 0 },
      pathRotation: { x: solver.resolve('#path.rotation'), y: 0 },
      textRotation: { x: solver.resolve('#txt.rotation'), y: 0 },
    });
  }, [solver, phase, onRead]);
  return null;
}

function expectPointClose(actual: { x: number; y: number }, expected: { x: number; y: number }, precision = 1) {
  expect(actual.x).toBeCloseTo(expected.x, precision);
  expect(actual.y).toBeCloseTo(expected.y, precision);
}

describe('shape rotation anchors', () => {
  it('rotated anchors match expected positions', async () => {
    let snapshot: Record<string, { x: number; y: number }> | null = null;
    render(
      <SolverProvider viewBox={{ minX: -50, minY: -50, width: 100, height: 100 }}>
        <Rect id="r" x={0} y={0} width={10} height={20} rotation={90} />
        <Rect id="r2" x={0} y={0} width={10} height={20} rotation="#r.rotation" />
        <SpriteText id="txt" x={0} y={0} rotation={90}>T</SpriteText>
        <Rect id="r3" x={0} y={0} width={10} height={20} rotation="#txt.rotation" />
        <Line id="l" start={{ x: 0, y: 0 }} end={{ x: 10, y: 0 }} rotation={90} />
        <Polygon id="p0" sides={4} r={10} centerX={0} centerY={0} />
        <Polygon id="p1" sides={4} r={10} centerX={0} centerY={0} rotation={90} />
        <Triangle id="t0" kind="equilateral" sideLength={100} x={50} y={25} />
        <Triangle id="t1" kind="equilateral" sideLength={100} x={50} y={25} rotation={90} />
        <Arc id="arc" center={{ x: 0, y: 0 }} r={10} rotation={15} />
        <Path id="path" d="M 0 0 L 10 0 L 10 10" rotation={20} />
        <ResolveProbe onRead={(data) => { snapshot = data; }} />
      </SolverProvider>,
    );

    await waitFor(() => {
      expect(snapshot).not.toBeNull();
    });

    expectPointClose(snapshot!.rectTopLeft, { x: 15, y: 5 });
    expectPointClose(snapshot!.rectTopRight, { x: 15, y: 15 });
    expectPointClose(snapshot!.rectBottomRight, { x: -5, y: 15 });
    expectPointClose(snapshot!.rectBottomLeft, { x: -5, y: 5 });
    expectPointClose(snapshot!.rect2TopLeft, { x: 15, y: 5 });
    expectPointClose(snapshot!.rect3TopLeft, { x: 15, y: 5 });

    expectPointClose(snapshot!.lineStart, { x: 5, y: -5 });
    expectPointClose(snapshot!.lineEnd, { x: 5, y: 5 });

    expectPointClose(snapshot!.polyV0, { x: 7.07, y: 7.07 });
    expectPointClose(snapshot!.polyV0Rot, { x: -7.07, y: 7.07 });

    expectPointClose(snapshot!.triV0, { x: 50, y: 111.6 });
    expectPointClose(snapshot!.triV0Rot, { x: 71.13, y: 32.73 });

    expect((snapshot!.arcRotation as { x: number }).x).toBeCloseTo(15, 1);
    expect((snapshot!.pathRotation as { x: number }).x).toBeCloseTo(20, 1);
    expect((snapshot!.textRotation as { x: number }).x).toBeCloseTo(90, 1);
  });
});
