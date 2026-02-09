# 040 — Polar Bolt Circle

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-7-combinations-52-polar-bolt-circle--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Bolts arranged in a circle around a central hub using polar constraints with parametric count and radius. Each bolt position is computed from `360 / count * i` degrees.

## What This Validates

- Polar constraint with parametric angle
- `Array.from` + polar creates circular patterns
- Construction geometry (dashed bolt circle) for visual reference
- Changing any variable recomputes the entire pattern
