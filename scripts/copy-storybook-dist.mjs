import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const storybookDist = path.join(root, 'storybook-viewer', 'storybook-static');
const targetRoot = path.join(root, 'app-ref', 'public');
const target = path.join(targetRoot, 'app-storybook');

await mkdir(targetRoot, { recursive: true });
await rm(target, { recursive: true, force: true });
await cp(storybookDist, target, { recursive: true });

console.log(`Copied ${storybookDist} -> ${target}`);
