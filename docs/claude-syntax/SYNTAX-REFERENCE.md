# Sprite Assembly Syntax Reference

A complete reference for the React-based 2D SVG Sprite Assembly dialect. This syntax is designed for **assembling 2D sprites from geometric primitives with CAD-grade constraints** — not pixel-pushing.

For TypeScript definitions, see [TYPES.md](./TYPES.md).
For worked examples, see [EXAMPLES.md](./EXAMPLES.md).

---

## 1. Primitives

Primitives are the atomic drawing elements. Every primitive can accept positioning, dimensioning, and geometric constraint props.

### `<Rect>`

A rectangle. The default shape for panels, plates, frames, and bounding regions.

| Prop | Type | Description |
|------|------|-------------|
| `width` | `Length` | Width of the rectangle |
| `height` | `Length` | Height of the rectangle |
| `rx` | `number` | Corner radius (X) |
| `ry` | `number` | Corner radius (Y) |

**Exposed anchors:** `top`, `bottom`, `left`, `right`, `topLeft`, `topRight`, `bottomLeft`, `bottomRight`, `centerX`, `centerY`, `center`, `width`, `height`

```jsx
<Rect id="plate" x={10} y={10} width={100} height={60} fill="#ccc" />
```

### `<Circle>`

A circle or ellipse. Used for holes, rivets, eyes, joints.

| Prop | Type | Description |
|------|------|-------------|
| `r` | `Length` | Radius |
| `d` | `Length` | Diameter (alternative to `r`) |

**Exposed anchors:** `center`, `centerX`, `centerY`, `top`, `bottom`, `left`, `right`, `r`, `d`

```jsx
<Circle id="hole" centerX="#plate.centerX" centerY="#plate.centerY" r={8} />
```

### `<Line>`

A line segment between two points.

| Prop | Type | Description |
|------|------|-------------|
| `start` | `Point2D \| AnchorRef` | Start point |
| `end` | `Point2D \| AnchorRef` | End point |
| `length` | `Length` | Fixed length (with start + angle) |

**Exposed anchors:** `start`, `end`, `midpoint`, `startX`, `startY`, `endX`, `endY`, `length`, `angle`

```jsx
<Line id="edge" start="#plate.topLeft" end="#plate.topRight" stroke="black" />
```

### `<Arc>`

A circular arc.

| Prop | Type | Description |
|------|------|-------------|
| `center` | `Point2D \| AnchorRef` | Center of the arc's circle |
| `r` | `Length` | Radius |
| `startAngle` | `number` | Starting angle (degrees) |
| `endAngle` | `number` | Ending angle (degrees) |
| `sweep` | `number` | Arc length in degrees (alternative to endAngle) |

**Exposed anchors:** `center`, `centerX`, `centerY`, `start`, `end`, `midpoint`, `r`, `startAngle`, `endAngle`

```jsx
<Arc id="curve" center="#joint.center" r={20} startAngle={0} sweep={180} />
```

### `<Path>`

Freeform SVG path. Coordinates in the `d` string are normalized (0..1) when inside a Frame.

| Prop | Type | Description |
|------|------|-------------|
| `d` | `string` | SVG path data |
| `normalized` | `boolean` | Whether coordinates are 0..1 (default: true inside Frame) |

**Exposed anchors:** Same as Rect (bounding box anchors)

```jsx
<Path id="torso" d="M 0.2 0 L 0.8 0 L 0.9 1 L 0.1 1 Z" fill="#e0ac69" />
```

### `<Text>`

Text label. Font size can be relative to parent.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `string` | The text content |
| `fontSize` | `Length` | Font size (number, percentage, or reference) |
| `fontFamily` | `string` | Font family |
| `fontWeight` | `string \| number` | Font weight |
| `textAnchor` | `'start' \| 'middle' \| 'end'` | Horizontal alignment |

**Exposed anchors:** Same as Rect plus `baseline`

```jsx
<Text centerX="#plate.centerX" top="#plate.bottom + 5" fontSize={12}>
  100mm
</Text>
```

### `<Point>`

Invisible geometry. Exists only as an anchor target for other shapes. Useful for construction geometry.

| Prop | Type | Description |
|------|------|-------------|
| `at` | `Point2D \| AnchorRef` | Location of the point |

**Exposed anchors:** `x`, `y`

```jsx
<Point id="pivot" at={{ x: 50, y: 50 }} />
<Point id="midway" centerX="#a.right" centerY="#b.top" />
```

### `<Triangle>`

A triangle primitive with named variants for common geometric types.

| Prop | Type | Description |
|------|------|-------------|
| `kind` | `'equilateral' \| 'right' \| 'isosceles' \| 'scalene'` | Construction method |
| `sideLength` | `Length` | Side length (equilateral) |
| `base` | `Length` | Base edge length (right, isosceles) |
| `height` | `Length` | Height from base to apex (right, isosceles) |
| `legs` | `Length` | Equal-side length (isosceles, alternative to height) |
| `a`, `b`, `c` | `Length` | Three side lengths (scalene) |
| `vertices` | `[Point2D, Point2D, Point2D]` | Direct vertex override (any kind) |
| `baseAngle` | `number` | Rotation of the base edge in degrees |

**Exposed anchors:** `v0`, `v1`, `v2` (vertices), `centroid`, `incenter`, `circumcenter`, `midpoint01`, `midpoint12`, `midpoint20` (edge midpoints), plus bounding box anchors (`top`, `bottom`, `left`, `right`, `centerX`, `centerY`, `center`, `width`, `height`)

**Vertex convention:** Counter-clockwise winding. `v0` = base-left, `v1` = base-right, `v2` = apex. For right triangles, `v0` is the right-angle vertex.

```jsx
// Equilateral triangle
<Triangle id="eq" kind="equilateral" sideLength={60} x={20} y={20} fill="#4a90d9" />

// Right triangle (90 degree angle at v0)
<Triangle id="rt" kind="right" base={40} height={30} x={100} y={50} fill="#2ecc71" />

// Isosceles triangle
<Triangle id="iso" kind="isosceles" base={50} height={60} x={20} y={100} fill="#e74c3c" />

// Scalene triangle (three different sides)
<Triangle id="sc" kind="scalene" a={50} b={70} c={40} x={100} y={100} fill="#f39c12" />

// Using vertex anchors: place a circle at the apex
<Circle centerX="#eq.v2.x" centerY="#eq.v2.y" r={4} fill="red" />

// Using vertex anchors: line between two triangle vertices
<Line start="#rt.v0" end="#iso.v2" stroke="#333" />
```

**Triangle kinds and their angles:**

| Kind | Defining Property | Angle Characteristics |
|------|-------------------|----------------------|
| `equilateral` | All sides equal | All angles 60 deg (acute) |
| `right` | One 90-degree angle at v0 | Exactly one right angle |
| `isosceles` | Two equal sides (legs) | Two equal angles; acute or obtuse depending on base/height ratio |
| `scalene` | All sides different | All angles different; may be acute, right, or obtuse depending on side lengths |

To make an **obtuse** triangle, use `isosceles` with a wide base relative to height, or `scalene` with appropriate side ratios. To make an **acute** triangle, use any kind where all angles are less than 90 degrees.

### `<Polygon>`

A regular polygon (all sides and angles equal). Pentagons, hexagons, octagons, and beyond.

| Prop | Type | Description |
|------|------|-------------|
| `sides` | `number` | Number of sides (>= 3). 5 = pentagon, 6 = hexagon, 8 = octagon |
| `r` | `Length` | Circumradius (center to vertex) |
| `apothem` | `Length` | Inradius (center to edge midpoint) |
| `sideLength` | `Length` | Edge length |
| `startAngle` | `number` | Rotation offset in degrees (default: 0 = flat bottom) |

**Exposed anchors:** `v0` through `v{sides-1}` (vertices), `center`, `centerX`, `centerY`, `r`, `apothem`, plus bounding box anchors (`top`, `bottom`, `left`, `right`, `width`, `height`)

**Vertex convention:** Counter-clockwise from the bottom-right vertex of the base edge (flat-bottom orientation). `v0` = bottom-right, `v1` = first vertex CCW from v0.

```jsx
// Pentagon with circumradius
<Polygon id="pent" sides={5} r={40} centerX={80} centerY={80} fill="#9b59b6" />

// Hexagon with flat-bottom orientation
<Polygon id="hex" sides={6} sideLength={30} centerX={180} centerY={80} fill="#1abc9c" />

// Octagon
<Polygon id="oct" sides={8} r={50} centerX={100} centerY={100} fill="#e67e22" />

// Using vertex anchors: connect pentagon vertices to a center point
<Line start="#pent.v0" end="#pent.center" stroke="#666" />
<Line start="#pent.v1" end="#pent.center" stroke="#666" />

// Place a circle at each hexagon vertex
{Array.from({ length: 6 }, (_, i) => (
  <Circle key={i} centerX={`#hex.v${i}.x`} centerY={`#hex.v${i}.y`} r={3} fill="red" />
))}
```

---

## 2. Containers

Containers define coordinate scopes, layout strategies, and logical groupings.

### `<Sprite>`

The root container. Wraps the entire assembly and defines the SVG viewBox.

```jsx
<Sprite viewBox="0 0 200 300" vars={{ boltCount: 4, color: "#336699" }}>
  {/* All shapes and frames go here */}
</Sprite>
```

| Prop | Type | Description |
|------|------|-------------|
| `viewBox` | `string` | SVG viewBox (e.g. `"0 0 200 300"`) |
| `vars` | `Record<string, ...>` | Parametric variables passed to all children |
| `debug` | `boolean` | Show bounding boxes and anchor points |

### `<Frame>`

Establishes a new coordinate scope. Children inside a Frame use **normalized 0..1 coordinates** relative to the Frame's bounds.

```jsx
<Frame id="head" from={{ x: 0.3, y: 0 }} to={{ x: 0.7, y: 0.3 }}>
  {/* (0,0) = top-left of this frame, (1,1) = bottom-right */}
  <Circle id="eye_L" centerX={0.3} centerY={0.4} r={0.08} />
  <Circle id="eye_R" centerX={0.7} centerY={0.4} r={0.08} />
</Frame>
```

| Prop | Type | Description |
|------|------|-------------|
| `from` | `Point2D` | Top-left in parent space |
| `to` | `Point2D` | Bottom-right in parent space |
| `clip` | `boolean` | Clip children to Frame bounds |
| `debug` | `boolean` | Draw Frame boundary |

**Key behavior:** Frames nest. A Frame inside a Frame defines its `from`/`to` in the parent Frame's 0..1 space. This enables composable sub-assemblies.

### `<Layout>`

Auto-distributes children along an axis. Think Flexbox for SVG.

```jsx
<Layout direction="row" gap={10} alignItems="center">
  <Circle r={5} />
  <Circle r={5} />
  <Circle r={5} />
</Layout>
```

| Prop | Type | Description |
|------|------|-------------|
| `direction` | `'row' \| 'column'` | Distribution axis |
| `gap` | `Length` | Space between items |
| `padding` | `Length` | Space at edges |
| `alignItems` | `'start' \| 'center' \| 'end' \| 'stretch'` | Cross-axis alignment |
| `justifyContent` | `'start' \| 'center' \| 'end' \| 'space-between' \| 'space-around'` | Main-axis distribution |
| `wrap` | `boolean` | Allow wrapping to next line |

### `<Group>`

Logical grouping with no coordinate transform. Useful for:
- Z-ordering a set of shapes together
- Toggling visibility of a collection
- Applying shared opacity

```jsx
<Group id="shirt" z={10} visible={showShirt}>
  <Path id="fabric" d="..." fill="blue" />
  <Text centerX={0.5} centerY={0.5}>LOGO</Text>
</Group>
```

---

## 3. Reference Strings

The reference string syntax is the primary way to express relationships between shapes. It replaces absolute coordinate math with declarative constraints.

### Format

```
"#targetID.anchorName"
"#targetID.anchorName + offset"
"#targetID.anchorName - offset"
```

### Rules

1. The `#` prefix is required
2. The ID must match an `id` prop on another shape
3. The anchor must be one exposed by that shape type (see Section 1)
4. Simple arithmetic (`+`, `-`, `*`, `/`) is allowed after the anchor

### Examples

```jsx
// Position: "My left edge touches box_A's right edge"
<Rect left="#box_A.right" />

// Position with gap: "10px to the right of box_A"
<Rect left="#box_A.right + 10" />

// Center alignment: "Center me vertically with box_A"
<Rect centerY="#box_A.centerY" />

// Size matching: "Same width as box_A"
<Rect width="#box_A.width" />

// Half size: "Half the width of box_A"
<Rect width="#box_A.width * 0.5" />

// Self-reference: "Make me a square"
<Rect width={100} height="$self.width" />
```

### Special Prefix: `$self`

Use `$self` to reference the shape's own resolved properties. This enables aspect-ratio constraints without a separate `dim` prop.

```jsx
<Rect width={80} height="$self.width * 0.6" />
```

---

## 4. Positioning

There are two ways to position a shape: **virtual props** (string sugar) and **typed `pos` prop** (full control).

### Virtual Props (Preferred for Simple Cases)

Virtual props resolve to the underlying `x`, `y` coordinates after accounting for the shape's dimensions.

| Prop | Resolves To | Description |
|------|-------------|-------------|
| `x` | `x = value` | Set X directly |
| `y` | `y = value` | Set Y directly |
| `left` | `x = value` | Left edge position |
| `right` | `x = value - width` | Right edge position |
| `top` | `y = value` | Top edge position |
| `bottom` | `y = value - height` | Bottom edge position |
| `centerX` | `x = value - width/2` | Center X position |
| `centerY` | `y = value - height/2` | Center Y position |

**Priority:** If both `left` and `right` are specified, the shape's width is computed as `right - left` (the width prop is overridden). Same for `top`/`bottom` determining height.

### Typed `pos` Prop (For Complex Cases)

When you need polar coordinates, distribution, or multi-anchor coincident placement:

```jsx
// Polar positioning
<Circle pos={{ type: 'polar', center: "#hub.center", radius: 30, angle: 45 }} r={5} />

// Distributed positioning (item 2 of 5 in a row)
<Rect pos={{ type: 'distribute', axis: 'x', startRef: "#wall.left", index: 2, gap: 15 }} />

// Coincident (snap my topRight to target's bottomLeft)
<Rect pos={{ type: 'coincident', anchor: 'topRight', target: "#other.bottomLeft" }} />
```

---

## 5. Constraints

Geometric constraints express topological relationships between shapes. These override or supplement position/dimension props.

### Coincident

Force two points to share the same location.

```jsx
<Circle center="#pivot.center" r={10} />
<Rect centerX="#other.centerX" top="#other.bottom" />
```

### Collinear

Force an edge to lie on the same infinite line as another edge.

```jsx
// My left edge aligns with box_A's right edge (same X)
<Rect left="#box_A.right" />

// My top edge aligns with header's bottom edge (same Y)
<Rect top="#header.bottom" />
```

### Concentric

Force two shapes to share a center point.

```jsx
<Circle id="outer" centerX={50} centerY={50} r={20} />
<Circle id="inner" centerX="#outer.centerX" centerY="#outer.centerY" r={10} />

// Shorthand using geo prop:
<Circle geo={{ type: 'concentric', target: "outer" }} r={10} />
```

### Tangent

Force a curve to touch another geometry at exactly one point.

```jsx
<Circle geo={{ type: 'tangent', target: "line1", side: 'outside' }} r={15} />
```

### Symmetric (Mirror)

Force a shape to be the mirror image of another across an axis.

```jsx
<Circle id="eye_L" centerX={30} centerY={40} r={5} />
<Line id="face_axis" start={{ x: 50, y: 0 }} end={{ x: 50, y: 100 }} />
<Circle id="eye_R" geo={{ type: 'symmetry', source: "eye_L", axis: "face_axis", mode: 'mirror' }} />
```

### Parallel / Perpendicular

Force a shape's rotation to match or be orthogonal to a target.

```jsx
// Parallel: match rotation
<Line rotate={{ match: "#rail.angle" }} />

// Perpendicular: 90 degree offset
<Line rotate={{ match: "#rail.angle", add: 90 }} />

// Fixed rotation
<Line rotate={45} />
```

---

## 6. Dimensions

### Fixed Size

```jsx
<Rect width={100} height={60} />
```

### Match Another Shape

```jsx
<Rect width="#other.width" height="#other.height" />
```

### Percentage of Parent

```jsx
<Rect width="80%" height="50%" />
```

### Aspect Ratio

```jsx
// Via self-reference
<Rect width={100} height="$self.width * 0.75" />

// Via typed prop
<Rect dim={{ type: 'ratio', base: 'width', ratio: 0.75 }} width={100} />
```

### Fit Between Anchors

```jsx
// Width = distance between two points, minus margin
<Rect dim={{
  type: 'fit',
  horizontal: { start: "#wall_L.right", end: "#wall_R.left", margin: 5 }
}} />
```

### Computed Size

```jsx
<Rect dim={{
  type: 'calc',
  w: (ctx) => ctx.parent.w * 0.5,
  h: (ctx) => ctx.get('other').h + 10
}} />
```

---

## 7. Z-Ordering

Z-ordering uses a **sibling-scoped** `z` prop. Shapes are painted in ascending `z` order within their parent container. Default `z` is `0`.

### Rules

1. `z` only competes with siblings (children of the same parent)
2. A parent's `z` determines its position among *its* siblings; children are painted inside the parent
3. Equal `z` values fall back to source order (JSX order)

### Example

```jsx
<Frame id="body">
  {/* Skin renders first (z=0) */}
  <Path id="skin" z={0} d="..." fill="#e0ac69" />

  {/* Shirt renders on top (z=10) */}
  <Group id="shirt" z={10}>
    <Path id="fabric" z={0} d="..." fill="blue" />
    <Text id="logo" z={1} centerX={0.5} centerY={0.5}>LOGO</Text>
  </Group>

  {/* Accessories on top of everything (z=20) */}
  <Circle id="badge" z={20} centerX={0.3} centerY={0.4} r={0.05} fill="gold" />
</Frame>
```

Paint order: skin -> fabric -> logo -> badge.

The `<Text>` has `z=1` but it's scoped inside the shirt Group. Because the Group has `z=10`, all its children paint after the skin (`z=0`).

---

## 8. Variables & Parameters

Sprites can be parametric. Variables are declared on the `<Sprite>` and accessed in CalcValue functions or interpolated into reference expressions.

### Declaration

```jsx
<Sprite
  viewBox="0 0 200 200"
  vars={{
    boltCount: 4,
    boltRadius: 3,
    plateWidth: 150,
    color: "#336699",
    showHoles: true
  }}
>
  {/* children */}
</Sprite>
```

### Usage in CalcValue

```jsx
<Layout
  direction="row"
  gap={(ctx) => ctx.vars.plateWidth / (ctx.vars.boltCount + 1)}
>
  {Array.from({ length: vars.boltCount }, (_, i) => (
    <Circle key={i} r={vars.boltRadius} fill={vars.color} />
  ))}
</Layout>
```

### Usage with `visible`

```jsx
<Group visible={vars.showHoles}>
  <Circle id="hole1" r={vars.boltRadius} />
</Group>
```

### Variable Definitions (for UI generation)

When you want the host app to auto-generate controls:

```jsx
<Sprite
  viewBox="0 0 200 200"
  vars={{ boltCount: 4 }}
  varDefs={[
    { name: 'boltCount', type: 'number', default: 4, min: 1, max: 12, step: 1, label: 'Bolt Count' },
    { name: 'color', type: 'color', default: '#336699', label: 'Plate Color' },
    { name: 'showHoles', type: 'boolean', default: true, label: 'Show Holes' }
  ]}
>
```

---

## 9. The `locked` and `fixed` Props

```jsx
{/* This shape cannot be moved by the constraint solver */}
<Rect id="anchor" x={0} y={0} width={100} height={100} locked />

{/* This shape is invisible but participates in constraints */}
<Point id="construction_pt" at={{ x: 50, y: 50 }} visible={false} />
```

- `locked={true}`: The solver treats this shape as immovable ground. Other shapes constrained to it will move; it will not.
- `visible={false}`: The shape is not rendered to SVG but its anchors remain available for reference strings.

---

## 10. Quick Reference: Prop Shorthand Table

| Want to express... | Shorthand | Typed equivalent |
|---|---|---|
| "Put me at (10, 20)" | `x={10} y={20}` | `pos={{ type: 'manual', x: 10, y: 20 }}` |
| "My left = their right" | `left="#a.right"` | `pos={{ type: 'align', x: { edge: 'left', target: '#a.right' } }}` |
| "My left = their right + 10" | `left="#a.right + 10"` | `pos={{ type: 'align', x: { edge: 'left', target: '#a.right', margin: 10 } }}` |
| "Center me on them" | `centerX="#a.centerX" centerY="#a.centerY"` | `pos={{ type: 'coincident', anchor: 'center', target: '#a.center' }}` |
| "Same width" | `width="#a.width"` | `dim={{ type: 'match', target: 'a', axis: 'width' }}` |
| "Half their width" | `width="#a.width * 0.5"` | `dim={{ type: 'match', target: 'a', axis: 'width', scale: 0.5 }}` |
| "Fill the gap" | `left="#a.right" right="#b.left"` | `dim={{ type: 'fit', horizontal: { start: '#a.right', end: '#b.left' } }}` |
| "Mirror of X across Y" | — | `geo={{ type: 'symmetry', source: 'X', axis: 'Y', mode: 'mirror' }}` |
| "Touch line tangentially" | — | `geo={{ type: 'tangent', target: 'line1', side: 'outside' }}` |
