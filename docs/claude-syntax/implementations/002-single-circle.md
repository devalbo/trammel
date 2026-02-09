# 002 — Single Circle

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-1-static-shapes-02-single-circle--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A single circle with explicit center coordinates and radius. Tests the Circle component's translation of `centerX`/`centerY`/`r` to SVG `cx`/`cy`/`r`.

## What This Validates

- Circle maps `centerX`/`centerY` to SVG `cx`/`cy`
- Circle maps `r` directly to SVG `r`
- No virtual prop resolution needed (centerX/centerY are the native positioning model for circles)
