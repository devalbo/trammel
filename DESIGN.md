# trammel — 2D Parametric Art Asset Tool

## Context

**trammel** is a browser tool for rapidly creating high-detail 2D art assets as composable React SVG components. Users define elements as React components, composite them into larger components, and those components **are** the final SVG. The edit pattern: change a component, a constraint/expression, or a variable value → SVG output updates immediately.

Named variables (dimensions and colors) are the core constraint mechanism. Performance is not a concern — getting good, high-detail, decomposable SVG is the highest priority.

TinyBase handles persistence (tb-solid-pod patterns). Files round-trip between browser editor and filesystem.

## Key Design Principles

1. **React components ARE the SVG** — users think in React components that render SVG elements. Small components compose into larger ones. The rendered component tree is the final output.

2. **Variables drive everything** — dimensions (`width: 300`), colors (`panelColor: '#e2e8f0'`), toggles (`showGrid: true`). Change a variable → entire SVG updates via React re-render.

3. **Dual expression: every constraint is both a function and a component** — this is a core design principle. Every constraint (alignment, concentric, distribution, mirror, etc.) has a single shared implementation in a pure function. That function is directly callable. It is also wrapped as a React component. Users choose whichever form fits the context — imperative function call when computing a value, declarative component when laying out children. Both produce identical results because the component delegates to the function.

4. **Edit triggers re-render** — three edit types, all cause immediate SVG update:
   - Change a variable value
   - Change a constraint/expression (derived formula)
   - Change a component definition

5. **Decomposable output** — the SVG is built from named, composable pieces. You can later extract any sub-component as its own asset.

6. **TypeScript constrains everything** — strict types prevent misunderstanding.

7. **Comprehensive error reporting** — when constraints fail or geometry is invalid, collect ALL errors (don't stop at the first one) and report them uniformly with actionable diagnostics. Use React Error Boundaries for rendering errors and a structured error collection system for constraint/eval errors. Never hide information — give the user everything they need to fix every issue.

8. **Don't optimize prematurely** — correctness and detail over performance.

## Tech Stack

- **Vite** — build tool
- **React 19** + **TypeScript** (strict)
- **replicad** + **replicad-opencascadejs** — available as utility for boolean ops, fillets, chamfers when standard SVG isn't enough
- **TinyBase** + **@tinybase/ui-react** — reactive storage, localStorage persistence
- **CodeMirror 6** — in-browser code editor
- **Sucrase** — fast JSX/TSX transform for live eval (no full babel needed)
- **Zod** — runtime validation

## Architecture

### The Core Loop

```
  User writes TSX in editor
         │
         ▼
  Sucrase transforms JSX → JS
         │
         ▼
  Execute with React + vars + replicad in scope
         │
         ▼
  Get back a React element tree
         │
         ▼
  Render into SVG viewport (React DOM)
         │
         ▼
  XMLSerializer → SVG source view / export
```

## Constraint System

### The Problem

Replicad has **no constraint solver**. It's purely imperative — you specify exact coordinates, not geometric relationships. But the user needs CAD-style constraints expressible in code: alignment, concentricity, arcs bounded by edges, etc.

### The Solution: Typed Constraint Helper Functions

trammel provides a library of **constraint helpers** — TypeScript functions that compute coordinates from geometric relationships. Users call them in code. The type system enforces correct usage.

These are geometry math functions, not a solver. They compute deterministically from inputs.

### Geometric Primitives (inputs to constraints)

```typescript
// Core geometric types — everything constraints operate on
type Point = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };
type Circle = { cx: number; cy: number; r: number };
type Line = { from: Point; to: Point };
type Arc = { cx: number; cy: number; r: number; startAngle: number; endAngle: number };

// Edges/sides of a Rect — for "bounded by the top side" style constraints
type RectEdge = 'top' | 'bottom' | 'left' | 'right';
type RectCorner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
```

### Constraint Helpers

Full catalog of CAD constraint helpers, organized by category. All are pure functions: geometry in → geometry out.

#### Geometric Constraints

**Coincident** — force two points to share a location:
```typescript
coincident(a: Point, b: Point): Point                          // returns the shared position (a)
centerAtPoint(shape: Circle | Rect, point: Point): Circle | Rect  // reposition shape center at point
centerAtCorner(shape: Circle, rect: Rect, corner: RectCorner): Circle
centerAtEdgeMidpoint(shape: Circle, rect: Rect, edge: RectEdge): Circle
```

**Concentric** — circles/arcs sharing the same center:
```typescript
concentric(a: Circle | Arc, b: Circle | Arc): Circle | Arc   // reposition b to share a's center
```

**Collinear** — two line segments on the same infinite line:
```typescript
collinear(fixed: Line, movable: Line): Line                   // project movable onto fixed's infinite line
```

**Parallel** — two lines forced parallel:
```typescript
parallel(fixed: Line, movable: Line, offset?: number): Line   // rotate movable to match fixed's angle
parallelThrough(fixed: Line, point: Point, length: number): Line  // parallel to fixed, passing through point
```

**Perpendicular** — two lines at 90°:
```typescript
perpendicular(fixed: Line, movable: Line): Line               // rotate movable to be ⊥ to fixed
perpendicularThrough(line: Line, point: Point, length: number): Line  // ⊥ to line, through point
perpendicularAt(line: Line, t: number, length: number): Line  // ⊥ at parameter t along line
```

**Tangent** — tangency between lines and circles:
```typescript
tangentLineToCircle(circle: Circle, point: Point): Line[]     // tangent lines from external point (returns 0-2)
tangentLineBetweenCircles(a: Circle, b: Circle, outer: boolean): Line[]  // external or internal tangent
tangentCircleToLine(radius: number, line: Line, side: 'left' | 'right'): Circle[]  // circles tangent to line
tangentCircleToCircles(radius: number, a: Circle, b: Circle): Circle[]  // circles tangent to two circles
pointOfTangency(circle: Circle, externalPoint: Point): Point[] // tangent contact points
```

**Equal** — force equal dimensions:
```typescript
equalLength(fixed: Line, movable: Line): Line                 // scale movable to match fixed's length
equalRadius(fixed: Circle, movable: Circle): Circle            // set movable's radius to fixed's
```

**Symmetric / Mirror** — reflection about a line or point:
```typescript
mirrorPoint(point: Point, axis: Line): Point
mirrorLine(line: Line, axis: Line): Line
mirrorCircle(circle: Circle, axis: Line): Circle
mirrorRect(rect: Rect, axis: Line): Rect
mirrorPointAbout(point: Point, center: Point): Point           // point symmetry
```

**Horizontal / Vertical** — force orientation:
```typescript
horizontal(line: Line): Line                                   // force line to be horizontal
vertical(line: Line): Line                                     // force line to be vertical
horizontalDistance(a: Point, b: Point): number                 // |b.x - a.x|
verticalDistance(a: Point, b: Point): number                   // |b.y - a.y|
```

**Midpoint** — of any segment:
```typescript
midpoint(line: Line): Point
midpoint(a: Point, b: Point): Point
```

**Point on Curve** — constrain a point to lie on a shape:
```typescript
nearestPointOnLine(point: Point, line: Line): Point
nearestPointOnCircle(point: Point, circle: Circle): Point
nearestPointOnArc(point: Point, arc: Arc): Point
pointOnLineAt(line: Line, t: number): Point                   // parametric (0..1)
pointOnCircleAt(circle: Circle, angle: number): Point
pointOnArcAt(arc: Arc, t: number): Point                      // parametric (0..1)
```

**Angle** — fixed angle between lines:
```typescript
angleBetween(a: Line, b: Line): number                        // measure angle (radians)
rotateToAngle(fixed: Line, movable: Line, angle: number): Line  // rotate movable to form angle with fixed
```

#### Alignment Constraints

```typescript
alignCenterX(a: Rect | Circle, b: Rect | Circle): Point      // align centers horizontally
alignCenterY(a: Rect | Circle, b: Rect | Circle): Point      // align centers vertically
alignEdge(a: Rect, aEdge: RectEdge, b: Rect, bEdge: RectEdge): Point
alignFlush(a: Rect, aEdge: RectEdge, b: Rect, bEdge: RectEdge): number
```

#### Arc Constraints

```typescript
arcTangentToLines(radius: number, line1: Line, line2: Line): Arc
arcInCorner(radius: number, rect: Rect, corner: RectCorner): Arc
arcBetween(from: Point, to: Point, radius: number, direction: 'cw' | 'ccw'): Arc
filletArc(radius: number, edge1: Line, edge2: Line): Arc      // smooth fillet at intersection
```

#### Spacing / Distribution

```typescript
distributeEvenly(count: number, itemWidth: number, totalWidth: number): number[]
distributeAlongEdge(count: number, itemSize: number, rect: Rect, edge: RectEdge): Point[]
gridPositions(cols: number, rows: number, cellWidth: number, cellHeight: number, gap: number): Point[]
distributeOnCircle(count: number, circle: Circle, startAngle?: number): Point[]  // radial distribution
```

#### Distance / Offset

```typescript
offsetPoint(from: Point, distance: number, angle: number): Point
parallelLine(line: Line, offset: number): Line
insetRect(rect: Rect, inset: number): Rect
insetRect(rect: Rect, insets: { top: number; right: number; bottom: number; left: number }): Rect
offsetCircle(circle: Circle, offset: number): Circle           // grow/shrink radius
```

#### Query Helpers

```typescript
rectCenter(rect: Rect): Point
rectCorner(rect: Rect, corner: RectCorner): Point
rectEdgeMidpoint(rect: Rect, edge: RectEdge): Point
rectEdge(rect: Rect, edge: RectEdge): Line                    // get edge as a Line

circleCenter(circle: Circle): Point
circleBoundingBox(circle: Circle): Rect

lineLength(line: Line): number
lineAngle(line: Line): number                                  // angle in radians
lineDirection(line: Line): Point                               // unit vector

// Intersections
lineLineIntersection(a: Line, b: Line): Point | null
lineCircleIntersection(line: Line, circle: Circle): Point[]
circleCircleIntersection(a: Circle, b: Circle): Point[]
lineRectIntersection(line: Line, rect: Rect): Point[]

// Distance
distanceBetween(a: Point, b: Point): number
distancePointToLine(point: Point, line: Line): number
distancePointToCircle(point: Point, circle: Circle): number
```

#### SVG Path Helpers

```typescript
arcToSVGPath(arc: Arc): string                                 // M...A... path string
lineToSVGPath(line: Line): string
rectToSVGPath(rect: Rect, cornerRadius?: number): string
circleToSVGPath(circle: Circle): string
pathFromPoints(points: Point[], closed?: boolean): string      // polyline/polygon
```

### Constraint React Components

Layout/spatial constraints map naturally to React components. They wrap children and apply positioning via SVG `<g transform>` or by injecting computed props.

**Implementation pattern**: each constraint component calculates a transform from its props (reference shape, edge, etc.) and applies it to children — either via a wrapping `<g transform="translate(...)">` or via a render prop that passes computed positions.

```tsx
// AlignCenter — positions children so their center matches the reference shape's center
<AlignCenter reference={panel}>
  <circle r={10} fill="red" />   {/* centered on panel */}
</AlignCenter>

// AlignEdge — aligns a child's edge to a reference edge
<AlignEdge reference={panel} refEdge="top" childEdge="bottom">
  <rect width={30} height={30} fill="blue" />  {/* sits on top of panel */}
</AlignEdge>

// Concentric — all children share the reference shape's center
<Concentric reference={outerRing}>
  <circle r={vars.innerRadius} fill={vars.innerColor} />
  <circle r={vars.innerRadius * 0.5} fill={vars.dotColor} />
</Concentric>

// Distribute — render prop passes computed positions to children
<Distribute count={vars.knobCount} along={rectEdge(panel, 'top')} itemSize={vars.knobSize}>
  {(pos, index) => <Knob key={index} x={pos.x} y={pos.y} />}
</Distribute>

// DistributeOnCircle — radial distribution
<DistributeOnCircle count={8} circle={outerRing} startAngle={0}>
  {(pos, angle, index) => <Bolt key={index} x={pos.x} y={pos.y} rotation={angle} />}
</DistributeOnCircle>

// Grid — 2D grid layout
<Grid cols={3} rows={2} cellWidth={50} cellHeight={50} gap={10}>
  {(pos, col, row) => <Cell key={`${col}-${row}`} x={pos.x} y={pos.y} />}
</Grid>

// Mirror — renders children + their reflection
<Mirror axis={verticalLine(rectCenter(panel).x)}>
  <MountHole pos={topLeftHole} />
</Mirror>

// Inset — positions children within an inset boundary
<Inset rect={panel} inset={vars.margin}>
  {(innerRect) => <ContentArea rect={innerRect} />}
</Inset>
```

**Constraint components available:**

| Component | What it does | Props |
|-----------|-------------|-------|
| `<AlignCenter>` | Centers children on reference shape | `reference: Rect \| Circle` |
| `<AlignEdge>` | Aligns child edge to reference edge | `reference, refEdge, childEdge` |
| `<Concentric>` | Children share reference center | `reference: Circle \| Rect` |
| `<Distribute>` | Even spacing along a line/edge | `count, along: Line, itemSize` |
| `<DistributeOnCircle>` | Radial distribution | `count, circle, startAngle?` |
| `<Grid>` | 2D grid positions | `cols, rows, cellWidth, cellHeight, gap` |
| `<Mirror>` | Reflect children about axis | `axis: Line` |
| `<Inset>` | Shrink reference rect | `rect, inset` |

**Dual expression principle in practice:**

Every constraint follows this implementation pattern:

```
constraints/functions/align.ts     <- pure function: alignCenter(ref, target) -> Point
constraints/components/AlignCenter.tsx  <- React wrapper: calls alignCenter(), applies <g transform>
```

The component is a thin wrapper that delegates to the function. This means:
- The function is the single source of truth for the math
- The component is syntactic sugar for spatial use cases
- Users get identical results either way
- Unit tests cover the function; the component just tests delegation + rendering

Example — both produce the same positioned circle:

```tsx
// Function style — compute position, pass as props
const pos = alignCenter(panel, { cx: 0, cy: 0, r: 10 });
<circle cx={pos.x} cy={pos.y} r={10} fill="red" />

// Component style — declarative, wraps children
<AlignCenter reference={panel}>
  <circle r={10} fill="red" />
</AlignCenter>
```

**When each style shines:**

| Component style | Function style |
|----------------|----------------|
| Laying out children in JSX | Computing a value to pass as a prop |
| Multiple children in same relationship | Single result needed (a point, a line) |
| Reading more declaratively in JSX tree | Composing multiple constraints in a formula |
| `<Distribute>`, `<Mirror>`, `<Grid>` | `tangentLineToCircle()`, `angleBetween()`, `lineIntersection()` |

Both are always available. Users mix freely.

### How It Looks in User Code

```tsx
const vars = {
  panelWidth: 300,
  panelHeight: 100,
  cornerRadius: 15,
  mountHoleRadius: 5,
  mountHoleInset: 12,
  panelColor: '#e2e8f0',
  holeColor: '#333',
};

// Define the panel rectangle
const panel: Rect = { x: 0, y: 0, width: vars.panelWidth, height: vars.panelHeight };

// Constraint: mount holes at each corner, inset by a fixed distance
const mountPositions = [
  rectCorner(insetRect(panel, vars.mountHoleInset), 'topLeft'),
  rectCorner(insetRect(panel, vars.mountHoleInset), 'topRight'),
  rectCorner(insetRect(panel, vars.mountHoleInset), 'bottomLeft'),
  rectCorner(insetRect(panel, vars.mountHoleInset), 'bottomRight'),
];

// Constraint: decorative arc in the top-left corner, bounded by panel edges
const cornerArc = arcInCorner(vars.cornerRadius, panel, 'topLeft');

const MountHole = ({ pos }: { pos: Point }) => (
  <circle cx={pos.x} cy={pos.y} r={vars.mountHoleRadius} fill={vars.holeColor} />
);

const Root = () => (
  <svg viewBox={`-10 -10 ${vars.panelWidth + 20} ${vars.panelHeight + 20}`}>
    <rect {...panel} fill={vars.panelColor} stroke="black" strokeWidth={2} />
    <path d={arcToSVGPath(cornerArc)} fill="none" stroke="black" strokeWidth={1} />
    {mountPositions.map((pos, i) => <MountHole key={i} pos={pos} />)}
  </svg>
);
```

### What the User Writes

Users write React components that render SVG. This is the primary mental model:

```tsx
// Variables — dimensions, colors, toggles
const vars = {
  width: 300,
  height: 100,
  knobCount: 5,
  knobSize: 30,
  gap: (300 - 5 * 30) / (5 + 1), // derived constraint
  panelColor: '#e2e8f0',
  strokeColor: '#475569',
  knobColor: '#3b82f6',
};

// A small, reusable component
const Knob = ({ x, y, size, color }: {
  x: number; y: number; size: number; color: string;
}) => (
  <rect x={x} y={y} width={size} height={size} fill={color} stroke={vars.strokeColor} strokeWidth={2} />
);

// A larger component compositing smaller ones
const Panel = () => (
  <g>
    <rect width={vars.width} height={vars.height} fill={vars.panelColor} stroke={vars.strokeColor} strokeWidth={2} />
    {Array.from({ length: vars.knobCount }, (_, i) => (
      <Knob
        key={i}
        x={vars.gap + i * (vars.knobSize + vars.gap)}
        y={-vars.knobSize}
        size={vars.knobSize}
        color={vars.knobColor}
      />
    ))}
  </g>
);

// Root — this is what gets rendered
const Root = () => (
  <svg viewBox={`-10 -${vars.knobSize + 10} ${vars.width + 20} ${vars.height + vars.knobSize + 20}`}>
    <Panel />
  </svg>
);
```

When replicad is needed (boolean ops, fillets):

```tsx
// For complex geometry, use replicad as a utility
const filletedPath = useMemo(() => {
  let shape = draw().rect(vars.width, vars.height);
  shape = shape.chamfer(vars.chamfer);
  return shape.toSVGPaths()[0]; // get path "d" string
}, [vars.width, vars.height, vars.chamfer]);

const FilletedPanel = () => (
  <path d={filletedPath} fill={vars.panelColor} stroke={vars.strokeColor} strokeWidth={2} />
);
```

### Live Eval Pipeline

1. User code (TSX string) lives in CodeMirror / TinyBase `files` table
2. On any edit (debounced) or explicit Run (Ctrl+Enter):
   a. **Sucrase** transforms TSX -> plain JS (fast, no config)
   b. **Execute** the JS with `React`, `useMemo`, `draw` (replicad), and utility functions injected in scope via `new Function()`
   c. The code's last expression (or exported `Root`) is a React element
   d. **Render** that element into the SVG viewport container via `createRoot`
3. If eval throws, show the error inline in the viewport

### Replicad Integration

Replicad is a **utility**, not the rendering pipeline. It's available in the eval scope for when users need:
- Boolean operations (`.fuse()`, `.cut()`)
- Fillets / chamfers
- Complex path generation

For v1, replicad runs on the main thread after WASM init (user said don't worry about performance). Can move to WebWorker later if needed.

### When to Use Replicad vs. Constraint Helpers

| Need | Use |
|------|-----|
| Position a circle at a corner | `centerAt()` constraint helper |
| Align two rectangles | `alignEdge()` constraint helper |
| Even spacing | `distributeEvenly()` constraint helper |
| Arc bounded by edges | `arcInCorner()` constraint helper |
| Boolean union (merge two shapes) | replicad `.fuse()` |
| Boolean subtraction (drill a hole) | replicad `.cut()` |
| Round all corners of a complex merged shape | replicad `.fillet()` |
| Chamfer edges of a boolean result | replicad `.chamfer()` |

The constraint helpers handle **positioning and relationships**. Replicad handles **shape operations** that SVG can't do natively (booleans, fillets on complex merged geometry).

## Variable System

```typescript
type TrammelVarValue = number | string | boolean;
type TrammelVars = Record<string, TrammelVarValue>;

// Runtime type inference for the vars object
type InferVarType<T> =
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends string ? 'color' :  // strings treated as colors by default
  never;
```

Variables are defined inline in user code as a plain object. The eval environment extracts variable metadata after execution and writes it to TinyBase `variables` table — this is the bridge for future form UI (number inputs, color pickers, toggles).

## Error System

### Design: Collect Everything, Report Everything

Errors are not thrown-and-caught one at a time. They are **collected** across the entire eval/render pipeline, then **reported all at once** in a structured error panel — like a compiler error list.

### Error Types (discriminated union)

```typescript
type TrammelError =
  | {
      kind: 'syntax';              // TSX/JS syntax error from Sucrase transform
      message: string;
      line: number;
      column: number;
      source: string;              // the code snippet around the error
    }
  | {
      kind: 'eval';                // Runtime error during code execution
      message: string;
      stack: string;
      line?: number;               // mapped back to user code if possible
    }
  | {
      kind: 'constraint';          // A constraint function returned an invalid/impossible result
      constraint: string;          // which function: "arcInCorner", "tangentLineToCircle", etc.
      message: string;             // what went wrong: "radius 50 exceeds corner space (max 30)"
      inputs: Record<string, unknown>;  // the actual arguments passed
      suggestion?: string;         // actionable fix: "reduce radius to <= 30 or increase panel size"
    }
  | {
      kind: 'geometry';            // replicad / OpenCascade error
      operation: string;           // "fuse", "chamfer", "fillet", etc.
      message: string;
      suggestion?: string;         // "chamfer size exceeds edge length - reduce to < 15"
    }
  | {
      kind: 'variable';            // Variable validation error
      variable: string;            // which var name
      message: string;             // "expected number, got string" or "color '#xyz' is not valid"
      value: unknown;
    }
  | {
      kind: 'render';              // React rendering error (caught by Error Boundary)
      message: string;
      componentStack: string;      // React component stack trace
    };
```

### Error Collection Pattern

Constraint functions and geometry operations don't throw by default. They return results AND report errors to a collector:

```typescript
// Error collector — accumulated during a single eval cycle
class ErrorCollector {
  private errors: TrammelError[] = [];

  report(error: TrammelError): void;
  hasErrors(): boolean;
  getErrors(): TrammelError[];
  clear(): void;
}

// Provided via React context so constraint functions and components can report
const ErrorContext = createContext<ErrorCollector>(new ErrorCollector());
```

Constraint functions receive the collector (or access it from context in component form) and **report but continue** where possible — returning a fallback/best-effort value so the rest of the drawing can still render. This means the user sees:
- A partially rendered SVG (everything that could be resolved)
- A complete list of every error, not just the first one

### Error Panel UI

The error panel sits below the SVG viewport (or as a collapsible drawer). It shows:

```
+-- Errors (3) -------------------------------------------------------+
|                                                                       |
|  X CONSTRAINT  arcInCorner (line 24)                                  |
|  radius 50 exceeds available corner space (max 30.0)                  |
|  Inputs: { radius: 50, rect: {x:0, y:0, w:60, h:40},                |
|            corner: "topLeft" }                                        |
|  -> Reduce radius to <= 30 or increase panel dimensions               |
|                                                                       |
|  X GEOMETRY  chamfer (line 31)                                        |
|  Chamfer size 20 exceeds shortest edge length (15)                    |
|  -> Reduce chamferSize to < 15                                        |
|                                                                       |
|  X VARIABLE  panelColor (line 5)                                      |
|  Color value "#xyz" is not a valid CSS color                          |
|  -> Use a hex color like "#e2e8f0" or a named color like "red"        |
|                                                                       |
+-----------------------------------------------------------------------+
```

Each error:
- Shows the **kind** badge (SYNTAX, EVAL, CONSTRAINT, GEOMETRY, VARIABLE, RENDER)
- Shows the **location** (line number, clickable to jump to editor)
- Shows the **message** — what went wrong
- Shows **inputs** — the actual values that caused the failure
- Shows a **suggestion** — actionable fix when possible

### React Integration

- **Error Boundary** wraps the SVG viewport. If a render error occurs, it catches it, reports to the ErrorCollector, and shows a fallback (the error panel).
- **Constraint components** catch their own errors, report to ErrorCollector via context, and render children in a degraded state (e.g., un-transformed) so surrounding geometry still appears.
- **The eval pipeline** catches syntax and runtime errors, adds them to the collector, and the error panel renders the full list after each eval cycle.

### Error Flow

```
User edits code
       |
       v
Sucrase transform ---- syntax errors -> ErrorCollector
       |
       v
Execute code ---------- runtime errors -> ErrorCollector
       |
       v
Constraint functions -- constraint errors -> ErrorCollector
       |                  (return fallback values, keep going)
       v
Replicad operations --- geometry errors -> ErrorCollector
       |                  (return fallback paths, keep going)
       v
React render ------------ render errors -> Error Boundary -> ErrorCollector
       |
       v
+-------------------------+
| SVG Viewport            |  (partial render — everything that worked)
+-------------------------+
| Error Panel             |  (full list of all collected errors)
+-------------------------+
```

## SVG Output Modes

The viewport has two tabs:
- **Visual**: the live React-rendered SVG with pan/zoom/grid/coordinates (default)
- **Source**: the serialized SVG markup as syntax-highlighted XML (read-only CodeMirror, copyable)

Both derive from the same rendered `<svg>` DOM node via `XMLSerializer`.

## TinyBase Store Layout

### Tables

- **`projects`** — `id`, `name`, `created`, `updated`
- **`files`** — `id`, `projectId`, `name`, `content` (TSX code), `created`, `updated`
- **`variables`** — `id`, `fileId`, `name`, `type` (`number`|`color`|`boolean`), `value`, `min`, `max`, `step`
- **`renders`** — `id`, `fileId`, `svgMarkup` (serialized SVG string for source view), `error`, `timestamp`

### Indexes

- `filesByProject`, `variablesByFile`, `renderByFile`

### Persistence

- `createLocalPersister(store, 'trammel')` with auto-save

## File Structure

```
trammel/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json                   # strict: true
├── src/
│   ├── main.tsx
│   ├── App.tsx                     # Layout: editor left, viewport right
│   ├── types/
│   │   ├── variables.ts           # TrammelVarValue, TrammelVars, variable metadata
│   │   └── store.ts               # Table row types, accessor signatures
│   ├── store/
│   │   ├── layout.ts              # TinyBase table/index defs
│   │   ├── schemas.ts             # Zod schemas
│   │   ├── accessors.ts           # Typed get/set (tb-solid-pod pattern)
│   │   └── provider.tsx           # React context + localStorage persister
│   ├── errors/
│   │   ├── types.ts               # TrammelError discriminated union (all error kinds)
│   │   ├── collector.ts           # ErrorCollector class — accumulates errors per eval cycle
│   │   ├── context.tsx            # React ErrorContext provider
│   │   ├── boundary.tsx           # Error Boundary wrapping SVG viewport
│   │   └── ErrorPanel.tsx         # Error list UI (badges, line links, inputs, suggestions)
│   ├── eval/
│   │   ├── transform.ts           # Sucrase TSX -> JS transform
│   │   ├── execute.ts             # new Function() with React/replicad/utils in scope
│   │   └── scope.ts              # Defines what's available in user code (React, draw, etc.)
│   ├── components/
│   │   ├── Editor.tsx             # CodeMirror, TSX syntax, Ctrl+Enter to run
│   │   ├── SvgViewport.tsx        # Pan/zoom container wrapping the rendered output
│   │   ├── SvgSource.tsx          # Read-only serialized SVG markup view
│   │   ├── SvgGrid.tsx            # Optional grid overlay
│   │   ├── Dimension.tsx          # Annotation component (extension lines, arrows, labels)
│   │   ├── Toolbar.tsx            # Run, Export SVG, Export .tsx, Import
│   │   └── ProjectSidebar.tsx     # File list
│   ├── hooks/
│   │   ├── useEval.ts             # transform + execute + render pipeline
│   │   ├── useProject.ts          # current project/file state
│   │   └── useSvgExport.ts        # ref -> XMLSerializer -> download .svg
│   ├── constraints/
│   │   ├── types.ts               # Point, Rect, Circle, Line, Arc, RectEdge, RectCorner
│   │   ├── functions/             # Pure computation constraints (geometry in -> geometry out)
│   │   │   ├── geometric.ts       # coincident, collinear, parallel, perpendicular, horizontal, vertical
│   │   │   ├── tangent.ts         # tangentLineToCircle, tangentCircleToLine, pointOfTangency
│   │   │   ├── concentric.ts      # concentric, centerAtPoint, centerAtCorner
│   │   │   ├── equal.ts           # equalLength, equalRadius
│   │   │   ├── mirror.ts          # mirrorPoint, mirrorLine, mirrorCircle, mirrorRect
│   │   │   ├── angle.ts           # angleBetween, rotateToAngle, midpoint
│   │   │   ├── point-on-curve.ts  # nearestPointOn*, pointOn*At
│   │   │   ├── align.ts           # alignCenterX, alignCenterY, alignEdge, alignFlush
│   │   │   ├── arc.ts             # arcTangentToLines, arcInCorner, arcBetween, filletArc
│   │   │   ├── distribute.ts      # distributeEvenly, distributeAlongEdge, gridPositions
│   │   │   ├── offset.ts          # offsetPoint, parallelLine, insetRect, offsetCircle
│   │   │   ├── query.ts           # rectCenter, rectCorner, lineLength, intersections, distances
│   │   │   └── svg-helpers.ts     # arcToSVGPath, lineToSVGPath, rectToSVGPath, pathFromPoints
│   │   ├── components/            # Spatial/layout constraints as React components
│   │   │   ├── AlignCenter.tsx    # Center children on reference shape
│   │   │   ├── AlignEdge.tsx      # Align child edge to reference edge
│   │   │   ├── Concentric.tsx     # Children share reference center
│   │   │   ├── Distribute.tsx     # Even spacing along line/edge (render prop)
│   │   │   ├── DistributeOnCircle.tsx  # Radial distribution (render prop)
│   │   │   ├── Grid.tsx           # 2D grid positions (render prop)
│   │   │   ├── Mirror.tsx         # Reflect children about axis
│   │   │   └── Inset.tsx          # Shrink reference rect, pass to children
│   │   └── index.ts               # Re-exports all functions + components (injected into eval scope)
│   └── lib/
│       ├── defaults.ts            # Starter code template
│       ├── file-io.ts             # Export/import .tsx files
│       └── color.ts               # Color validation
```

## Implementation Steps

### Step 1: Scaffold project
- Create `trammel/` with Vite React-TS template (strict tsconfig)
- Install: `replicad`, `replicad-opencascadejs`, `sucrase`, `tinybase`, `@tinybase/ui-react`, CodeMirror 6 packages, `zod`
- Configure `vite.config.ts` for WASM

### Step 2: Define types
- `types/variables.ts`: `TrammelVarValue`, `TrammelVars`, variable metadata type
- `types/store.ts`: row types for TinyBase tables

### Step 3: Error system
- `errors/types.ts`: `TrammelError` discriminated union — syntax, eval, constraint, geometry, variable, render
- `errors/collector.ts`: `ErrorCollector` class — report(), getErrors(), clear()
- `errors/context.tsx`: React context providing ErrorCollector to constraint components
- `errors/boundary.tsx`: Error Boundary catching render errors -> reports to collector
- `errors/ErrorPanel.tsx`: error list UI — kind badge, line number (clickable), message, inputs, suggestion

### Step 4: Constraint library
- `constraints/types.ts`: `Point`, `Rect`, `Circle`, `Line`, `Arc`, `RectEdge`, `RectCorner`
- `constraints/functions/`: all pure constraint functions — each reports to ErrorCollector on failure, returns fallback value to keep rendering
- `constraints/components/`: React wrappers — delegate to functions, report via ErrorContext, render children in degraded state on failure
- `constraints/index.ts`: barrel export

### Step 5: Eval pipeline
- `eval/transform.ts`: Sucrase TSX -> JS (syntax errors -> ErrorCollector)
- `eval/scope.ts`: define injected scope — React, createElement, useMemo, draw (replicad), ALL constraint functions + components, ErrorCollector
- `eval/execute.ts`: `new Function(...)` -> React element (runtime errors -> ErrorCollector)
- `useEval` hook: wires transform -> execute -> render into container, passes ErrorCollector through

### Step 6: Replicad init
- Initialize OpenCascade WASM on app startup (main thread for v1)
- Expose `draw`, `Sketcher`, `drawCircle`, `drawRectangle`, etc. in the eval scope
- Wrap replicad calls to catch geometry errors -> ErrorCollector with operation name + suggestion

### Step 7: TinyBase store
- `layout.ts`, `schemas.ts`, `accessors.ts`, `provider.tsx`
- localStorage persistence keyed as `'trammel'`

### Step 8: Editor component
- CodeMirror 6, TSX syntax highlighting
- Debounced save to TinyBase `files`
- Ctrl+Enter to trigger eval
- Error line highlighting: errors with line numbers get red gutter markers in the editor

### Step 9: SvgViewport + SvgSource + ErrorPanel
- Viewport: container div where eval renders the user's Root component, wrapped in Error Boundary
- Pan (pointer drag), zoom (wheel), reset (fit-to-view), coordinate readout
- Source tab: `XMLSerializer` on the `<svg>` node -> read-only CodeMirror with XML highlighting
- Error panel: below viewport, shows all collected errors with clickable line numbers

### Step 10: App layout + Toolbar
- Horizontal split: editor left, viewport/source/errors right
- Toolbar: Run, Export SVG, Export .tsx, Import .tsx

### Step 11: Wire together + defaults
- Default starter project with example using constraint functions + components
- Variable extraction -> TinyBase `variables` table
- Auto-eval on load
- ErrorCollector cleared on each new eval cycle, repopulated as pipeline runs

## SVG Export

- **Export SVG**: `XMLSerializer` on rendered `<svg>` DOM -> `.svg` file
- **Export .tsx**: download code file (editable in IDE, re-importable)
- **Import .tsx**: upload -> upsert in TinyBase `files`

## Deployment: GitHub Pages

The app deploys as a static site to GitHub Pages.

- `vite.config.ts`: set `base` to the repo path (e.g., `'/trammel/'`)
- `package.json` script: `"deploy": "vite build && gh-pages -d dist"`
- Install `gh-pages` as dev dependency
- GitHub Actions workflow (`.github/workflows/deploy.yml`): build on push to main, deploy to `gh-pages` branch
- All persistence is client-side (TinyBase + localStorage) so no server needed

## Future: Form UI from Variables

1. Eval extracts `vars` object -> writes to TinyBase `variables` table
2. New component reads `variables` -> renders typed controls (number inputs, color pickers, toggles)
3. Form edits inject as variable overrides into next eval
4. Zero architectural changes

## Verification

1. `npm run dev` — starts clean, no TS errors
2. Editor loads with starter TSX using constraint helpers + vars
3. Ctrl+Enter -> SVG renders in viewport
4. Change `vars.panelColor` -> re-eval -> SVG updates with new color
5. Change `vars.panelWidth` -> re-eval -> mount holes reposition (constraints recalculate), layout updates
6. Use `arcInCorner()` -> arc renders correctly bounded by rect edges
7. Use `concentric()` -> two circles share the same center
8. Use `distributeEvenly()` -> items space correctly, adapt when count changes
9. Use replicad `.fuse()` in `useMemo` -> boolean result renders as `<path>`
10. Switch to Source tab -> see clean SVG markup
11. Export SVG -> opens in browser/Inkscape with all detail preserved
12. Refresh -> code restored from TinyBase
13. Syntax error -> error shown inline, app doesn't crash
14. Compose: define a small component, use it inside a larger one -> renders correctly
