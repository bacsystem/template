import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { replacePlaceholders } from './replace-placeholders.mjs';
import { makeTempDir } from './testing/temp-dir.mjs';

test('replacePlaceholders rewrites tokens in nested text files', async (t) => {
  const root = await makeTempDir(t, 'replace-test-');
  await fs.mkdir(path.join(root, 'nested'), { recursive: true });
  await fs.writeFile(
    path.join(root, 'nested', 'config.txt'),
    'name=__PROJECT_NAME__\nurl=__API_BASE_URL__'
  );

  await replacePlaceholders(root, {
    __PROJECT_NAME__: 'acme-app',
    __API_BASE_URL__: 'https://api.acme.com',
  });

  const content = await fs.readFile(path.join(root, 'nested', 'config.txt'), 'utf8');
  assert.equal(content, 'name=acme-app\nurl=https://api.acme.com');
});

test('replacePlaceholders does not re-substitute a value that matches another token', async (t) => {
  const root = await makeTempDir(t, 'replace-test-');
  await fs.writeFile(path.join(root, 'file.txt'), 'name=__PROJECT_NAME__');

  await replacePlaceholders(root, {
    __PROJECT_NAME__: '__API_BASE_URL__',
    __API_BASE_URL__: 'https://api.acme.com',
  });

  const content = await fs.readFile(path.join(root, 'file.txt'), 'utf8');
  assert.equal(content, 'name=__API_BASE_URL__');
});

test('replacePlaceholders leaves files untouched when there is nothing to replace', async (t) => {
  const root = await makeTempDir(t, 'replace-test-');
  await fs.writeFile(path.join(root, 'file.txt'), 'hello');

  await replacePlaceholders(root, {});

  assert.equal(await fs.readFile(path.join(root, 'file.txt'), 'utf8'), 'hello');
});

test('replacePlaceholders rewrites a lockfile, which is a copy-time exclusion only', async (t) => {
  const root = await makeTempDir(t, 'replace-test-');
  await fs.writeFile(path.join(root, 'pnpm-lock.yaml'), 'name: __PROJECT_NAME__');

  await replacePlaceholders(root, { __PROJECT_NAME__: 'acme-app' });

  assert.equal(await fs.readFile(path.join(root, 'pnpm-lock.yaml'), 'utf8'), 'name: acme-app');
});

test('replacePlaceholders does not descend into .git or node_modules', async (t) => {
  const root = await makeTempDir(t, 'replace-test-');
  await fs.mkdir(path.join(root, '.git'), { recursive: true });
  await fs.mkdir(path.join(root, 'node_modules'), { recursive: true });
  await fs.writeFile(path.join(root, '.git', 'COMMIT_EDITMSG'), '__PROJECT_NAME__');
  await fs.writeFile(path.join(root, 'node_modules', 'dep.js'), '__PROJECT_NAME__');
  await fs.writeFile(path.join(root, 'file.txt'), '__PROJECT_NAME__');

  await replacePlaceholders(root, { __PROJECT_NAME__: 'acme-app' });

  assert.equal(await fs.readFile(path.join(root, 'file.txt'), 'utf8'), 'acme-app');
  assert.equal(
    await fs.readFile(path.join(root, '.git', 'COMMIT_EDITMSG'), 'utf8'),
    '__PROJECT_NAME__'
  );
  assert.equal(
    await fs.readFile(path.join(root, 'node_modules', 'dep.js'), 'utf8'),
    '__PROJECT_NAME__'
  );
});
