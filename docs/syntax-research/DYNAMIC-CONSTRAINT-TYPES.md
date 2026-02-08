You are absolutely right. The previous pass handled *static* constraints well ("match this," "align to that"), but it struggled with *dynamic* or *calculated* constraints ("be 80% of that"). It also needs to explicitly handle the **Coordinate Context** (Nesting/Frames) we discussed earlier, where a child’s `0.0` to `1.0` is relative to its parent’s Frame.

Here is the refined, production-ready TypeScript specification. It introduces **Calculated Types** and **Frame Awareness**.

### 1. The Core Value Types (The "Math" Layer)

We need to support three ways of defining a value:

1. **Absolute:** `100` (pixels)
2. **Relative:** `"50%"` (of parent Frame)
3. **Functional:** `(ctx) => ctx.ref("A").width * 0.8` (The power user option)

```typescript
// --- CONTEXT & RESOLUTION ---
// The object passed to functional constraints to look up other shapes.
export interface ConstraintContext {
  // Get the bounding box of another shape by ID
  get(id: string): BoundingBox; 
  
  // Get the parent Frame's dimensions
  parent: BoundingBox; 
}

export interface BoundingBox {
  x: number; y: number;
  w: number; h: number;
  // Computed Anchors
  top: number; bottom: number;
  left: number; right: number;
  cx: number; cy: number; // Center X/Y
}

// --- VALUE TYPES ---
// 1. Static: Just a number
export type StaticValue = number;

// 2. Relative: A string percentage of the PARENT FRAME
export type RelativeValue = `${number}%`; // e.g., "50%", "100%"

// 3. Calculated: A function that derives a number from the context
export type CalcValue = (ctx: ConstraintContext) => number;

// THE MASTER UNION
// Use this everywhere a dimension or coordinate is needed.
export type Length = StaticValue | RelativeValue | CalcValue;

```

---

### 2. The Frame System (Nesting)

We explicitly define how a `Frame` works. A Frame is just a Rectangle that establishes a new "World" for its children.

```typescript
// --- FRAME PROPS ---
export interface FrameProps {
  id: string;
  
  // The Frame's position in its PARENT's world
  // Uses the same constraint system as any other shape.
  pos: PositionConstraint;
  dim: DimensionConstraint;

  // Visuals (Optional - frames can be invisible groups)
  clip?: boolean; // SVG clipPath
  debug?: boolean; // Draw outline?
  
  // Children (The Nested Scope)
  children?: React.ReactNode;
}

```

---

### 3. Refined Constraint Categories (With Functions)

Now we inject the `Length` type (which includes functions) into our constraint definitions.

#### A. Position (Where am I?)

```typescript
// 1. MANUAL (Cartesian / Relative)
// "Place me at x=10 or x=50% of parent"
export type PositionManual = {
  type: 'manual';
  x: Length; // Can be "50%" or (c) => c.get('A').w / 2
  y: Length;
  anchor?: 'center' | 'topLeft'; // Pivot point
};

// 2. ALIGN (Snap to Edges)
// "Snap my Left edge to Box A's Right edge + 10px"
export type PositionAlign = {
  type: 'align';
  x?: { 
    target: string;     // "#boxA"
    edge: 'left' | 'right' | 'center'; // Target's edge
    myEdge?: 'left' | 'right' | 'center'; // My edge (defaults to match)
    offset?: Length;    // Gap
  };
  y?: { 
    target: string; 
    edge: 'top' | 'bottom' | 'center';
    myEdge?: 'top' | 'bottom' | 'center';
    offset?: Length;
  };
};

// 3. DISTRIBUTE (Auto-Layout)
// "I am item 2 in a list starting at Box A"
export type PositionDistribute = {
  type: 'distribute';
  axis: 'x' | 'y';
  target: string;       // Start point ("#header")
  index: number;        // Item index (0, 1, 2...)
  gap: Length;          // Fixed gap or formula
  sizeRef?: string;     // Use this object's size as the 'step'
};

export type PositionConstraint = PositionManual | PositionAlign | PositionDistribute;

```

#### B. Dimensions (How big am I?)

This is where your request for "80% of diameter" shines.

```typescript
// 1. FIXED / RELATIVE
// "100px" or "50% of parent width"
export type DimFixed = {
  type: 'fixed';
  w: Length;
  h: Length;
};

// 2. CALCULATED (The Function Strategy)
// "My width is a function of another object"
export type DimCalc = {
  type: 'calc';
  // Example: w: (c) => c.get('circle1').w * 0.8
  w?: CalcValue; 
  h?: CalcValue;
  aspect?: number; // Optional: Enforce aspect ratio on the result
};

// 3. MATCH (The Copycat)
// "Copy Box A's width, but match Box B's height"
export type DimMatch = {
  type: 'match';
  w?: { ref: string; scale?: number }; // ref="boxA", scale=0.8
  h?: { ref: string; scale?: number };
};

// 4. FIT (The Container Strategy)
// "Fill the space between Header and Footer"
export type DimFit = {
  type: 'fit';
  horizontal?: { start: string; end: string; margin?: number };
  vertical?: { start: string; end: string; margin?: number };
};

export type DimensionConstraint = DimFixed | DimCalc | DimMatch | DimFit;

```

---

### 4. Usage Examples (The "Code-CAD" Experience)

Here is how a developer writes this. Notice the blend of simple strings for simple layout and arrow functions for complex relationships.

#### Example 1: The "80% of Diameter" Request

We have a Circle and a Box. The Box's width is derived from the Circle.

```tsx
<ConstraintCanvas>
  
  {/* THE SOURCE: A Circle */}
  <SmartCircle 
    id="wheel" 
    pos={{ type: 'manual', x: 100, y: 100 }}
    dim={{ type: 'fixed', w: 50, h: 50 }} // Diameter = 50
  />

  {/* THE DEPENDENT: A Box */}
  <SmartRect
    id="box"
    pos={{ type: 'manual', x: 200, y: 100 }}
    
    // CONSTRAINT: Width is 80% of Wheel's Width (Diameter)
    dim={{
      type: 'calc',
      w: (ctx) => ctx.get('wheel').w * 0.8, // Returns 40
      h: 20 // Fixed height
    }}
  />

</ConstraintCanvas>

```

#### Example 2: Nesting (Frames)

Using the `%` unit to respect the Frame boundary.

```tsx
<Frame 
  id="card" 
  pos={{ type: 'manual', x: 10, y: 10 }} 
  dim={{ type: 'fixed', w: 300, h: 200 }}
  debug={true} // Shows border
>
  
  {/* HEADER: Top 20% of the Card */}
  <Frame 
    id="card_header"
    pos={{ type: 'manual', x: 0, y: 0 }}
    dim={{ type: 'fixed', w: "100%", h: "20%" }} 
  >
     <Text pos={{ type: 'manual', x: "50%", y: "50%" }}>Title</Text>
  </Frame>

  {/* BODY: Fills the remaining space */}
  <Frame
    id="card_body"
    pos={{ 
      type: 'align', 
      y: { target: 'card_header', edge: 'bottom' } // Starts below header
    }}
    dim={{ 
      type: 'calc', 
      w: "100%", 
      // Height = Parent Height - Header Height
      h: (ctx) => ctx.parent.h - ctx.get('card_header').h 
    }}
  >
     <SmartRect fill="gray" />
  </Frame>

</Frame>

```

### 5. Why this is "Production Grade"

1. **Type Safety:** The `(ctx)` function is fully typed. If you try to access `ctx.get('typo')`, your IDE won't catch it (runtime error), but if you access a property that doesn't exist on `BoundingBox` (like `ctx.get('A').color`), TypeScript *will* catch it immediately.
2. **Performance:** By distinguishing between `StaticValue` (fast path) and `CalcValue` (slow path), your renderer knows exactly which objects need to be re-evaluated when the context changes.
3. **Recursion:** Because `ConstraintContext` exposes the `parent` property, you can write constraints that traverse up the tree ("Make me half the size of my Grandparent").