# 013 — Self-Reference

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A rectangle whose height is derived from its own width, locking a 4:3 aspect ratio. Tests the `$self` prefix for intra-shape references.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Rect>` #box | Primitive | Self-referencing rect |

## Constraints Used

| Constraint | Expression | Resolution |
|---|---|---|
| Self-reference | `height="$self.width * 0.75"` | width = 120 → 120 * 0.75 = 90 → height = 90 |

## Syntax

```jsx
<Sprite viewBox="0 0 200 150">
  <Rect
    id="box"
    x={30}
    y={20}
    width={120}
    height="$self.width * 0.75"
    fill="#4a90d9"
    stroke="#333"
  />
</Sprite>
```

## Resolver Trace

1. box begins resolution with known values: `x = 30`, `y = 20`, `width = 120`
2. `height` encounters `$self.width` → reads own resolved width → 120
3. Applies `* 0.75` → 90
4. box resolves: `{ x: 30, y: 20, w: 120, h: 90 }`

## Expected SVG Output

```svg
<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="20" width="120" height="90" fill="#4a90d9" stroke="#333" />
</svg>
```

## What This Validates

- `$self` prefix references the shape's own resolved properties
- Self-references resolve in a single pass when the referenced property is already known
- This is the simplest form of aspect ratio locking (alternative to `dim={{ type: 'ratio', ... }}`)
