# 032 — Layout with space-between

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-6-layout-variables-43-layout-with-spacebetween--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Four rects distributed to fill available space with equal gaps using `justifyContent="space-between"`.

## What This Validates

- `justifyContent="space-between"` distributes remaining space as equal gaps
- First item touches left padding, last item touches right padding
- Combined with `alignItems="center"` for cross-axis centering
