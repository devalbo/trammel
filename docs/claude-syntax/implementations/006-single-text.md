# 006 — Single Text

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-1-static-shapes-04-single-text--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A text label with explicit position and font properties. Tests text rendering and bounding box computation for text elements.

## What This Validates

- Text renders children as SVG `<text>` content
- Font properties map to SVG attributes (camelCase → kebab-case)
- `textAnchor` maps to SVG `text-anchor`
