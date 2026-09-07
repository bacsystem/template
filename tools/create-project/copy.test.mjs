import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { copyTemplate } from './copy.mjs';

test('copyTemplate copies nested files and skips excluded entries', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'copy-test-'));
  const src = path.join(root, 'src');
  const dest = path.join(root, 'dest');
  await fs.mkdir(path.join(src, 'node_modules'), { recursive: true });
  await fs.writeFile(path.join(src, 'node_modules', 'ignored.js'), 'ignored');
  await fs.mkdir(path.join(src, 'nested'), { recursive: true });
  await fs.writeFile(path.join(src, 'nested', 'file.txt'), 'hello');
  await fs.writeFile(path.join(src, 'package.json'), '{}');

  await copyTemplate(src, dest);

  const nestedContent = await fs.readFile(path.join(dest, 'nested', 'file.txt'), 'utf8');
  assert.equal(nestedContent, 'hello');
  await assert.rejects(fs.access(path.join(dest, 'node_modules')));

  await fs.rm(root, { recursive: true, force: true });
});
