# 014 — Basic Frame

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-4-containers-28-basic-frame--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A Frame containing a Rect that uses normalized 0..1 coordinates. The Frame occupies a subregion of the viewBox, and the child's coordinates are relative to the Frame.

## What This Validates

- Frame transforms children's 0..1 coordinates into pixel space
- Frame computes its own pixel bounds from `from`/`to`
- Children's position AND size are scaled by the Frame dimensions
