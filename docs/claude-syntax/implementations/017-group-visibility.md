# 017 — Group Visibility Toggle

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-4-containers-27-group-visibility-toggle--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A Group wrapping a rect and a text label. Setting `visible={false}` on the Group hides both children. The hidden shapes still register in the solver context (their anchors are available).

## What This Validates

- Group `visible={false}` suppresses SVG output for all children
- Hidden shapes still resolve their geometry (badge computes its position)
- If another shape outside the group referenced `#badge.centerX`, it would still work
