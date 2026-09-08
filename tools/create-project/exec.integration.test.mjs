// Runs real processes on purpose. Every other test in this directory injects
// a fake `run`, which is exactly why a shell-quoting bug once shipped green:
// the fakes receive the args array, while the shell receives a concatenated
// string. This file is the only guard against that class of regression.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createExec } from './exec.mjs';

const COMMIT_MESSAGE = 'chore: scaffold project from template';

test('createExec preserves a multi-word git commit message end to end', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'exec-integration-'));
  const exec = createExec();
  const opts = { cwd: repo };

  await exec('git', ['init'], opts);
  await exec('git', ['config', 'user.email', 'test@example.com'], opts);
  await exec('git', ['config', 'user.name', 'Test'], opts);
  await fs.writeFile(path.join(repo, 'file.txt'), 'content');
  await exec('git', ['add', '.'], opts);
  await exec('git', ['commit', '-m', COMMIT_MESSAGE], opts);

  const { stdout } = await exec('git', ['log', '-1', '--pretty=%s'], opts);

  assert.equal(stdout.trim(), COMMIT_MESSAGE);

  await fs.rm(repo, { recursive: true, force: true });
});

test('createExec surfaces a real command failure as a rejection', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'exec-integration-'));
  const exec = createExec();

  // No repository here, so git must fail rather than resolve silently.
  await assert.rejects(exec('git', ['log'], { cwd: repo }));

  await fs.rm(repo, { recursive: true, force: true });
});
