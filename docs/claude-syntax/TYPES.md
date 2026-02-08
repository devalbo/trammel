# Sprite Assembly Type System

Complete TypeScript type definitions for the 2D SVG Sprite Assembly dialect.

---

## 1. Core Primitives

```typescript
// ============================================================
// BRANDED TYPES
// Prevent mixing raw strings with semantic identifiers.
// ============================================================

/** Unique identifier for a shape or container. */
export type GeometryID = string & { readonly __brand: 'GeometryID' };

/**
 * Reference to another shape's anchor point.
 * Format: "#id.anchor" or "#id.anchor + 10"
 *
 * Examples:
 *   "#box1.right"
 *   "#header.centerX"
 *   "#bolt.top - 5"
 */
export type AnchorRef = string & { readonly __brand: 'AnchorRef' };

// ============================================================
// MATH PRIMITIVES
// ============================================================

export interface Point2D {
  x: number;
  y: number;
}

export interface Vector2D {
  dx: number;
  dy: number;
}

export type Axis = 'x' | 'y';
```

---

## 2. The Value System

Every numeric prop in the system accepts a `Length`. This is the key abstraction that lets you mix absolute values, relative percentages, references, and computed functions freely.

```typescript
/** Absolute pixels. */
export type AbsoluteValue = number;

/** Percentage of the parent Frame's corresponding dimension. */
export type RelativeValue = `${number}%`;

/** Dynamic value computed at solve time. */
export type CalcValue = (ctx: SolverContext) => number;

/**
 * THE MASTER VALUE TYPE.
 *
 * Any prop that accepts a Length can take:
 *   - A number:        width={100}
 *   - A percentage:    width="50%"
 *   - A reference:     width="#other.width"
 *   - A function:      width={(ctx) => ctx.parent.w * 0.5}
 */
export type Length = AbsoluteValue | RelativeValue | AnchorRef | CalcValue;
```

---

## 3. Anchor System

Shapes expose named anchor points that other shapes can reference. The set of anchors depends on the shape type.

```typescript
// Anchors available on rectangular shapes (Rect, Frame, Group, Layout)
export type RectAnchor =
  | 'top' | 'bottom' | 'left' | 'right'
  | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  | 'centerX' | 'centerY' | 'center'
  | 'width' | 'height';

// Anchors available on circles
export type CircleAnchor =
  | 'center' | 'centerX' | 'centerY'
  | 'top' | 'bottom' | 'left' | 'right'
  | 'r' | 'd';

// Anchors available on lines
export type LineAnchor =
  | 'start' | 'end' | 'midpoint'
  | 'startX' | 'startY' | 'endX' | 'endY'
  | 'length' | 'angle';

// Anchors available on arcs
export type ArcAnchor =
  | 'center' | 'centerX' | 'centerY'
  | 'start' | 'end' | 'midpoint'
  | 'r' | 'startAngle' | 'endAngle';

// Anchors available on triangles
export type TriangleAnchor =
  | 'v0' | 'v1' | 'v2'                        // Vertices (CCW from base-left)
  | 'top' | 'bottom' | 'left' | 'right'       // Bounding box edges
  | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' // Bounding box corners
  | 'centerX' | 'centerY' | 'center'          // Bounding box center
  | 'width' | 'height'                        // Bounding box dimensions
  | 'centroid'                                 // Geometric center (avg of vertices)
  | 'incenter'                                 // Center of inscribed circle
  | 'circumcenter'                             // Center of circumscribed circle
  | 'midpoint01' | 'midpoint12' | 'midpoint20'; // Edge midpoints

// Anchors available on regular polygons
export type PolygonAnchor =
  | `v${number}`                               // Vertices: v0, v1, v2, ...
  | 'top' | 'bottom' | 'left' | 'right'       // Bounding box edges
  | 'centerX' | 'centerY' | 'center'          // Geometric center
  | 'width' | 'height'                        // Bounding box dimensions
  | 'r'                                        // Circumradius
  | 'apothem';                                 // Inradius (center to edge midpoint)

// Anchors available on points
export type PointAnchor = 'x' | 'y';

// Anchors available on text
export type TextAnchor =
  | 'top' | 'bottom' | 'left' | 'right'
  | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  | 'centerX' | 'centerY' | 'center'
  | 'width' | 'height' | 'baseline';
```

---

## 4. Solver Context

The context object passed to `CalcValue` functions and available during constraint resolution.

```typescript
export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;

  // Computed edges (world space)
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
  readonly cx: number;    // center X
  readonly cy: number;    // center Y
}

export interface SolverContext {
  /** Look up any shape's resolved geometry by ID. */
  get(id: GeometryID): Readonly<BoundingBox>;

  /** The immediate parent Frame's geometry. */
  parent: Readonly<BoundingBox>;

  /** The previous sibling's geometry (for stacking). */
  prev?: Readonly<BoundingBox>;

  /** User-defined variables (parametric inputs). */
  vars: Record<string, number | string | boolean>;
}
```

---

## 5. Constraint Types

### 5A. Position Constraints

How a shape determines its location. Choose one strategy.

```typescript
/** Explicit coordinates. */
export interface PosManual {
  type: 'manual';
  x?: Length;
  y?: Length;
  anchor?: 'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

/** Snap a point on this shape to a point on another shape. */
export interface PosCoincident {
  type: 'coincident';
  anchor: 'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  target: AnchorRef | Point2D;
  offset?: Vector2D;
}

/** Align edges independently on each axis. */
export interface PosAlign {
  type: 'align';
  x?: {
    edge: 'left' | 'right' | 'center';
    target: AnchorRef;
    margin?: Length;
  };
  y?: {
    edge: 'top' | 'bottom' | 'center';
    target: AnchorRef;
    margin?: Length;
  };
}

/** Place as item N in a distributed chain. */
export interface PosDistribute {
  type: 'distribute';
  axis: Axis;
  startRef: AnchorRef;
  index: number;
  gap: Length;
  itemSize?: Length;
}

/** Polar coordinates from a center point. */
export interface PosPolar {
  type: 'polar';
  center: AnchorRef | Point2D;
  radius: Length;
  angle: Length;
}

export type PositionConstraint =
  | PosManual
  | PosCoincident
  | PosAlign
  | PosDistribute
  | PosPolar;
```

### 5B. Dimension Constraints

How a shape determines its size. Choose one strategy.

```typescript
/** Explicit size. */
export interface DimFixed {
  type: 'fixed';
  w?: Length;
  h?: Length;
}

/** Copy size from another shape. */
export interface DimMatch {
  type: 'match';
  target: GeometryID;
  axis: 'width' | 'height' | 'both';
  scale?: number;
}

/** Lock aspect ratio. */
export interface DimRatio {
  type: 'ratio';
  base: 'width' | 'height';
  ratio: number;
}

/** Fill available space between two anchors. */
export interface DimFit {
  type: 'fit';
  horizontal?: { start: AnchorRef; end: AnchorRef; margin?: number };
  vertical?: { start: AnchorRef; end: AnchorRef; margin?: number };
}

/** Computed size via function. */
export interface DimCalc {
  type: 'calc';
  w?: CalcValue;
  h?: CalcValue;
}

export type DimensionConstraint =
  | DimFixed
  | DimMatch
  | DimRatio
  | DimFit
  | DimCalc;
```

### 5C. Geometric Constraints

Shape-to-shape topological relationships.

```typescript
/** Touch a curve at exactly one point. */
export interface GeoTangent {
  type: 'tangent';
  target: GeometryID;
  side: 'outside' | 'inside';
  offset?: number;
}

/** Force two shapes to share a center point. */
export interface GeoConcentric {
  type: 'concentric';
  target: GeometryID;
}

/** Mirror this shape across an axis. */
export interface GeoSymmetry {
  type: 'symmetry';
  source: GeometryID;
  axis: GeometryID;
  mode: 'mirror' | 'clone';
}

/** Place at the intersection of two geometries. */
export interface GeoIntersection {
  type: 'intersection';
  targetA: GeometryID;
  targetB: GeometryID;
}

/** Force two edges to be collinear. */
export interface GeoCollinear {
  type: 'collinear';
  edge: 'left' | 'right' | 'top' | 'bottom';
  target: AnchorRef;
}

/** Force angle to match or offset from a target. */
export interface GeoParallel {
  type: 'parallel';
  target: GeometryID;
  offset?: number; // 0 = parallel, 90 = perpendicular
}

export type GeometricConstraint =
  | GeoTangent
  | GeoConcentric
  | GeoSymmetry
  | GeoIntersection
  | GeoCollinear
  | GeoParallel;
```

---

## 6. Shape Component Interfaces

### 6A. Base Props (shared by all shapes)

```typescript
export interface BaseShapeProps {
  /** Unique identifier. Required if any other shape references this one. */
  id?: GeometryID;

  // --- Constraint props (typed objects) ---
  pos?: PositionConstraint;
  dim?: DimensionConstraint;
  geo?: GeometricConstraint;

  // --- Virtual positioning props (string sugar) ---
  x?: Length;
  y?: Length;
  left?: Length | AnchorRef;
  right?: Length | AnchorRef;
  top?: Length | AnchorRef;
  bottom?: Length | AnchorRef;
  centerX?: Length | AnchorRef;
  centerY?: Length | AnchorRef;

  // --- Stacking ---
  z?: number;

  // --- Rotation ---
  rotate?: number | { match: AnchorRef; add?: number };

  // --- Presentation ---
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;

  // --- Interaction ---
  onClick?: (e: React.MouseEvent) => void;
  onHover?: (e: React.MouseEvent) => void;

  // --- Metadata ---
  label?: string;       // Human-readable name (for debugging/UI)
  locked?: boolean;      // Prevent solver from moving this shape
  visible?: boolean;     // Hide without removing from constraint graph
}
```

### 6B. Primitive Shapes

```typescript
export interface RectProps extends BaseShapeProps {
  width?: Length;
  height?: Length;
  rx?: number;  // Corner radius X
  ry?: number;  // Corner radius Y
}

export interface CircleProps extends BaseShapeProps {
  r?: Length;
  d?: Length;   // Diameter (alternative to r)
}

export interface LineProps extends BaseShapeProps {
  start?: Point2D | AnchorRef;
  end?: Point2D | AnchorRef;
  length?: Length;      // If only start + angle are given
}

export interface ArcProps extends BaseShapeProps {
  center?: Point2D | AnchorRef;
  r?: Length;
  startAngle?: number;
  endAngle?: number;
  sweep?: number;       // Alternative: arc length in degrees
}

export interface PathProps extends BaseShapeProps {
  d: string;            // SVG path data (normalized 0..1 if inside Frame)
  normalized?: boolean; // Whether path coords are 0..1 (default: true inside Frame)
}

export interface TextProps extends BaseShapeProps {
  children: string;
  fontSize?: Length;
  fontFamily?: string;
  fontWeight?: string | number;
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?: 'auto' | 'middle' | 'hanging';
}

export interface PointProps extends BaseShapeProps {
  /** A Point is invisible geometry. It exists only as an anchor target. */
  at?: Point2D | AnchorRef;
}

// ============================================================
// TRIANGLE
// ============================================================

export type TriangleKind = 'equilateral' | 'right' | 'isosceles' | 'scalene';

/**
 * A triangle primitive. The `kind` prop selects the construction method,
 * which determines which other props are relevant.
 *
 * Vertex winding is always counter-clockwise: v0 = base-left, v1 = base-right,
 * v2 = apex (opposite the base). For right triangles, v0 is the right-angle vertex.
 *
 * All triangle kinds accept `baseAngle` to rotate the base edge.
 */
export interface TriangleProps extends BaseShapeProps {
  kind: TriangleKind;

  // --- Equilateral: one side length defines everything ---
  sideLength?: Length;

  // --- Right: base and height (right angle at v0) ---
  base?: Length;
  height?: Length;

  // --- Isosceles: base + height, or base + legs ---
  legs?: Length;           // Length of the two equal sides

  // --- Scalene: three explicit side lengths ---
  a?: Length;              // Side v0→v1 (base)
  b?: Length;              // Side v1→v2
  c?: Length;              // Side v2→v0

  // --- Any: direct vertex override (ignores kind) ---
  vertices?: [Point2D, Point2D, Point2D];

  // --- Orientation ---
  baseAngle?: number;      // Rotation of the base edge in degrees (default: 0 = horizontal)
}

// ============================================================
// REGULAR POLYGON
// ============================================================

/**
 * A regular polygon (all sides and angles equal).
 * Use `sides` to specify the shape: 5 = pentagon, 6 = hexagon, etc.
 *
 * Size is specified by one of: `r` (circumradius), `apothem` (inradius),
 * or `sideLength`. The others are computed.
 *
 * Vertices are numbered v0..v{sides-1} counter-clockwise from the
 * "flat bottom" orientation (v0 at bottom-right of base edge).
 * Use `startAngle` to rotate the whole polygon.
 */
export interface PolygonProps extends BaseShapeProps {
  sides: number;           // Must be >= 3

  // --- Size (provide one, others are derived) ---
  r?: Length;              // Circumradius (center to vertex)
  apothem?: Length;        // Inradius (center to edge midpoint)
  sideLength?: Length;     // Edge length

  // --- Orientation ---
  startAngle?: number;     // Rotation offset in degrees (default: 0 = flat bottom)
}
```

### 6C. Container Components

```typescript
/**
 * Root container. Defines the SVG viewBox.
 * All coordinates inside are in the viewBox's unit space.
 */
export interface SpriteProps {
  viewBox: string;              // e.g. "0 0 200 300"
  children: React.ReactNode;
  vars?: Record<string, number | string | boolean>;  // Parametric inputs
  debug?: boolean;              // Show bounding boxes, anchor points
}

/**
 * Coordinate scope container.
 * Children use normalized 0..1 coordinates relative to this Frame's bounds.
 */
export interface FrameProps extends BaseShapeProps {
  /** Top-left corner in parent space (0..1 if nested, px if under Sprite). */
  from?: Point2D;
  /** Bottom-right corner in parent space. */
  to?: Point2D;
  clip?: boolean;               // Clip children to Frame bounds
  debug?: boolean;              // Draw Frame boundary
  children?: React.ReactNode;
}

/**
 * Auto-distribution container.
 * Children are positioned automatically along an axis.
 */
export interface LayoutProps extends BaseShapeProps {
  direction: 'row' | 'column';
  gap?: Length;
  padding?: Length;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  wrap?: boolean;
  children: React.ReactNode;
}

/**
 * Logical grouping with no coordinate transform.
 * Useful for z-ordering a set of shapes together or toggling visibility.
 */
export interface GroupProps {
  id?: GeometryID;
  z?: number;
  visible?: boolean;
  opacity?: number;
  children: React.ReactNode;
}
```

---

## 7. Parametric Variables

```typescript
/**
 * Variable definition for parametric sprites.
 * Passed via <Sprite vars={...}> and accessible in CalcValue functions.
 */
export interface VariableDefinition {
  name: string;
  type: 'number' | 'color' | 'boolean' | 'select';
  default: number | string | boolean;
  label?: string;

  // Number-specific
  min?: number;
  max?: number;
  step?: number;
  unit?: string;

  // Select-specific
  options?: Array<{ label: string; value: string | number }>;
}
```

---

## 8. Helper Functions

```typescript
/** Create a type-safe GeometryID. */
export const id = (s: string): GeometryID => s as GeometryID;

/** Create a type-safe AnchorRef. Validates "#id.anchor" format. */
export const ref = (s: string): AnchorRef => {
  if (process.env.NODE_ENV !== 'production') {
    if (!s.startsWith('#') || !s.includes('.')) {
      console.warn(`Invalid AnchorRef: "${s}". Expected "#id.anchor" format.`);
    }
  }
  return s as AnchorRef;
};

/** Shorthand: create a Length that's a percentage of the parent. */
export const pct = (n: number): RelativeValue => `${n}%` as RelativeValue;

/** Shorthand: create a CalcValue from a function. */
export const calc = (fn: CalcValue): CalcValue => fn;
```
