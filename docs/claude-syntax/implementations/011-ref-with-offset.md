# 011 — Reference String with Offset

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

Two rects where Box B is positioned 10px to the right of Box A. Tests the arithmetic parser in reference strings.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Rect>` #a, #b | Primitive | Two rects with a gap |

## Constraints Used

| Constraint | Expression | Resolution |
|---|---|---|
| Position with offset | `left="#a.right + 10"` | `a.right = 80`, `80 + 10 = 90` → boxB.x = 90 |

## Syntax

```jsx
<Sprite viewBox="0 0 220 100">
  <Rect id="a" x={10} y={20} width={70} height={50} fill="#4a90d9" />

  <Rect
    id="b"
    left="#a.right + 10"
    top="#a.top"
    width={70}
    height="#a.height"
    fill="#d94a4a"
  />
</Sprite>
```

## Resolver Trace

1. a resolves → `right = 80`, `top = 20`, `height = 50`
2. b reads `#a.right + 10` → parser splits to `{ ref: "#a.right", op: "+", val: 10 }` → `80 + 10 = 90`
3. b reads `#a.top` → 20
4. b reads `#a.height` → 50

## Expected SVG Output

```svg
<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="70" height="50" fill="#4a90d9" />
  <rect x="90" y="20" width="70" height="50" fill="#d94a4a" />
</svg>
```

## What This Validates

- Reference string parser handles `+ N` arithmetic
- The offset is applied after the anchor value is resolved
- Also validates dimension reference (`height="#a.height"`)
