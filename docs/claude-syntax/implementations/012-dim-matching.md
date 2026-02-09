# 012 — Dimension Matching

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-3-reference-math-21-dimension-matching--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Two rectangles where the second matches the first's width and half its height. Tests reference strings on dimension props.

## What This Validates

- Reference strings work on `width`/`height` dimension props, not just position props
- Multiplication arithmetic works in reference strings (`* 0.5`)
- Dimension references create a dependency edge in the solver graph
