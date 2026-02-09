# 019 — Align Constraint (Independent Axes)

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-5-typed-constraints-34-align-constraint-independent-axes--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A rect aligned on X to one shape's edge and on Y to a different shape's edge. Tests the `align` position strategy with independent axis targets.

## What This Validates

- Align constraint allows independent X and Y targets
- Each axis specifies which edge of the shape and which anchor to align to
- The `margin` field adds offset after alignment
