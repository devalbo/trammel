# 049 — Rotated Triangle

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-1-static-shapes-15-rotated-triangle--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Equilateral triangles with different `baseAngle` values to orient them in various directions. Default is 0 (base at bottom, apex points up). Rotating the base rotates the entire triangle.

## What This Validates

- `baseAngle` rotates the triangle without changing its construction
- Vertex anchors rotate with the shape
- Bounding box is recomputed for the rotated orientation
- Useful for directional indicators (arrows, chevrons) and alternating tile patterns
