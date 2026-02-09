# 039 — Pipe Between Two Tanks

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-7-combinations-47-pipe-between-two-tanks--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

A rect that auto-stretches between two shapes using dual-anchor fit. Width is implicit — determined by `left` and `right` referencing different shapes. Proves the "responsive connector" pattern.

## What This Validates

- Dual `left`/`right` references compute width automatically
- Moving tank2 to x=300 would stretch the pipe to width=230 with no code changes
- This is the key "responsive connector" pattern for assembly diagrams
