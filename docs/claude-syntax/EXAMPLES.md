# Sprite Assembly Examples

Progressively complex examples demonstrating the syntax from [SYNTAX-REFERENCE.md](./SYNTAX-REFERENCE.md).

---

## Example 1: Two Boxes with a Gap

The simplest useful sprite: two rectangles side-by-side with a 10px gap.

**Concepts:** Reference strings, virtual positioning props.

```jsx
<Sprite viewBox="0 0 200 100">

  {/* Box A: positioned absolutely */}
  <Rect id="boxA" x={10} y={20} width={70} height={60} fill="#4a90d9" />

  {/* Box B: positioned relative to Box A */}
  <Rect
    id="boxB"
    left="#boxA.right + 10"    // 10px gap after Box A
    top="#boxA.top"            // Aligned tops
    width={70}
    height="#boxA.height"      // Same height
    fill="#d94a4a"
  />

</Sprite>
```

**What happens:**
1. Box A resolves to `{ x: 10, y: 20, width: 70, height: 60 }`.
2. Box B reads `#boxA.right` → `80`, adds `10` → sets its `x = 90`.
3. Box B reads `#boxA.top` → `20` → sets its `y = 20`.
4. Box B reads `#boxA.height` → `60` → sets its `height = 60`.

**Result:** Two identically-sized boxes at y=20, with Box B starting at x=90.

---

## Example 2: Robot Face (Frames + Symmetry)

A character face using nested Frames for proportional layout and symmetry for the eyes.

**Concepts:** Frame coordinate isolation, normalized coordinates, symmetry constraint, z-ordering.

```jsx
<Sprite viewBox="0 0 200 200">

  {/* The head occupies the full viewBox */}
  <Frame id="head" from={{ x: 0.05, y: 0.05 }} to={{ x: 0.95, y: 0.95 }}>

    {/* Background: round head shape */}
    <Circle
      id="skull"
      z={0}
      centerX={0.5}
      centerY={0.5}
      r={0.48}
      fill="#f0d080"
      stroke="#333"
      strokeWidth={2}
    />

    {/* Symmetry axis (invisible construction line) */}
    <Line
      id="face_axis"
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      visible={false}
    />

    {/* Left eye: positioned manually */}
    <Frame id="eye_L" from={{ x: 0.15, y: 0.25 }} to={{ x: 0.42, y: 0.5 }}>
      <Circle id="eyeball_L" centerX={0.5} centerY={0.5} r={0.4} fill="white" stroke="#333" />
      <Circle id="pupil_L" centerX={0.55} centerY={0.45} r={0.15} fill="#222" />
    </Frame>

    {/* Right eye: mirror of left eye across face_axis */}
    <Frame
      id="eye_R"
      geo={{ type: 'symmetry', source: "eye_L", axis: "face_axis", mode: 'mirror' }}
    >
      <Circle id="eyeball_R" centerX={0.5} centerY={0.5} r={0.4} fill="white" stroke="#333" />
      <Circle id="pupil_R" centerX={0.45} centerY={0.45} r={0.15} fill="#222" />
    </Frame>

    {/* Mouth: centered horizontally, in lower third */}
    <Rect
      id="mouth"
      z={1}
      centerX={0.5}
      top={0.65}
      width={0.35}
      height={0.08}
      rx={4}
      fill="#c0392b"
    />

    {/* Nose: a small triangle, centered */}
    <Path
      id="nose"
      z={1}
      d="M 0.47 0.5 L 0.53 0.5 L 0.5 0.6 Z"
      fill="#d4a050"
    />

  </Frame>

</Sprite>
```

**What happens:**
1. The `<Frame id="head">` maps its children's 0..1 coordinates to the region (5%,5%)→(95%,95%) of the 200x200 viewBox, so children work in a 190x190 space.
2. `eye_L` is a sub-Frame at (15%,25%)→(42%,50%) of the head. Its children (eyeball, pupil) use 0..1 within that eye-sized region.
3. `eye_R` uses the symmetry constraint — no coordinates needed. It's the mirror of `eye_L` across `face_axis` (x=0.5). The solver computes `from={{ x: 0.58, y: 0.25 }} to={{ x: 0.85, y: 0.5 }}`.
4. The mouth is centered at x=0.5 in the head's space and positioned at y=0.65.

---

## Example 3: Parametric Bolt Pattern (Layout + Variables)

A mechanical bracket with a parametric row of bolt holes.

**Concepts:** Variables, Layout auto-distribution, CalcValue functions, visibility toggle.

```jsx
<Sprite
  viewBox="0 0 300 120"
  vars={{
    plateWidth: 250,
    plateHeight: 80,
    boltCount: 5,
    boltRadius: 4,
    margin: 20,
    showCenterline: true
  }}
  varDefs={[
    { name: 'boltCount', type: 'number', default: 5, min: 2, max: 10, step: 1, label: 'Bolts' },
    { name: 'boltRadius', type: 'number', default: 4, min: 2, max: 8, step: 0.5, label: 'Bolt Radius' },
    { name: 'margin', type: 'number', default: 20, min: 10, max: 50, step: 5, label: 'Edge Margin' },
    { name: 'showCenterline', type: 'boolean', default: true, label: 'Show Centerline' }
  ]}
>

  {/* The plate body */}
  <Rect
    id="plate"
    centerX={150}
    centerY={60}
    width={(ctx) => ctx.vars.plateWidth}
    height={(ctx) => ctx.vars.plateHeight}
    fill="#b0b0b0"
    stroke="#333"
    strokeWidth={1.5}
    rx={3}
  />

  {/* Centerline (construction geometry) */}
  <Line
    id="centerline"
    start="#plate.left"
    end="#plate.right"
    centerY="#plate.centerY"
    stroke="#999"
    strokeWidth={0.5}
    visible={(ctx) => ctx.vars.showCenterline}
    style={{ strokeDasharray: "4 2" }}
  />

  {/* Bolt holes: auto-distributed across the plate */}
  <Layout
    direction="row"
    left={(ctx) => ctx.get('plate').left + ctx.vars.margin}
    right={(ctx) => ctx.get('plate').right - ctx.vars.margin}
    centerY="#plate.centerY"
    justifyContent="space-between"
    alignItems="center"
  >
    {Array.from({ length: vars.boltCount }, (_, i) => (
      <Circle
        key={i}
        id={`bolt_${i}`}
        r={(ctx) => ctx.vars.boltRadius}
        fill="none"
        stroke="#333"
        strokeWidth={1}
      />
    ))}
  </Layout>

  {/* Dimension annotation: plate width */}
  <Line
    start="#plate.bottomLeft"
    end="#plate.bottomRight"
    y="#plate.bottom + 15"
    stroke="#666"
    strokeWidth={0.5}
  />
  <Text
    centerX="#plate.centerX"
    top="#plate.bottom + 20"
    fontSize={10}
    fill="#666"
  >
    {vars.plateWidth}mm
  </Text>

</Sprite>
```

**What happens:**
1. Changing `boltCount` from 5 to 8 re-renders with 8 evenly-spaced holes.
2. Changing `margin` pushes the holes inward, and the `Layout`'s `space-between` recalculates.
3. Toggling `showCenterline` hides the dashed line without affecting constraint resolution.
4. The dimension annotation auto-positions below the plate using reference strings.

---

## Example 4: Multi-Part Sprite Assembly

A full character sprite with separate body parts as nested Frames, z-layers for clothing, and inter-part constraints.

**Concepts:** Deep Frame nesting, cross-Frame references, Group visibility, z-layer stacking, parametric clothing.

```jsx
<Sprite
  viewBox="0 0 200 400"
  vars={{
    skinTone: "#e0ac69",
    shirtColor: "#336699",
    showShirt: true,
    armAngle: 15
  }}
>

  {/* === TORSO REGION === */}
  <Frame id="torso" from={{ x: 0.2, y: 0.25 }} to={{ x: 0.8, y: 0.65 }}>

    {/* Skin layer */}
    <Path
      id="torso_skin"
      z={0}
      d="M 0.15 0 L 0.85 0 L 0.9 0.15 L 0.95 1 L 0.05 1 L 0.1 0.15 Z"
      fill={(ctx) => ctx.vars.skinTone}
    />

    {/* T-Shirt layer (toggleable) */}
    <Group id="shirt_group" z={10} visible={(ctx) => ctx.vars.showShirt}>
      <Frame id="shirt_zone" from={{ x: 0, y: 0 }} to={{ x: 1, y: 0.85 }}>

        <Path
          id="shirt_fabric"
          z={0}
          d="M 0.2 0 Q 0.5 0.12 0.8 0 L 1 0.2 L 0.85 0.3 L 0.85 1 L 0.15 1 L 0.15 0.3 L 0 0.2 Z"
          fill={(ctx) => ctx.vars.shirtColor}
        />

        <Text
          z={1}
          centerX={0.5}
          centerY={0.55}
          fontSize={0.1}
          fontFamily="Impact"
          fill="white"
          style={{ letterSpacing: 0.03 }}
        >
          SPRITE CO
        </Text>

      </Frame>
    </Group>

  </Frame>

  {/* === HEAD REGION === */}
  <Frame id="head" from={{ x: 0.3, y: 0.02 }} to={{ x: 0.7, y: 0.28 }}>

    <Circle
      id="head_shape"
      centerX={0.5}
      centerY={0.55}
      r={0.45}
      fill={(ctx) => ctx.vars.skinTone}
      stroke="#333"
      strokeWidth={1}
    />

    {/* Eyes */}
    <Circle id="eye_L" centerX={0.35} centerY={0.45} r={0.07} fill="white" stroke="#333" />
    <Circle id="pupil_L" centerX="#eye_L.centerX" centerY="#eye_L.centerY" r={0.03} fill="#222" />

    <Line id="face_center" start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} visible={false} />
    <Circle id="eye_R" geo={{ type: 'symmetry', source: "eye_L", axis: "face_center", mode: 'mirror' }} />
    <Circle id="pupil_R" geo={{ type: 'symmetry', source: "pupil_L", axis: "face_center", mode: 'mirror' }} />

    {/* Mouth */}
    <Arc
      id="mouth"
      center={{ x: 0.5, y: 0.55 }}
      r={0.15}
      startAngle={200}
      endAngle={340}
      stroke="#333"
      strokeWidth={1.5}
      fill="none"
    />

  </Frame>

  {/* === LEFT ARM === */}
  <Frame
    id="arm_L"
    from={{ x: 0.02, y: 0.27 }}
    to={{ x: 0.22, y: 0.55 }}
    rotate={(ctx) => -ctx.vars.armAngle}
  >
    <Rect
      width={1}
      height={1}
      rx={0.15}
      fill={(ctx) => ctx.vars.skinTone}
      stroke="#333"
      strokeWidth={0.5}
    />

    {/* Sleeve overlay (only when shirt visible) */}
    <Rect
      z={10}
      width={1}
      height={0.35}
      fill={(ctx) => ctx.vars.shirtColor}
      visible={(ctx) => ctx.vars.showShirt}
    />
  </Frame>

  {/* === RIGHT ARM (mirrored) === */}
  <Frame
    id="arm_R"
    geo={{ type: 'symmetry', source: "arm_L", axis: "face_center", mode: 'mirror' }}
    rotate={(ctx) => ctx.vars.armAngle}
  >
    <Rect
      width={1}
      height={1}
      rx={0.15}
      fill={(ctx) => ctx.vars.skinTone}
      stroke="#333"
      strokeWidth={0.5}
    />
    <Rect
      z={10}
      width={1}
      height={0.35}
      fill={(ctx) => ctx.vars.shirtColor}
      visible={(ctx) => ctx.vars.showShirt}
    />
  </Frame>

  {/* === LEGS === */}
  <Frame id="legs" from={{ x: 0.25, y: 0.63 }} to={{ x: 0.75, y: 0.98 }}>

    <Rect id="leg_L" x={0.05} y={0} width={0.4} height={1} rx={0.05}
          fill={(ctx) => ctx.vars.skinTone} stroke="#333" strokeWidth={0.5} />

    <Rect id="leg_R" left="#leg_L.right + 0.1" y={0} width="#leg_L.width" height={1} rx={0.05}
          fill={(ctx) => ctx.vars.skinTone} stroke="#333" strokeWidth={0.5} />

  </Frame>

</Sprite>
```

**What this demonstrates:**

1. **Frame nesting:** `torso` > `shirt_group` > `shirt_zone` > `shirt_fabric`. Each level has its own 0..1 coordinate space.

2. **Cross-Frame symmetry:** `eye_R` mirrors `eye_L` across `face_center`. `arm_R` mirrors `arm_L`. No manual coordinate calculation.

3. **Parametric variables:** `skinTone`, `shirtColor`, `armAngle`, `showShirt` are all reactive. Changing `showShirt` to false hides both the shirt fabric/text AND the sleeve overlays on both arms.

4. **Z-layer stacking:** Within the torso Frame:
   - z=0: skin
   - z=10: shirt group (fabric at z=0 inside, text at z=1 inside)

   Within each arm:
   - z=0: skin rectangle
   - z=10: sleeve overlay

5. **CalcValue functions:** `rotate={(ctx) => -ctx.vars.armAngle}` makes arm angle parametric. The host app can expose a slider for `armAngle` and the arms rotate in real-time.

6. **Reference strings across siblings:** In the legs Frame, `leg_R` references `#leg_L.right` and `#leg_L.width` to position itself relative to its sibling.

---

## Pattern Summary

| Pattern | When to Use | Example |
|---------|------------|---------|
| **Reference string** | Simple "put me next to that" | `left="#box.right + 10"` |
| **Frame** | Sub-assembly with local coordinates | `<Frame from={...} to={...}>` |
| **Layout** | Repeating evenly-spaced items | `<Layout direction="row" gap={10}>` |
| **Symmetry constraint** | Matching pairs (eyes, arms, brackets) | `geo={{ type: 'symmetry', ... }}` |
| **CalcValue** | Complex computed values | `width={(ctx) => ctx.parent.w * 0.5}` |
| **Group + z** | Layered clothing/overlays | `<Group z={10} visible={showLayer}>` |
| **Variables** | Parametric control | `vars={{ count: 4, size: 10 }}` |
| **Invisible geometry** | Construction lines, axes | `<Line visible={false} />`, `<Point />` |
