import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Registers cleanup with the test context up front, so a failing assertion
// leaves no orphan directory in the system temp folder — a trailing
// `fs.rm` never runs when the assertion above it throws.
export async function makeTempDir(t, prefix = 'create-project-') {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return dir;
}
