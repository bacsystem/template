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

export function createExec({ platform = process.platform, run = execFileAsync } = {}) {
  return async (command, args, options = {}) => {
    const shell = needsShell(command, platform);

    // Fail loudly rather than let the shell silently split an argument, which
    // is the failure mode this module exists to prevent.
    if (shell) {
      const unsafe = args.find((arg) => /\s/.test(arg));
      if (unsafe) {
        throw new Error(
          `Argument "${unsafe}" cannot be passed through a shell unescaped. ` +
            `Pass a single-word argument, or run this command without a shell.`
        );
      }
    }

    return run(command, args, { ...options, shell });
  };
}
