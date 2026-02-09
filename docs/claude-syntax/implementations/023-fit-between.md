# 023 — Fit Between Anchors

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-5-typed-constraints-35-fit-between-anchors--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A rect that stretches to fill the horizontal gap between two other rects. Width is implicit — determined by `left` and `right` virtual props targeting different shapes.

## What This Validates

- When both `left` and `right` are specified, width is computed as `right - left`
- This is the virtual-prop shorthand for `DimFit`
- The shape auto-resizes if either wall moves
