# 053 — Hexagonal Tile Grid

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-8-full-assemblies-53-hexagonal-tile-grid--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A honeycomb pattern of hexagons tiled edge-to-edge. Each row is offset by half a hex width. Uses vertex anchors and CalcValue for positioning. Parametric rows, columns, and hex size.

## What This Validates

- Polygon tiling with computed offsets
- Parametric grid dimensions
- Hex-specific geometry (apothem, column/row spacing)
- Dynamic id generation for grid elements
- Both computed and vertex-snapped approaches work
