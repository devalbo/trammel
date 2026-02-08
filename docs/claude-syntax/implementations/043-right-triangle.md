# 043 — Right Triangle

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A right triangle with a 90-degree angle at vertex v0. Defined by `base` (horizontal leg) and `height` (vertical leg). The hypotenuse connects v1 to v2.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Sprite>` | Container | Root |
| `<Triangle>` | Primitive | Right triangle |

## Props Exercised

- `kind="right"`, `base`, `height` — Geometry
- `x`, `y` — Position

## Syntax

```jsx
<Sprite viewBox="0 0 200 150">
  <Triangle
    id="rt"
    kind="right"
    base={80}
    height={60}
    x={30}
    y={20}
    fill="#2ecc71"
    stroke="#1a8a4a"
    strokeWidth={1.5}
  />
</Sprite>
```

## Vertex Computation

For a right triangle at (30, 20) with base=80, height=60:
- v0 (right angle): (30, 80) — bottom-left corner
- v1 (base end): (110, 80) — bottom-right corner
- v2 (apex): (30, 20) — top-left corner
- Hypotenuse: v1→v2, length = sqrt(80^2 + 60^2) = 100

## Expected SVG Output

```svg
<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
  <polygon points="30,80 110,80 30,20" fill="#2ecc71" stroke="#1a8a4a" stroke-width="1.5" />
</svg>
```

## Anchors Registered

| Anchor | Value | Description |
|--------|-------|-------------|
| `v0` | `{ x: 30, y: 80 }` | Right-angle vertex |
| `v1` | `{ x: 110, y: 80 }` | Base end |
| `v2` | `{ x: 30, y: 20 }` | Apex (top of height) |
| `centroid` | `{ x: 56.67, y: 60 }` | Geometric center |
| `width` | `80` | = base |
| `height` | `60` | = height |

## What This Validates

- `kind="right"` places the right angle at v0
- Base runs along the X-axis from v0, height runs along the Y-axis from v0
- Hypotenuse is implicit (v1→v2)
- The 3-4-5 family (base=80, height=60, hyp=100) is a classic validation case
