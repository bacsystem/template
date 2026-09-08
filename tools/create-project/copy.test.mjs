import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { copyTemplate } from './copy.mjs';
import { makeTempDir } from './testing/temp-dir.mjs';

test('copyTemplate copies nested files and skips excluded entries', async (t) => {
  const root = await makeTempDir(t, 'copy-test-');
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
});

test('copyTemplate skips lockfiles, which pin the template author install', async (t) => {
  const root = await makeTempDir(t, 'copy-test-');
  const src = path.join(root, 'src');
  const dest = path.join(root, 'dest');
  await fs.mkdir(src, { recursive: true });
  await fs.writeFile(path.join(src, 'pnpm-lock.yaml'), 'lock');
  await fs.writeFile(path.join(src, 'package.json'), '{}');

  await copyTemplate(src, dest);

  await assert.rejects(fs.access(path.join(dest, 'pnpm-lock.yaml')));
  assert.equal(await fs.readFile(path.join(dest, 'package.json'), 'utf8'), '{}');
});

test('copyTemplate refuses to copy into a non-empty destination', async (t) => {
  const root = await makeTempDir(t, 'copy-test-');
  const src = path.join(root, 'src');
  const dest = path.join(root, 'dest');
  await fs.mkdir(src, { recursive: true });
  await fs.writeFile(path.join(src, 'file.txt'), 'hello');
  await fs.mkdir(dest, { recursive: true });
  await fs.writeFile(path.join(dest, 'existing.txt'), 'do not touch');

  await assert.rejects(copyTemplate(src, dest), /already exists and is not empty/);
});
