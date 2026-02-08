# 037 — Symmetric Face

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A simple character face: head circle, two mirrored eyes, and a centered mouth arc. Combines Frame normalization, symmetry constraints, and cross-sibling reference strings.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Frame>` #head | Container | Coordinate scope for the face |
| `<Circle>` #skull | Primitive | Head outline |
| `<Line>` #axis | Primitive | Symmetry axis (invisible) |
| `<Circle>` #eye_L | Primitive | Left eye |
| `<Circle>` #eye_R | Primitive | Right eye (mirrored) |
| `<Arc>` #mouth | Primitive | Smile |

## Constraints Used

- Frame normalized coordinates (0..1)
- Symmetry: eye_R mirrors eye_L across axis
- centerX/centerY reference strings

## Syntax

```jsx
<Sprite viewBox="0 0 200 200">
  <Frame id="head" from={{ x: 10, y: 10 }} to={{ x: 190, y: 190 }}>

    <Circle id="skull" centerX={0.5} centerY={0.5} r={0.48}
      fill="#f0d080" stroke="#333" strokeWidth={2} />

    <Line id="axis" start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      visible={false} />

    <Circle id="eye_L" centerX={0.32} centerY={0.4} r={0.07}
      fill="white" stroke="#333" strokeWidth={1} />

    <Circle id="eye_R"
      geo={{ type: 'symmetry', source: 'eye_L', axis: 'axis', mode: 'mirror' }}
      fill="white" stroke="#333" strokeWidth={1} />

    <Arc id="mouth"
      center={{ x: 0.5, y: 0.52 }}
      r={0.18}
      startAngle={200}
      endAngle={340}
      stroke="#333"
      strokeWidth={1.5}
      fill="none" />

  </Frame>
</Sprite>
```

## What This Validates

- Frame maps 0..1 coords to pixel space for all children
- Symmetry works within a Frame's normalized coordinate space
- Arc renders correctly with center-relative angles
- Invisible construction line serves as mirror axis
