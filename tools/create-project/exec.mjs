import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// pnpm/npm/yarn ship as .cmd shims on Windows, which Node refuses to spawn
// directly since CVE-2024-27980 — those need a shell. Real executables like
// git must NOT go through one: with `shell: true` Node concatenates the args
// unescaped, so `git commit -m 'chore: scaffold from template'` reaches git as
// five separate arguments and fails on the extra pathspecs.
const SHELL_SHIMS = new Set(['pnpm', 'npm', 'yarn', 'npx']);

// Whitespace splits an argument in two; the rest are metacharacters both
// cmd.exe and POSIX shells act on (redirection, chaining, substitution).
const SHELL_UNSAFE = /[\s&|;<>`$()^"'*?[\]{}!~#]/;

export function needsShell(command, platform = process.platform) {
  return platform === 'win32' && SHELL_SHIMS.has(command);
}

export function createExec({ platform = process.platform, run = execFileAsync } = {}) {
  return async (command, args, options = {}) => {
    const shell = needsShell(command, platform);

    // Fail loudly rather than let the shell silently split or reinterpret an
    // argument, which is the failure mode this module exists to prevent.
    if (shell) {
      const unsafe = args.find((arg) => SHELL_UNSAFE.test(arg));
      if (unsafe) {
        throw new Error(
          `Argument "${unsafe}" cannot be passed through a shell unescaped. ` +
            `Shell-invoked commands accept only plain arguments — no whitespace ` +
            `and no shell metacharacters.`
        );
      }
    }

    return run(command, args, { ...options, shell });
  };
}
