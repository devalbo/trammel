# 035 — Visibility Controlled by Variable

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-6-layout-variables-45-visibility-controlled-by-variable--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A Group whose visibility is toggled by a boolean variable. Tests that hidden groups suppress rendering but maintain solver presence.

## What This Validates

- `visible` accepts CalcValue functions reading `ctx.vars`
- Group visibility cascades to all children
- `varDefs` provides metadata for auto-generating a checkbox in the host UI
