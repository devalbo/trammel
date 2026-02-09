# 016 — Z-Ordering

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-4-containers-26-z-ordering--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Three overlapping shapes where the `z` prop overrides JSX source order. A circle (z=2) appears in front of two overlapping rects despite being declared between them.

## What This Validates

- Children are sorted by `z` before being emitted to SVG
- Higher `z` = painted later = visually on top (SVG painter's algorithm)
- Z-ordering is sibling-scoped (all three are siblings of Sprite)
