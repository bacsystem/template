import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function replacePlaceholders(destDir, replacements) {
  const entries = await fs.readdir(destDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await replacePlaceholders(entryPath, replacements);
      continue;
    }
    const content = await fs.readFile(entryPath, 'utf8');
    let updated = content;
    for (const [token, value] of Object.entries(replacements)) {
      updated = updated.split(token).join(value);
    }
    if (updated !== content) {
      await fs.writeFile(entryPath, updated, 'utf8');
    }
  }
}
