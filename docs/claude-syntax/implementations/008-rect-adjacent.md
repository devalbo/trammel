# 008 — Rect Adjacent to Rect

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-2-one-reference-16-rect-adjacent-to-rect--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Two rectangles placed side-by-side. Box B's left edge snaps to Box A's right edge using a reference string. This is the first example requiring the constraint resolver.

## What This Validates

- Reference string parser extracts target ID and anchor name from `"#boxA.right"`
- Solver resolves dependencies in correct order (boxA before boxB)
- Virtual prop `left` correctly maps to SVG `x`
