# 029 — Perpendicular Rotation

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

Two lines where the second is forced perpendicular to the first by adding 90 degrees to the matched angle.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Line>` #rail | Primitive | Reference line |
| `<Line>` #cross | Primitive | Perpendicular to rail |

## Syntax

```jsx
<Sprite viewBox="0 0 200 200">
  <Line
    id="rail"
    start={{ x: 20, y: 150 }}
    end={{ x: 180, y: 50 }}
    stroke="#333"
    strokeWidth={2}
  />

  <Line
    id="cross"
    start="#rail.midpoint"
    length={60}
    rotate={{ match: '#rail.angle', add: 90 }}
    stroke="#e74c3c"
    strokeWidth={2}
  />
</Sprite>
```

## Resolver Trace

1. rail: midpoint = (100, 100), angle ≈ -32°
2. cross: start = (100, 100), rotate = -32° + 90° = 58°
3. cross end.x = 100 + 60 * cos(58°) ≈ 132
4. cross end.y = 100 + 60 * sin(58°) ≈ 151

## What This Validates

- `rotate={{ match: '#id.angle', add: 90 }}` creates perpendicular relationships
- The `add` field is summed with the matched angle
- Line `start` can reference another line's `midpoint` anchor
