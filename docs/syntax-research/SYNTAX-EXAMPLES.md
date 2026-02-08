Here are specific examples of how to express these advanced CAD constraints using the **React-CAD Dialect** we have defined.

These examples assume a "Solver" hook running in the background that parses these props and calculates the final `x, y, width, height, rotation`.

### 1. Positional Constraints (Coincident & Alignment)

**Scenario:** A "Label" that must always stay attached to the top-right corner of a box, no matter where the box moves.

```jsx
<ConstraintCanvas>
  {/* 1. The Anchor Object */}
  <SmartRect 
    id="main_box" 
    x={100} y={100} width={100} height={50} 
    fill="blue" 
  />

  {/* 2. The Dependent Object (The Label) */}
  <SmartRect 
    id="label"
    // CONSTRAINT: "My bottom-left corner touches the box's top-right corner"
    bottom="#main_box.top" 
    left="#main_box.right"
    
    width={30} height={15} 
    fill="yellow"
  />
</ConstraintCanvas>

```

* **Renderer Logic:** The solver reads `#main_box.top` (100) and sets `label.y = 100 - label.height`. It reads `#main_box.right` (200) and sets `label.x = 200`.

---

### 2. Linear Constraints (Collinear & Parallel)

**Scenario:** Two segments of a pipe that must align perfectly, even if they have different widths.

```jsx
<Group>
  {/* Segment A */}
  <SmartLine 
    id="pipe_A" 
    start={{x: 0, y: 50}} 
    end={{x: 100, y: 50}} 
    strokeWidth={10} 
  />

  {/* Segment B */}
  <SmartLine 
    id="pipe_B"
    // CONSTRAINT: "Start where A ends" (Coincident)
    start="#pipe_A.end"
    
    // CONSTRAINT: "Continue in the same direction" (Collinear)
    // This forces the angle to match, creating a straight line.
    angle="#pipe_A.angle" 
    
    length={50}
    strokeWidth={5} // Different width, but same center axis
  />
</Group>

```

---

### 3. Topological Constraints (Tangent & Concentric)

**Scenario:** A "Wheel" resting on a "Hill" (Line). The wheel must touch the line but not cross it.

```jsx
<ConstraintCanvas>
  {/* The Ground */}
  <SmartLine 
    id="hill" 
    start={{x: 0, y: 200}} 
    end={{x: 300, y: 150}} // A sloped line
  />

  {/* The Wheel */}
  <SmartCircle 
    id="wheel" 
    r={20}
    
    // CONSTRAINT: Tangent
    // "Calculate my center (cx, cy) such that I touch the line."
    // Since X is not defined, it might default to x=0 or need an 'x' prop.
    x={150} // Fix X position, let Solver figure out Y based on tangency
    
    tangent={{ 
      target: "#hill", 
      side: "above" // Solutions: "above" | "below"
    }}
  />
</ConstraintCanvas>

```

* **Renderer Logic:** The solver calculates the nearest point on the line `#hill` at `x=150`, finds the normal vector, and moves the circle center along that normal by `radius` distance.

---

### 4. Symmetric Constraints (Mirroring)

**Scenario:** Drawing a face. You define the Left Eye, and the Right Eye is automatically created and mirrored across the nose.

```jsx
<ConstraintCanvas>
  {/* The Center Line (Invisible Axis) */}
  <SmartLine 
    id="nose_axis" 
    start={{x: 100, y: 0}} 
    end={{x: 100, y: 200}} 
    stroke="none" // Invisible guide
  />

  {/* The Left Eye (Driver) */}
  <SmartCircle 
    id="eye_L" 
    center={{x: 80, y: 50}} 
    r={10} 
  />

  {/* The Right Eye (Driven) */}
  <SmartCircle 
    id="eye_R"
    // CONSTRAINT: Symmetry
    // "I am the mirror image of eye_L across nose_axis"
    symmetry={{ 
      source: "#eye_L", 
      axis: "#nose_axis",
      mode: "mirror" // Flips the shape geometry too (important for paths)
    }}
  />
</ConstraintCanvas>

```

* **Renderer Logic:** If you update `eye_L.x` to 70 (moving left), `eye_R.x` automatically updates to 130 (moving right) to maintain equidistant spacing from the axis (x=100).

---

### 5. Dimensional Constraints (Ratios & Distances)

**Scenario:** A "Responsive" Button where the icon size depends on the button height, and the text padding depends on the icon size.

```jsx
<SmartRect id="btn_bg" width={200} height={50}>
  
  {/* 1. Icon: Size is 60% of button height */}
  <SmartCircle 
    id="icon"
    centerY="#btn_bg.centerY"
    left="#btn_bg.left + 10" // 10px padding
    
    // CONSTRAINT: Aspect Ratio / Relative Dimension
    d={{ formula: "#btn_bg.height * 0.6" }} 
  />

  {/* 2. Text: Starts 10px after the icon */}
  <Text
    id="label"
    centerY="#btn_bg.centerY"
    
    // CONSTRAINT: Relative Positioning
    left="#icon.right + 10" 
    
    fontSize={{ formula: "#btn_bg.height * 0.4" }}
  >
    Click Me
  </Text>

</SmartRect>

```

### Summary of Syntax Patterns

| Constraint Type | Syntax Pattern | Example |
| --- | --- | --- |
| **Simple Reference** | `prop="#id.anchor"` | `left="#box.right"` |
| **Math Expression** | `prop="#id.anchor +/- val"` | `top="#box.bottom + 20"` |
| **Complex Object** | `prop={{ target: "...", option: "..." }}` | `tangent={{ target: "#line", side: "above" }}` |
| **Formula** | `prop={{ formula: "..." }}` | `width={{ formula: "#parent.width / 3" }}` |

This syntax provides the full expressiveness of a CAD tool while remaining readable as standard React props.