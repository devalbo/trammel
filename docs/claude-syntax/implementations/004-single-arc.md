# 004 — Single Arc

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-1-static-shapes-11-single-arc--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A circular arc defined by center, radius, and angle range. Tests conversion of the high-level Arc props into an SVG `<path>` with arc commands.

## What This Validates

- Arc converts `center` + `r` + angle range into SVG arc path commands
- `startAngle`/`endAngle` in degrees are translated to SVG arc parameters
- The large-arc-flag is correctly computed (270° > 180° → flag = 1)
