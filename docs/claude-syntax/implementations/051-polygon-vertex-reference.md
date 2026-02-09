# 051 — Vertex Reference (Polygon)

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-3-reference-math-24-vertex-reference-polygon--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Lines connecting each vertex of a hexagon to its center, forming a "spoke" pattern. Tests that `#hex.v0` through `#hex.v5` all resolve correctly.

## What This Validates

- Dynamic vertex anchors `v0`..`v{N-1}` work for N-sided polygons
- Vertex anchors resolve to Point2D for Line start/end
- Template literal `#hex.v${i}` pattern works in dynamic generation
- `#hex.center` resolves to the polygon's geometric center
