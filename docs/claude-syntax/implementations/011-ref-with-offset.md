# 011 — Reference String with Offset

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-3-reference-math-20-reference-string-with-offset--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

Two rects where Box B is positioned 10px to the right of Box A. Tests the arithmetic parser in reference strings.

## What This Validates

- Reference string parser handles `+ N` arithmetic
- The offset is applied after the anchor value is resolved
- Also validates dimension reference (`height="#a.height"`)
