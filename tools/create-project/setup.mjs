const COMMIT_MESSAGE = 'chore: scaffold project from template';

export async function runSetup(destDir, { exec, warn = console.warn }) {
  // `git init` comes first: `pnpm install` runs the `prepare` lifecycle script,
  // which is where husky installs its hooks. Without an existing `.git`, husky
  // no-ops silently and the scaffolded project ends up with no pre-commit hook.
  await exec('git', ['init'], { cwd: destDir });
  await exec('pnpm', ['install'], { cwd: destDir });
  await exec('git', ['add', '.'], { cwd: destDir });

  // The commit is the least critical step — by now the project is copied and
  // installed. A missing git identity should not discard that work.
  try {
    await exec('git', ['commit', '-m', COMMIT_MESSAGE], { cwd: destDir });
    return { committed: true };
  } catch (error) {
    warn(
      `No se pudo crear el commit inicial: ${error.message}\n` +
        `El proyecto quedó creado e instalado. Commiteá manualmente:\n` +
        `  git commit -m "${COMMIT_MESSAGE}"`
    );
    return { committed: false };
  }
}
