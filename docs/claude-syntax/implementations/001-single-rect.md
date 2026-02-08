# 001 — Single Rect

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

The simplest possible sprite: a single rectangle rendered with explicit absolute props. No constraints, no references, no containers beyond the root `<Sprite>`.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Sprite>` | Container | Root SVG viewBox |
| `<Rect>` | Primitive | The rectangle |

## Props Exercised

- `id` — Identity
- `x`, `y` — Absolute position
- `width`, `height` — Absolute dimensions
- `fill`, `stroke`, `strokeWidth` — Presentation
- `rx` — Corner radius

## Syntax

```jsx
<Sprite viewBox="0 0 200 120">
  <Rect
    id="plate"
    x={20}
    y={20}
    width={160}
    height={80}
    fill="#b0b0b0"
    stroke="#333"
    strokeWidth={1.5}
    rx={4}
  />
</Sprite>
```

## Expected SVG Output

```svg
<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="160" height="80" fill="#b0b0b0" stroke="#333" stroke-width="1.5" rx="4" />
</svg>
```

## What This Validates

- Sprite renders an `<svg>` with the correct viewBox
- Rect maps props directly to SVG `<rect>` attributes
- No solver logic is triggered (all values are static numbers)
