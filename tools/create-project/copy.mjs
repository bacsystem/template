import { promises as fs } from 'node:fs';
import path from 'node:path';

const DEFAULT_EXCLUDES = new Set([
  'node_modules',
  '.git',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
]);

export async function copyTemplate(srcDir, destDir, { exclude = DEFAULT_EXCLUDES } = {}) {
  if (await pathHasEntries(destDir)) {
    throw new Error(`Destination already exists and is not empty: ${destDir}`);
  }
  await copyRecursive(srcDir, destDir, exclude);
}

async function pathHasEntries(dir) {
  try {
    const entries = await fs.readdir(dir);
    return entries.length > 0;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function copyRecursive(srcDir, destDir, exclude) {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (exclude.has(entry.name)) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath, exclude);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
