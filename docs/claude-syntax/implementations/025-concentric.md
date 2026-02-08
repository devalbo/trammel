# 025 — Concentric Circles

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

Two circles sharing the same center — an outer ring and an inner hole. Tests the `concentric` geometric constraint.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Circle>` #outer | Primitive | The ring |
| `<Circle>` #inner | Primitive | The hole, concentric with outer |

## Syntax

```jsx
<Sprite viewBox="0 0 200 200">
  <Circle
    id="outer"
    centerX={100}
    centerY={100}
    r={50}
    fill="none"
    stroke="#333"
    strokeWidth={3}
  />

  <Circle
    id="inner"
    geo={{ type: 'concentric', target: 'outer' }}
    r={20}
    fill="#e74c3c"
  />
</Sprite>
```

## Resolver Trace

1. outer: cx = 100, cy = 100, r = 50
2. inner: concentric with outer → cx = 100, cy = 100, r = 20

## Expected SVG Output

```svg
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="50" fill="none" stroke="#333" stroke-width="3" />
  <circle cx="100" cy="100" r="20" fill="#e74c3c" />
</svg>
```

## What This Validates

- `GeoConcentric` forces center alignment via the `geo` prop
- The concentric constraint only affects position, not size (radius is independent)
- This is equivalent to `centerX="#outer.centerX" centerY="#outer.centerY"` but more semantic
