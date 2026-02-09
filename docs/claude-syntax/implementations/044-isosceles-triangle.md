# 044 — Isosceles Triangle

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-1-static-shapes-09-isosceles-triangle--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

An isosceles triangle with two equal sides (legs). Can be defined by `base` + `height`, or `base` + `legs`. Depending on proportions, the triangle is acute (tall/narrow) or obtuse (short/wide).

## What This Validates

- `kind="isosceles"` constructs with base centered and apex above
- Both `base + height` and `base + legs` forms work
- The same component produces both acute and obtuse triangles depending on proportions
