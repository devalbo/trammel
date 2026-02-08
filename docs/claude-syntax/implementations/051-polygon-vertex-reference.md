# 051 — Vertex Reference (Polygon)

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

Lines connecting each vertex of a hexagon to its center, forming a "spoke" pattern. Tests that `#hex.v0` through `#hex.v5` all resolve correctly.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Polygon>` #hex | Primitive | Regular hexagon |
| `<Line>` x6 | Primitive | Spokes from vertices to center |

## Syntax

```jsx
<Sprite viewBox="0 0 200 200">
  <Polygon
    id="hex"
    sides={6}
    r={60}
    centerX={100}
    centerY={100}
    fill="#e8f4f8"
    stroke="#2c3e50"
    strokeWidth={1.5}
  />

  {/* Spokes from each vertex to center */}
  <Line start="#hex.v0" end="#hex.center" stroke="#95a5a6" strokeWidth={0.5} />
  <Line start="#hex.v1" end="#hex.center" stroke="#95a5a6" strokeWidth={0.5} />
  <Line start="#hex.v2" end="#hex.center" stroke="#95a5a6" strokeWidth={0.5} />
  <Line start="#hex.v3" end="#hex.center" stroke="#95a5a6" strokeWidth={0.5} />
  <Line start="#hex.v4" end="#hex.center" stroke="#95a5a6" strokeWidth={0.5} />
  <Line start="#hex.v5" end="#hex.center" stroke="#95a5a6" strokeWidth={0.5} />
</Sprite>
```

## Dynamic Version (with Array.from)

```jsx
{Array.from({ length: 6 }, (_, i) => (
  <Line
    key={i}
    start={`#hex.v${i}`}
    end="#hex.center"
    stroke="#95a5a6"
    strokeWidth={0.5}
  />
))}
```

## Resolver Trace

1. hex resolves with r=60, center=(100,100)
2. Each `#hex.vN` resolves to the Nth vertex position
3. `#hex.center` resolves to `{ x: 100, y: 100 }`
4. Each Line draws from a vertex to center

## What This Validates

- Dynamic vertex anchors `v0`..`v{N-1}` work for N-sided polygons
- Vertex anchors resolve to Point2D for Line start/end
- Template literal `#hex.v${i}` pattern works in dynamic generation
- `#hex.center` resolves to the polygon's geometric center
