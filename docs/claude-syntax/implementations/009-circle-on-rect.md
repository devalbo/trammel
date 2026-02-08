# 009 — Circle Centered on Rect

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A circle whose center aligns with a rectangle's center. Tests centerX/centerY anchor resolution and the virtual prop math for circles (cx = centerX, cy = centerY).

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Rect>` #box | Primitive | Anchor shape |
| `<Circle>` #dot | Primitive | Centered on the rect |

## Constraints Used

| Constraint | Expression | Resolution |
|---|---|---|
| Center X alignment | `centerX="#box.centerX"` | box.centerX = 30 + 80/2 = 70 → circle cx = 70 |
| Center Y alignment | `centerY="#box.centerY"` | box.centerY = 20 + 50/2 = 45 → circle cy = 45 |

## Syntax

```jsx
<Sprite viewBox="0 0 200 100">
  <Rect
    id="box"
    x={30}
    y={20}
    width={80}
    height={50}
    fill="#e8e8e8"
    stroke="#999"
  />

  <Circle
    id="dot"
    centerX="#box.centerX"
    centerY="#box.centerY"
    r={12}
    fill="#c0392b"
  />
</Sprite>
```

## Resolver Trace

1. box resolves: `{ x: 30, y: 20, w: 80, h: 50 }` → anchors: `centerX = 70`, `centerY = 45`
2. dot reads `#box.centerX` → 70, `#box.centerY` → 45
3. dot resolves: `{ cx: 70, cy: 45, r: 12 }`

## Expected SVG Output

```svg
<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="20" width="80" height="50" fill="#e8e8e8" stroke="#999" />
  <circle cx="70" cy="45" r="12" fill="#c0392b" />
</svg>
```

## What This Validates

- `centerX` and `centerY` anchors compute correctly for rects (x + w/2, y + h/2)
- Circle's `centerX`/`centerY` virtual props map directly to SVG `cx`/`cy`
- Cross-shape-type references work (Circle → Rect)
