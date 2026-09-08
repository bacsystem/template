import { promises as fs } from 'node:fs';
import path from 'node:path';

// Never walked, whether copying a template or rewriting placeholders in the
// generated project: build output and VCS internals are not template content,
// and rewriting inside .git corrupts the repository.
export const DEFAULT_EXCLUDES = new Set([
  'node_modules',
  '.git',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
]);

export async function walkFiles(dir, onFile, { exclude = DEFAULT_EXCLUDES } = {}) {
  const excludedLower = new Set([...exclude].map((name) => name.toLowerCase()));
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (excludedLower.has(entry.name.toLowerCase())) continue;
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(entryPath, onFile, { exclude });
    } else {
      await onFile(entryPath);
    }
  }
}
