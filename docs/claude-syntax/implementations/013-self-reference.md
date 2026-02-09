# 013 — Self-Reference

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-3-reference-math-22-self-reference--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A rectangle whose height is derived from its own width, locking a 4:3 aspect ratio. Tests the `$self` prefix for intra-shape references.

## What This Validates

- `$self` prefix references the shape's own resolved properties
- Self-references resolve in a single pass when the referenced property is already known
- This is the simplest form of aspect ratio locking (alternative to `dim={{ type: 'ratio', ... }}`)
