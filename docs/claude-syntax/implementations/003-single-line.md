# 003 — Single Line

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-1-static-shapes-03-single-line--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A line segment between two explicit points. Tests Point2D prop handling for `start` and `end`.

## What This Validates

- Line maps `start.x`/`start.y` to SVG `x1`/`y1`
- Line maps `end.x`/`end.y` to SVG `x2`/`y2`
- Point2D objects are accepted as prop values
