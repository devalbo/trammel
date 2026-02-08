# Implementation Plan

A progressive build-up of the Sprite Assembly system, ordered strictly by difficulty. Each entry builds on concepts proven by earlier entries. Implement top-to-bottom.

For type definitions, see [TYPES.md](./TYPES.md).
For syntax reference, see [SYNTAX-REFERENCE.md](./SYNTAX-REFERENCE.md).
For full worked examples, see [EXAMPLES.md](./EXAMPLES.md).

---

## Tier 1: Static Shapes

Render each primitive with only absolute props. No solver, no references, no containers. Proves each shape component maps its props to SVG correctly.

**What you need to build:** Shape components that accept props and emit SVG elements.

### 1. Single Rect

The most basic renderable element. Direct prop-to-attribute mapping.

- **Shapes:** `<Rect>`
- **Props exercised:** `id`, `x`, `y`, `width`, `height`, `fill`, `stroke`, `strokeWidth`, `rx`
- **Implementation:** [001-single-rect.md](./implementations/001-single-rect.md)

### 2. Single Circle

A circle with center and radius. Maps to SVG `<circle>`.

- **Shapes:** `<Circle>`
- **Props exercised:** `id`, `centerX`, `centerY`, `r`, `fill`, `stroke`
- **Implementation:** [002-single-circle.md](./implementations/002-single-circle.md)

### 3. Single Line

A line segment between two explicit Point2D objects.

- **Shapes:** `<Line>`
- **Props exercised:** `id`, `start`, `end`, `stroke`, `strokeWidth`
- **Implementation:** [003-single-line.md](./implementations/003-single-line.md)

### 4. Single Text

A text label. Maps font props to SVG text attributes.

- **Shapes:** `<Text>`
- **Props exercised:** `id`, `x`, `y`, `fontSize`, `fontFamily`, `fill`, `children`
- **Implementation:** [006-single-text.md](./implementations/006-single-text.md)

### 5. Single Path

Freeform SVG path with `d` string passthrough.

- **Shapes:** `<Path>`
- **Props exercised:** `id`, `d`, `normalized`, `fill`, `stroke`
- **Implementation:** [005-single-path.md](./implementations/005-single-path.md)

### 6. Single Point

Invisible construction geometry. Introduces the concept of non-rendering shapes.

- **Shapes:** `<Point>`
- **Props exercised:** `id`, `at`, `visible`
- **Implementation:** [007-single-point.md](./implementations/007-single-point.md)

### 7. Equilateral Triangle

Simplest triangle — one parameter (`sideLength`) defines everything.

- **Shapes:** `<Triangle>`
- **Props exercised:** `id`, `kind="equilateral"`, `sideLength`, `x`, `y`, `fill`, `stroke`
- **Anchors exposed:** `v0`, `v1`, `v2`, `centroid`, bounding box
- **Implementation:** [042-equilateral-triangle.md](./implementations/042-equilateral-triangle.md)

### 8. Right Triangle

Two parameters (`base`, `height`), familiar geometry. Right angle at v0.

- **Shapes:** `<Triangle>`
- **Props exercised:** `id`, `kind="right"`, `base`, `height`, `x`, `y`, `fill`
- **Anchors exposed:** `v0` (right-angle vertex), `v1`, `v2`, bounding box
- **Implementation:** [043-right-triangle.md](./implementations/043-right-triangle.md)

### 9. Isosceles Triangle

Two equal sides. Two construction forms (`base`+`height` or `base`+`legs`).

- **Shapes:** `<Triangle>`
- **Props exercised:** `id`, `kind="isosceles"`, `base`, `height`, `legs`, `fill`
- **Implementation:** [044-isosceles-triangle.md](./implementations/044-isosceles-triangle.md)

### 10. Regular Hexagon

The most common regular polygon. Defined by `sideLength`. Unique property: `r == sideLength`.

- **Shapes:** `<Polygon>`
- **Props exercised:** `id`, `sides=6`, `sideLength`, `centerX`, `centerY`, `fill`
- **Implementation:** [048-hexagon.md](./implementations/048-hexagon.md)

### 11. Single Arc

Circular arc. Requires angle-to-path conversion (slightly more math than shapes above).

- **Shapes:** `<Arc>`
- **Props exercised:** `id`, `center`, `r`, `startAngle`, `endAngle`, `stroke`, `fill`
- **Implementation:** [004-single-arc.md](./implementations/004-single-arc.md)

### 12. Regular Pentagon

Less familiar regular polygon. Same Polygon component as hexagon but with 5 sides.

- **Shapes:** `<Polygon>`
- **Props exercised:** `id`, `sides=5`, `r`, `centerX`, `centerY`, `fill`
- **Anchors exposed:** `v0`..`v4`, `center`, `r`, `apothem`, bounding box
- **Implementation:** [047-pentagon.md](./implementations/047-pentagon.md)

### 13. Scalene Triangle

Three different sides. Vertex computation requires law of cosines.

- **Shapes:** `<Triangle>`
- **Props exercised:** `id`, `kind="scalene"`, `a`, `b`, `c`, `fill`
- **Implementation:** [045-scalene-triangle.md](./implementations/045-scalene-triangle.md)

### 14. Triangle with Direct Vertices

Explicit vertex coordinates. Bypasses `kind` construction — the escape hatch.

- **Shapes:** `<Triangle>`
- **Props exercised:** `id`, `vertices`, `fill`, `stroke`
- **Implementation:** [046-triangle-vertices.md](./implementations/046-triangle-vertices.md)

### 15. Rotated Triangle

Adds `baseAngle` transformation on top of a known kind. Vertex positions must be rotated.

- **Shapes:** `<Triangle>`
- **Props exercised:** `kind="equilateral"`, `sideLength`, `baseAngle`, `fill`
- **Implementation:** [049-rotated-triangle.md](./implementations/049-rotated-triangle.md)

---

## Tier 2: One Reference String

Introduce the constraint resolver. Exactly two shapes: one absolute, one referencing the other via `#id.anchor`. Proves the parser, context registry, and virtual prop resolution.

**What you need to build:** Anchor registry, reference string parser, dependency-ordered resolution.

### 16. Rect Adjacent to Rect

The simplest possible reference: `left="#a.right"`.

- **Shapes:** `<Rect>` x2
- **Constraints:** `left="#a.right"`
- **What it proves:** Resolver reads `#a.right`, computes `a.x + a.width`, assigns to second rect's `x`.
- **Implementation:** [008-rect-adjacent.md](./implementations/008-rect-adjacent.md)

### 17. Circle Centered on Rect

Center-to-center alignment across shape types.

- **Shapes:** `<Rect>`, `<Circle>`
- **Constraints:** `centerX="#box.centerX"`, `centerY="#box.centerY"`
- **What it proves:** `centerX`/`centerY` anchors and virtual prop math (`x = centerX - r`).
- **Implementation:** [009-circle-on-rect.md](./implementations/009-circle-on-rect.md)

### 18. Collinear Edges

Two rects whose left edges share the same X. Simplest geometric alignment.

- **Shapes:** `<Rect>` x2
- **Constraints:** `left="#a.left"`
- **Implementation:** [027-collinear.md](./implementations/027-collinear.md)

### 19. Line Between Two Shapes

Line endpoints anchored to shape centers. Tests Point2D anchor resolution.

- **Shapes:** `<Rect>` x2, `<Line>`
- **Constraints:** `start="#a.center"`, `end="#b.center"`
- **Implementation:** [010-line-between.md](./implementations/010-line-between.md)

---

## Tier 3: Reference Arithmetic, Dimensions & Vertices

Extend reference strings with math, dimension targets, self-references, and vertex anchors.

**What you need to build:** Arithmetic parser in ref strings, dimension prop resolution, `$self` prefix, vertex anchor sub-properties (`.x`, `.y`).

### 20. Reference String with Offset

Two rects with a 10px gap: `left="#a.right + 10"`.

- **Shapes:** `<Rect>` x2
- **Constraints:** `left="#a.right + 10"`
- **What it proves:** Arithmetic in reference strings.
- **Implementation:** [011-ref-with-offset.md](./implementations/011-ref-with-offset.md)

### 21. Dimension Matching

Second rect copies first rect's width: `width="#a.width"`.

- **Shapes:** `<Rect>` x2
- **Constraints:** `width="#a.width"`, `height="#a.height * 0.5"`
- **What it proves:** Reference strings on dimension props, multiplication.
- **Implementation:** [012-dim-matching.md](./implementations/012-dim-matching.md)

### 22. Self-Reference

Aspect ratio via `$self`: `height="$self.width * 0.75"`.

- **Shapes:** `<Rect>`
- **Constraints:** `height="$self.width * 0.75"`
- **What it proves:** `$self` prefix resolves own properties.
- **Implementation:** [013-self-reference.md](./implementations/013-self-reference.md)

### 23. Vertex Reference (Triangle)

Circles placed at each triangle vertex: `centerX="#tri.v0.x"`.

- **Shapes:** `<Triangle>`, `<Circle>` x3
- **Constraints:** `centerX="#tri.v0.x"`, `centerY="#tri.v0.y"` (and v1, v2)
- **What it proves:** Vertex anchors expose `.x`/`.y` sub-properties.
- **Implementation:** [050-vertex-reference.md](./implementations/050-vertex-reference.md)

### 24. Vertex Reference (Polygon)

Lines from hexagon vertices to center: `start="#hex.v0"`, `end="#hex.center"`.

- **Shapes:** `<Polygon>`, `<Line>` x6
- **Constraints:** `start="#hex.v0"`, `end="#hex.center"` (for each vertex)
- **What it proves:** Dynamic vertex anchors `v0`..`v{N-1}` on polygons.
- **Implementation:** [051-polygon-vertex-reference.md](./implementations/051-polygon-vertex-reference.md)

### 25. Cross-Shape Vertex Line

Line connecting apex of one triangle to vertex of another.

- **Shapes:** `<Triangle>` x2, `<Line>`
- **Constraints:** `start="#triA.v2"`, `end="#triB.v0"`
- **What it proves:** Vertex anchors work as Line targets across shapes.
- **Implementation:** [052-cross-vertex-line.md](./implementations/052-cross-vertex-line.md)

---

## Tier 4: Containers

Introduce coordinate scopes, z-ordering, and visibility. No constraint system yet — just container behavior.

**What you need to build:** Frame coordinate transform, Group rendering, z-sort, visibility propagation.

### 26. Group with Z-Ordering

Three overlapping siblings where `z` overrides source order. Simplest container concept.

- **Shapes:** `<Rect>` x2, `<Circle>`
- **Constraints:** `z` prop
- **What it proves:** Sibling-scoped z-sort controls paint order.
- **Implementation:** [016-z-ordering.md](./implementations/016-z-ordering.md)

### 27. Group Visibility Toggle

Group with `visible={false}` hides all children.

- **Shapes:** `<Group>`, `<Rect>`, `<Circle>`
- **Constraints:** `visible` prop propagation
- **What it proves:** Visibility cascades; hidden shapes still resolve in solver.
- **Implementation:** [017-group-visibility.md](./implementations/017-group-visibility.md)

### 28. Basic Frame

Frame maps children's 0..1 coordinates to pixel bounds.

- **Shapes:** `<Frame>`, `<Rect>`
- **Constraints:** Normalized coordinates
- **What it proves:** Frame coordinate transformation.
- **Implementation:** [014-basic-frame.md](./implementations/014-basic-frame.md)

### 29. Nested Frames

Frame inside a Frame. Double coordinate transform.

- **Shapes:** `<Frame>` x2, `<Circle>`
- **Constraints:** Nested coordinate spaces
- **What it proves:** Frame transforms compose correctly.
- **Implementation:** [015-nested-frames.md](./implementations/015-nested-frames.md)

---

## Tier 5: Typed Constraints (Single Type)

Exercise individual `pos`, `dim`, and `geo` typed props. One constraint strategy per example.

**What you need to build:** Discriminated union dispatchers for each constraint category.

### 30. Percentage of Parent

Simplest dimension constraint: `width="80%"`.

- **Shapes:** `<Rect>`
- **Constraints:** `width="80%"`, `height="50%"`
- **Implementation:** [021-percentage.md](./implementations/021-percentage.md)

### 31. Coincident Constraint

Snap circle center to rect corner via `pos` prop.

- **Shapes:** `<Rect>`, `<Circle>`
- **Constraints:** `pos={{ type: 'coincident', anchor: 'center', target: '#box.topRight' }}`
- **Implementation:** [018-coincident.md](./implementations/018-coincident.md)

### 32. Concentric Circles

Force shared center via `geo` prop. Specialized form of coincident.

- **Shapes:** `<Circle>` x2
- **Constraints:** `geo={{ type: 'concentric', target: 'outer' }}`
- **Implementation:** [025-concentric.md](./implementations/025-concentric.md)

### 33. Aspect Ratio Lock

Height derived from width via `dim` prop.

- **Shapes:** `<Rect>`
- **Constraints:** `dim={{ type: 'ratio', base: 'width', ratio: 0.618 }}`
- **Implementation:** [022-aspect-ratio.md](./implementations/022-aspect-ratio.md)

### 34. Align Constraint (Independent Axes)

Align X to one shape, Y to another. Two-axis `pos` prop.

- **Shapes:** `<Rect>` x3
- **Constraints:** `pos={{ type: 'align', x: { edge: 'left', ... }, y: { edge: 'top', ... } }}`
- **Implementation:** [019-align.md](./implementations/019-align.md)

### 35. Fit Between Anchors

Width computed from dual `left`/`right` references.

- **Shapes:** `<Rect>` x3
- **Constraints:** `left="#a.right"`, `right="#b.left"` (width implicit)
- **Implementation:** [023-fit-between.md](./implementations/023-fit-between.md)

### 36. CalcValue Dimension

Dimension via function: `width={(ctx) => ctx.get('other').w * 0.5 + 10}`.

- **Shapes:** `<Rect>` x2
- **Constraints:** CalcValue function reading SolverContext
- **Implementation:** [024-calc-dimension.md](./implementations/024-calc-dimension.md)

### 37. Parallel Rotation

Line angle matches another line's angle.

- **Shapes:** `<Line>` x2
- **Constraints:** `rotate={{ match: '#rail.angle' }}`
- **Implementation:** [028-parallel.md](./implementations/028-parallel.md)

### 38. Perpendicular Rotation

Line angle offset by 90 degrees from target.

- **Shapes:** `<Line>` x2
- **Constraints:** `rotate={{ match: '#rail.angle', add: 90 }}`
- **Implementation:** [029-perpendicular.md](./implementations/029-perpendicular.md)

### 39. Symmetry (Mirror)

Shape mirrored across a construction line. Most complex geometric constraint (3 actors).

- **Shapes:** `<Line>` (axis), `<Rect>` x2
- **Constraints:** `geo={{ type: 'symmetry', source: 'left_box', axis: 'center_line', mode: 'mirror' }}`
- **Implementation:** [026-symmetry.md](./implementations/026-symmetry.md)

### 40. Polar Constraint

Circles at angular positions around a center. Requires trig computation.

- **Shapes:** `<Point>`, `<Circle>` x4
- **Constraints:** `pos={{ type: 'polar', center: '#hub', radius: 40, angle: N }}`
- **Implementation:** [020-polar.md](./implementations/020-polar.md)

---

## Tier 6: Layout & Variables

Auto-distribution and parametric inputs. Requires the Layout solver and variable propagation system.

**What you need to build:** Layout distribution algorithm, variable context, CalcValue on presentation props, varDefs for UI generation.

### 41. Row Layout with Gap

Evenly spaced circles in a row.

- **Shapes:** `<Layout>`, `<Circle>` x5
- **Constraints:** `direction="row"`, `gap={10}`
- **Implementation:** [030-layout-row.md](./implementations/030-layout-row.md)

### 42. Column Layout with Alignment

Stacked rects of different widths, center-aligned.

- **Shapes:** `<Layout>`, `<Rect>` x3
- **Constraints:** `direction="column"`, `alignItems="center"`
- **Implementation:** [031-layout-column.md](./implementations/031-layout-column.md)

### 43. Layout with space-between

Items fill available space with equal gaps.

- **Shapes:** `<Layout>`, `<Rect>` x4
- **Constraints:** `justifyContent="space-between"`
- **Implementation:** [032-layout-justify.md](./implementations/032-layout-justify.md)

### 44. Simple Parametric Rect

Width and color controlled by `vars`.

- **Shapes:** `<Rect>`
- **Constraints:** CalcValue reading `ctx.vars`
- **Variables:** `plateWidth`, `color`
- **Implementation:** [033-simple-vars.md](./implementations/033-simple-vars.md)

### 45. Visibility Controlled by Variable

Group toggled by boolean variable.

- **Shapes:** `<Group>`, `<Rect>`, `<Text>`
- **Constraints:** `visible={(ctx) => ctx.vars.showLabel}`
- **Variables:** `showLabel: boolean`
- **Implementation:** [035-var-visibility.md](./implementations/035-var-visibility.md)

### 46. Dynamic Count (Array.from)

Variable-driven count + Layout. First example combining Layout with variables.

- **Shapes:** `<Layout>`, `<Circle>` x N
- **Constraints:** `vars.count` drives `Array.from`
- **Variables:** `count`, `radius`
- **Implementation:** [034-dynamic-count.md](./implementations/034-dynamic-count.md)

---

## Tier 7: Two-Constraint Combinations

Combine 2-3 constraint types in a single example. Integration tests for constraint interop.

**What you need to build at this point:** Nothing new — these prove existing systems compose.

### 47. Pipe Between Two Tanks

Rect auto-stretches between two shapes. Combines ref strings + implicit dimension.

- **Shapes:** `<Rect>` x3
- **Constraints:** `left="#tank1.right"`, `right="#tank2.left"`, `centerY="#tank1.centerY"`
- **Implementation:** [039-pipe-connection.md](./implementations/039-pipe-connection.md)

### 48. Gusset Bracket

L-bracket with right-triangle gussets. Combines triangle vertex refs + rect bounding box refs + baseAngle.

- **Shapes:** `<Rect>` x2, `<Triangle kind="right">` x2, `<Line>` x2
- **Constraints:** Vertex ↔ bounding box references, baseAngle orientation
- **Implementation:** [055-gusset-bracket.md](./implementations/055-gusset-bracket.md)

### 49. Triangle Mosaic

Alternating up/down equilateral triangles forming a band. Combines baseAngle + vertex snapping + parametric count.

- **Shapes:** `<Triangle kind="equilateral">` x N
- **Constraints:** `baseAngle` alternation, vertex refs for tiling, parametric count
- **Variables:** `count`, `triSize`
- **Implementation:** [054-triangle-mosaic.md](./implementations/054-triangle-mosaic.md)

### 50. Bracket with Holes

Plate with bolt holes. Combines Layout + concentric + parametric count.

- **Shapes:** `<Rect>`, `<Layout>`, `<Circle>` x N
- **Constraints:** Layout distribution, concentric circles, parametric count
- **Implementation:** [036-bracket-with-holes.md](./implementations/036-bracket-with-holes.md)

### 51. Symmetric Face

Character face. Combines Frame + symmetry + reference strings.

- **Shapes:** `<Frame>`, `<Circle>` x3, `<Line>` (axis), `<Arc>`
- **Constraints:** Symmetry, centerX/centerY references, Frame normalization
- **Implementation:** [037-symmetric-face.md](./implementations/037-symmetric-face.md)

### 52. Polar Bolt Circle

Circular bolt pattern. Combines polar + concentric + parametric angle computation.

- **Shapes:** `<Circle>` x (N+1)
- **Constraints:** Polar position, parametric angle calc, concentric hub
- **Variables:** `boltCount`, `boltCircleRadius`, `boltRadius`
- **Implementation:** [040-polar-bolt-circle.md](./implementations/040-polar-bolt-circle.md)

---

## Tier 8: Multi-System Assemblies

Full assemblies requiring 4+ constraint types, deep nesting, and parametric control.

### 53. Hexagonal Tile Grid

Honeycomb pattern. Combines polygon vertices + CalcValue positioning + parametric 2D grid.

- **Shapes:** `<Polygon sides={6}>` x N
- **Constraints:** Vertex references, CalcValue row/column offsets, parametric grid
- **Variables:** `rows`, `cols`, `hexSize`
- **Implementation:** [053-hex-tile-grid.md](./implementations/053-hex-tile-grid.md)

### 54. Layered Torso with T-Shirt

Skin + shirt + logo using z-layers and nested Frames. Combines nested Frames + z-ordering + Group visibility + percentage sizing + variables.

- **Shapes:** `<Frame>` x2, `<Path>` x2, `<Text>`, `<Group>`
- **Constraints:** Z-ordering, Frame nesting, visibility toggle, percentage sizing, parametric color
- **Implementation:** [038-layered-torso.md](./implementations/038-layered-torso.md)

### 55. Full Character Sprite

Head + torso + arms + legs. The capstone test. Uses every constraint category: reference strings, symmetry, z-ordering, nested Frames, Layout, variables, CalcValue, vertex refs, visibility toggles, construction geometry.

- **Shapes:** All primitive types, `<Frame>` x5, `<Group>`, `<Layout>`
- **Constraints:** Every constraint category
- **Implementation:** [041-full-character.md](./implementations/041-full-character.md)

---

## Difficulty Summary

| Tier | Items | What You Build | Cumulative Concepts |
|------|-------|----------------|---------------------|
| 1 | 1–15 | Shape → SVG mapping, vertex computation | Static rendering |
| 2 | 16–19 | Anchor registry, ref string parser, resolver | + reference strings |
| 3 | 20–25 | Arithmetic parser, $self, vertex sub-props | + math, dimensions, vertices |
| 4 | 26–29 | Frame transforms, z-sort, visibility | + containers |
| 5 | 30–40 | pos/dim/geo discriminated unions | + typed constraints |
| 6 | 41–46 | Layout algorithm, variable context | + auto-layout, parameters |
| 7 | 47–52 | (nothing new — integration tests) | 2-3 types combined |
| 8 | 53–55 | (nothing new — integration tests) | 4+ types combined |
