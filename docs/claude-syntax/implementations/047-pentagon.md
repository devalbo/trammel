# 047 — Regular Pentagon

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A regular pentagon (5 equal sides, 5 equal angles of 108 degrees) defined by circumradius.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Polygon>` | Primitive | Regular pentagon |

## Props Exercised

- `sides=5`, `r` — Geometry
- `centerX`, `centerY` — Center position
- `fill`, `stroke` — Presentation

## Syntax

```jsx
<Sprite viewBox="0 0 200 200">
  <Polygon
    id="pent"
    sides={5}
    r={60}
    centerX={100}
    centerY={100}
    fill="#9b59b6"
    stroke="#6c3483"
    strokeWidth={1.5}
  />
</Sprite>
```

## Vertex Computation

For a regular pentagon with `r=60`, centered at (100, 100), flat-bottom orientation (startAngle=0):

The vertices are placed at angles: `90 + 360/5 * i` degrees for `i = 0..4`, adjusted so the base edge is horizontal at the bottom.

| Vertex | Angle (from center) | x | y |
|--------|---------------------|---|---|
| v0 | -54° | 148.54 | 138.04 |
| v1 | 18° | 157.08 | 81.46 |
| v2 | 90° | 100 | 40 |
| v3 | 162° | 42.92 | 81.46 |
| v4 | 234° | 51.46 | 138.04 |

(Exact values depend on the flat-bottom convention.)

## Anchors Registered

| Anchor | Type | Description |
|--------|------|-------------|
| `v0`..`v4` | Point2D | Five vertex positions |
| `center` | Point2D | `{ x: 100, y: 100 }` |
| `r` | number | `60` (circumradius) |
| `apothem` | number | `r * cos(π/5)` ≈ 48.54 |
| `top`, `bottom`, etc. | number | Bounding box edges |

## What This Validates

- `<Polygon sides={5}>` generates a regular pentagon
- `r` (circumradius) determines size
- All 5 vertex anchors are registered
- `apothem` is derived from `r` and `sides`
