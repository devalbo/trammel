# 021 — Percentage of Parent

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-5-typed-constraints-30-percentage-of-parent--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A rect sized as a percentage of the Sprite viewBox. Tests `RelativeValue` (`"80%"`) in dimension props.

## What This Validates

- `"N%"` string values resolve against the parent container's dimensions
- Percentage width uses parent width; percentage height uses parent height
- Virtual prop `centerX`/`centerY` resolution works with dynamically computed width/height
