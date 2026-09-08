import { promises as fs } from 'node:fs';
import path from 'node:path';

// Off-limits to every walk, whatever the caller is doing: these hold installed
// dependencies and VCS internals, never authored content. Rewriting inside
// .git corrupts the repository, so this is the safe default rather than
// something each caller must remember to pass.
export const NEVER_WALK = new Set(['node_modules', '.git']);

export async function walkFiles(dir, onFile, { exclude = NEVER_WALK } = {}) {
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
