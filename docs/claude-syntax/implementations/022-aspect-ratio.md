# 022 — Aspect Ratio Lock

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A rect with fixed width and height locked to a golden ratio (0.618) using the typed `dim` prop.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Rect>` | Primitive | Ratio-constrained |

## Syntax

```jsx
<Sprite viewBox="0 0 200 200">
  <Rect
    id="golden"
    x={20}
    y={30}
    width={140}
    dim={{ type: 'ratio', base: 'width', ratio: 0.618 }}
    fill="#f39c12"
    stroke="#333"
  />
</Sprite>
```

## Resolver Trace

1. width = 140 (explicit)
2. dim.ratio: height = width × 0.618 = 140 × 0.618 = 86.52

## Expected SVG Output

```svg
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="30" width="140" height="86.52" fill="#f39c12" stroke="#333" />
</svg>
```

## What This Validates

- `DimRatio` constraint computes the dependent dimension from the base dimension
- `base: 'width'` means width is the master and height is derived
- The `dim` prop coexists with explicit `width` (dim handles the missing height)
