import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('root package.json declares create:project script and prompts dependency', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  assert.equal(pkg.scripts['create:project'], 'node tools/create-project/index.mjs');
  assert.ok(pkg.devDependencies.prompts);
});
