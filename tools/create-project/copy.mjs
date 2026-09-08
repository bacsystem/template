import { promises as fs } from 'node:fs';
import path from 'node:path';
import { walkFiles } from './walk.mjs';

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
  await fs.mkdir(destDir, { recursive: true });
  await walkFiles(
    srcDir,
    async (srcPath) => {
      const destPath = path.join(destDir, path.relative(srcDir, srcPath));
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.copyFile(srcPath, destPath);
    },
    { exclude }
  );
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
