# 016 — Z-Ordering

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

Three overlapping shapes where the `z` prop overrides JSX source order. A circle (z=2) appears in front of two overlapping rects despite being declared between them.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Rect>` #back | Primitive | z=0, background |
| `<Circle>` #mid | Primitive | z=2, on top |
| `<Rect>` #front | Primitive | z=1, middle layer |

## Syntax

```jsx
<Sprite viewBox="0 0 200 150">
  {/* Declared first, z=0: painted first */}
  <Rect id="back" x={20} y={20} width={100} height={80} fill="#4a90d9" z={0} />

  {/* Declared second, z=2: painted LAST (on top) */}
  <Circle id="mid" centerX={90} centerY={60} r={30} fill="#e74c3c" z={2} />

  {/* Declared third, z=1: painted second (middle) */}
  <Rect id="front" x={60} y={40} width={100} height={80} fill="#2ecc71" z={1} />
</Sprite>
```

## Expected SVG Output (z-sorted)

```svg
<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
  <!-- z=0 -->
  <rect x="20" y="20" width="100" height="80" fill="#4a90d9" />
  <!-- z=1 -->
  <rect x="60" y="40" width="100" height="80" fill="#2ecc71" />
  <!-- z=2 (on top despite being declared second) -->
  <circle cx="90" cy="60" r="30" fill="#e74c3c" />
</svg>
```

## What This Validates

- Children are sorted by `z` before being emitted to SVG
- Higher `z` = painted later = visually on top (SVG painter's algorithm)
- Z-ordering is sibling-scoped (all three are siblings of Sprite)
