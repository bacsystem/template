export async function runSetup(destDir, { exec }) {
  await exec('pnpm', ['install'], { cwd: destDir });
  await exec('git', ['init'], { cwd: destDir });
  await exec('git', ['add', '.'], { cwd: destDir });
  await exec('git', ['commit', '-m', 'chore: scaffold project from template'], { cwd: destDir });
}
