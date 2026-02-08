# 033 — Simple Parametric Rect

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A rect whose width and color are controlled by variables passed through `<Sprite vars={...}>`. Tests CalcValue functions reading `ctx.vars`.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Sprite>` | Container | Variable host |
| `<Rect>` | Primitive | Variable-driven |

## Syntax

```jsx
<Sprite
  viewBox="0 0 300 100"
  vars={{
    plateWidth: 200,
    color: "#4a90d9"
  }}
>
  <Rect
    id="plate"
    centerX={150}
    centerY={50}
    width={(ctx) => ctx.vars.plateWidth}
    height={60}
    fill={(ctx) => ctx.vars.color}
    stroke="#333"
    strokeWidth={1.5}
  />
</Sprite>
```

## Resolver Trace

1. vars: `{ plateWidth: 200, color: "#4a90d9" }`
2. plate width: CalcValue reads `ctx.vars.plateWidth` → 200
3. plate fill: reads `ctx.vars.color` → "#4a90d9"
4. centerX = 150 → x = 150 - 200/2 = 50

## Expected SVG Output

```svg
<svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="20" width="200" height="60" fill="#4a90d9" stroke="#333" stroke-width="1.5" />
</svg>
```

## What This Validates

- Variables are accessible via `ctx.vars` in CalcValue functions
- CalcValue works on both dimension and presentation props (width, fill)
- Changing `vars.plateWidth` to 100 would move and resize the rect
