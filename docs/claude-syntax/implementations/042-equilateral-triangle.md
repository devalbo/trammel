# 042 — Equilateral Triangle

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-1-static-shapes-07-equilateral-triangle--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

An equilateral triangle defined by a single side length. All three sides are equal, all three angles are 60 degrees. The simplest Triangle variant.

## What This Validates

- Triangle component generates correct vertices from `kind="equilateral"` + `sideLength`
- SVG output is a `<polygon>` element with computed point coordinates
- All vertex and bounding box anchors are registered for reference by other shapes
