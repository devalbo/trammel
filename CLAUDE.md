# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an early-stage research/design project exploring a **"Code-CAD" parametric configurator** built with **Replicad** (OpenCascade JS wrapper), **React**, and **SVG** output. The goal is engineering-accurate 2D/3D geometry defined in JavaScript — not pixel-based drawing.

There is no build system, package.json, or test suite yet. The repo currently contains design documents and sample code.

## Key Files

- `SVG_CAD_SPECIFICATION.md` — Full specification for the CAD-like React SVG component system, including the `Dimension` annotation component and a feature summary table
- `THOUGHTS.md` — Design rationale, workflow description, and annotated example code showing the Replicad approach vs plain SVG
- `sample_code.js` — `MachinedAssembly` React component demonstrating parametric knob layout with boolean fuse and chamfer

## Architecture Concepts

**Replicad workflow:** Define a `Sketcher` or use `draw()` → build geometry with constraints → apply boolean ops (`.fuse()`, `.cut()`) → apply edge treatments (`.chamfer()`, `.fillet()`) → export via `.toSVG()` → render in React `<path>`.

**Parametric constraints** are expressed as algebraic formulas in JS (e.g., `gap = (width - knobCount * knobSize) / (knobCount + 1)`), not via a drag-and-drop solver. Changing one parameter recalculates the entire assembly.

**SVG coordinate flip:** CAD uses Y-up; SVG uses Y-down. Components use `scale(1, -1)` transforms to reconcile this.

**Dimension annotations** are a separate SVG layer (extension lines + arrow line + label text) rendered alongside the geometry path. They use an `<marker>` definition for arrowheads.

**Performance consideration:** Replicad operations are computationally heavy. Use `useMemo` or Web Workers to avoid blocking the main thread.

## Key Dependencies (planned)

- `replicad` — OpenCascade-based geometry kernel (`draw()`, `.fuse()`, `.chamfer()`, `.toSVG()`)
- `react` — UI rendering with SVG output

## Project Workspace Coordination

Refer [here](./CODING_AGENT_INSTRUCTIONS.md) for instructions about how coding agents should interact with this repo.