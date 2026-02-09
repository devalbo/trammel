# 015 — Nested Frames

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-4-containers-29-nested-frames--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A Frame inside a Frame. The inner Frame's `from`/`to` are in the outer Frame's 0..1 space. A circle inside the inner Frame uses 0..1 relative to the inner Frame.

## What This Validates

- Frame transforms compose: inner 0..1 → outer 0..1 → pixel space
- Inner Frame's `from`/`to` are interpreted in the parent Frame's normalized space
- Radius scales proportionally (by the smaller Frame dimension)
