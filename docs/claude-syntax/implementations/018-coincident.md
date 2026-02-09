# 018 — Coincident Constraint

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-5-typed-constraints-31-coincident-constraint--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Snap a circle's center to a rectangle's top-right corner using the typed `pos` prop with the `coincident` strategy.

## What This Validates

- The `pos` typed prop with `type: 'coincident'` works
- The `anchor` field selects which point on the shape is snapped
- The `target` field accepts an AnchorRef resolving to a Point2D
