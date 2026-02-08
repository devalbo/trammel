# 004 — Single Arc

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A circular arc defined by center, radius, and angle range. Tests conversion of the high-level Arc props into an SVG `<path>` with arc commands.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Sprite>` | Container | Root SVG viewBox |
| `<Arc>` | Primitive | The circular arc |

## Props Exercised

- `id`, `center`, `r`, `startAngle`, `endAngle` — Geometry
- `stroke`, `strokeWidth`, `fill` — Presentation

## Syntax

```jsx
<Sprite viewBox="0 0 200 200">
  <Arc
    id="curve"
    center={{ x: 100, y: 100 }}
    r={60}
    startAngle={0}
    endAngle={270}
    stroke="#c0392b"
    strokeWidth={3}
    fill="none"
  />
</Sprite>
```

## Expected SVG Output

The Arc component must compute SVG arc path commands from the center/radius/angle description:

```svg
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M 160 100 A 60 60 0 1 1 100 160" stroke="#c0392b" stroke-width="3" fill="none" />
</svg>
```

(Exact path data depends on angle→point conversion and large-arc-flag calculation.)

## What This Validates

- Arc converts `center` + `r` + angle range into SVG arc path commands
- `startAngle`/`endAngle` in degrees are translated to SVG arc parameters
- The large-arc-flag is correctly computed (270° > 180° → flag = 1)
