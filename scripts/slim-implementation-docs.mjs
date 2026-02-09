/**
 * Slims down docs/claude-syntax/implementations/*.md to thin pointers to Storybook.
 * Preserves title, summary, and "What This Validates" — removes duplicated code/tables.
 * Skips 001-single-rect.md since it was already slimmed manually.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const IMPL_DIR = path.join(ROOT, 'docs/claude-syntax/implementations');

const MAPPING = [
  { n: 1,  file: '001-single-rect.md',         skip: true },
  { n: 2,  file: '002-single-circle.md',        storyPath: 'tier-1-static-shapes-02-single-circle' },
  { n: 3,  file: '003-single-line.md',          storyPath: 'tier-1-static-shapes-03-single-line' },
  { n: 4,  file: '006-single-text.md',          storyPath: 'tier-1-static-shapes-04-single-text' },
  { n: 5,  file: '005-single-path.md',          storyPath: 'tier-1-static-shapes-05-single-path' },
  { n: 6,  file: '007-single-point.md',         storyPath: 'tier-1-static-shapes-06-single-point-construction-geometry' },
  { n: 7,  file: '042-equilateral-triangle.md',  storyPath: 'tier-1-static-shapes-07-equilateral-triangle' },
  { n: 8,  file: '043-right-triangle.md',        storyPath: 'tier-1-static-shapes-08-right-triangle' },
  { n: 9,  file: '044-isosceles-triangle.md',    storyPath: 'tier-1-static-shapes-09-isosceles-triangle' },
  { n: 10, file: '048-hexagon.md',               storyPath: 'tier-1-static-shapes-10-regular-hexagon' },
  { n: 11, file: '004-single-arc.md',            storyPath: 'tier-1-static-shapes-11-single-arc' },
  { n: 12, file: '047-pentagon.md',              storyPath: 'tier-1-static-shapes-12-regular-pentagon' },
  { n: 13, file: '045-scalene-triangle.md',      storyPath: 'tier-1-static-shapes-13-scalene-triangle' },
  { n: 14, file: '046-triangle-vertices.md',     storyPath: 'tier-1-static-shapes-14-triangle-with-direct-vertices' },
  { n: 15, file: '049-rotated-triangle.md',      storyPath: 'tier-1-static-shapes-15-rotated-triangle' },
  { n: 16, file: '008-rect-adjacent.md',         storyPath: 'tier-2-one-reference-16-rect-adjacent-to-rect' },
  { n: 17, file: '009-circle-on-rect.md',        storyPath: 'tier-2-one-reference-17-circle-centered-on-rect' },
  { n: 18, file: '027-collinear.md',             storyPath: 'tier-2-one-reference-18-collinear-edges' },
  { n: 19, file: '010-line-between.md',          storyPath: 'tier-2-one-reference-19-line-between-two-shapes' },
  { n: 20, file: '011-ref-with-offset.md',       storyPath: 'tier-3-reference-math-20-reference-string-with-offset' },
  { n: 21, file: '012-dim-matching.md',          storyPath: 'tier-3-reference-math-21-dimension-matching' },
  { n: 22, file: '013-self-reference.md',        storyPath: 'tier-3-reference-math-22-self-reference' },
  { n: 23, file: '050-vertex-reference.md',      storyPath: 'tier-3-reference-math-23-vertex-reference-triangle' },
  { n: 24, file: '051-polygon-vertex-reference.md', storyPath: 'tier-3-reference-math-24-vertex-reference-polygon' },
  { n: 25, file: '052-cross-vertex-line.md',     storyPath: 'tier-3-reference-math-25-line-between-triangle-vertices' },
  { n: 26, file: '016-z-ordering.md',            storyPath: 'tier-4-containers-26-z-ordering' },
  { n: 27, file: '017-group-visibility.md',      storyPath: 'tier-4-containers-27-group-visibility-toggle' },
  { n: 28, file: '014-basic-frame.md',           storyPath: 'tier-4-containers-28-basic-frame' },
  { n: 29, file: '015-nested-frames.md',         storyPath: 'tier-4-containers-29-nested-frames' },
  { n: 30, file: '021-percentage.md',            storyPath: 'tier-5-typed-constraints-30-percentage-of-parent' },
  { n: 31, file: '018-coincident.md',            storyPath: 'tier-5-typed-constraints-31-coincident-constraint' },
  { n: 32, file: '025-concentric.md',            storyPath: 'tier-5-typed-constraints-32-concentric-circles' },
  { n: 33, file: '022-aspect-ratio.md',          storyPath: 'tier-5-typed-constraints-33-aspect-ratio-lock' },
  { n: 34, file: '019-align.md',                 storyPath: 'tier-5-typed-constraints-34-align-constraint-independent-axes' },
  { n: 35, file: '023-fit-between.md',           storyPath: 'tier-5-typed-constraints-35-fit-between-anchors' },
  { n: 36, file: '024-calc-dimension.md',        storyPath: 'tier-5-typed-constraints-36-calc-value-dimension' },
  { n: 37, file: '028-parallel.md',              storyPath: 'tier-5-typed-constraints-37-parallel-rotation' },
  { n: 38, file: '029-perpendicular.md',         storyPath: 'tier-5-typed-constraints-38-perpendicular-rotation' },
  { n: 39, file: '026-symmetry.md',              storyPath: 'tier-5-typed-constraints-39-symmetry-mirror' },
  { n: 40, file: '020-polar.md',                 storyPath: 'tier-5-typed-constraints-40-polar-constraint' },
  { n: 41, file: '030-layout-row.md',            storyPath: 'tier-6-layout-variables-41-row-layout-with-gap' },
  { n: 42, file: '031-layout-column.md',         storyPath: 'tier-6-layout-variables-42-column-layout-with-alignment' },
  { n: 43, file: '032-layout-justify.md',        storyPath: 'tier-6-layout-variables-43-layout-with-spacebetween' },
  { n: 44, file: '033-simple-vars.md',           storyPath: 'tier-6-layout-variables-44-simple-parametric-rect' },
  { n: 45, file: '035-var-visibility.md',        storyPath: 'tier-6-layout-variables-45-visibility-controlled-by-variable' },
  { n: 46, file: '034-dynamic-count.md',         storyPath: 'tier-6-layout-variables-46-dynamic-count-arrayfrom' },
  { n: 47, file: '039-pipe-connection.md',       storyPath: 'tier-7-combinations-47-pipe-between-two-tanks' },
  { n: 48, file: '055-gusset-bracket.md',        storyPath: 'tier-7-combinations-48-gusset-bracket-right-triangles-rects' },
  { n: 49, file: '054-triangle-mosaic.md',       storyPath: 'tier-7-combinations-49-triangle-mosaic' },
  { n: 50, file: '036-bracket-with-holes.md',    storyPath: 'tier-7-combinations-50-bracket-with-holes' },
  { n: 51, file: '037-symmetric-face.md',        storyPath: 'tier-7-combinations-51-symmetric-face' },
  { n: 52, file: '040-polar-bolt-circle.md',     storyPath: 'tier-7-combinations-52-polar-bolt-circle' },
  { n: 53, file: '053-hex-tile-grid.md',         storyPath: 'tier-8-full-assemblies-53-hexagonal-tile-grid' },
  { n: 54, file: '038-layered-torso.md',         storyPath: 'tier-8-full-assemblies-54-layered-torso-with-t-shirt' },
  { n: 55, file: '041-full-character.md',        storyPath: 'tier-8-full-assemblies-55-full-character-sprite' },
];

function extractTitle(md) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : 'Unknown';
}

function extractDescription(md) {
  const m = md.match(/## Description\s*\n+([\s\S]*?)(?=\n## )/);
  return m ? m[1].trim() : '';
}

function extractValidates(md) {
  const m = md.match(/## What This Validates\s*\n+([\s\S]*?)$/);
  return m ? m[1].trim() : '';
}

async function main() {
  let updated = 0;

  for (const entry of MAPPING) {
    if (entry.skip) continue;

    const filePath = path.join(IMPL_DIR, entry.file);
    const md = await readFile(filePath, 'utf-8');
    const title = extractTitle(md);
    const description = extractDescription(md);
    const validates = extractValidates(md);

    const slim = `# ${title}

[Back to Implementation Plan](../IMPLEMENTATIONS.md)

> **Live demo & full docs:** [Storybook](http://localhost:6006/?path=/docs/${entry.storyPath}--docs)
>
> Source: \`storybook-viewer/src/stories/\`

## Summary

${description}

## What This Validates

${validates}
`;

    await writeFile(filePath, slim, 'utf-8');
    updated++;
  }

  console.log(`Slimmed ${updated} implementation docs.`);
}

main().catch(console.error);
