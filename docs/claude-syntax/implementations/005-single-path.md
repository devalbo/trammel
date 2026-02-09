# 005 — Single Path

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-1-static-shapes-05-single-path--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A freeform SVG path using absolute coordinates. Tests passthrough of the `d` attribute with `normalized={false}`.

## What This Validates

- Path passes the `d` string directly to SVG when `normalized={false}`
- The `d` prop is not transformed or scaled
- Bounding box is computed from path data for anchor resolution (used by later examples)
