# 022 — Aspect Ratio Lock

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-5-typed-constraints-33-aspect-ratio-lock--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A rect with fixed width and height locked to a golden ratio (0.618) using the typed `dim` prop.

## What This Validates

- `DimRatio` constraint computes the dependent dimension from the base dimension
- `base: 'width'` means width is the master and height is derived
- The `dim` prop coexists with explicit `width` (dim handles the missing height)
