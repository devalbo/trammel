# 028 — Parallel Rotation

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-5-typed-constraints-37-parallel-rotation--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Two lines where the second is forced to be parallel to the first using the `rotate` prop with `match`.

## What This Validates

- `rotate={{ match: '#id.angle' }}` copies a line's computed angle
- Lines expose an `angle` anchor computed from start/end points
- `length` + `start` + `rotate` fully determines a line (end is computed)
