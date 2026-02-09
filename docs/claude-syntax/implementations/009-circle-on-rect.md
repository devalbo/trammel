# 009 — Circle Centered on Rect

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-2-one-reference-17-circle-centered-on-rect--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A circle whose center aligns with a rectangle's center. Tests centerX/centerY anchor resolution and the virtual prop math for circles (cx = centerX, cy = centerY).

## What This Validates

- `centerX` and `centerY` anchors compute correctly for rects (x + w/2, y + h/2)
- Circle's `centerX`/`centerY` virtual props map directly to SVG `cx`/`cy`
- Cross-shape-type references work (Circle → Rect)
