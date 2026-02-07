import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const codexDist = path.join(root, 'app-codex', 'dist-bundle');
const targetRoot = path.join(root, 'app-ref', 'public');
const target = path.join(targetRoot, 'app-codex');

await mkdir(targetRoot, { recursive: true });
await rm(target, { recursive: true, force: true });
await cp(codexDist, target, { recursive: true });

console.log(`Copied ${codexDist} -> ${target}`);
