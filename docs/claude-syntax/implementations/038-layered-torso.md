# 038 — Layered Torso with T-Shirt

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-8-full-assemblies-54-layered-torso-with-t-shirt--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A torso with skin base layer and a shirt overlay with logo text. The shirt is in a toggleable Group with higher z-index. Tests nested Frames, z-ordering, and Group visibility.

## What This Validates

- Nested Frames: shirt_zone is scoped within body
- Z-ordering: skin renders first, then shirt group (fabric before logo)
- Group visibility toggle hides entire shirt layer
- Parametric shirt color via CalcValue
- Percentage-based font size scales with frame
