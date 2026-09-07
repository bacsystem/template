import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runSetup } from './setup.mjs';

test('runSetup runs pnpm install then git init/add/commit in order', async () => {
  const calls = [];
  const exec = async (cmd, args, options) => {
    calls.push({ cmd, args, cwd: options.cwd });
  };

  await runSetup('/tmp/dest', { exec });

  assert.deepEqual(calls.map((c) => c.cmd), ['pnpm', 'git', 'git', 'git']);
  assert.deepEqual(calls[0], { cmd: 'pnpm', args: ['install'], cwd: '/tmp/dest' });
  assert.deepEqual(calls[1].args, ['init']);
  assert.deepEqual(calls[2].args, ['add', '.']);
  assert.equal(calls[3].args[0], 'commit');
});
