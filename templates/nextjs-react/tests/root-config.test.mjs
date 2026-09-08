import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('package.json declares required scripts and the placeholder name', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  assert.equal(pkg.name, '__PROJECT_NAME__');
  assert.equal(pkg.scripts.dev, 'next dev');
  assert.equal(pkg.scripts.build, 'next build');
  assert.equal(pkg.scripts.test, 'vitest run');
  assert.equal(pkg.scripts.typecheck, 'tsc --noEmit');
  assert.equal(pkg.scripts.lint, 'eslint .');
});
