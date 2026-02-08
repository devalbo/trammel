# 046 — Triangle with Direct Vertices

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A triangle defined by three explicit vertex coordinates, bypassing the `kind` construction methods entirely. Useful for irregular triangles or when you already know the exact points.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Triangle>` | Primitive | Vertex-defined triangle |

## Syntax

```jsx
<Sprite viewBox="0 0 200 200">
  <Triangle
    id="custom"
    vertices={[
      { x: 30, y: 160 },
      { x: 170, y: 140 },
      { x: 80, y: 30 }
    ]}
    fill="#9b59b6"
    stroke="#6c3483"
    strokeWidth={1.5}
  />
</Sprite>
```

## Vertex Mapping

- v0 = `{ x: 30, y: 160 }` (first element)
- v1 = `{ x: 170, y: 140 }` (second element)
- v2 = `{ x: 80, y: 30 }` (third element)

## Expected SVG Output

```svg
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <polygon points="30,160 170,140 80,30" fill="#9b59b6" stroke="#6c3483" stroke-width="1.5" />
</svg>
```

## Anchors Registered

| Anchor | Value |
|--------|-------|
| `v0` | `{ x: 30, y: 160 }` |
| `v1` | `{ x: 170, y: 140 }` |
| `v2` | `{ x: 80, y: 30 }` |
| `centroid` | `{ x: 93.33, y: 110 }` |
| `left` | `30` |
| `right` | `170` |
| `top` | `30` |
| `bottom` | `160` |
| `width` | `140` |
| `height` | `130` |

## What This Validates

- `vertices` prop overrides `kind`-based construction
- Anchors are computed from the explicit vertices
- Bounding box is the axis-aligned bounds of all three points
- This is the escape hatch for any triangle geometry that doesn't fit a named kind
