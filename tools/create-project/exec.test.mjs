import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createExec, needsShell } from './exec.mjs';

test('needsShell is true only for npm-family shims on Windows', () => {
  assert.equal(needsShell('pnpm', 'win32'), true);
  assert.equal(needsShell('npm', 'win32'), true);
  assert.equal(needsShell('git', 'win32'), false);
  assert.equal(needsShell('pnpm', 'linux'), false);
  assert.equal(needsShell('git', 'linux'), false);
});

test('createExec never runs git through a shell, so multi-word args stay intact', async () => {
  const calls = [];
  const run = async (cmd, args, options) => calls.push({ cmd, args, options });
  const exec = createExec({ platform: 'win32', run });

  await exec('git', ['commit', '-m', 'chore: scaffold project from template'], { cwd: '/dest' });

  assert.equal(calls[0].options.shell, false);
  assert.deepEqual(calls[0].args, ['commit', '-m', 'chore: scaffold project from template']);
});

test('createExec runs pnpm through a shell on Windows', async () => {
  const calls = [];
  const run = async (cmd, args, options) => calls.push({ cmd, args, options });
  const exec = createExec({ platform: 'win32', run });

  await exec('pnpm', ['install'], { cwd: '/dest' });

  assert.equal(calls[0].options.shell, true);
});

test('createExec rejects a shell command whose args would be split by the shell', async () => {
  const exec = createExec({ platform: 'win32', run: async () => {} });

  await assert.rejects(
    exec('pnpm', ['run', 'some script'], { cwd: '/dest' }),
    /cannot be passed through a shell/
  );
});
