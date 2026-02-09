# 055 — Gusset Bracket (Right Triangles + Rects)

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-7-combinations-48-gusset-bracket-right-triangles-rects--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

An L-shaped bracket made of two perpendicular rects, reinforced with right-triangle gussets at the inner corner. Construction lines are drawn from triangle vertices to rect edges. Tests triangle + rect interop with vertex and bounding-box constraints.

## What This Validates

- Right triangles positioned via `right`/`bottom` virtual props referencing rect anchors
- Triangle vertex anchors (`v1`, `v2`) used as Line endpoints for construction geometry
- `baseAngle` rotates the gusset to fit the other side of the corner
- Mixed shape types (Rect + Triangle + Line) with cross-type constraint references
- Real-world mechanical pattern: gusset reinforcement at structural joints
