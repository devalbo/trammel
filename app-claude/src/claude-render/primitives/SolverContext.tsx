import React, { createContext, useContext, useRef } from 'react';
import { parseExpr, parseAndEvaluate, collectAnchors } from './ExprParser';

export interface Point2D {
  x: number;
  y: number;
}

export type DiagnosticLevel = 'warning' | 'error';

export interface SolverDiagnostic {
  level: DiagnosticLevel;
  shapeId: string;
  message: string;
}

export interface ViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export interface RealizedShape {
  type: 'rect' | 'circle' | 'line';
  id: string;
  autoId: boolean;
  props: Record<string, unknown>;
}

const X_AXIS_ANCHORS = new Set(['left', 'right', 'centerX', 'startX', 'endX']);
const Y_AXIS_ANCHORS = new Set(['top', 'bottom', 'centerY', 'startY', 'endY']);

/**
 * Parses a reference string like "#boxA.right" into { id, anchor }.
 */
export function parseRef(ref: string): { id: string; anchor: string } {
  const match = ref.match(/^#([^.]+)\.(.+)$/);
  if (!match) {
    throw new Error(`Invalid anchor reference: "${ref}". Expected format "#id.anchor".`);
  }
  return { id: match[1], anchor: match[2] };
}


/**
 * Synchronous registry that stores anchor values for shapes.
 * Shapes register anchors as they render (top-to-bottom in JSX order),
 * so later shapes can resolve references to earlier shapes.
 *
 * Also accumulates diagnostics (warnings/errors) that can be read
 * after the render cycle completes.
 */
export class AnchorRegistry {
  private anchors = new Map<string, Record<string, number | Point2D>>();
  private shapes = new Map<string, RealizedShape>();
  private _diagnostics: SolverDiagnostic[] = [];
  private _viewBox: ViewBox | null = null;

  get diagnostics(): readonly SolverDiagnostic[] {
    return this._diagnostics;
  }

  get viewBox(): ViewBox | null {
    return this._viewBox;
  }

  get realizedShapes(): readonly RealizedShape[] {
    return Array.from(this.shapes.values());
  }

  setViewBox(vb: ViewBox): void {
    this._viewBox = vb;
  }

  register(id: string, values: Record<string, number | Point2D>): void {
    this.anchors.set(id, values);
  }

  registerShape(id: string, shape: RealizedShape): void {
    this.shapes.set(id, shape);
  }

  addDiagnostic(level: DiagnosticLevel, shapeId: string, message: string): void {
    this._diagnostics.push({ level, shapeId, message });
  }

  /**
   * Check a shape's axis-aligned bounds against the viewBox.
   * Pushes warnings for any edges that extend outside.
   */
  checkBounds(shapeId: string, bounds: { left: number; right: number; top: number; bottom: number }): void {
    const vb = this._viewBox;
    if (!vb) return;

    const vbRight = vb.minX + vb.width;
    const vbBottom = vb.minY + vb.height;

    if (bounds.left < vb.minX) {
      this.addDiagnostic('warning', shapeId, `Left edge (${bounds.left}) is outside viewBox (minX=${vb.minX})`);
    }
    if (bounds.top < vb.minY) {
      this.addDiagnostic('warning', shapeId, `Top edge (${bounds.top}) is outside viewBox (minY=${vb.minY})`);
    }
    if (bounds.right > vbRight) {
      this.addDiagnostic('warning', shapeId, `Right edge (${bounds.right}) extends beyond viewBox (maxX=${vbRight})`);
    }
    if (bounds.bottom > vbBottom) {
      this.addDiagnostic('warning', shapeId, `Bottom edge (${bounds.bottom}) extends beyond viewBox (maxY=${vbBottom})`);
    }
  }

  /**
   * Check rotated bounds against the viewBox.
   * Rotates corner points around a pivot, computes the AABB, and checks against viewBox.
   */
  checkRotatedBounds(
    shapeId: string,
    corners: Point2D[],
    rotationDeg: number,
    pivotX: number,
    pivotY: number,
  ): void {
    const vb = this._viewBox;
    if (!vb) return;

    const rad = (rotationDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const rotated = corners.map(({ x, y }) => ({
      x: pivotX + (x - pivotX) * cos - (y - pivotY) * sin,
      y: pivotY + (x - pivotX) * sin + (y - pivotY) * cos,
    }));

    const xs = rotated.map(p => p.x);
    const ys = rotated.map(p => p.y);

    this.checkBounds(shapeId, {
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: Math.min(...ys),
      bottom: Math.max(...ys),
    });
  }

  /**
   * Resolve a reference with cross-axis validation.
   * If the referenced anchor name implies a different axis than expected, pushes a warning.
   */
  resolveWithAxisCheck(
    ref: string,
    expectedAxis: 'x' | 'y',
    forProp: string,
    shapeId: string,
    selfId?: string,
  ): number {
    const ast = parseExpr(ref);
    const anchors = collectAnchors(ast);

    for (const anchor of anchors) {
      const isXAnchor = X_AXIS_ANCHORS.has(anchor);
      const isYAnchor = Y_AXIS_ANCHORS.has(anchor);

      if (expectedAxis === 'x' && isYAnchor) {
        this.addDiagnostic(
          'warning',
          shapeId,
          `'${forProp}' references '${ref}' which is a y-axis anchor; did you mean a different anchor?`,
        );
      } else if (expectedAxis === 'y' && isXAnchor) {
        this.addDiagnostic(
          'warning',
          shapeId,
          `'${forProp}' references '${ref}' which is an x-axis anchor; did you mean a different anchor?`,
        );
      }
    }

    return this.resolve(ref, selfId);
  }

  resolve(ref: string, selfId?: string): number {
    const lookup = (rawId: string, anchor: string): number => {
      const id = rawId === '$self' ? selfId : rawId;
      if (!id) {
        throw new Error(`"$self" used in "${ref}" but no shape ID context available.`);
      }
      const shapeAnchors = this.anchors.get(id);
      if (!shapeAnchors) {
        throw new Error(`Anchor reference "#${id}.${anchor}": shape "${id}" not found. Is it defined before this shape?`);
      }
      const value = shapeAnchors[anchor];
      if (value === undefined) {
        throw new Error(`Anchor reference "#${id}.${anchor}": anchor "${anchor}" not found on shape "${id}".`);
      }
      if (typeof value !== 'number') {
        throw new Error(`Anchor reference "#${id}.${anchor}" resolved to a point, not a number. Use resolvePoint() for point anchors.`);
      }
      return value;
    };

    return parseAndEvaluate(ref, lookup);
  }

  resolvePoint(ref: string): Point2D {
    const { id, anchor } = parseRef(ref);
    const shapeAnchors = this.anchors.get(id);
    if (!shapeAnchors) {
      throw new Error(`Anchor reference "#${id}.${anchor}": shape "${id}" not found. Is it defined before this shape?`);
    }
    const value = shapeAnchors[anchor];
    if (value === undefined) {
      throw new Error(`Anchor reference "#${id}.${anchor}": anchor "${anchor}" not found on shape "${id}".`);
    }
    if (typeof value === 'number') {
      throw new Error(`Anchor reference "#${id}.${anchor}" resolved to a number, not a point. Use resolve() for scalar anchors.`);
    }
    return value;
  }

  reset(): void {
    this.anchors.clear();
    this.shapes.clear();
    this._diagnostics = [];
  }
}

const SolverContext = createContext<AnchorRegistry | null>(null);

export interface SolverProviderProps {
  viewBox?: ViewBox;
  children: React.ReactNode;
}

/**
 * Provides an AnchorRegistry to descendant primitives.
 * The registry is reset at the start of each render so stale anchors
 * from a previous render cycle don't leak through.
 */
export const SolverProvider: React.FC<SolverProviderProps> = ({ viewBox, children }) => {
  const registryRef = useRef<AnchorRegistry | null>(null);
  // Create once
  if (registryRef.current === null) {
    registryRef.current = new AnchorRegistry();
  }
  // Reset on every render so shapes re-register fresh anchors
  registryRef.current.reset();
  if (viewBox) {
    registryRef.current.setViewBox(viewBox);
  }

  return (
    <SolverContext.Provider value={registryRef.current}>
      {children}
    </SolverContext.Provider>
  );
};

/**
 * Hook to access the anchor registry. Returns null if used outside a SolverProvider.
 */
export function useSolver(): AnchorRegistry | null {
  return useContext(SolverContext);
}

/**
 * Hook to read solver diagnostics. Returns an empty array if used outside a SolverProvider.
 */
export function useSolverDiagnostics(): readonly SolverDiagnostic[] {
  const registry = useContext(SolverContext);
  return registry?.diagnostics ?? [];
}

/**
 * Hook to read all realized shapes. Returns an empty array if used outside a SolverProvider.
 */
export function useSolverShapes(): readonly RealizedShape[] {
  const registry = useContext(SolverContext);
  return registry?.realizedShapes ?? [];
}
