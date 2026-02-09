# 007 — Single Point (Construction Geometry)

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-1-static-shapes-06-single-point-construction-geometry--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

An invisible point used as construction geometry. It renders nothing to SVG but registers its coordinates in the solver context so other shapes can reference it.

## What This Validates

- Point produces no SVG output
- Point registers its `x` and `y` anchors in the solver context
- Other shapes can reference Point anchors via `#id.x` / `#id.y`
