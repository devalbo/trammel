# 018 — Coincident Constraint

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

Snap a circle's center to a rectangle's top-right corner using the typed `pos` prop with the `coincident` strategy.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Rect>` #box | Primitive | Anchor shape |
| `<Circle>` #pin | Primitive | Snapped to box corner |

## Constraints Used

| Prop | Value |
|------|-------|
| `pos` | `{ type: 'coincident', anchor: 'center', target: '#box.topRight' }` |

## Syntax

```jsx
<Sprite viewBox="0 0 200 150">
  <Rect id="box" x={30} y={40} width={80} height={60} fill="#e8e8e8" stroke="#999" />

  <Circle
    id="pin"
    pos={{ type: 'coincident', anchor: 'center', target: '#box.topRight' }}
    r={8}
    fill="#e74c3c"
  />
</Sprite>
```

## Resolver Trace

1. box resolves → `topRight = { x: 110, y: 40 }`
2. pin's coincident constraint: snap pin's `center` to `{ x: 110, y: 40 }`
3. Since anchor is `center`: `cx = 110, cy = 40`

## Expected SVG Output

```svg
<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="40" width="80" height="60" fill="#e8e8e8" stroke="#999" />
  <circle cx="110" cy="40" r="8" fill="#e74c3c" />
</svg>
```

## What This Validates

- The `pos` typed prop with `type: 'coincident'` works
- The `anchor` field selects which point on the shape is snapped
- The `target` field accepts an AnchorRef resolving to a Point2D
