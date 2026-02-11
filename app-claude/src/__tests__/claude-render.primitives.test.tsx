import React, { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import {
  Arc,
  Circle,
  Hexagon,
  Line,
  Pentagon,
  Path,
  Point,
  Polygon,
  Rect,
  SolverProvider,
  Sprite,
  SpriteText,
  Triangle,
  AnchorRegistry,
  parseRef,
  useSolver,
  useSolverDiagnostics,
  useSolverShapes,
} from '../claude-render';

function ShapesProbe({ onRead }: { onRead: (data: { shapes: readonly unknown[]; diagnostics: readonly unknown[] }) => void }) {
  const shapes = useSolverShapes();
  const diagnostics = useSolverDiagnostics();
  useEffect(() => {
    onRead({ shapes, diagnostics });
  });
  return null;
}

function DiagnosticAdder() {
  const solver = useSolver();
  if (solver) {
    solver.addDiagnostic('warning', 'shape-a', 'warn-a');
    solver.addDiagnostic('error', 'shape-b', 'error-b');
  }
  return null;
}

describe('SolverContext basics', () => {
  it('parseRef parses valid refs and rejects invalid', () => {
    expect(parseRef('#box.right')).toEqual({ id: 'box', anchor: 'right' });
    expect(() => parseRef('box.right')).toThrow('Invalid anchor reference');
  });

  it('AnchorRegistry resolves scalars and points, with errors', () => {
    const reg = new AnchorRegistry();
    reg.register('box', {
      left: 10,
      width: 20,
      center: { x: 15, y: 25 },
    });

    expect(reg.resolve('#box.left')).toBe(10);
    expect(reg.resolve('#box.width')).toBe(20);
    expect(reg.resolvePoint('#box.center')).toEqual({ x: 15, y: 25 });
    expect(() => reg.resolvePoint('#box.left')).toThrow('resolved to a number');
    expect(() => reg.resolve('#box.center')).toThrow('resolved to a point');
    expect(() => reg.resolve('#missing.left')).toThrow('shape "missing" not found');
  });

  it('resolveWithAxisCheck warns on cross-axis anchors and still resolves', () => {
    const reg = new AnchorRegistry();
    reg.register('box', { top: 5, left: 7 });

    const value = reg.resolveWithAxisCheck('#box.top', 'x', 'left', 'shape-1');
    expect(value).toBe(5);
    expect(reg.diagnostics).toHaveLength(1);
    expect(reg.diagnostics[0].message).toContain('y-axis anchor');
  });

  it('checkBounds and checkRotatedBounds add warnings outside viewBox', () => {
    const reg = new AnchorRegistry();
    reg.setViewBox({ minX: 0, minY: 0, width: 10, height: 10 });
    reg.checkBounds('shape-1', { left: -1, right: 5, top: 0, bottom: 12 });
    expect(reg.diagnostics.length).toBeGreaterThan(0);

    reg.reset();
    reg.setViewBox({ minX: 0, minY: 0, width: 10, height: 10 });
    reg.checkRotatedBounds('shape-2', [{ x: -5, y: 0 }, { x: 5, y: 0 }], 45, 0, 0);
    expect(reg.diagnostics.length).toBeGreaterThan(0);
  });

  it('reset clears anchors, shapes, and diagnostics', () => {
    const reg = new AnchorRegistry();
    reg.register('box', { left: 1 });
    reg.registerShape('box', { type: 'rect', id: 'box', autoId: false, props: {} });
    reg.addDiagnostic('warning', 'box', 'warn');
    reg.reset();
    expect(reg.diagnostics).toHaveLength(0);
    expect(reg.realizedShapes).toHaveLength(0);
    expect(() => reg.resolve('#box.left')).toThrow('shape "box" not found');
  });

  it('hooks return empty values outside provider', async () => {
    const snapshots: Array<{ shapes: readonly unknown[]; diagnostics: readonly unknown[] }> = [];
    render(<ShapesProbe onRead={(data) => snapshots.push(data)} />);
    await waitFor(() => {
      expect(snapshots.length).toBeGreaterThan(0);
    });
    expect(snapshots[0].shapes).toEqual([]);
    expect(snapshots[0].diagnostics).toEqual([]);
  });

  it('SolverProvider resets registry each render', async () => {
    let snapshot: { shapes: readonly unknown[]; diagnostics: readonly unknown[] } | null = null;
    const { rerender } = render(
      <SolverProvider viewBox={{ minX: 0, minY: 0, width: 100, height: 100 }}>
        <Rect id="r1" width={10} height={10} />
        <ShapesProbe onRead={(data) => { snapshot = data; }} />
      </SolverProvider>,
    );

    await waitFor(() => {
      expect(snapshot?.shapes.length).toBe(1);
    });

    rerender(
      <SolverProvider viewBox={{ minX: 0, minY: 0, width: 100, height: 100 }}>
        <ShapesProbe onRead={(data) => { snapshot = data; }} />
      </SolverProvider>,
    );

    await waitFor(() => {
      expect(snapshot?.shapes.length).toBe(0);
    });
  });
});

describe('Primitives', () => {
  it('Sprite parses viewBox and logs diagnostics', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const { container } = render(
      <Sprite viewBox="0 0 100 50">
        <DiagnosticAdder />
      </Sprite>,
    );

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('100');
    expect(svg?.getAttribute('height')).toBe('50');

    await waitFor(() => {
      expect(warn).toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    warn.mockRestore();
    error.mockRestore();
  });

  it('Rect resolves precedence and registers shape', async () => {
    let snapshot: { shapes: readonly unknown[]; diagnostics: readonly unknown[] } | null = null;
    render(
      <SolverProvider viewBox={{ minX: 0, minY: 0, width: 200, height: 200 }}>
        <Rect id="r1" x={10} left={5} width={40} height="$self.width" />
        <ShapesProbe onRead={(data) => { snapshot = data; }} />
      </SolverProvider>,
    );

    await waitFor(() => {
      expect(snapshot).not.toBeNull();
      expect(snapshot!.diagnostics.length).toBe(1);
    });

    const shape = (snapshot!.shapes as Array<{ id: string; props: Record<string, unknown> }>)[0];
    expect(shape.id).toBe('r1');
    expect(shape.props.x).toBe(10);
    expect(shape.props.y).toBe(0);
    expect(shape.props.width).toBe(40);
    expect(shape.props.height).toBe(40);
  });

  it('Circle registers shape and sets rotation transform', async () => {
    let snapshot: { shapes: readonly unknown[]; diagnostics: readonly unknown[] } | null = null;
    const { container } = render(
      <SolverProvider viewBox={{ minX: 0, minY: 0, width: 100, height: 100 }}>
        <Circle id="c1" centerX={20} centerY={30} r={5} rotation={45} />
        <ShapesProbe onRead={(data) => { snapshot = data; }} />
      </SolverProvider>,
    );

    await waitFor(() => {
      expect(snapshot).not.toBeNull();
    });

    const circle = container.querySelector('circle');
    expect(circle?.getAttribute('transform')).toBe('rotate(45, 20, 30)');
    const shape = (snapshot!.shapes as Array<{ id: string; props: Record<string, unknown> }>)[0];
    expect(shape.id).toBe('c1');
    expect(shape.props.cx).toBe(20);
    expect(shape.props.cy).toBe(30);
  });

  it('Line resolves point references and registers shape', async () => {
    let snapshot: { shapes: readonly unknown[]; diagnostics: readonly unknown[] } | null = null;
    render(
      <SolverProvider viewBox={{ minX: 0, minY: 0, width: 100, height: 100 }}>
        <Rect id="base" x={10} y={20} width={30} height={40} />
        <Line id="ln" start="#base.center" end={{ x: 70, y: 80 }} />
        <ShapesProbe onRead={(data) => { snapshot = data; }} />
      </SolverProvider>,
    );

    await waitFor(() => {
      expect(snapshot).not.toBeNull();
      expect(snapshot!.shapes.length).toBe(2);
    });
    const line = (snapshot!.shapes as Array<{ id: string; props: Record<string, unknown> }>).find(s => s.id === 'ln');
    expect(line?.props.x1).toBe(25);
    expect(line?.props.y1).toBe(40);
    expect(line?.props.x2).toBe(70);
    expect(line?.props.y2).toBe(80);
  });

  it('Path computes rotation around d center', () => {
    const { container } = render(
      <Path id="p1" d="M 0 0 L 10 0 L 10 10" rotation={90} />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('transform')).toBe('rotate(90, 5, 5)');
  });

  it('Arc renders expected path and rotation', () => {
    const { container } = render(
      <Arc id="a1" center={{ x: 0, y: 0 }} r={10} startAngle={0} endAngle={270} rotation={15} />,
    );
    const path = container.querySelector('path');
    const d = path?.getAttribute('d') ?? '';
    expect(d).toContain('A 10 10 0 1 0');
    expect(path?.getAttribute('transform')).toBe('rotate(15, 0, 0)');
  });

  it('Triangle computes vertices and transform', () => {
    const { container } = render(
      <Triangle id="t1" kind="equilateral" sideLength={2} x={0} y={0} rotation={30} />,
    );
    const poly = container.querySelector('polygon');
    const points = poly?.getAttribute('points') ?? '';
    expect(points).toContain('0,1.73');
    expect(points).toContain('2,1.73');
    expect(points).toContain('1,0');
    expect(poly?.getAttribute('transform')).toContain('rotate(30,');
  });

  it('Polygon computes points and rotation', () => {
    const { container } = render(
      <Polygon id="p1" sides={4} r={10} centerX={5} centerY={5} rotation={45} />,
    );
    const poly = container.querySelector('polygon');
    const points = poly?.getAttribute('points') ?? '';
    expect(points.split(' ').length).toBe(4);
    expect(poly?.getAttribute('transform')).toBe('rotate(45, 5, 5)');
  });

  it('Hexagon and Pentagon delegate to Polygon', () => {
    const { container } = render(
      <svg>
        <Hexagon id="hx" r={10} centerX={0} centerY={0} />
        <Pentagon id="pn" r={10} centerX={0} centerY={0} />
      </svg>,
    );
    const polygons = container.querySelectorAll('polygon');
    expect(polygons).toHaveLength(2);
    const hexPoints = polygons[0].getAttribute('points') ?? '';
    const pentPoints = polygons[1].getAttribute('points') ?? '';
    expect(hexPoints.split(' ').length).toBe(6);
    expect(pentPoints.split(' ').length).toBe(5);
  });

  it('SpriteText renders text and rotation', () => {
    const { container } = render(
      <SpriteText id="tx" x={10} y={20} rotation={90}>Hello</SpriteText>,
    );
    const text = container.querySelector('text');
    expect(text?.textContent).toBe('Hello');
    expect(text?.getAttribute('transform')).toBe('rotate(90, 10, 20)');
  });

  it('Point renders nothing', () => {
    const { container } = render(<Point id="p1" at={{ x: 1, y: 2 }} />);
    expect(container.firstChild).toBeNull();
  });
});
