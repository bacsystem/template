import { promises as fs } from 'node:fs';
import { walkFiles } from './walk.mjs';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function replacePlaceholders(destDir, replacements) {
  const pattern = new RegExp(Object.keys(replacements).map(escapeRegExp).join('|'), 'g');

  await walkFiles(destDir, async (entryPath) => {
    const content = await fs.readFile(entryPath, 'utf8');
    const updated = content.replace(pattern, (token) => replacements[token]);
    if (updated !== content) {
      await fs.writeFile(entryPath, updated, 'utf8');
    }
  });
}
