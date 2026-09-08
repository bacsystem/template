import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runSetup } from './setup.mjs';

test('runSetup inits git before installing, so prepare scripts can add hooks', async () => {
  const calls = [];
  const exec = async (cmd, args, options) => {
    calls.push({ cmd, args, cwd: options.cwd });
  };

  await runSetup('/tmp/dest', { exec });

  assert.deepEqual(
    calls.map((c) => `${c.cmd} ${c.args.join(' ')}`),
    [
      'git init',
      'pnpm install',
      'git add .',
      'git commit -m chore: scaffold project from template',
    ]
  );
  assert.ok(calls.every((c) => c.cwd === '/tmp/dest'));
});

test('runSetup reports a failed commit instead of throwing, since the project is already scaffolded', async () => {
  const warnings = [];
  const exec = async (cmd, args) => {
    if (cmd === 'git' && args[0] === 'commit') {
      throw new Error('Author identity unknown');
    }
  };

  const result = await runSetup('/tmp/dest', { exec, warn: (msg) => warnings.push(msg) });

  assert.equal(result.committed, false);
  assert.match(warnings[0], /Author identity unknown/);
  assert.match(warnings[0], /git commit/);
});

test('runSetup reports success when the commit lands', async () => {
  const result = await runSetup('/tmp/dest', { exec: async () => {} });

  assert.equal(result.committed, true);
});
