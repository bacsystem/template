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

// Without this pin, `corepack enable` in the Dockerfile fetches whatever pnpm
// is newest at build time. A pnpm newer than the one that wrote the lockfile
// can reject it outright (ERR_PNPM_LOCKFILE_CONFIG_MISMATCH), so the image
// build breaks on a schedule nobody controls.
test('package.json pins the package manager so every environment resolves the same pnpm', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  assert.match(pkg.packageManager, /^pnpm@\d+\.\d+\.\d+$/);
});

// The runner stage does `COPY --from=builder /app/public ./public`, which is a
// hard build failure when the directory is absent — BuildKit cannot checksum a
// path that does not exist.
test('public/ exists for the Dockerfile runner stage to copy', () => {
  const dockerfile = readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8');
  assert.match(dockerfile, /COPY --from=builder \/app\/public/);
  assert.doesNotThrow(() => readFileSync(new URL('../public/.gitkeep', import.meta.url)));
});

test('CI derives pnpm from packageManager rather than pinning its own version', () => {
  const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
  const setupPnpm = workflow.slice(workflow.indexOf('pnpm/action-setup'));
  const nextStep = setupPnpm.slice(0, setupPnpm.indexOf('- uses: actions/setup-node'));
  assert.doesNotMatch(nextStep, /version:/);
});
