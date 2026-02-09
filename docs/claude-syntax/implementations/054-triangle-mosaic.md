# 054 — Triangle Mosaic

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-7-combinations-49-triangle-mosaic--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A band of alternating up-pointing and down-pointing equilateral triangles that tile edge-to-edge. Every other triangle is flipped using `baseAngle={180}`. The triangles share edges via vertex snapping.

## What This Validates

- `baseAngle={180}` flips a triangle upside-down
- Alternating orientation creates a tight mosaic
- Vertex references enable exact edge-to-edge tiling
- Parametric `count` and `triSize` control the pattern
