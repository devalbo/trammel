# Claude Agent — Needs Input

Questions for the project owner to help prioritize and clarify next work. Write your answers inline after each question.

---

### 1. Priority direction

The backlog has four tracks: more constraints, dimension annotations, viewport interactivity, and store/data model expansion. Which should I focus on first?

- [ ] Constraints (tangent, equal, missing components)
- [ ] Dimension annotations (`<Dimension>` component for measurement labels)
- [ ] Viewport (pan/zoom, grid overlay)
- [ ] Store expansion (multi-file projects, variables table, renders table)
- [ ] Tests first before new features
- [ ] Other: ___

Answer:

---

### 2. Dimension annotations scope

DESIGN.md and SVG_CAD_SPECIFICATION.md describe a `<Dimension>` component. Should I implement:

- [ ] Just the basic horizontal/vertical dimension lines
- [ ] Full set: horizontal, vertical, aligned, radial, angular
- [ ] Skip dimensions for now — focus elsewhere

Answer:

---

### 3. Pan/zoom approach

For viewport interactivity, what's the preferred approach?

- [ ] CSS transform based (simple, handles most cases)
- [ ] SVG viewBox manipulation (more precise for CAD use)
- [ ] Skip for now — static viewport is fine
- [ ] Other: ___

Answer:

---

### 4. Store expansion — how far?

The current store is minimal (one `files` table, one `default` file). DESIGN.md describes a full project model with `projects`, `variables`, and `renders` tables. How much of this do you want now?

- [ ] Keep it minimal — single file is fine for now
- [ ] Add multi-file support but skip projects/variables/renders tables
- [ ] Implement the full DESIGN.md data model
- [ ] Other: ___

Answer:

---

### 5. Tests — what level?

No tests exist yet. What's the desired testing approach?

- [ ] Unit tests for constraint pure functions only (highest value, easiest)
- [ ] Unit tests + eval pipeline integration tests
- [ ] Full: unit + integration + component smoke tests
- [ ] Skip tests for now — focus on features
- [ ] Other: ___

Answer:

---

### 6. Eval pipeline — split or keep consolidated?

The eval logic is currently in one file (`eval/evaluate.ts`). The original plan had `transform.ts`, `scope.ts`, `execute.ts` as separate modules. Do you want me to split it further?

- [ ] Keep as-is — one file is fine, it's readable
- [ ] Split into separate transform/scope/execute modules
- [ ] Other: ___

Answer:

---

### 7. Replicad usage

Replicad WASM initializes but the eval scope currently only exposes `draw`. How much replicad integration do you want next?

- [ ] Expand the eval scope with more replicad functions (`.fuse()`, `.cut()`, `.chamfer()`, `.toSVG()`, etc.)
- [ ] Add a replicad-specific demo that uses 3D→2D projection
- [ ] Leave as-is — basic `draw` is enough for now
- [ ] Other: ___

Answer:

---

### 8. Any bugs or UX issues you've noticed?

List anything that's broken or annoying in the current app:

Answer:
