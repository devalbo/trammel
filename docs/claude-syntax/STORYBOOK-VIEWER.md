# Storybook Viewer — Implementation Plan

A Storybook-based test harness for the Sprite Assembly syntax. Each of the 55 implementation files becomes a visual story that proves a specific shape or constraint renders correctly.

## Goals

1. **Implement the component library** — actual React components (`<Sprite>`, `<Rect>`, `<Triangle>`, etc.) that emit SVG
2. **Build the constraint resolver** — parses reference strings, resolves anchors, computes positions
3. **Visual test harness** — Storybook story per implementation file, organized by difficulty tier
4. **Regression testing** — snapshot tests that lock down expected SVG output

---

## Architecture

### New Workspace: `storybook-viewer/`

Added to the monorepo alongside `app-ref`, `app-claude`, `app-codex`.

```
storybook-viewer/
├── .storybook/
│   ├── main.ts               # Storybook config (Vite builder, React framework)
│   ├── preview.ts            # Global decorators (dark/light bg, grid overlay)
│   └── theme.ts              # Trammel branding
├── src/
│   ├── primitives/           # Shape components → SVG elements
│   │   ├── Rect.tsx
│   │   ├── Circle.tsx
│   │   ├── Line.tsx
│   │   ├── Arc.tsx
│   │   ├── Path.tsx
│   │   ├── SpriteText.tsx    # "Text" conflicts with DOM, so SpriteText
│   │   ├── Point.tsx
│   │   ├── Triangle.tsx
│   │   └── Polygon.tsx
│   ├── containers/           # Coordinate scope & grouping
│   │   ├── Sprite.tsx        # Root <svg> wrapper, variable provider
│   │   ├── Frame.tsx         # Normalized coordinate scope
│   │   ├── Layout.tsx        # Auto-distribution
│   │   └── Group.tsx         # Logical grouping, z-sort, visibility
│   ├── solver/               # Constraint resolution engine
│   │   ├── types.ts          # Runtime types (BoundingBox, SolverContext)
│   │   ├── registry.ts       # Shape anchor registry (register/lookup)
│   │   ├── ref-parser.ts     # Parse "#id.anchor + 10" strings
│   │   ├── resolver.ts       # Dependency-order resolution loop
│   │   ├── anchors.ts        # Anchor computation per shape type
│   │   └── context.tsx       # React context for solver state
│   ├── stories/              # One story file per implementation
│   │   ├── tier-1-static/
│   │   │   ├── 01-SingleRect.stories.tsx
│   │   │   ├── 02-SingleCircle.stories.tsx
│   │   │   ├── ...
│   │   │   └── 15-RotatedTriangle.stories.tsx
│   │   ├── tier-2-one-ref/
│   │   │   ├── 16-RectAdjacent.stories.tsx
│   │   │   ├── ...
│   │   │   └── 19-LineBetween.stories.tsx
│   │   ├── tier-3-ref-math/
│   │   ├── tier-4-containers/
│   │   ├── tier-5-typed-constraints/
│   │   ├── tier-6-layout-vars/
│   │   ├── tier-7-combos/
│   │   └── tier-8-assemblies/
│   └── index.ts              # Public API (re-exports all components)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Relationship to Existing Workspaces

```
┌──────────────────────────────────────────────────┐
│  Root monorepo (npm workspaces)                  │
│                                                  │
│  app-ref/         — Router shell (existing)      │
│  app-claude/      — Claude editor (existing)     │
│  app-codex/       — Codex editor (existing)      │
│  storybook-viewer/ — Component library + stories │
│                     (NEW)                        │
│                                                  │
│  docs/claude-syntax/ — Specs & implementations   │
│                       (reference docs, not code)  │
└──────────────────────────────────────────────────┘
```

The component library built here is **standalone** — no dependency on `app-claude` or `app-codex`. It implements the types from `TYPES.md` from scratch. Later, `app-claude` and `app-codex` can import from this package if desired.

---

## Dependencies

```jsonc
{
  "name": "storybook-viewer",
  "private": true,
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test": "vitest",
    "test:snapshot": "vitest --run"
  },
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.2"
  },
  "devDependencies": {
    "@storybook/react-vite": "^8.6.x",
    "@storybook/react": "^8.6.x",
    "@storybook/addon-essentials": "^8.6.x",
    "@storybook/addon-interactions": "^8.6.x",
    "@storybook/test": "^8.6.x",
    "storybook": "^8.6.x",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vitest": "^1.6.0",
    "@testing-library/react": "^16.0.0"
  }
}
```

No replicad dependency. This package is pure React + SVG.

---

## Component Implementation Strategy

### Phase A: Primitives (Tier 1 stories)

Each primitive is a React component that:
1. Accepts props matching the interface in `TYPES.md`
2. Registers its resolved geometry in a `SolverContext` via `useEffect`
3. Renders an SVG element (`<rect>`, `<circle>`, `<polygon>`, `<line>`, `<path>`, `<text>`)
4. Returns `null` if `visible === false`

#### Rect

```tsx
// Simplified — real implementation handles all virtual props
const Rect: React.FC<RectProps> = ({ id, x, y, width, height, rx, ry, fill, stroke, strokeWidth, ...rest }) => {
  const solver = useSolver();
  const resolved = solver.resolve(id, { x, y, width, height, ...rest });

  useEffect(() => {
    if (id) solver.register(id, resolved.bbox, 'rect');
    return () => { if (id) solver.unregister(id); };
  }, [id, resolved]);

  return <rect x={resolved.x} y={resolved.y} width={resolved.w} height={resolved.h}
               rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
};
```

#### Triangle

```tsx
const Triangle: React.FC<TriangleProps> = ({ id, kind, sideLength, base, height, legs, a, b, c, vertices, baseAngle, ...rest }) => {
  const solver = useSolver();

  // 1. Compute vertices from kind + params
  const verts = useMemo(() => {
    if (vertices) return vertices;
    switch (kind) {
      case 'equilateral': return equilateralVertices(sideLength, baseAngle);
      case 'right':       return rightVertices(base, height, baseAngle);
      case 'isosceles':   return isoscelesVertices(base, height ?? legsToHeight(base, legs), baseAngle);
      case 'scalene':     return scaleneVertices(a, b, c, baseAngle);
    }
  }, [kind, sideLength, base, height, legs, a, b, c, vertices, baseAngle]);

  // 2. Position offset from virtual props
  const resolved = solver.resolve(id, { ...rest }, verts);

  // 3. Register vertex anchors
  useEffect(() => {
    if (id) solver.registerTriangle(id, resolved.verts, resolved.bbox);
    return () => { if (id) solver.unregister(id); };
  }, [id, resolved]);

  // 4. Render
  const points = resolved.verts.map(v => `${v.x},${v.y}`).join(' ');
  return <polygon points={points} fill={rest.fill} stroke={rest.stroke} strokeWidth={rest.strokeWidth} />;
};
```

#### Polygon

```tsx
const Polygon: React.FC<PolygonProps> = ({ id, sides, r, apothem, sideLength, startAngle, ...rest }) => {
  const solver = useSolver();

  // Derive circumradius from whichever prop is given
  const R = r ?? (apothem ? apothem / Math.cos(Math.PI / sides)
                          : sideLength ? sideLength / (2 * Math.sin(Math.PI / sides))
                          : 0);

  const verts = useMemo(() => {
    return Array.from({ length: sides }, (_, i) => {
      const angle = (startAngle ?? 0) + (360 / sides) * i;
      const rad = angle * Math.PI / 180;
      return { x: R * Math.cos(rad), y: -R * Math.sin(rad) }; // SVG Y-down
    });
  }, [sides, R, startAngle]);

  const resolved = solver.resolve(id, { ...rest }, verts);

  useEffect(() => {
    if (id) solver.registerPolygon(id, sides, resolved.verts, resolved.bbox, R);
    return () => { if (id) solver.unregister(id); };
  }, [id, resolved]);

  const points = resolved.verts.map(v => `${v.x},${v.y}`).join(' ');
  return <polygon points={points} fill={rest.fill} stroke={rest.stroke} strokeWidth={rest.strokeWidth} />;
};
```

### Phase B: Solver (Tier 2-3 stories)

The solver is a React context that runs between component mount and paint:

```
┌─────────────────────────────────────────┐
│  <Sprite>                               │
│    <SolverProvider>                      │
│      1. Children mount & call register() │
│      2. Provider runs resolution pass    │
│      3. Children read resolved values    │
│      4. SVG renders                      │
│    </SolverProvider>                     │
│  </Sprite>                              │
└─────────────────────────────────────────┘
```

**Resolution algorithm:**
1. **Registration pass**: Each component registers its declared props (absolute values, ref strings, CalcValues)
2. **Topological sort**: Build dependency graph from reference strings. Shapes with no refs resolve first.
3. **Resolution pass**: Walk the sorted list. For each shape:
   - Parse any `#id.anchor` strings → look up resolved anchor values
   - Evaluate any `CalcValue` functions with the current context
   - Resolve virtual props (`left`, `right`, `centerX` → `x`)
   - Compute bounding box and anchors
   - Store in registry
4. **Re-render**: Components re-read their resolved geometry from context

**Reference string parser:**
```
"#boxA.right + 10"  →  { targetId: "boxA", anchor: "right", op: "+", offset: 10 }
"$self.width * 0.75" →  { targetId: "$self", anchor: "width", op: "*", offset: 0.75 }
"#hex.v3.x"         →  { targetId: "hex", anchor: "v3", subProp: "x" }
```

### Phase C: Containers (Tier 4 stories)

- **Frame**: Wraps children in a `<g>` with transform. Pushes a new coordinate space onto the solver's stack. Children's 0..1 values are multiplied by Frame dimensions.
- **Group**: Wraps children in a `<g>`. Sorts children by `z` before rendering. Propagates `visible` and `opacity`.
- **Layout**: Computes child positions based on `direction`, `gap`, `justifyContent`, `alignItems`. Injects computed `x`/`y` into children via context or cloneElement.

### Phase D: Typed Constraints (Tier 5 stories)

Each `PositionConstraint`, `DimensionConstraint`, and `GeometricConstraint` variant gets a handler function in the solver:

```typescript
// solver/handlers.ts
function resolvePosition(pos: PositionConstraint, ctx: SolverContext): Point2D { ... }
function resolveDimension(dim: DimensionConstraint, ctx: SolverContext): { w: number, h: number } { ... }
function resolveGeometric(geo: GeometricConstraint, ctx: SolverContext): Partial<BoundingBox> { ... }
```

### Phase E: Layout + Variables (Tier 6 stories)

- **Variables**: `<Sprite vars={...}>` provides a `VarsContext`. CalcValue functions receive it as `ctx.vars`.
- **Layout solver**: Runs after the main constraint resolver. Distributes children along the specified axis.

---

## Story Structure

Each story file follows the same template:

```tsx
// stories/tier-1-static/01-SingleRect.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Sprite, Rect } from '../../index';

const meta: Meta = {
  title: 'Tier 1 — Static Shapes/01 Single Rect',
  parameters: {
    docs: {
      description: {
        component: 'A rectangle with explicit x, y, width, height. '
          + 'The most basic renderable element. '
          + '[Implementation spec](../../docs/claude-syntax/implementations/001-single-rect.md)',
      },
    },
  },
};
export default meta;

/** Matches 001-single-rect.md exactly */
export const Default: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 200 120">
      <Rect
        id="plate"
        x={20}
        y={20}
        width={160}
        height={80}
        fill="#b0b0b0"
        stroke="#333"
        strokeWidth={1.5}
        rx={4}
      />
    </Sprite>
  ),
};

/** Variations for testing edge cases */
export const NoFill: StoryObj = {
  render: () => (
    <Sprite viewBox="0 0 200 120">
      <Rect id="outline" x={20} y={20} width={160} height={80} fill="none" stroke="#333" />
    </Sprite>
  ),
};
```

### Story-to-Implementation Mapping

Every implementation file maps to exactly one story file. The `Default` export renders the exact JSX from the implementation file's "Syntax" section.

| Implementation File | Story File | Storybook Path |
|---|---|---|
| `001-single-rect.md` | `tier-1-static/01-SingleRect.stories.tsx` | Tier 1 — Static Shapes / 01 Single Rect |
| `042-equilateral-triangle.md` | `tier-1-static/07-EquilateralTriangle.stories.tsx` | Tier 1 — Static Shapes / 07 Equilateral Triangle |
| `008-rect-adjacent.md` | `tier-2-one-ref/16-RectAdjacent.stories.tsx` | Tier 2 — One Reference / 16 Rect Adjacent |
| ... | ... | ... |
| `041-full-character.md` | `tier-8-assemblies/55-FullCharacter.stories.tsx` | Tier 8 — Full Assemblies / 55 Full Character |

Story files are numbered by difficulty order (1-55), matching IMPLEMENTATIONS.md.

---

## Testing Strategy

### 1. SVG Snapshot Tests (Vitest)

Each story has a companion `.test.tsx` that renders the component and snapshots the SVG output.

```tsx
// stories/tier-1-static/01-SingleRect.test.tsx
import { render } from '@testing-library/react';
import { Default } from './01-SingleRect.stories';

test('001 — Single Rect matches expected SVG', () => {
  const { container } = render(Default.render());
  const svg = container.querySelector('svg');
  expect(svg).toMatchInlineSnapshot(`
    <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="160" height="80" fill="#b0b0b0" stroke="#333" stroke-width="1.5" rx="4" />
    </svg>
  `);
});
```

The expected SVG matches the "Expected SVG Output" section from the implementation file. Snapshots lock down the rendering so regressions are caught.

### 2. Anchor Value Tests (Vitest)

For Tier 2+ stories, test that the solver computes correct anchor values:

```tsx
test('008 — Rect Adjacent: boxB.x resolves to boxA.right', () => {
  const solver = createTestSolver();
  solver.register('boxA', { x: 10, y: 20, w: 70, h: 50 }, 'rect');
  const resolved = solver.resolveRef('#boxA.right');
  expect(resolved).toBe(80);
});
```

### 3. Storybook Interaction Tests

For dynamic stories (Tier 6+), use `@storybook/test` play functions:

```tsx
export const VariableChange: StoryObj = {
  render: () => <BracketWithHoles />,
  play: async ({ canvasElement }) => {
    // Change boltCount from 4 to 8 and verify circles update
    const canvas = within(canvasElement);
    const circles = canvas.getAllByRole('img'); // SVG circles
    expect(circles).toHaveLength(4);

    // After variable change...
    expect(circles).toHaveLength(8);
  },
};
```

### 4. Visual Regression (Optional)

If the team wants pixel-level regression:
- **Chromatic** (hosted) or **Loki** (self-hosted) can screenshot each story
- Compare against baselines on PR

---

## Build Order

Implementation follows the tier structure. Each tier unlocks the next set of stories.

| Step | What to Build | Stories Unlocked | Estimated Story Count |
|------|---------------|------------------|-----------------------|
| 1 | Workspace setup, Storybook config, `<Sprite>` shell | — | 0 |
| 2 | `<Rect>`, `<Circle>`, `<Line>`, `<SpriteText>`, `<Path>`, `<Point>` | Tier 1 #1-6 | 6 |
| 3 | `<Triangle>` (all kinds), `<Polygon>`, `<Arc>` | Tier 1 #7-15 | 9 |
| 4 | Solver: registry, ref-parser, resolver | Tier 2 #16-19 | 4 |
| 5 | Solver: arithmetic, dimension refs, `$self`, vertex sub-props | Tier 3 #20-25 | 6 |
| 6 | `<Group>` (z-sort, visibility), `<Frame>` (coordinate transform) | Tier 4 #26-29 | 4 |
| 7 | `pos`/`dim`/`geo` typed constraint dispatchers | Tier 5 #30-40 | 11 |
| 8 | `<Layout>` solver, variable context (`vars`, `varDefs`) | Tier 6 #41-46 | 6 |
| 9 | (Integration — nothing new to build) | Tier 7 #47-52 | 6 |
| 10 | (Integration — nothing new to build) | Tier 8 #53-55 | 3 |

**Total: 55 stories**, matching the 55 implementation files.

---

## Storybook Configuration

### `.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // Inherit root tsconfig paths if needed
    return config;
  },
};
export default config;
```

### `.storybook/preview.ts`

```typescript
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a2e' },
        { name: 'grid', value: '#f5f5f5' },
      ],
    },
    layout: 'centered',
  },
  decorators: [
    // Optional: wrap every story in a container with consistent sizing
    (Story) => (
      <div style={{ padding: 20, border: '1px solid #eee', background: 'white' }}>
        <Story />
      </div>
    ),
  ],
};
export default preview;
```

### Global Decorators

Each story's `<Sprite>` is the natural root. A global decorator adds:
- **Grid overlay toggle** — faint grid behind the SVG to visualize alignment
- **Anchor point overlay** — when enabled, renders dots at all registered anchors (debug mode)
- **Bounding box overlay** — when enabled, draws dashed rects around each shape's bbox

These are controlled via Storybook toolbar buttons.

---

## Root Package Changes

Add `storybook-viewer` to the workspace list:

```jsonc
// package.json (root)
{
  "workspaces": [
    "app-ref",
    "app-codex",
    "app-claude",
    "storybook-viewer"   // NEW
  ],
  "scripts": {
    // existing...
    "storybook": "npm run storybook -w storybook-viewer",
    "build-storybook": "npm run build-storybook -w storybook-viewer"
  }
}
```

---

## Key Design Decisions

### 1. Standalone component library (not coupled to app-claude)

The sprite components live in `storybook-viewer/src/` as a fresh implementation of the TYPES.md spec. They don't import from `app-claude/src/constraints/`. Reason: the existing constraint system is tightly coupled to the eval pipeline and replicad. The sprite syntax is a new system.

Later, the components can be extracted to a shared package (e.g., `packages/sprite-components/`) and imported by both `app-claude` and `storybook-viewer`.

### 2. Two-pass rendering (not a full solver)

A full constraint solver (like Cassowary) is overkill for the initial implementation. Instead, use a two-pass approach:

1. **Pass 1**: All shapes with only absolute props resolve immediately. Shapes with references register as "pending."
2. **Pass 2**: Walk the dependency graph (topological sort). Resolve each pending shape using already-resolved anchors.

This handles all cases in Tiers 1-7. Circular dependencies (which would need a real solver) only appear in advanced CAD scenarios not covered by the 55 implementation files.

### 3. Story files authored manually (not auto-generated from markdown)

Each story is hand-written TSX that mirrors the "Syntax" section of the corresponding implementation file. This ensures stories are valid React code (not string parsing) and can include interactive variants, controls, and tests.

The implementation markdown files serve as the **spec**. The story files serve as the **test**.

### 4. SVG output validation via inline snapshots

Using Vitest inline snapshots (not file snapshots) so the expected SVG is visible directly in the test file. This makes it easy to compare against the "Expected SVG Output" section in the implementation file.

---

## npm Scripts

```bash
# Development
npm run storybook              # Start Storybook dev server on :6006

# Testing
npm run test -w storybook-viewer           # Run all vitest tests
npm run test -w storybook-viewer -- --run   # Run once (CI mode)

# Build
npm run build-storybook        # Static Storybook build for deployment
```
