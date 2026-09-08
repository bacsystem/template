import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function walkFiles(dir, onFile, { exclude = new Set() } = {}) {
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
