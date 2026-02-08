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
│   ├── App.tsx                 # Root app — composes all components (~180 lines)
│   ├── styles.ts               # Shared style objects + errorKindColors
│   ├── ClaudeRoute.tsx          # Route wrapper for app-ref integration
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
│   │   └── evaluate.ts         # evaluateTsx, prettyPrintXml, defaultCode, EvalResult
│   ├── store/
│   │   └── store.ts            # TinyBase store + localStorage persister
│   ├── components/
│   │   ├── Editor.tsx           # Textarea editor with Ctrl+Enter
│   │   ├── SvgViewport.tsx      # SVG render container (Visual + Source tabs)
│   │   ├── ErrorPanel.tsx       # Structured error list with kind badges
│   │   ├── VariablePanel.tsx    # Auto-generated variable controls
│   │   ├── Toolbar.tsx          # Run, Reset, Import, Export buttons
│   │   └── Diagnostics.tsx      # Eval/serialize timing, SVG stats, replicad status
│   └── replicad/
│       └── init.ts             # Replicad WASM initialization
```

## Implementation Steps

### Step 1: Project scaffold — DONE
- [x] `package.json` — react, react-dom, sucrase, tinybase, replicad, replicad-opencascadejs
- [x] `tsconfig.json` — strict, ES2022, react-jsx
- [x] `vite.config.ts` — IIFE bundle mode (matches codex pattern), dev port 5175
- [x] `vitest.config.ts` — jsdom environment
- [x] `index.html` — standalone dev

### Step 2: Constraint types + core functions (per DESIGN.md) — DONE
- [x] `types.ts` — Point, Rect, Circle, Line, Arc, RectEdge, RectCorner
- [x] `query.ts` — rectCenter, rectCorner, rectEdgeMidpoint, rectEdge, circleCenter, circleBoundingBox, lineLength, lineAngle, lineDirection, distanceBetween, distancePointToLine, distancePointToCircle, lineLineIntersection, lineCircleIntersection, circleCircleIntersection, lineRectIntersection
- [x] `align.ts` — alignCenterX, alignCenterY, alignEdge, alignFlush
- [x] `distribute.ts` — distributeEvenly, distributeAlongEdge, gridPositions, distributeOnCircle
- [x] `offset.ts` — offsetPoint, parallelLine, insetRect, offsetCircle
- [x] `arc.ts` — arcTangentToLines, arcInCorner, arcBetween, filletArc
- [x] `geometric.ts` — coincident, centerAtPoint, centerAtCorner, centerAtEdgeMidpoint, concentric, collinear, parallel, parallelThrough, perpendicular, perpendicularThrough, perpendicularAt, horizontal, vertical, horizontalDistance, verticalDistance, midpoint, nearestPointOnLine, nearestPointOnCircle, pointOnLineAt, pointOnCircleAt, pointOnArcAt, angleBetween, rotateToAngle
- [x] `mirror.ts` — mirrorPoint, mirrorLine, mirrorCircle, mirrorRect, mirrorPointAbout
- [x] `svg-helpers.ts` — arcToSVGPath, lineToSVGPath, rectToSVGPath, circleToSVGPath, pathFromPoints
- [x] `index.ts` — barrel export

### Step 3: Constraint React components (dual expression pattern) — DONE
- [x] AlignCenter — centers children on reference shape
- [x] Concentric — children share reference center
- [x] Distribute — even spacing along a line/edge (render prop)
- [x] Inset — shrink reference rect (render prop)
- [x] Mirror — reflect children about axis
- [x] Grid — 2D grid positions (render prop)
- [x] components/index.ts — barrel export

### Step 4: Error system (per DESIGN.md) — DONE
- [x] `types.ts` — TrammelError: syntax | eval | constraint | geometry | variable | render
- [x] `collector.ts` — ErrorCollector: report(), getErrors(), hasErrors(), clear()
- [x] `context.tsx` — ErrorContext + useErrorCollector hook
- [x] `boundary.tsx` — Error Boundary catching render errors, reporting to collector

### Step 5: Eval pipeline — DONE
- [x] Sucrase TSX→JS transform with syntax error capture
- [x] new Function() execution with scope injection, eval error capture, vars extraction
- [x] `eval/evaluate.ts` — evaluateTsx, prettyPrintXml, defaultCode, EvalResult type (consolidated module)

### Step 6: Store + Replicad — DONE
- [x] `store.ts` — TinyBase createStore + createLocalPersister('trammel-claude')
- [x] `replicad/init.ts` — WASM init (same pattern as codex)

### Step 7: UI Components — DONE
- [x] `Editor.tsx` — textarea editor with Ctrl+Enter
- [x] `SvgViewport.tsx` — viewport with Visual/Source tabs + XMLSerializer
- [x] `ErrorPanel.tsx` — error list with kind badges + suggestions
- [x] `VariablePanel.tsx` — auto-generated variable controls
- [x] `Toolbar.tsx` — Run, Reset, Import, Export buttons
- [x] `Diagnostics.tsx` — eval time, serialize time, SVG stats, replicad status

### Step 8: App shell + Bundle — DONE
- [x] `App.tsx` — composes Editor, Toolbar, SvgViewport, ErrorPanel, VariablePanel, Diagnostics (~180 lines)
- [x] `bundle.tsx` — window.TrammelClaude = { mount, unmount }
- [x] `main.tsx` — standalone dev entry

### Step 9: Integration with app-ref — DONE
- [x] Add `app-claude` to root `package.json` workspaces
- [x] Add Claude route to `app-ref/src/router.tsx` (parallel to CodexRoute)
- [x] Add nav link in app-ref header
- [x] Add `scripts/copy-claude-dist.mjs`
- [x] Update root build scripts (dev:claude, build:claude, build:copy-claude)
- [x] Update `.gitignore` for claude bundle output

### Step 10: Update this document
- [x] Mark completed items
- [x] Note architecture decisions made during implementation

### Step 11: Refactor App.tsx into component modules — DONE
- [x] Extract `Editor.tsx`, `Toolbar.tsx`, `SvgViewport.tsx`, `ErrorPanel.tsx`, `VariablePanel.tsx`, `Diagnostics.tsx`
- [x] Extract eval logic into `eval/evaluate.ts`
- [x] Extract shared styles into `styles.ts`
- [x] Slim App.tsx from ~720 lines to ~180 lines
- [x] TypeScript + production build pass cleanly

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

---

## Next Work (Backlog)

Prioritized by impact. Pick from the top.

### P1 — Missing constraint functions (DESIGN.md gaps)
- [ ] Tangent constraints: `tangentLineToCircle`, `tangentLineBetweenCircles`, `tangentCircleToLine`, `tangentCircleToCircles`, `pointOfTangency`
- [ ] Equal constraints: `equalLength`, `equalRadius`
- [ ] `nearestPointOnArc` — point-on-arc constraint

### P1 — Missing constraint React components
- [ ] `<AlignEdge>` — aligns child edge to reference edge (pure function exists, component missing)
- [ ] `<DistributeOnCircle>` — radial distribution (pure function exists, component missing)

### P2 — Dimension annotations
- [ ] `<Dimension>` component — extension lines + arrow line + label text (per SVG_CAD_SPECIFICATION.md)
- [ ] Arrowhead `<marker>` definition
- [ ] Horizontal, vertical, and aligned dimension variants

### P2 — Viewport interactivity
- [ ] Pan/zoom controls in SvgViewport (mouse drag + wheel zoom)
- [ ] Grid overlay with coordinate labels

### P3 — Store expansion (DESIGN.md data model)
- [ ] `projects` table (id, name, created, updated)
- [ ] `variables` table (id, fileId, name, type, value, min, max, step) with `variablesByFile` index
- [ ] `renders` table (id, fileId, svgMarkup, error, timestamp) with `renderByFile` index
- [ ] Multi-file project support (currently single `default` file)

### P3 — Tests — PARTIAL
- [x] Constraint pure function unit tests — 84 tests across query, align, distribute, offset, arc, geometric, mirror, svg-helpers
- [x] Error system tests — 6 tests: report, getErrors, hasErrors, clear, copy semantics, all 6 error kinds
- [x] Eval pipeline tests — 13 tests: valid TSX, syntax errors, runtime errors, overrides, vars extraction, prettyPrintXml
- [ ] Component smoke tests (Editor, Toolbar, SvgViewport render without crash)

### P4 — Polish
- [ ] Import/export enhancements (filename prompts, drag-and-drop .tsx files)
- [ ] Project import/export as .json bundles
- [ ] Variable controls: min/max/step sliders for numbers, toggle switches for booleans
