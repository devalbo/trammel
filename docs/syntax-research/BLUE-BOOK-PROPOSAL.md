>>> based on all the syntax we've discussed, create the full specification/dictionary of each component type, its properties, and how its applied. also include the description of how the renderer needs to work and handle each component to make the whole system come together.


This is a comprehensive specification of the **Geometric Constraint Dictionary** for your React-CAD dialect. This list mirrors the constraint types found in professional 2D CAD kernels (like Parasolid or ACIS) but translates them into React Prop interfaces.

In this system, a **Constraint** is passed as a prop to a Component. If the constraint requires parameters (like an offset or a specific side), it uses an **Object Syntax** (`{ target, ... }`). If it is simple, it uses a **String Syntax** (`"#id"`).

### 1. Positional Constraints (Point-to-Point)

*Locks a specific point on the object to a specific point on another object.*

| Constraint Name | React Prop | Syntax Example | CAD Definition |
| --- | --- | --- | --- |
| **Coincident** | `center`, `origin` | `center="#A.corner"` | Forces two points to share the exact same X,Y coordinate. |
| **Midpoint** | `center`, `origin` | `center="#lineA.midpoint"` | Locks a point to the calculated middle of a line or arc. |
| **Fix (Lock)** | `fixed` | `fixed={true}` | Prevents the object from moving, even if other constraints try to push it. Acts as the "Ground" for the solver. |
| **Offset** | `offset` | `offset={{ x: 10, y: 0 }}` | Shifts the calculated position by a delta *after* the constraint is applied. |

---

### 2. Linear & Orientation Constraints (Line-to-Line)

*Controls the angle or alignment of straight edges.*

| Constraint Name | React Prop | Syntax Example | CAD Definition |
| --- | --- | --- | --- |
| **Collinear** | `align` | `align="#lineA"` | Forces two lines to lie on the same infinite vector. (Implies Parallel + Coincident). |
| **Parallel** | `rotate` | `rotate={{ match: "#lineA" }}` | Forces the angle of the object to match the target. |
| **Perpendicular** | `rotate` | `rotate={{ match: "#lineA", add: 90 }}` | Forces the angle to be exactly 90° relative to the target. |
| **Horizontal** | `rotate` | `rotate={0}` | Forces the line to be perfectly aligned with the X-axis. |
| **Vertical** | `rotate` | `rotate={90}` | Forces the line to be perfectly aligned with the Y-axis. |

---

### 3. Topological Constraints (Shape-to-Shape)

*Defines how complex shapes interact with each other.*

| Constraint Name | React Prop | Syntax Example | Properties | CAD Definition |
| --- | --- | --- | --- | --- |
| **Concentric** | `center` | `center="#circleA.center"` | N/A | Forces the center points of two arcs/circles to be identical. |
| **Tangent** | `tangent` | `tangent={{ target: "#lineA", side: "outside" }}` | `target`: Ref ID<br>

<br>`side`: `"inside"`/`"outside"` | Forces a curve to touch a line/curve at exactly one point without crossing. |
| **Symmetric** | `symmetry` | `symmetry={{ axis: "#lineA", source: "#eyeL" }}` | `axis`: Ref ID<br>

<br>`source`: Ref ID | Forces this object to be the mirror image of the `source` across the `axis`. |
| **Intersection** | `origin` | `origin={{ intersect: ["#lineA", "#lineB"] }}` | `intersect`: Array[2] | Places the point exactly where two other geometries cross. |

---

### 4. Dimensional Constraints (Value-to-Value)

*Locks the size or proportion of an object.*

| Constraint Name | React Prop | Syntax Example | CAD Definition |
| --- | --- | --- | --- |
| **Equal Length** | `width` / `len` | `width="#lineA.width"` | Forces length to match the target dynamically. |
| **Equal Radius** | `r` | `r="#circleA.r"` | Forces radius to match the target. |
| **Distance** | `distance` | `distance={{ target: "#wall", val: 50 }}` | Forces a specific scalar distance between two entities (often used with constraints like Concentric to create a "Slot"). |
| **Ratio (Scale)** | `scale` | `scale={{ target: "#boxA", factor: 0.5 }}` | Forces size to be a multiple of another object (e.g., "Half size"). |

---

### 5. Detailed Property Specification

Here is the deep dive into the properties required for the renderer to solve these constraints.

#### A. The `tangent` Constraint

Tangent is mathematically ambiguous (a circle can touch a line on the left or right).

```javascript
// Prop Interface
tangent: {
  target: string;   // Reference ID ("#line1")
  priority?: number;// If multiple solutions exist, which to prefer?
  flip?: boolean;   // Toggle between the two possible tangent points
}

```

#### B. The `symmetry` Constraint

Symmetry requires three actors: The Left Object, The Right Object, and the Axis.

```javascript
// Prop Interface applied to the "Right" Object
symmetry: {
  source: string; // The ID of the "Left" Object ("#eye_L")
  axis: string;   // The ID of the mirror line ("#face_center_line")
  mode?: "mirror" | "clone"; // "Mirror" flips the image, "Clone" just moves it.
}

```

#### C. The `distribute` Constraint (Patterning)

CAD systems often have "Pattern" or "Array" tools.

```javascript
// Applied to a Group or Layout
distribute: {
  between: [string, string]; // Start and End References ["#wall_L", "#wall_R"]
  count?: number;            // Number of items to fit (e.g., 5 bolts)
  spacing?: number;          // OR fixed spacing (e.g., 10mm apart)
  margin?: number;           // Gap at start/end
}

```

---

### 6. Application Example: A Piston Mechanism

This example demonstrates how to combine these constraints to build a mechanism where moving one part moves the others.

```jsx
<MechanicalPart>
  
  {/* 1. CRANKSHAFT (The Driver) */}
  {/* Fixed center, but rotates. */}
  <SmartCircle 
    id="crank" 
    r={20} 
    center={{ x: 100, y: 100 }} 
    fixed={true} 
  />
  
  {/* A point on the rim of the crank */}
  <Point 
    id="crank_pin" 
    concentric="#crank" 
    offset={{ r: 20, angle: 45 }} // 45 degrees is the "current state"
  />

  {/* 2. PISTON (The Slider) */}
  {/* Constrained to only move vertically (X is fixed) */}
  <SmartRect 
    id="piston" 
    width={30} height={40}
    x={100} // Locked X (Vertical movement only)
    // We don't know Y yet! The connecting rod decides Y.
  />
  
  {/* 3. CONNECTING ROD (The Constraint Solver) */}
  {/* This line connects the rotating pin to the sliding piston. */}
  <SmartLine 
    id="rod"
    length={80} // Fixed physical length
    
    // Constraint A: Start at the crank pin
    start="#crank_pin"
    
    // Constraint B: End at the piston center
    // This forces the Piston's Y to update to satisfy the rod length!
    end="#piston.center"
  />

</MechanicalPart>

```

### 7. How the Renderer Solves This

Since React is unidirectional (Parent -> Child), but CAD constraints are often circular or bidirectional (The rod pushes the piston), how does the renderer handle the Piston example?

**The "Constraint Solver" Loop:**

1. **Pass 1 (Draft):** React renders the Piston at `y=0` (default) and the Crank at `45deg`.
2. **Constraint Check:** The `<SmartLine>` calculates distance between `#crank_pin` and `#piston`.
* *Result:* Distance is 120. *Target:* 80. *Error:* 40.


3. **Solver Correction:** The system sees the Piston is not `fixed` in Y. It solves the triangle equations (Inverse Kinematics).
4. **Pass 2 (Refinement):** The `ConstraintContext` updates the Piston's Y coordinate to the correct value.
5. **Final Render:** The Piston appears in the correct position.

*Note: For complex mechanisms, this usually requires an external solver library (like `cassowary.js` or a custom Inverse Kinematics hook) wrapped in your component logic.*
