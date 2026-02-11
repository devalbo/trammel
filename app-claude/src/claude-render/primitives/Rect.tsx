import React, { useId } from 'react';
import { useRenderPhase, useSolver } from './SolverContext';

export interface RectProps {
  id?: string;
  x?: number;
  y?: number;
  width?: number | string;
  height?: number | string;
  rx?: number;
  ry?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number | string;
  left?: number | string;
  right?: number | string;
  top?: number | string;
  bottom?: number | string;
  centerX?: number | string;
  centerY?: number | string;
}

function resolveScalar(
  value: number | string | undefined,
  solver: ReturnType<typeof useSolver>,
  selfId?: string,
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  if (!solver) throw new Error(`Cannot resolve reference "${value}": no SolverProvider found.`);
  return solver.resolve(value, selfId, selfId);
}

function resolveScalarWithAxisCheck(
  value: number | string | undefined,
  solver: ReturnType<typeof useSolver>,
  expectedAxis: 'x' | 'y',
  forProp: string,
  shapeId: string,
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  if (!solver) throw new Error(`Cannot resolve reference "${value}": no SolverProvider found.`);
  return solver.resolveWithAxisCheck(value, expectedAxis, forProp, shapeId, shapeId);
}

function resolveRotation(
  value: number | string | undefined,
  solver: ReturnType<typeof useSolver>,
  shapeId: string,
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  if (!solver) throw new Error(`Cannot resolve reference "${value}": no SolverProvider found.`);
  return solver.resolve(value, shapeId, shapeId);
}

function rotatePoint(px: number, py: number, pivotX: number, pivotY: number, rotationDeg: number): { x: number; y: number } {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - pivotX;
  const dy = py - pivotY;
  return {
    x: Math.round((pivotX + dx * cos - dy * sin) * 100) / 100,
    y: Math.round((pivotY + dx * sin + dy * cos) * 100) / 100,
  };
}

export const Rect: React.FC<RectProps> = ({
  id: idProp,
  x: xProp,
  y: yProp,
  width: widthProp = 0,
  height: heightProp = 0,
  rx,
  ry,
  fill,
  stroke,
  strokeWidth,
  rotation,
  left: leftProp,
  right: rightProp,
  top: topProp,
  bottom: bottomProp,
  centerX: centerXProp,
  centerY: centerYProp,
}) => {
  const solver = useSolver();
  const phase = useRenderPhase();
  const autoId = useId();
  const id = idProp ?? autoId;
  const isAutoId = idProp === undefined;
  const label = idProp ? `Rect "${idProp}"` : 'unnamed Rect';

  // Conflict warnings: detect when explicit prop and virtual prop target the same axis
  if (solver && phase === 'render') {
    // x-axis conflicts
    const xAxisProps = [
      xProp !== undefined && 'x',
      leftProp !== undefined && 'left',
      rightProp !== undefined && 'right',
      centerXProp !== undefined && 'centerX',
    ].filter(Boolean) as string[];
    if (xAxisProps.length > 1 && xAxisProps.includes('x')) {
      const others = xAxisProps.filter(p => p !== 'x').join(', ');
      solver.addDiagnostic('warning', id,
        `${label}: explicit 'x' is set alongside ${others}; 'x' takes precedence`);
    } else if (xAxisProps.length > 1) {
      solver.addDiagnostic('warning', id,
        `${label}: multiple x-axis props set (${xAxisProps.join(', ')}); only the first is used`);
    }

    // y-axis conflicts
    const yAxisProps = [
      yProp !== undefined && 'y',
      topProp !== undefined && 'top',
      bottomProp !== undefined && 'bottom',
      centerYProp !== undefined && 'centerY',
    ].filter(Boolean) as string[];
    if (yAxisProps.length > 1 && yAxisProps.includes('y')) {
      const others = yAxisProps.filter(p => p !== 'y').join(', ');
      solver.addDiagnostic('warning', id,
        `${label}: explicit 'y' is set alongside ${others}; 'y' takes precedence`);
    } else if (yAxisProps.length > 1) {
      solver.addDiagnostic('warning', id,
        `${label}: multiple y-axis props set (${yAxisProps.join(', ')}); only the first is used`);
    }
  }

  // Resolve width first, register it early so $self.width works for height
  const width = resolveScalar(widthProp, solver, id) ?? 0;
  if (solver) {
    solver.register(id, { width });
  }
  const height = resolveScalar(heightProp, solver, id) ?? 0;

  // Resolve virtual props (with cross-axis validation for string references)
  const left = resolveScalarWithAxisCheck(leftProp, solver, 'x', 'left', id);
  const right = resolveScalarWithAxisCheck(rightProp, solver, 'x', 'right', id);
  const top = resolveScalarWithAxisCheck(topProp, solver, 'y', 'top', id);
  const bottom = resolveScalarWithAxisCheck(bottomProp, solver, 'y', 'bottom', id);
  const centerX = resolveScalarWithAxisCheck(centerXProp, solver, 'x', 'centerX', id);
  const centerY = resolveScalarWithAxisCheck(centerYProp, solver, 'y', 'centerY', id);
  const resolvedRotation = resolveRotation(rotation, solver, id);

  // Derive x: explicit x wins, then left, right, centerX
  let x: number;
  if (xProp !== undefined) {
    x = xProp;
  } else if (left !== undefined) {
    x = left;
  } else if (right !== undefined) {
    x = right - width;
  } else if (centerX !== undefined) {
    x = centerX - width / 2;
  } else {
    x = 0;
  }

  // Derive y: explicit y wins, then top, bottom, centerY
  let y: number;
  if (yProp !== undefined) {
    y = yProp;
  } else if (top !== undefined) {
    y = top;
  } else if (bottom !== undefined) {
    y = bottom - height;
  } else if (centerY !== undefined) {
    y = centerY - height / 2;
  } else {
    y = 0;
  }

  // Register anchors, bounds, and shape (always, not just when id is explicit)
  if (solver) {
    const bounds = { left: x, right: x + width, top: y, bottom: y + height };
    const cx = x + width / 2;
    const cy = y + height / 2;
    if (resolvedRotation) {
      const corners = [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ];
      const [tl, tr, br, bl] = corners.map(c => rotatePoint(c.x, c.y, cx, cy, resolvedRotation));
      solver.register(id, {
        width,
        height,
        rotation: resolvedRotation,
        centerX: cx,
        centerY: cy,
        center: { x: cx, y: cy },
        left: Math.min(tl.x, tr.x, br.x, bl.x),
        right: Math.max(tl.x, tr.x, br.x, bl.x),
        top: Math.min(tl.y, tr.y, br.y, bl.y),
        bottom: Math.max(tl.y, tr.y, br.y, bl.y),
        topLeft: tl,
        topRight: tr,
        bottomRight: br,
        bottomLeft: bl,
      });
    } else {
      solver.register(id, {
        ...bounds,
        width,
        height,
        rotation: resolvedRotation ?? 0,
        centerX: cx,
        centerY: cy,
        center: { x: cx, y: cy },
        topLeft: { x, y },
        topRight: { x: x + width, y },
        bottomRight: { x: x + width, y: y + height },
        bottomLeft: { x, y: y + height },
      });
    }

    if (resolvedRotation) {
      const corners = [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ];
      solver.checkRotatedBounds(id, corners, resolvedRotation, x + width / 2, y + height / 2);
    } else {
      solver.checkBounds(id, bounds);
    }

    solver.registerShape(id, {
      type: 'rect',
      id,
      autoId: isAutoId,
      props: { x, y, width, height, rx, ry, fill, stroke, strokeWidth, rotation: resolvedRotation ?? rotation },
    });
  }

  const transform = resolvedRotation
    ? `rotate(${resolvedRotation}, ${x + width / 2}, ${y + height / 2})`
    : undefined;

  if (phase === 'register') {
    return null;
  }

  return (
    <rect
      id={idProp}
      x={x}
      y={y}
      width={width}
      height={height}
      rx={rx}
      ry={ry}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transform={transform}
    />
  );
};
