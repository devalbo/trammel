# 030 — Row Layout with Gap

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

Five circles evenly spaced in a horizontal row using the `<Layout>` container.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Layout>` | Container | Auto-distributes children |
| `<Circle>` x5 | Primitive | Row items |

## Syntax

```jsx
<Sprite viewBox="0 0 240 60">
  <Layout
    direction="row"
    gap={15}
    padding={20}
    alignItems="center"
    x={0}
    y={0}
    width={240}
    height={60}
  >
    <Circle r={10} fill="#e74c3c" />
    <Circle r={10} fill="#3498db" />
    <Circle r={10} fill="#2ecc71" />
    <Circle r={10} fill="#f39c12" />
    <Circle r={10} fill="#9b59b6" />
  </Layout>
</Sprite>
```

## Resolver Trace

1. Layout: direction=row, gap=15, padding=20, width=240
2. 5 items, each diameter 20, total item width = 100, gaps = 4 × 15 = 60, padding = 2 × 20 = 40
3. Positions (cx): 30, 55, 80, 105, 130 (each center, starting at padding + r)
4. All cy = 30 (centered in 60px height)

## Expected SVG Output

```svg
<svg viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30" cy="30" r="10" fill="#e74c3c" />
  <circle cx="55" cy="30" r="10" fill="#3498db" />
  <circle cx="80" cy="30" r="10" fill="#2ecc71" />
  <circle cx="105" cy="30" r="10" fill="#f39c12" />
  <circle cx="130" cy="30" r="10" fill="#9b59b6" />
</svg>
```

## What This Validates

- Layout distributes children along the main axis with fixed `gap`
- `alignItems="center"` centers children on the cross axis
- `padding` adds space at the start and end
- Children don't need explicit position props — Layout assigns them
