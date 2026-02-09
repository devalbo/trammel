# 047 — Regular Pentagon

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-1-static-shapes-12-regular-pentagon--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A regular pentagon (5 equal sides, 5 equal angles of 108 degrees) defined by circumradius.

## What This Validates

- `<Polygon sides={5}>` generates a regular pentagon
- `r` (circumradius) determines size
- All 5 vertex anchors are registered
- `apothem` is derived from `r` and `sides`
