# 010 — Line Between Two Shapes

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A line whose start and end points are anchored to the centers of two rectangles. Tests AnchorRef resolution for Line's `start`/`end` props.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Rect>` #a, #b | Primitive | Anchor shapes |
| `<Line>` #connector | Primitive | Connects the two rects |

## Constraints Used

| Constraint | Expression | Resolution |
|---|---|---|
| Start point | `start="#a.center"` | Resolves to `{ x: 55, y: 50 }` |
| End point | `end="#b.center"` | Resolves to `{ x: 165, y: 50 }` |

## Syntax

```jsx
<Sprite viewBox="0 0 220 100">
  <Rect id="a" x={20} y={25} width={70} height={50} fill="#4a90d9" />
  <Rect id="b" x={130} y={25} width={70} height={50} fill="#d94a4a" />

  <Line
    id="connector"
    start="#a.center"
    end="#b.center"
    stroke="#333"
    strokeWidth={2}
  />
</Sprite>
```

## Resolver Trace

1. a resolves → anchors: `center = { x: 55, y: 50 }`
2. b resolves → anchors: `center = { x: 165, y: 50 }`
3. connector reads `#a.center` → `{ x: 55, y: 50 }`, `#b.center` → `{ x: 165, y: 50 }`

## Expected SVG Output

```svg
<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="25" width="70" height="50" fill="#4a90d9" />
  <rect x="130" y="25" width="70" height="50" fill="#d94a4a" />
  <line x1="55" y1="50" x2="165" y2="50" stroke="#333" stroke-width="2" />
</svg>
```

## What This Validates

- Line `start`/`end` accept AnchorRef strings
- The `.center` anchor resolves to a Point2D (both x and y)
- Lines don't use the virtual prop system (left/right/top/bottom) — they use start/end directly
