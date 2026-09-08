import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// pnpm/npm/yarn ship as .cmd shims on Windows, which Node refuses to spawn
// directly since CVE-2024-27980 — those need a shell. Real executables like
// git must NOT go through one: with `shell: true` Node concatenates the args
// unescaped, so `git commit -m 'chore: scaffold from template'` reaches git as
// five separate arguments and fails on the extra pathspecs.
const SHELL_SHIMS = new Set(['pnpm', 'npm', 'yarn', 'npx']);

export function needsShell(command, platform = process.platform) {
  return platform === 'win32' && SHELL_SHIMS.has(command);
}

// Node concatenates args with a bare space under `shell: true`, so anything
// heading for a shell is quoted here first. Quoting rather than rejecting
// matters: npm-ecosystem arguments legitimately contain shell metacharacters
// (`pkg@^1.2.3`, `--filter=./packages/*`), and a guard that refuses them
// invites the next contributor to weaken it instead.
export function quoteForShell(arg, platform = process.platform) {
  if (platform === 'win32') {
    // Inside double quotes cmd.exe stops acting on &, |, <, >, ^ and friends,
    // and "" is its escape for a literal quote. %VAR% still expands there and
    // has no reliable escape, so it stays refused.
    if (arg.includes('%')) {
      throw new Error(
        `Argument "${arg}" cannot be passed through cmd.exe: % triggers ` +
          `variable expansion that quoting does not disarm.`
      );
    }

    // A backslash is only special when it precedes a quote, so every run that
    // does — including the run at the end, which meets the closing quote — has
    // to be doubled. Skipping the trailing run lets `C:\path\` escape its own
    // closing quote and swallow whatever argument follows.
    const escaped = arg.replace(/(\\*)"/g, '$1$1""').replace(/(\\+)$/, '$1$1');
    return `"${escaped}"`;
  }

  // POSIX single quotes are fully literal; only ' itself needs breaking out.
  return `'${arg.replace(/'/g, `'\\''`)}'`;
}

export function createExec({ platform = process.platform, run = execFileAsync } = {}) {
  return async (command, args, options = {}) => {
    const shell = needsShell(command, platform);
    const finalArgs = shell ? args.map((arg) => quoteForShell(arg, platform)) : args;

    return run(command, finalArgs, { ...options, shell });
  };
}
