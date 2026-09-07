import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { replacePlaceholders } from './replace-placeholders.mjs';

test('replacePlaceholders rewrites tokens in nested text files', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'replace-test-'));
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

  await fs.rm(root, { recursive: true, force: true });
});
