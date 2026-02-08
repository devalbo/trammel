# 002 — Single Circle

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A single circle with explicit center coordinates and radius. Tests the Circle component's translation of `centerX`/`centerY`/`r` to SVG `cx`/`cy`/`r`.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Sprite>` | Container | Root SVG viewBox |
| `<Circle>` | Primitive | The circle |

## Props Exercised

- `id`, `centerX`, `centerY`, `r` — Geometry
- `fill`, `stroke`, `strokeWidth` — Presentation

## Syntax

```jsx
<Sprite viewBox="0 0 200 200">
  <Circle
    id="hub"
    centerX={100}
    centerY={100}
    r={40}
    fill="#4a90d9"
    stroke="#2a5080"
    strokeWidth={2}
  />
</Sprite>
```

## Expected SVG Output

```svg
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="40" fill="#4a90d9" stroke="#2a5080" stroke-width="2" />
</svg>
```

## What This Validates

- Circle maps `centerX`/`centerY` to SVG `cx`/`cy`
- Circle maps `r` directly to SVG `r`
- No virtual prop resolution needed (centerX/centerY are the native positioning model for circles)
