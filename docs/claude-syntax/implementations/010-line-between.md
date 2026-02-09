# 010 — Line Between Two Shapes

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-2-one-reference-19-line-between-two-shapes--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A line whose start and end points are anchored to the centers of two rectangles. Tests AnchorRef resolution for Line's `start`/`end` props.

## What This Validates

- Line `start`/`end` accept AnchorRef strings
- The `.center` anchor resolves to a Point2D (both x and y)
- Lines don't use the virtual prop system (left/right/top/bottom) — they use start/end directly
