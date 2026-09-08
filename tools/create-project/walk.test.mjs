import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { walkFiles } from './walk.mjs';
import { makeTempDir } from './testing/temp-dir.mjs';

test('walkFiles visits nested files and skips excluded entries case-insensitively', async (t) => {
  const root = await makeTempDir(t, 'walk-test-');
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
});

test('walkFiles skips .git and node_modules by default, with no exclude passed', async (t) => {
  const root = await makeTempDir(t, 'walk-test-');
  await fs.mkdir(path.join(root, '.git'), { recursive: true });
  await fs.writeFile(path.join(root, '.git', 'HEAD'), 'ref');
  await fs.mkdir(path.join(root, 'node_modules'), { recursive: true });
  await fs.writeFile(path.join(root, 'node_modules', 'dep.js'), 'dep');
  await fs.writeFile(path.join(root, 'top.txt'), 'top');

  const visited = [];
  await walkFiles(root, async (filePath) => visited.push(path.relative(root, filePath)));

  assert.deepEqual(visited, ['top.txt']);
});
