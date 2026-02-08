# 017 — Group Visibility Toggle

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A Group wrapping a rect and a text label. Setting `visible={false}` on the Group hides both children. The hidden shapes still register in the solver context (their anchors are available).

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Rect>` #plate | Primitive | Always visible |
| `<Group>` #label_group | Container | Toggleable visibility |
| `<Rect>` #badge | Primitive | Inside group |
| `<Text>` #text | Primitive | Inside group |

## Syntax

```jsx
<Sprite viewBox="0 0 200 100">
  <Rect id="plate" x={10} y={10} width={180} height={80} fill="#ddd" />

  <Group id="label_group" visible={false}>
    <Rect
      id="badge"
      centerX="#plate.centerX"
      top="#plate.top + 10"
      width={80}
      height={25}
      fill="#c0392b"
      rx={4}
    />
    <Text
      id="text"
      centerX="#badge.centerX"
      centerY="#badge.centerY"
      fontSize={12}
      fill="white"
      textAnchor="middle"
    >
      LABEL
    </Text>
  </Group>
</Sprite>
```

## Expected SVG Output

```svg
<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="180" height="80" fill="#ddd" />
  <!-- Group hidden: badge and text not rendered -->
</svg>
```

## What This Validates

- Group `visible={false}` suppresses SVG output for all children
- Hidden shapes still resolve their geometry (badge computes its position)
- If another shape outside the group referenced `#badge.centerX`, it would still work
