# 033 — Simple Parametric Rect

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-6-layout-variables-44-simple-parametric-rect--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A rect whose width and color are controlled by variables passed through `<Sprite vars={...}>`. Tests CalcValue functions reading `ctx.vars`.

## What This Validates

- Variables are accessible via `ctx.vars` in CalcValue functions
- CalcValue works on both dimension and presentation props (width, fill)
- Changing `vars.plateWidth` to 100 would move and resize the rect
