# 048 — Regular Hexagon

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A regular hexagon (6 equal sides, 6 equal angles of 120 degrees) defined by side length. Hexagons are the most common tiling polygon and a key shape for game grids and mechanical patterns.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Polygon>` | Primitive | Regular hexagon |

## Props Exercised

- `sides=6`, `sideLength` — Geometry
- `centerX`, `centerY` — Center position
- `fill`, `stroke` — Presentation

## Syntax

```jsx
<Sprite viewBox="0 0 200 200">
  <Polygon
    id="hex"
    sides={6}
    sideLength={40}
    centerX={100}
    centerY={100}
    fill="#1abc9c"
    stroke="#16a085"
    strokeWidth={1.5}
  />
</Sprite>
```

## Key Hexagon Properties

For a regular hexagon with `sideLength = 40`:
- Circumradius (r) = sideLength = 40
- Apothem = `sideLength * sqrt(3)/2` ≈ 34.64
- Width (flat-bottom) = `2 * sideLength` = 80
- Height (flat-bottom) = `2 * apothem` ≈ 69.28

## Vertex Positions (flat-bottom, center at 100,100)

| Vertex | Position |
|--------|----------|
| v0 | (120, 134.64) — bottom-right |
| v1 | (140, 100) — right |
| v2 | (120, 65.36) — top-right |
| v3 | (80, 65.36) — top-left |
| v4 | (60, 100) — left |
| v5 | (80, 134.64) — bottom-left |

## What This Validates

- `sideLength` correctly derives circumradius and apothem
- Flat-bottom orientation places a horizontal edge at the bottom
- All 6 vertex anchors (v0..v5) are registered
- For hexagons: `r == sideLength` (unique property of regular hexagons)
