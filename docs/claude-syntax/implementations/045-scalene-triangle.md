# 045 — Scalene Triangle

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-1-static-shapes-13-scalene-triangle--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A scalene triangle with three different side lengths. All angles are different. Depending on side ratios, the triangle may be acute, right, or obtuse.

## What This Validates

- `kind="scalene"` uses three independent side lengths
- Vertex positions are computed via law of cosines
- The same component handles both acute and obtuse cases
- Triangle inequality is implicitly validated (a + b > c for all permutations)
