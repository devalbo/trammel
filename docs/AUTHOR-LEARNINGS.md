# My Learnings
This is a place for me to fuse what I've learned as both coding agents explore and add new ideas and features.

## Realizations
* Each "SVG Sprite" should declare a set of "input props" that would ultimately be exposed - these become the "configuration for the SVG sprite (svrite?).
  * These will probably translate into the top level variables that the user might want to twiddle.
* It will be nice to have a "cute" (terser) way of saying "SVG Sprite". Spelling and pronunciation both matter! Name considerations:
  * svrite
  * skrite
  * scrite
  * skrike
  * scrike
* Composition is critical and needs to be accounted for in syntax. Svrites need to be able to contain sub-svrites.
* Each svrite should have a bounding box that nothing should be drawn outside of. This is more limiting than regular SVG, but that's OK. We're thinking of this more as a sprite editor/paint tool than everything you can do with SVG.
* Viewboxes should be vanilla and standard. 1000x1000 might be OK.
* We need a shared interface definition for constraint functions and geometry. This way, both apps can implement against these and have a single syntax.
* As syntax is discovered (e.g. constraint components), it might be useful to move those to a place where definitions become shared - the Svrite Component syntax is a human aesthetic thing, so that should be a reference for both sets of tools. How it's implemented should be in the purview of the coding agents.
* Every piece of geometry should have its value expressed and be given the chance to be overridden by the user.
* A way to map back from a shape to its component would be really cool - maybe not the raw component implementation definition, but to it's realized SVG text form as a start?
