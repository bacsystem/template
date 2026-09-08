import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('CI workflow runs lint, typecheck, test, and build', () => {
  const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
  assert.match(workflow, /pnpm lint/);
  assert.match(workflow, /pnpm typecheck/);
  assert.match(workflow, /pnpm test/);
  assert.match(workflow, /pnpm build/);
});

test('Dockerfile builds a standalone runner image', () => {
  const dockerfile = readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8');
  assert.match(dockerfile, /AS deps/);
  assert.match(dockerfile, /AS builder/);
  assert.match(dockerfile, /AS runner/);
  assert.match(dockerfile, /\.next\/standalone/);
});

test('nginx.conf proxies to the app container', () => {
  const nginxConf = readFileSync(new URL('../nginx.conf', import.meta.url), 'utf8');
  assert.match(nginxConf, /proxy_pass http:\/\/app:3000/);
});
