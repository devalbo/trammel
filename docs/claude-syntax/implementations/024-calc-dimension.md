# 024 — CalcValue Dimension

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-5-typed-constraints-36-calc-value-dimension--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A rect whose width is computed from a function that reads another shape's resolved geometry via the solver context.

## What This Validates

- CalcValue functions receive SolverContext and can read other shapes
- `ctx.get(id)` returns the resolved BoundingBox of another shape
- CalcValue can express arbitrary arithmetic not possible in reference strings
