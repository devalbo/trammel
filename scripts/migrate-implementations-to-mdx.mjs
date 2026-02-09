/**
 * Converts docs/claude-syntax/implementations/*.md → storybook-viewer/src/stories/tier-*\/*.mdx
 *
 * Each implementation MD becomes a standalone Storybook MDX doc page.
 * The 001-single-rect.md is skipped since it already has a hand-crafted MDX + stories file.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const IMPL_DIR = path.join(ROOT, 'docs/claude-syntax/implementations');
const STORIES_DIR = path.join(ROOT, 'storybook-viewer/src/stories');

// Mapping: story number → { file, title, tier, tierDir }
// Derived from IMPLEMENTATIONS.md ordering
const MAPPING = [
  { n: 1,  file: '001-single-rect.md',         tier: 1, skip: true }, // already done
  { n: 2,  file: '002-single-circle.md',        tier: 1 },
  { n: 3,  file: '003-single-line.md',          tier: 1 },
  { n: 4,  file: '006-single-text.md',          tier: 1 },
  { n: 5,  file: '005-single-path.md',          tier: 1 },
  { n: 6,  file: '007-single-point.md',         tier: 1 },
  { n: 7,  file: '042-equilateral-triangle.md',  tier: 1 },
  { n: 8,  file: '043-right-triangle.md',        tier: 1 },
  { n: 9,  file: '044-isosceles-triangle.md',    tier: 1 },
  { n: 10, file: '048-hexagon.md',               tier: 1 },
  { n: 11, file: '004-single-arc.md',            tier: 1 },
  { n: 12, file: '047-pentagon.md',              tier: 1 },
  { n: 13, file: '045-scalene-triangle.md',      tier: 1 },
  { n: 14, file: '046-triangle-vertices.md',     tier: 1 },
  { n: 15, file: '049-rotated-triangle.md',      tier: 1 },
  { n: 16, file: '008-rect-adjacent.md',         tier: 2 },
  { n: 17, file: '009-circle-on-rect.md',        tier: 2 },
  { n: 18, file: '027-collinear.md',             tier: 2 },
  { n: 19, file: '010-line-between.md',          tier: 2 },
  { n: 20, file: '011-ref-with-offset.md',       tier: 3 },
  { n: 21, file: '012-dim-matching.md',          tier: 3 },
  { n: 22, file: '013-self-reference.md',        tier: 3 },
  { n: 23, file: '050-vertex-reference.md',      tier: 3 },
  { n: 24, file: '051-polygon-vertex-reference.md', tier: 3 },
  { n: 25, file: '052-cross-vertex-line.md',     tier: 3 },
  { n: 26, file: '016-z-ordering.md',            tier: 4 },
  { n: 27, file: '017-group-visibility.md',      tier: 4 },
  { n: 28, file: '014-basic-frame.md',           tier: 4 },
  { n: 29, file: '015-nested-frames.md',         tier: 4 },
  { n: 30, file: '021-percentage.md',            tier: 5 },
  { n: 31, file: '018-coincident.md',            tier: 5 },
  { n: 32, file: '025-concentric.md',            tier: 5 },
  { n: 33, file: '022-aspect-ratio.md',          tier: 5 },
  { n: 34, file: '019-align.md',                 tier: 5 },
  { n: 35, file: '023-fit-between.md',           tier: 5 },
  { n: 36, file: '024-calc-dimension.md',        tier: 5 },
  { n: 37, file: '028-parallel.md',              tier: 5 },
  { n: 38, file: '029-perpendicular.md',         tier: 5 },
  { n: 39, file: '026-symmetry.md',              tier: 5 },
  { n: 40, file: '020-polar.md',                 tier: 5 },
  { n: 41, file: '030-layout-row.md',            tier: 6 },
  { n: 42, file: '031-layout-column.md',         tier: 6 },
  { n: 43, file: '032-layout-justify.md',        tier: 6 },
  { n: 44, file: '033-simple-vars.md',           tier: 6 },
  { n: 45, file: '035-var-visibility.md',        tier: 6 },
  { n: 46, file: '034-dynamic-count.md',         tier: 6 },
  { n: 47, file: '039-pipe-connection.md',       tier: 7 },
  { n: 48, file: '055-gusset-bracket.md',        tier: 7 },
  { n: 49, file: '054-triangle-mosaic.md',       tier: 7 },
  { n: 50, file: '036-bracket-with-holes.md',    tier: 7 },
  { n: 51, file: '037-symmetric-face.md',        tier: 7 },
  { n: 52, file: '040-polar-bolt-circle.md',     tier: 7 },
  { n: 53, file: '053-hex-tile-grid.md',         tier: 8 },
  { n: 54, file: '038-layered-torso.md',         tier: 8 },
  { n: 55, file: '041-full-character.md',        tier: 8 },
];

const TIER_NAMES = {
  1: 'tier-1-static',
  2: 'tier-2-one-ref',
  3: 'tier-3-ref-math',
  4: 'tier-4-containers',
  5: 'tier-5-typed-constraints',
  6: 'tier-6-layout-vars',
  7: 'tier-7-combos',
  8: 'tier-8-assemblies',
};

const TIER_LABELS = {
  1: 'Tier 1 — Static Shapes',
  2: 'Tier 2 — One Reference',
  3: 'Tier 3 — Reference Math',
  4: 'Tier 4 — Containers',
  5: 'Tier 5 — Typed Constraints',
  6: 'Tier 6 — Layout & Variables',
  7: 'Tier 7 — Combinations',
  8: 'Tier 8 — Full Assemblies',
};

function extractTitle(md) {
  const m = md.match(/^#\s+\d+\s+—\s+(.+)$/m);
  return m ? m[1].trim() : 'Unknown';
}

function storyName(n, title) {
  const nn = String(n).padStart(2, '0');
  // Convert title to PascalCase for filename
  const pascal = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
    .split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join('');
  return { nn, pascal, filename: `${nn}-${pascal}` };
}

/**
 * Escape { and } in prose lines so MDX doesn't treat them as JSX expressions.
 * Leaves fenced code blocks (``` ... ```) untouched.
 */
function escapeBracesOutsideCodeBlocks(text) {
  const lines = text.split('\n');
  let inCodeBlock = false;
  return lines.map(line => {
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return line;
    }
    if (inCodeBlock) return line;
    // Escape { and } in prose lines
    return line.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
  }).join('\n');
}

function stripFirstHeadingAndBackLink(md) {
  // Remove the first # heading line and the [Back to ...] link
  let lines = md.split('\n');
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('# ')) { startIdx = i + 1; continue; }
    if (lines[i].includes('[Back to Implementation Plan]')) { startIdx = i + 1; continue; }
    if (lines[i].trim() === '' && startIdx > 0) { startIdx = i + 1; continue; }
    break;
  }
  return lines.slice(startIdx).join('\n').trim();
}

async function main() {
  let created = 0;

  for (const entry of MAPPING) {
    if (entry.skip) continue;

    const md = await readFile(path.join(IMPL_DIR, entry.file), 'utf-8');
    const title = extractTitle(md);
    const { nn, pascal, filename } = storyName(entry.n, title);
    const tierDir = TIER_NAMES[entry.tier];
    const tierLabel = TIER_LABELS[entry.tier];
    const outDir = path.join(STORIES_DIR, tierDir);

    await mkdir(outDir, { recursive: true });

    const body = escapeBracesOutsideCodeBlocks(stripFirstHeadingAndBackLink(md));
    const storyTitle = `${tierLabel}/${nn} ${title}`;

    const banner = `<div style={{
  padding: '12px 16px',
  marginBottom: 24,
  background: '#fff8e1',
  border: '1px solid #ffe082',
  borderRadius: 4,
  fontSize: 14,
  color: '#6d4c00',
}}>
  **Spec only** — this component is not yet implemented. The syntax below shows the target API.
</div>`;

    const mdx = `import { Meta } from '@storybook/blocks';

<Meta title="${storyTitle}" />

# ${md.match(/^#\s+(.+)$/m)[1].trim()}

${banner}

${body}
`;

    const outPath = path.join(outDir, `${filename}.mdx`);
    await writeFile(outPath, mdx, 'utf-8');
    created++;
    console.log(`  ${tierDir}/${filename}.mdx`);
  }

  console.log(`\nCreated ${created} MDX files.`);
}

main().catch(console.error);
