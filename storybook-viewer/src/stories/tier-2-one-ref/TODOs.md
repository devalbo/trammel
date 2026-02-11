# Issues 


## Feature Ideas
* it would be good to have a set of "fully realized" geometries so that properties that are left unspecified can still be inspected. For example, shapes that don't have x, y values get them implicitly set to 0,0 - the fully realized SVG values should show they are 0, 0
* would be nice to see text SVG output in separate tab alongside rendered version
* could we treat constraints as nodes/components that are independent of props of shapes and have them applied once all shapes have been realized and had their initial geometries set? we'd still have to flag violations, but that should be traceable based on constraint ordering and implicit (or explicit) shape IDs


## Not assigned to specific story
* ~~if a transform rotates a shape out of viewport, I don't see a warning~~
  - how feasible is this?
* ~~text editor does not support undoing text deletion~~
* if two rectangles have different rotations, should they be able to align sides?
  


## Issues with Tier 2 Story 03
* Setting property `top="#top.top"` for bottom Rect doesn't align the tops of the rectangles.
* aligning property `left="#top.top"` for bottom Rect doesn't make sense (unless top rect is rotated 90 degrees, but that brings other potential issues)


## Issues with Tier 2 Story 04
* 
