# 027 — Collinear Edges

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-2-one-reference-18-collinear-edges--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Two rects at different Y positions whose left edges are forced to the same X coordinate. This is the simplest geometric alignment — collinear vertical edges.

## What This Validates

- The simplest form of edge alignment — collinear left edges
- `left="#id.left"` aligns left edges (same X)
- Shapes can differ in width/height while maintaining edge alignment
