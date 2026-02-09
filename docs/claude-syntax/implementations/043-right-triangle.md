# 043 — Right Triangle

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-1-static-shapes-08-right-triangle--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A right triangle with a 90-degree angle at vertex v0. Defined by `base` (horizontal leg) and `height` (vertical leg). The hypotenuse connects v1 to v2.

## What This Validates

- `kind="right"` places the right angle at v0
- Base runs along the X-axis from v0, height runs along the Y-axis from v0
- Hypotenuse is implicit (v1→v2)
- The 3-4-5 family (base=80, height=60, hyp=100) is a classic validation case
