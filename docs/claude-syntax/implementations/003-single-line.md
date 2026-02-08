# 003 — Single Line

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A line segment between two explicit points. Tests Point2D prop handling for `start` and `end`.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Sprite>` | Container | Root SVG viewBox |
| `<Line>` | Primitive | The line segment |

## Props Exercised

- `id`, `start`, `end` — Geometry (as Point2D objects)
- `stroke`, `strokeWidth` — Presentation

## Syntax

```jsx
<Sprite viewBox="0 0 200 120">
  <Line
    id="edge"
    start={{ x: 20, y: 60 }}
    end={{ x: 180, y: 60 }}
    stroke="#333"
    strokeWidth={2}
  />
</Sprite>
```

## Expected SVG Output

```svg
<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
  <line x1="20" y1="60" x2="180" y2="60" stroke="#333" stroke-width="2" />
</svg>
```

## What This Validates

- Line maps `start.x`/`start.y` to SVG `x1`/`y1`
- Line maps `end.x`/`end.y` to SVG `x2`/`y2`
- Point2D objects are accepted as prop values
