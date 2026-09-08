// Runs real processes on purpose. Every other test in this directory injects
// a fake `run`, which is exactly why a shell-quoting bug once shipped green:
// the fakes receive the args array, while the shell receives a concatenated
// string. This file is the only guard against that class of regression.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { createExec, quoteForShell } from './exec.mjs';
import { makeTempDir } from './testing/temp-dir.mjs';

const execFileAsync = promisify(execFile);
const COMMIT_MESSAGE = 'chore: scaffold project from template';

test('quoteForShell arguments survive a real shell round-trip', async () => {
  // Unit tests assert the quoted string; only a real shell proves the quoting
  // is the one cmd.exe/sh actually accept.
  const tricky = ['pkg@^1.2.3', 'pkg@~1.0.0', './packages/*', 'a&b', 'two words'];
  const script = 'console.log(process.argv.slice(1).join("|"))';

  const quoted = [script, ...tricky].map((arg) => quoteForShell(arg));
  const { stdout } = await execFileAsync('node', ['-e', ...quoted], { shell: true });

  assert.deepEqual(stdout.trim().split('|'), tricky);
});

test('createExec preserves a multi-word git commit message end to end', async (t) => {
  const repo = await makeTempDir(t, 'exec-integration-');
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
});

test('createExec surfaces a real command failure as a rejection', async (t) => {
  const repo = await makeTempDir(t, 'exec-integration-');
  const exec = createExec();

  // No repository here, so git must fail rather than resolve silently.
  await assert.rejects(exec('git', ['log'], { cwd: repo }));
});
