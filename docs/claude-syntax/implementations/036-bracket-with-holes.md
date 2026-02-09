# 036 — Bracket with Holes

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-7-combinations-50-bracket-with-holes--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A rectangular plate with a parametric number of bolt holes distributed via Layout. Each hole is a pair of concentric circles (bore + counterbore). Combines Layout, concentric constraints, and parametric variables.

## What This Validates

- Layout + parametric count working together
- Concentric constraint between sibling circles inside a Group
- CalcValue positioning Layout bounds relative to plate with margin
- Changing `boltCount` re-distributes; changing radii resizes all holes
