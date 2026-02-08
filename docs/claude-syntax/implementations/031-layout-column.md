# 031 — Column Layout with Alignment

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

Three rects of different widths stacked vertically and center-aligned using a column Layout.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Layout>` | Container | Column distribution |
| `<Rect>` x3 | Primitive | Varying-width items |

## Syntax

```jsx
<Sprite viewBox="0 0 200 200">
  <Layout
    direction="column"
    gap={10}
    padding={15}
    alignItems="center"
    x={0}
    y={0}
    width={200}
    height={200}
  >
    <Rect width={160} height={40} fill="#4a90d9" rx={4} />
    <Rect width={100} height={40} fill="#2ecc71" rx={4} />
    <Rect width={130} height={40} fill="#e74c3c" rx={4} />
  </Layout>
</Sprite>
```

## Resolver Trace

1. Layout: column, gap=10, padding=15, total height available=200
2. Item heights: 40, 40, 40. Gaps: 2 × 10 = 20. Padding: 2 × 15 = 30.
3. Y positions: 15, 65, 115
4. X positions (center-aligned in 200px width): (200-160)/2=20, (200-100)/2=50, (200-130)/2=35

## Expected SVG Output

```svg
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="15" width="160" height="40" fill="#4a90d9" rx="4" />
  <rect x="50" y="65" width="100" height="40" fill="#2ecc71" rx="4" />
  <rect x="35" y="115" width="130" height="40" fill="#e74c3c" rx="4" />
</svg>
```

## What This Validates

- Column layout distributes along Y axis
- `alignItems="center"` centers each child on the X axis
- Children with different widths are individually centered
