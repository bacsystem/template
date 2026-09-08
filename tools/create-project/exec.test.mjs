import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createExec, needsShell, quoteForShell } from './exec.mjs';

test('needsShell is true only for npm-family shims on Windows', () => {
  assert.equal(needsShell('pnpm', 'win32'), true);
  assert.equal(needsShell('npm', 'win32'), true);
  assert.equal(needsShell('git', 'win32'), false);
  assert.equal(needsShell('pnpm', 'linux'), false);
  assert.equal(needsShell('git', 'linux'), false);
});

test('quoteForShell wraps cmd.exe arguments so metacharacters lose their meaning', () => {
  assert.equal(quoteForShell('install', 'win32'), '"install"');
  assert.equal(quoteForShell('pkg@^1.2.3', 'win32'), '"pkg@^1.2.3"');
  assert.equal(quoteForShell('a&b', 'win32'), '"a&b"');
  assert.equal(quoteForShell('say "hi"', 'win32'), '"say ""hi"""');
});

test('quoteForShell doubles the backslashes that meet a quote, so they stay literal', () => {
  // Untouched: a backslash is only special next to a quote.
  assert.equal(quoteForShell('C:\\some\\path', 'win32'), '"C:\\some\\path"');
  // Trailing run meets the closing quote, so it doubles.
  assert.equal(quoteForShell('C:\\some\\path\\', 'win32'), '"C:\\some\\path\\\\"');
  assert.equal(quoteForShell('C:\\dir\\\\', 'win32'), '"C:\\dir\\\\\\\\"');
  // Run before an embedded quote doubles, and the quote itself is escaped.
  assert.equal(quoteForShell('a\\"b', 'win32'), '"a\\\\""b"');
});

test('quoteForShell single-quotes POSIX arguments, escaping embedded quotes', () => {
  assert.equal(quoteForShell('install', 'linux'), "'install'");
  assert.equal(quoteForShell('a&b', 'linux'), "'a&b'");
  assert.equal(quoteForShell("it's", 'linux'), "'it'\\''s'");
});

test('quoteForShell rejects cmd.exe variable expansion, which quoting cannot disarm', () => {
  assert.throws(() => quoteForShell('%PATH%', 'win32'), /cannot be passed through cmd\.exe/);
  // POSIX quoting handles % fine, so it must not be rejected there.
  assert.equal(quoteForShell('%PATH%', 'linux'), "'%PATH%'");
});

test('createExec never runs git through a shell, so multi-word args stay intact', async () => {
  const calls = [];
  const run = async (cmd, args, options) => calls.push({ cmd, args, options });
  const exec = createExec({ platform: 'win32', run });

  await exec('git', ['commit', '-m', 'chore: scaffold project from template'], { cwd: '/dest' });

  assert.equal(calls[0].options.shell, false);
  assert.deepEqual(calls[0].args, ['commit', '-m', 'chore: scaffold project from template']);
});

test('createExec quotes args for the shell instead of rejecting them', async () => {
  const calls = [];
  const run = async (cmd, args, options) => calls.push({ cmd, args, options });
  const exec = createExec({ platform: 'win32', run });

  await exec('pnpm', ['add', 'pkg@^1.2.3'], { cwd: '/dest' });

  assert.equal(calls[0].options.shell, true);
  assert.deepEqual(calls[0].args, ['"add"', '"pkg@^1.2.3"']);
});

test('createExec passes shell args that a bare shell would have split or reinterpreted', async () => {
  const calls = [];
  const run = async (cmd, args, options) => calls.push({ args });
  const exec = createExec({ platform: 'win32', run });

  for (const arg of ['some script', 'a&b', 'a|b', 'a;b', 'a>b', 'pkg@~1.0.0', './packages/*']) {
    await exec('pnpm', ['run', arg], { cwd: '/dest' });
  }

  assert.deepEqual(
    calls.map((c) => c.args[1]),
    ['"some script"', '"a&b"', '"a|b"', '"a;b"', '"a>b"', '"pkg@~1.0.0"', '"./packages/*"']
  );
});
