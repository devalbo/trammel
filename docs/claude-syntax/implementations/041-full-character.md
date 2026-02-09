# 041 — Full Character Sprite

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/tier-8-full-assemblies-55-full-character-sprite--docs)
>
> Source: `storybook-viewer/src/stories/`

## Summary

The capstone integration test. A complete character sprite with head, torso, arms, and legs across multiple Frames. Uses every constraint category: reference strings, symmetry, z-ordering, nested Frames, variables, CalcValue, and Group visibility.

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
