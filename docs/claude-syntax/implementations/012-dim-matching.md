# 012 — Dimension Matching

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

Two rectangles where the second matches the first's width and half its height. Tests reference strings on dimension props.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Rect>` #a, #b | Primitive | Dimension-linked rects |

## Constraints Used

| Constraint | Expression | Resolution |
|---|---|---|
| Match width | `width="#a.width"` | a.width = 100 → b.width = 100 |
| Scaled height | `height="#a.height * 0.5"` | a.height = 60 → 60 * 0.5 = 30 → b.height = 30 |

## Syntax

```jsx
<Sprite viewBox="0 0 250 120">
  <Rect id="a" x={10} y={10} width={100} height={60} fill="#4a90d9" />

  <Rect
    id="b"
    x={10}
    y={80}
    width="#a.width"
    height="#a.height * 0.5"
    fill="#d94a4a"
  />
</Sprite>
```

## Expected SVG Output

```svg
<svg viewBox="0 0 250 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="100" height="60" fill="#4a90d9" />
  <rect x="10" y="80" width="100" height="30" fill="#d94a4a" />
</svg>
```

## What This Validates

- Reference strings work on `width`/`height` dimension props, not just position props
- Multiplication arithmetic works in reference strings (`* 0.5`)
- Dimension references create a dependency edge in the solver graph
