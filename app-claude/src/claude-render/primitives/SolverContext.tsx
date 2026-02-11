import React, { createContext, useContext, useRef } from 'react';

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
  private _diagnostics: SolverDiagnostic[] = [];
  private _viewBox: ViewBox | null = null;

  get diagnostics(): readonly SolverDiagnostic[] {
    return this._diagnostics;
  }

  get viewBox(): ViewBox | null {
    return this._viewBox;
  }

  setViewBox(vb: ViewBox): void {
    this._viewBox = vb;
  }

  register(id: string, values: Record<string, number | Point2D>): void {
    this.anchors.set(id, values);
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

  resolve(ref: string): number {
    const { id, anchor } = parseRef(ref);
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
