# 001 — Single Rect

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook → Tier 1 / 01 Single Rect](http://localhost:6006/?path=/docs/tier-1-static-shapes-01-single-rect--docs)
>
> Source: `storybook-viewer/src/stories/tier-1-static/01-SingleRect.stories.tsx`

## Summary

The simplest possible sprite: a single rectangle rendered with explicit absolute props. No constraints, no references, no containers beyond the root `<Sprite>`.

## What This Validates

- Sprite renders an `<svg>` with the correct viewBox
- Rect maps props directly to SVG `<rect>` attributes
- No solver logic is triggered (all values are static numbers)
