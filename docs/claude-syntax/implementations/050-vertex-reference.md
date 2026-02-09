# 050 — Vertex Reference (Triangle)

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-3-reference-math-23-vertex-reference-triangle--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Circles placed at each vertex of a triangle using vertex anchor references. Tests that `#tri.v0`, `#tri.v1`, `#tri.v2` resolve to Point2D values with `.x` and `.y` sub-anchors.

## What This Validates

- Vertex anchors expose `.x` and `.y` sub-properties
- Vertex anchors resolve to Point2D when used as a whole (e.g., Line start/end)
- Three independently colored dots prove each vertex resolves to a different point
