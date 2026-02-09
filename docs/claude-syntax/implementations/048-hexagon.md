# 048 — Regular Hexagon

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-1-static-shapes-10-regular-hexagon--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A regular hexagon (6 equal sides, 6 equal angles of 120 degrees) defined by side length. Hexagons are the most common tiling polygon and a key shape for game grids and mechanical patterns.

## What This Validates

- `sideLength` correctly derives circumradius and apothem
- Flat-bottom orientation places a horizontal edge at the bottom
- All 6 vertex anchors (v0..v5) are registered
- For hexagons: `r == sideLength` (unique property of regular hexagons)
