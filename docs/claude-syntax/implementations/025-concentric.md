# 025 — Concentric Circles

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-5-typed-constraints-32-concentric-circles--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Two circles sharing the same center — an outer ring and an inner hole. Tests the `concentric` geometric constraint.

## What This Validates

- `GeoConcentric` forces center alignment via the `geo` prop
- The concentric constraint only affects position, not size (radius is independent)
- This is equivalent to `centerX="#outer.centerX" centerY="#outer.centerY"` but more semantic
