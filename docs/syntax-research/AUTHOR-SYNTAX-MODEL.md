Here is the comprehensive specification for your **React-CAD Dialect**. This document serves as the "Blue Book" for the system, defining every component, property, and the rendering logic required to make it work.

### System Overview

**Name:** React-CAD (or "Constraint-SVG")
**Core Philosophy:**

1. **Declarative Geometry:** Shapes are defined by *relationships* and *intent*, not just pixels.
2. **Relative Coordinates:** The default coordinate system is normalized (0.0 to 1.0) relative to the parent container.
3. **Z-Sorting:** Rendering order is controlled by explicit `z` index, not DOM order.
4. **Passthrough:** All components accept standard SVG attributes (`fill`, `stroke`, `opacity`) as overrides.

---

### Part 1: The Rendering Engine

To make this syntax work, the renderer (the internal React logic) must perform three specific tasks that standard SVG does not do.

#### 1. The Anchor Registry (Context)

* **Role:** Acts as a central database of geometry.
* **Mechanism:** A React Context (`ConstraintContext`) stores the bounding box and anchor points of every component with an `id`.
* **Cycle:**
1. **Registration:** On mount (or resize), every component calculates its absolute world coordinates and registers them: `Registry.set('boxA', { x: 10, y: 10, w: 50, h: 50, anchors: {...} })`.
2. **Resolution:** Dependent components read from this registry to solve strings like `x="#boxA.right"`.



#### 2. The Coordinate Stack (Frames)

* **Role:** Handles the nesting logic (0.0 to 1.0).
* **Mechanism:** Every `<Frame>` component calculates a **CTM (Current Transformation Matrix)**.
* **Math:** It takes the parent's `width/height` and multiplies it by its own `from/to` props to create a new local coordinate system for its children.

#### 3. The Z-Sorter

* **Role:** Manages visual layering.
* **Mechanism:** Before rendering `children`, the container component converts the React Node List into an array, sorts them by the numeric `z` prop, and then renders them.

---

### Part 2: Component Dictionary

#### 1. The Root: `<Sprite>`

The entry point for any React-CAD diagram. It initializes the context and SVG namespace.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `viewBox` | `string` | `"0 0 100 100"` | The global SVG coordinate space. |
| `id` | `string` | `undefined` | Unique ID for the root element. |
| `debug` | `boolean` | `false` | If true, renders visual outlines of all Frames and Anchors. |

**Usage:**

```jsx
<Sprite viewBox="0 0 500 500" debug={true}>
  {/* All content goes here */}
</Sprite>

```

---

#### 2. The Container: `<Frame>`

The primary tool for layout and nesting. Creates a local coordinate system.

| Prop | Type | Description |
| --- | --- | --- |
| `from` | `object {x, y}` | **Start Point (0..1):** The top-left corner relative to the *parent*. |
| `to` | `object {x, y}` | **End Point (0..1):** The bottom-right corner relative to the *parent*. |
| `clip` | `boolean` | If `true`, applies an SVG `clipPath` to hide overflowing children. |
| `z` | `number` | **Stacking Order:** Higher numbers render on top of siblings. |
| `id` | `string` | Required if other shapes need to anchor to this frame. |

**Anchors Exposed:** `topLeft`, `topRight`, `bottomLeft`, `bottomRight`, `center`, `width`, `height`.

**Usage:**

```jsx
{/* A standard "Header" area: Top 20% of the parent */}
<Frame id="header" from={{x:0, y:0}} to={{x:1, y:0.2}} z={10}>
   {/* Children here treat the header as 0..1 */}
</Frame>

```

---

#### 3. The Geometry: `<SmartRect>`, `<SmartCircle>`, `<SmartPath>`

These replace standard SVG tags. They support "Constraint Props" (Reference Strings).

**Common Constraint Props (All Shapes):**

* **Inputs:** `x`, `y`, `width`, `height`, `rotation`.
* **Virtual Inputs:** `left`, `right`, `top`, `bottom`, `centerX`, `centerY`.
* **Accepted Values:**
* `Number` (Pixels): `x={10}`
* `Percent` (String): `width="50%"`
* **Reference String:** `left="#header.left"`, `y="#boxA.centerY"`
* **Math String:** `x="#boxA.right + 20"`



**Specific Props:**

| Component | Unique Props | Anchors Exposed |
| --- | --- | --- |
| **SmartRect** | `rx`, `ry` (Corner radius) | `corners` (TL, TR, BL, BR), `midpoints` (Top, Right, Bottom, Left), `center` |
| **SmartCircle** | `r` (Radius), `d` (Diameter) | `center`, `quadrants` (0, 90, 180, 270 degrees) |
| **SmartLine** | `start` (`{x,y}`), `end` (`{x,y}`) | `start`, `end`, `midpoint` |

**Usage:**

```jsx
{/* A Circle centered on a Rect's corner */}
<SmartCircle 
  id="dot"
  center="#mainBox.bottomRight" 
  r={5} 
  fill="red" 
/>

```

---

#### 4. The Auto-Layout: `<Layout>`

Distributes space automatically among children (like Flexbox).

| Prop | Type | Options | Description |
| --- | --- | --- | --- |
| `direction` | `string` | `"row"`, `"column"` | Horizontal or vertical stacking. |
| `gap` | `number` | `0` | Pixel space between items. |
| `padding` | `number` | `0` | Pixel padding around the group. |
| `align` | `string` | `"start"`, `"center"`, `"end"` | Cross-axis alignment (e.g., center items vertically in a row). |

**Child Props (Specific to Layout):**
Any child inside a `<Layout>` accepts these extra props:

* `flex`: `number` (Growth factor. `flex={1}` takes available space).
* `fixed`: `boolean` (If true, the element calculates its own size and doesn't shrink/grow).

**Usage:**

```jsx
<Layout direction="row" gap={10}>
  <SmartRect width={50} fixed={true} /> {/* Fixed Sidebar */}
  <SmartRect flex={1} />                {/* Main Content (Fills rest) */}
</Layout>

```

---

#### 5. The Annotation: `<Dimension>`

Displays a measurement arrow and text. It is purely visual but linked to geometry.

| Prop | Type | Description |
| --- | --- | --- |
| `start` | `Ref String` or `{x,y}` | The point to measure *from*. (e.g., `#wall.left`) |
| `end` | `Ref String` or `{x,y}` | The point to measure *to*. (e.g., `#wall.right`) |
| `offset` | `number` | Distance to pull the dimension line away from the object. |
| `label` | `string` | (Optional) Override the automatic numeric text. |

**Usage:**

```jsx
<Dimension 
  start="#part.left" 
  end="#part.right" 
  offset={20} 
/>

```

---

### Part 3: Constraint Logic Dictionary

This defines the valid syntax for the **Reference Strings**.

#### 1. Anchor References

Syntax: `#ID.ANCHOR`

* **Box Anchors:** `.topLeft`, `.topRight`, `.bottomLeft`, `.bottomRight`, `.center`
* **Edge Anchors:** `.left`, `.right`, `.top`, `.bottom` (Returns a single coordinate, X or Y)

#### 2. Math Operations

Syntax: `#ID.ANCHOR [OPERATOR] [VALUE]`

* **Operators:** `+`, `-`, `*`, `/`
* **Examples:**
* `#box.right + 10` (10px gap)
* `#box.width / 2` (Half width)



#### 3. Keyword Constants

These are context-aware values available in any prop.

* `$parent.width`: The width of the immediate `<Frame>` or `<Sprite>`.
* `$parent.center`: The `{x,y}` center of the parent.
* `$prev.right`: The right edge of the *sibling immediately before this one*. (Useful for simple stacking).

---

### Part 4: Implementation Guide (The "Renderer")

If you are building this renderer, here is the pseudocode flow for the **Component Lifecycle**:

1. **Parse Props:**
* Does the prop start with `#`? If yes, query the `ConstraintContext`.
* Is it a calculation? Run a simple regex parser/evaluator.


2. **Calculate Local Geometry:**
* Resolve all `left`, `right`, `centerX` props into standard `x`, `y`, `width`, `height`.
* Apply the Parent Frame's offset (if inside a Frame).


3. **Register Self:**
* If `id` is present, push calculated bounds to `ConstraintContext`.
* *Note:* To handle dependencies (A needs B), you may need a `useLayoutEffect` that triggers a second render pass if references resolve to `null` on the first pass.


4. **Sort Children:**
* Check `props.z`.
* Re-order the children array.


5. **Render SVG:**
* Return the standard `<rect>`, `<circle>`, or `<g>` element.
* Spread `...otherProps` onto the SVG element to allow user overrides (`className`, `onClick`, `style`).



This specification provides a complete mental model for both the **User** (writing the JSX) and the **Architect** (building the renderer).