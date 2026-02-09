# 052 — Line Between Triangle Vertices

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-3-reference-math-25-line-between-triangle-vertices--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A line connecting the apex (v2) of one triangle to the base-left vertex (v0) of another triangle. Tests cross-shape vertex referencing.

## What This Validates

- Vertex anchors from different triangle kinds are interoperable
- `#triA.v2` resolves to Point2D and works as Line `start`
- `#triB.v0` resolves to Point2D and works as Line `end`
- Different triangle kinds (equilateral, right) expose the same anchor interface
