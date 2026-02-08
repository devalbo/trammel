# 041 — Full Character Sprite

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

The capstone integration test. A complete character sprite with head, torso, arms, and legs across multiple Frames. Uses every constraint category: reference strings, symmetry, z-ordering, nested Frames, variables, CalcValue, and Group visibility.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Frame>` #torso | Container | Body region |
| `<Frame>` #head | Container | Head region |
| `<Frame>` #arm_L, #arm_R | Container | Arm regions (mirrored) |
| `<Frame>` #legs | Container | Leg region |
| `<Path>` #torso_skin | Primitive | Body skin |
| `<Group>` #shirt | Container | Toggleable shirt layer |
| `<Frame>` #shirt_zone | Container | Shirt sub-scope |
| `<Path>` #shirt_fabric | Primitive | Shirt shape |
| `<Text>` | Primitive | Shirt logo |
| `<Circle>` #head_shape | Primitive | Head |
| `<Circle>` #eye_L, #eye_R | Primitive | Eyes (symmetric) |
| `<Circle>` #pupil_L, #pupil_R | Primitive | Pupils (symmetric) |
| `<Line>` #face_center | Primitive | Mirror axis (invisible) |
| `<Arc>` #mouth | Primitive | Smile |
| `<Rect>` (arms, legs, sleeves) | Primitive | Limb shapes |

## All Constraint Types Exercised

| Category | Examples in This Sprite |
|----------|------------------------|
| Reference strings | `centerX="#eye_L.centerX"`, `left="#leg_L.right + 0.1"` |
| Frame normalization | All children use 0..1 within their Frame |
| Symmetry | eye_R mirrors eye_L, pupil_R mirrors pupil_L, arm_R mirrors arm_L |
| Z-ordering | Skin z=0, shirt Group z=10, logo z=1 within shirt |
| Group visibility | `<Group visible={(ctx) => ctx.vars.showShirt}>` |
| CalcValue | `fill={(ctx) => ctx.vars.skinTone}`, `rotate={(ctx) => -ctx.vars.armAngle}` |
| Variables | skinTone, shirtColor, showShirt, armAngle |
| Construction geometry | `<Line id="face_center" visible={false} />` |

## Syntax

```jsx
<Sprite
  viewBox="0 0 200 400"
  vars={{
    skinTone: "#e0ac69",
    shirtColor: "#336699",
    showShirt: true,
    armAngle: 15
  }}
  varDefs={[
    { name: 'skinTone', type: 'color', default: '#e0ac69', label: 'Skin Tone' },
    { name: 'shirtColor', type: 'color', default: '#336699', label: 'Shirt Color' },
    { name: 'showShirt', type: 'boolean', default: true, label: 'Show Shirt' },
    { name: 'armAngle', type: 'number', default: 15, min: 0, max: 45, step: 1, label: 'Arm Angle' }
  ]}
>

  {/* === TORSO === */}
  <Frame id="torso" from={{ x: 0.2, y: 0.25 }} to={{ x: 0.8, y: 0.65 }}>
    <Path id="torso_skin" z={0}
      d="M 0.15 0 L 0.85 0 L 0.9 0.15 L 0.95 1 L 0.05 1 L 0.1 0.15 Z"
      fill={(ctx) => ctx.vars.skinTone} />

    <Group id="shirt" z={10} visible={(ctx) => ctx.vars.showShirt}>
      <Frame id="shirt_zone" from={{ x: 0, y: 0 }} to={{ x: 1, y: 0.85 }}>
        <Path id="shirt_fabric" z={0}
          d="M 0.2 0 Q 0.5 0.12 0.8 0 L 1 0.2 L 0.85 0.3 L 0.85 1 L 0.15 1 L 0.15 0.3 L 0 0.2 Z"
          fill={(ctx) => ctx.vars.shirtColor} />
        <Text z={1} centerX={0.5} centerY={0.55}
          fontSize={0.1} fontFamily="Impact" fill="white"
          style={{ letterSpacing: 0.03 }}>
          SPRITE CO
        </Text>
      </Frame>
    </Group>
  </Frame>

  {/* === HEAD === */}
  <Frame id="head" from={{ x: 0.3, y: 0.02 }} to={{ x: 0.7, y: 0.28 }}>
    <Circle id="head_shape" centerX={0.5} centerY={0.55} r={0.45}
      fill={(ctx) => ctx.vars.skinTone} stroke="#333" strokeWidth={1} />

    <Circle id="eye_L" centerX={0.35} centerY={0.45} r={0.07}
      fill="white" stroke="#333" />
    <Circle id="pupil_L" centerX="#eye_L.centerX" centerY="#eye_L.centerY"
      r={0.03} fill="#222" />

    <Line id="face_center" start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      visible={false} />

    <Circle id="eye_R"
      geo={{ type: 'symmetry', source: 'eye_L', axis: 'face_center', mode: 'mirror' }}
      fill="white" stroke="#333" />
    <Circle id="pupil_R"
      geo={{ type: 'symmetry', source: 'pupil_L', axis: 'face_center', mode: 'mirror' }}
      fill="#222" />

    <Arc id="mouth" center={{ x: 0.5, y: 0.55 }} r={0.15}
      startAngle={200} endAngle={340}
      stroke="#333" strokeWidth={1.5} fill="none" />
  </Frame>

  {/* === LEFT ARM === */}
  <Frame id="arm_L" from={{ x: 0.02, y: 0.27 }} to={{ x: 0.22, y: 0.55 }}
    rotate={(ctx) => -ctx.vars.armAngle}>
    <Rect width={1} height={1} rx={0.15}
      fill={(ctx) => ctx.vars.skinTone} stroke="#333" strokeWidth={0.5} />
    <Rect z={10} width={1} height={0.35}
      fill={(ctx) => ctx.vars.shirtColor}
      visible={(ctx) => ctx.vars.showShirt} />
  </Frame>

  {/* === RIGHT ARM (mirrored) === */}
  <Frame id="arm_R"
    geo={{ type: 'symmetry', source: 'arm_L', axis: 'face_center', mode: 'mirror' }}
    rotate={(ctx) => ctx.vars.armAngle}>
    <Rect width={1} height={1} rx={0.15}
      fill={(ctx) => ctx.vars.skinTone} stroke="#333" strokeWidth={0.5} />
    <Rect z={10} width={1} height={0.35}
      fill={(ctx) => ctx.vars.shirtColor}
      visible={(ctx) => ctx.vars.showShirt} />
  </Frame>

  {/* === LEGS === */}
  <Frame id="legs" from={{ x: 0.25, y: 0.63 }} to={{ x: 0.75, y: 0.98 }}>
    <Rect id="leg_L" x={0.05} y={0} width={0.4} height={1} rx={0.05}
      fill={(ctx) => ctx.vars.skinTone} stroke="#333" strokeWidth={0.5} />
    <Rect id="leg_R" left="#leg_L.right + 0.1" y={0}
      width="#leg_L.width" height={1} rx={0.05}
      fill={(ctx) => ctx.vars.skinTone} stroke="#333" strokeWidth={0.5} />
  </Frame>

</Sprite>
```

## What This Validates

This is the integration test that proves all constraint types compose correctly:

1. **Frame nesting** — torso > shirt group > shirt_zone > fabric/text
2. **Cross-Frame symmetry** — eyes and arms mirrored across construction line
3. **Z-layer stacking** — skin/shirt/accessories at different z-levels
4. **Parametric variables** — skin tone, shirt color, arm angle, shirt visibility all reactive
5. **CalcValue on rotation** — arm angle driven by variable
6. **Reference strings across siblings** — leg_R references leg_L within the same Frame
7. **Group visibility cascading** — hiding shirt hides fabric + logo + sleeves
8. **Construction geometry** — invisible face_center line as mirror axis
