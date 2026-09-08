import { promises as fs } from 'node:fs';
import { walkFiles } from './walk.mjs';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function replacePlaceholders(destDir, replacements) {
  const tokens = Object.keys(replacements);

  // An empty alternation compiles to //g, which matches at every position and
  // would splice `undefined` between every character of every file.
  if (tokens.length === 0) return;

  const pattern = new RegExp(tokens.map(escapeRegExp).join('|'), 'g');

  await walkFiles(destDir, async (entryPath) => {
    const content = await fs.readFile(entryPath, 'utf8');
    const updated = content.replace(pattern, (token) => replacements[token]);
    if (updated !== content) {
      await fs.writeFile(entryPath, updated, 'utf8');
    }
  });
}
