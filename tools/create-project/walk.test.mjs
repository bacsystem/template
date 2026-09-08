import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { walkFiles } from './walk.mjs';

test('walkFiles visits nested files and skips excluded entries case-insensitively', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'walk-test-'));
  await fs.mkdir(path.join(root, 'Node_Modules'), { recursive: true });
  await fs.writeFile(path.join(root, 'Node_Modules', 'ignored.js'), 'ignored');
  await fs.mkdir(path.join(root, 'nested'), { recursive: true });
  await fs.writeFile(path.join(root, 'nested', 'file.txt'), 'hello');
  await fs.writeFile(path.join(root, 'top.txt'), 'top');

  const visited = [];
  await walkFiles(root, async (filePath) => visited.push(path.relative(root, filePath)), {
    exclude: new Set(['node_modules']),
  });

  assert.deepEqual(visited.sort(), [path.join('nested', 'file.txt'), 'top.txt'].sort());

  await fs.rm(root, { recursive: true, force: true });
});
