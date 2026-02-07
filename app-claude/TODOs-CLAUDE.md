# Claude Version — TODOs & Implementation Plan

Reference spec: [DESIGN.md](../DESIGN.md)
Integration guide: [CODING_AGENT_INSTRUCTIONS.md](../CODING_AGENT_INSTRUCTIONS.md)

## Architecture

Flat source structure within `app-claude/src/`, organized by concern. Follows the DESIGN.md spec for the full parametric art tool. Integrates with `app-ref` via the same IIFE bundle pattern as `app-codex`.

```
app-claude/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── index.html
├── src/
│   ├── bundle.tsx              # IIFE entry — window.TrammelClaude mount/unmount
│   ├── main.tsx                # Standalone dev entry
│   ├── App.tsx                 # Root app component
│   ├── constraints/
│   │   ├── types.ts            # Point, Rect, Circle, Line, Arc, RectEdge, RectCorner
│   │   ├── query.ts            # rectCenter, rectCorner, rectEdge, lineLength, distances, intersections
│   │   ├── align.ts            # alignCenterX/Y, alignEdge, alignFlush
│   │   ├── distribute.ts       # distributeEvenly, distributeAlongEdge, gridPositions, distributeOnCircle
│   │   ├── offset.ts           # offsetPoint, parallelLine, insetRect, offsetCircle
│   │   ├── arc.ts              # arcInCorner, arcBetween, filletArc
│   │   ├── geometric.ts        # coincident, concentric, collinear, parallel, perpendicular, h/v, midpoint
│   │   ├── mirror.ts           # mirrorPoint, mirrorLine, mirrorCircle, mirrorRect
│   │   ├── svg-helpers.ts      # arcToSVGPath, lineToSVGPath, rectToSVGPath, circleToSVGPath, pathFromPoints
│   │   ├── index.ts            # Barrel export
│   │   └── components/         # React constraint wrappers (dual expression pattern)
│   │       ├── AlignCenter.tsx
│   │       ├── Concentric.tsx
│   │       ├── Distribute.tsx
│   │       ├── Inset.tsx
│   │       ├── Mirror.tsx
│   │       ├── Grid.tsx
│   │       └── index.ts
│   ├── errors/
│   │   ├── types.ts            # TrammelError discriminated union (6 error kinds)
│   │   ├── collector.ts        # ErrorCollector class
│   │   ├── context.tsx         # React ErrorContext provider
│   │   └── boundary.tsx        # Error Boundary component
│   ├── eval/
│   │   ├── transform.ts        # Sucrase TSX → JS
│   │   ├── execute.ts          # new Function() with scope injection
│   │   └── scope.ts            # Build the injected scope object
│   ├── store/
│   │   └── store.ts            # TinyBase store + localStorage persister
│   ├── components/
│   │   ├── Editor.tsx           # Textarea editor with Ctrl+Enter
│   │   ├── SvgViewport.tsx      # SVG render container (Visual + Source tabs)
│   │   ├── ErrorPanel.tsx       # Structured error list with kind badges
│   │   ├── VariablePanel.tsx    # Auto-generated variable controls
│   │   └── Toolbar.tsx          # Run, Reset, Import, Export buttons
│   └── replicad/
│       └── init.ts             # Replicad WASM initialization
```

## Implementation Steps

### Step 1: Project scaffold
- [ ] `package.json` — react, react-dom, sucrase, tinybase, replicad, replicad-opencascadejs
- [ ] `tsconfig.json` — strict, ES2022, react-jsx
- [ ] `vite.config.ts` — IIFE bundle mode (matches codex pattern), dev port 5175
- [ ] `vitest.config.ts` — jsdom environment
- [ ] `index.html` — standalone dev

### Step 2: Constraint types + core functions (per DESIGN.md)
- [ ] `types.ts` — Point, Rect, Circle, Line, Arc, RectEdge, RectCorner
- [ ] `query.ts` — rectCenter, rectCorner, rectEdgeMidpoint, rectEdge, circleCenter, circleBoundingBox, lineLength, lineAngle, lineDirection, distanceBetween, distancePointToLine, distancePointToCircle, lineLineIntersection, lineCircleIntersection, circleCircleIntersection, lineRectIntersection
- [ ] `align.ts` — alignCenterX, alignCenterY, alignEdge, alignFlush
- [ ] `distribute.ts` — distributeEvenly, distributeAlongEdge, gridPositions, distributeOnCircle
- [ ] `offset.ts` — offsetPoint, parallelLine, insetRect, offsetCircle
- [ ] `arc.ts` — arcTangentToLines, arcInCorner, arcBetween, filletArc
- [ ] `geometric.ts` — coincident, centerAtPoint, centerAtCorner, centerAtEdgeMidpoint, concentric, collinear, parallel, parallelThrough, perpendicular, perpendicularThrough, perpendicularAt, horizontal, vertical, horizontalDistance, verticalDistance, midpoint, nearestPointOnLine, nearestPointOnCircle, pointOnLineAt, pointOnCircleAt, pointOnArcAt, angleBetween, rotateToAngle
- [ ] `mirror.ts` — mirrorPoint, mirrorLine, mirrorCircle, mirrorRect, mirrorPointAbout
- [ ] `svg-helpers.ts` — arcToSVGPath, lineToSVGPath, rectToSVGPath, circleToSVGPath, pathFromPoints
- [ ] `index.ts` — barrel export

### Step 3: Constraint React components (dual expression pattern)
- [ ] AlignCenter — centers children on reference shape
- [ ] Concentric — children share reference center
- [ ] Distribute — even spacing along a line/edge (render prop)
- [ ] Inset — shrink reference rect (render prop)
- [ ] Mirror — reflect children about axis
- [ ] Grid — 2D grid positions (render prop)
- [ ] components/index.ts — barrel export

### Step 4: Error system (per DESIGN.md)
- [ ] `types.ts` — TrammelError: syntax | eval | constraint | geometry | variable | render
- [ ] `collector.ts` — ErrorCollector: report(), getErrors(), hasErrors(), clear()
- [ ] `context.tsx` — ErrorContext + useErrorCollector hook
- [ ] `boundary.tsx` — Error Boundary catching render errors, reporting to collector

### Step 5: Eval pipeline
- [ ] `transform.ts` — Sucrase TSX→JS, captures syntax errors to collector
- [ ] `scope.ts` — Builds scope: React hooks, all constraint functions, constraint components
- [ ] `execute.ts` — new Function() execution, captures eval/runtime errors, extracts vars object

### Step 6: Store + Replicad
- [ ] `store.ts` — TinyBase createStore + createLocalPersister('trammel-claude')
- [ ] `replicad/init.ts` — WASM init (same pattern as codex)

### Step 7: UI Components
- [ ] `Editor.tsx` — textarea, monospace, Ctrl+Enter to run
- [ ] `SvgViewport.tsx` — renders React element, Visual/Source tabs, XMLSerializer
- [ ] `ErrorPanel.tsx` — kind badges (SYNTAX, EVAL, CONSTRAINT, etc.), inputs display, suggestions
- [ ] `VariablePanel.tsx` — auto-generated: number inputs, color pickers, text inputs
- [ ] `Toolbar.tsx` — Run, Reset Demo, Import .tsx, Export .tsx, Export .svg

### Step 8: App shell + Bundle
- [ ] `App.tsx` — wires editor + viewport + error panel + variables + diagnostics
- [ ] `bundle.tsx` — window.TrammelClaude = { mount, unmount }
- [ ] `main.tsx` — standalone dev entry

### Step 9: Integration with app-ref
- [ ] Add `app-claude` to root `package.json` workspaces
- [ ] Add Claude route to `app-ref/src/router.tsx` (parallel to CodexRoute)
- [ ] Add nav link in app-ref header
- [ ] Add `scripts/copy-claude-dist.mjs`
- [ ] Update root build scripts (dev:claude, build:claude, build:copy-claude)
- [ ] Update `.gitignore` for claude bundle output

### Step 10: Update this document
- [ ] Mark completed items
- [ ] Note architecture decisions made during implementation

## Integration Details

**Bundle pattern** (mirrors codex):
- `window.TrammelClaude = { mount, unmount }`
- Dev: app-ref loads `http://localhost:5175/src/bundle.tsx` as module
- Prod: app-ref loads `app-claude/trammel-claude.iife.js`

**Dev ports**: app-ref=5173, app-codex=5174, app-claude=5175

## Key Design Decisions

1. **Dual expression** (DESIGN.md principle 3): every constraint has both a pure function AND a React component form. The component delegates to the function.
2. **Error collection, not throwing** (DESIGN.md error system): constraint functions report to ErrorCollector but return fallback values so partial rendering continues.
3. **Flat src structure**: no separate packages — everything lives under `app-claude/src/` organized by modules. Simpler than the DESIGN.md monorepo proposal since we're scoped to one agent directory.
4. **TinyBase for persistence**: localStorage via `createLocalPersister`, separate namespace from codex (`trammel-claude`).

## Verification Criteria (from DESIGN.md)

1. `npm install` — all deps installed
2. Standalone dev server runs on port 5175
3. Editor loads with demo TSX using constraint helpers + vars
4. Ctrl+Enter → SVG renders in viewport
5. Change `vars.panelColor` → re-eval → SVG updates
6. Change `vars.panelWidth` → constraints recalculate, layout updates
7. `arcInCorner()` → arc renders correctly bounded by rect edges
8. `concentric()` → circles share center
9. `distributeEvenly()` → items space correctly
10. Source tab → clean SVG markup
11. Export SVG → valid SVG file
12. Refresh → code restored from TinyBase
13. Syntax error → error shown, app doesn't crash
14. Compose components → nested components render correctly
