# 035 — Visibility Controlled by Variable

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

## Description

A Group whose visibility is toggled by a boolean variable. Tests that hidden groups suppress rendering but maintain solver presence.

## Elements

| Element | Type | Purpose |
|---------|------|---------|
| `<Rect>` #plate | Primitive | Always visible |
| `<Group>` #overlay | Container | Toggleable |
| `<Rect>` #badge | Primitive | Inside group |
| `<Text>` | Primitive | Inside group |

## Syntax

```jsx
<Sprite
  viewBox="0 0 200 100"
  vars={{ showLabel: true }}
  varDefs={[
    { name: 'showLabel', type: 'boolean', default: true, label: 'Show Label' }
  ]}
>
  <Rect id="plate" x={10} y={10} width={180} height={80} fill="#ddd" stroke="#999" />

  <Group id="overlay" visible={(ctx) => ctx.vars.showLabel}>
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
      centerX="#badge.centerX"
      centerY="#badge.centerY"
      fontSize={11}
      fill="white"
      textAnchor="middle"
    >
      LABEL
    </Text>
  </Group>
</Sprite>
```

## When showLabel = true

Badge and text are rendered.

## When showLabel = false

Badge and text are hidden. Badge's geometry still resolves in the solver (other shapes could reference `#badge.centerX`).

## What This Validates

- `visible` accepts CalcValue functions reading `ctx.vars`
- Group visibility cascades to all children
- `varDefs` provides metadata for auto-generating a checkbox in the host UI
