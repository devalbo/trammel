# 037 — Symmetric Face

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-7-combinations-51-symmetric-face--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A simple character face: head circle, two mirrored eyes, and a centered mouth arc. Combines Frame normalization, symmetry constraints, and cross-sibling reference strings.

## What This Validates

- Frame maps 0..1 coords to pixel space for all children
- Symmetry works within a Frame's normalized coordinate space
- Arc renders correctly with center-relative angles
- Invisible construction line serves as mirror axis
