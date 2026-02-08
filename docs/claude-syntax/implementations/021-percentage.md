# 021 — Percentage of Parent

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A rect sized as a percentage of the Sprite viewBox. Tests `RelativeValue` (`"80%"`) in dimension props.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Rect>` | Primitive | Percentage-sized |

## Syntax

```jsx
<Sprite viewBox="0 0 200 200">
  <Rect
    id="box"
    centerX={100}
    centerY={100}
    width="80%"
    height="50%"
    fill="#4a90d9"
    stroke="#333"
  />
</Sprite>
```

## Resolver Trace

1. Parent (Sprite) dimensions: 200 x 200
2. width = 80% of 200 = 160
3. height = 50% of 200 = 100
4. centerX = 100 → x = 100 - 160/2 = 20
5. centerY = 100 → y = 100 - 100/2 = 50

## Expected SVG Output

```svg
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="50" width="160" height="100" fill="#4a90d9" stroke="#333" />
</svg>
```

## What This Validates

- `"N%"` string values resolve against the parent container's dimensions
- Percentage width uses parent width; percentage height uses parent height
- Virtual prop `centerX`/`centerY` resolution works with dynamically computed width/height
