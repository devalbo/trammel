# 026 — Symmetry (Mirror)

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-5-typed-constraints-39-symmetry-mirror--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Two rectangles mirrored across a vertical construction line. The right rect is the mirror of the left rect.

## What This Validates

- Symmetry constraint mirrors position across a line axis
- The mirrored shape inherits dimensions from the source
- Mode `'mirror'` flips position; `'clone'` would duplicate without flipping
- Invisible construction lines work as constraint targets
