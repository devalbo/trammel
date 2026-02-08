Here is the **Exhaustive TypeScript Specification** for the **React-CAD Constraint System**.

This specification is designed to be copy-pasted into a `types.ts` or `schema.ts` file. It leverages **Branded Types** to prevent primitive obsession errors (like confusing an ID with a CSS string) and **Discriminated Unions** to enforce mutually exclusive layout strategies.

### Module 1: Core Primitives & Brands

*The atomic units of the system.*

```typescript
// --- 1. BRANDED STRINGS (Type Safety) ---
// Prevents passing a raw string where a Reference ID or Formula is expected.

export type GeometryID = string & { readonly __brand: unique symbol };
export type AnchorRef = string & { readonly __brand: unique symbol }; // e.g., "#box1.top"
export type FormulaString = string & { readonly __brand: unique symbol }; // e.g., "#box1.width / 2"
export type ColorString = string; // Standard CSS color

// --- 2. BASIC MATH TYPES ---
export interface Point2D {
  x: number;
  y: number;
}

export interface Vector2D {
  dx: number;
  dy: number;
}

export type Axis = 'x' | 'y';
export type Edge = 'top' | 'bottom' | 'left' | 'right' | 'center';

// --- 3. CONTEXT AWARENESS (The "Solver" API) ---
// This object is passed to functional constraints.
export interface SolverContext {
  // Look up another shape's geometry by ID
  get(id: GeometryID): Readonly<BoundingBox>;
  
  // Access the immediate parent Frame's geometry
  parent: Readonly<BoundingBox>;
  
  // Access the previous sibling (useful for stacking)
  prev?: Readonly<BoundingBox>;
  
  // Global helper variables (e.g., grid size)
  vars: Record<string, number>;
}

// The Computed Geometry of any shape
export interface BoundingBox {
  x: number; y: number;
  w: number; h: number;
  // Computed Anchors (World Space)
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
  readonly cx: number; 
  readonly cy: number;
}

```

---

### Module 2: The Value System

*How we express numbers, percentages, and functions.*

```typescript
// A static number (Pixels)
export type StaticValue = number;

// A relative percentage of the PARENT Frame (e.g., "50%")
export type RelativeValue = `${number}%`;

// A dynamic function calculated at render time
export type CalcValue = (ctx: SolverContext) => number;

// THE MASTER VALUE TYPE
export type Length = StaticValue | RelativeValue | CalcValue;

```

---

### Module 3: Constraint Strategies (Unions)

*The heart of the system. You must choose ONE strategy per category.*

#### A. Position (Location)

```typescript
// 1. MANUAL: "Put me at X, Y"
export interface PosManual {
  type: 'manual';
  x?: Length; 
  y?: Length;
  anchor?: 'center' | 'topLeft'; // Pivot point defaults to topLeft
}

// 2. COINCIDENT: "Snap point A to point B"
export interface PosCoincident {
  type: 'coincident';
  anchor: 'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  target: AnchorRef | Point2D;
  offset?: { x: number; y: number };
}

// 3. ALIGN: "Snap edges independently"
export interface PosAlign {
  type: 'align';
  x?: { 
    edge: 'left' | 'right' | 'center'; 
    target: AnchorRef; // Must reference an X-axis anchor (e.g., #box.right)
    margin?: Length; 
  };
  y?: { 
    edge: 'top' | 'bottom' | 'center'; 
    target: AnchorRef; // Must reference a Y-axis anchor
    margin?: Length; 
  };
}

// 4. DISTRIBUTE: "I am item N in a chain"
export interface PosDistribute {
  type: 'distribute';
  axis: Axis;
  startRef: AnchorRef;   // The anchor to start counting from
  index: number;         // 0, 1, 2...
  gap: Length;           // Fixed spacing
  itemSize?: Length;     // If items are uniform, specify size here to optimize
}

// 5. POLAR: "Distance and Angle from a center"
export interface PosPolar {
  type: 'polar';
  center: AnchorRef | Point2D;
  radius: Length;
  angle: Length; // Degrees
}

export type PositionConstraint = 
  | PosManual 
  | PosCoincident 
  | PosAlign 
  | PosDistribute 
  | PosPolar;

```

#### B. Dimensions (Size)

```typescript
// 1. FIXED: Explicit size
export interface DimFixed {
  type: 'fixed';
  w?: Length;
  h?: Length;
}

// 2. MATCH: Copy another object
export interface DimMatch {
  type: 'match';
  target: GeometryID;
  axis: 'width' | 'height' | 'both';
  scale?: number; // e.g., 0.5 = Half size
}

// 3. RATIO: Aspect Ratio
export interface DimRatio {
  type: 'ratio';
  base: 'width' | 'height'; // Which dimension is the "Master"?
  ratio: number;            // Master * Ratio = Slave
}

// 4. FIT: Fill available space
export interface DimFit {
  type: 'fit';
  // Fill width between two X-anchors
  horizontal?: { start: AnchorRef; end: AnchorRef; margin?: number };
  // Fill height between two Y-anchors
  vertical?: { start: AnchorRef; end: AnchorRef; margin?: number };
}

// 5. CALC: Pure function overrides
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

#### C. Geometry (Topology)

*Overrides Position and Rotation logic.*

```typescript
// 1. TANGENT: Touch a curve
export interface GeoTangent {
  type: 'tangent';
  target: GeometryID;
  side: 'outside' | 'inside';
  offset?: number;
}

// 2. CONCENTRIC: Share a center
export interface GeoConcentric {
  type: 'concentric';
  target: GeometryID;
}

// 3. SYMMETRY: Mirroring
export interface GeoSymmetry {
  type: 'symmetry';
  source: GeometryID;
  axis: GeometryID;
  mode: 'mirror' | 'clone';
}

// 4. INTERSECTION: Point where lines cross
export interface GeoIntersection {
  type: 'intersection';
  targetA: GeometryID;
  targetB: GeometryID;
}

export type GeometricConstraint = 
  | GeoTangent 
  | GeoConcentric 
  | GeoSymmetry 
  | GeoIntersection;

```

---

### Module 4: Component Interfaces

*The React Props.*

```typescript
// --- BASE PROPS (Shared by all shapes) ---
export interface BaseShapeProps {
  // Identity (Required for constraint referencing)
  id?: GeometryID; 
  
  // Logical Constraints (Optional - defaults to Manual/Fixed)
  pos?: PositionConstraint;
  dim?: DimensionConstraint;
  geo?: GeometricConstraint;

  // Stacking Context
  z?: number; 
  
  // Standard Presentation (Passthrough)
  className?: string;
  style?: React.CSSProperties;
  fill?: ColorString;
  stroke?: ColorString;
  strokeWidth?: number;
  opacity?: number;
  
  // Interaction
  onClick?: (e: any) => void;
}

// --- 1. SMART RECT ---
export interface SmartRectProps extends BaseShapeProps {
  rx?: number; // Corner Radius
  ry?: number;
}

// --- 2. SMART CIRCLE ---
export interface SmartCircleProps extends BaseShapeProps {
  // Circle-specific dimension overrides
  // If 'dim' is provided, these are ignored.
  r?: Length; 
  d?: Length;
}

// --- 3. SMART LINE ---
export interface SmartLineProps extends BaseShapeProps {
  // Lines define position via start/end, usually overriding 'pos'
  start?: Point2D | AnchorRef;
  end?: Point2D | AnchorRef;
}

// --- 4. FRAME (The Scope Container) ---
// Establishes a new Coordinate System (0,0 to 1,1)
export interface FrameProps extends BaseShapeProps {
  // Coordinate System Definition
  from?: Point2D; // Top-Left in Parent Space (0..1)
  to?: Point2D;   // Bottom-Right in Parent Space (0..1)
  
  clip?: boolean; // Apply SVG clipPath?
  debug?: boolean; // Draw bounding box for debugging?
  children?: React.ReactNode;
}

// --- 5. LAYOUT (The Distributor) ---
// A special Frame that enforces layout on children
export interface LayoutProps extends BaseShapeProps {
  direction: 'row' | 'column';
  gap?: number;
  padding?: number;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  children: React.ReactNode; // Children here receive implicit position props
}

```

---

### Module 5: Helper Functions

*The "standard library" for using these types safely.*

```typescript
// --- FACTORY FUNCTIONS ---

// 1. Create a safe ID
export const toId = (id: string): GeometryID => {
  return id as GeometryID;
};

// 2. Create a safe Reference
// Validates format "#id.anchor"
export const toRef = (refStr: string): AnchorRef => {
  if (!refStr.startsWith('#') || !refStr.includes('.')) {
    console.warn(`Invalid Reference Format: ${refStr}. Expected "#id.anchor"`);
  }
  return refStr as AnchorRef;
};

// --- USAGE EXAMPLE ---
/*
  const myRect = (
    <SmartRect 
      id={toId("box1")}
      pos={{ 
        type: 'align', 
        x: { edge: 'left', target: toRef("#header.left") } 
      }} 
      dim={{
        type: 'calc',
        w: (ctx) => ctx.parent.w * 0.5
      }}
    />
  );
*/

```