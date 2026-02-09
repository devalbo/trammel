# 046 — Triangle with Direct Vertices

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-1-static-shapes-14-triangle-with-direct-vertices--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A triangle defined by three explicit vertex coordinates, bypassing the `kind` construction methods entirely. Useful for irregular triangles or when you already know the exact points.

## What This Validates

- `vertices` prop overrides `kind`-based construction
- Anchors are computed from the explicit vertices
- Bounding box is the axis-aligned bounds of all three points
- This is the escape hatch for any triangle geometry that doesn't fit a named kind
