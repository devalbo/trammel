# 029 — Perpendicular Rotation

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-5-typed-constraints-38-perpendicular-rotation--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Two lines where the second is forced perpendicular to the first by adding 90 degrees to the matched angle.

## What This Validates

- `rotate={{ match: '#id.angle', add: 90 }}` creates perpendicular relationships
- The `add` field is summed with the matched angle
- Line `start` can reference another line's `midpoint` anchor
