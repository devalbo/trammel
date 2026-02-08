# 007 — Single Point (Construction Geometry)

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

An invisible point used as construction geometry. It renders nothing to SVG but registers its coordinates in the solver context so other shapes can reference it.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Sprite>` | Container | Root SVG viewBox |
| `<Point>` | Primitive | Invisible anchor |
| `<Circle>` | Primitive | Visible shape that references the point |

## Props Exercised

- `id`, `at` — Point identity and location
- Reference string reading from a Point anchor

## Syntax

```jsx
<Sprite viewBox="0 0 200 200">
  {/* Construction point — not rendered */}
  <Point id="pivot" at={{ x: 100, y: 100 }} />

  {/* Circle centered on the invisible point */}
  <Circle
    id="ring"
    centerX="#pivot.x"
    centerY="#pivot.y"
    r={30}
    fill="none"
    stroke="#333"
    strokeWidth={2}
  />
</Sprite>
```

## Expected SVG Output

```svg
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- No output for Point -->
  <circle cx="100" cy="100" r="30" fill="none" stroke="#333" stroke-width="2" />
</svg>
```

## What This Validates

- Point produces no SVG output
- Point registers its `x` and `y` anchors in the solver context
- Other shapes can reference Point anchors via `#id.x` / `#id.y`
