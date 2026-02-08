# 005 — Single Path

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A freeform SVG path using absolute coordinates. Tests passthrough of the `d` attribute with `normalized={false}`.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Sprite>` | Container | Root SVG viewBox |
| `<Path>` | Primitive | Freeform shape |

## Props Exercised

- `id`, `d`, `normalized` — Geometry
- `fill`, `stroke` — Presentation

## Syntax

```jsx
<Sprite viewBox="0 0 200 200">
  <Path
    id="arrow"
    normalized={false}
    d="M 40 100 L 140 100 L 140 70 L 180 110 L 140 150 L 140 120 L 40 120 Z"
    fill="#4a90d9"
    stroke="#2a5080"
    strokeWidth={1.5}
  />
</Sprite>
```

## Expected SVG Output

```svg
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M 40 100 L 140 100 L 140 70 L 180 110 L 140 150 L 140 120 L 40 120 Z" fill="#4a90d9" stroke="#2a5080" stroke-width="1.5" />
</svg>
```

## What This Validates

- Path passes the `d` string directly to SVG when `normalized={false}`
- The `d` prop is not transformed or scaled
- Bounding box is computed from path data for anchor resolution (used by later examples)
