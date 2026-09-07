# Monorepo Structure & Scaffolding CLI Implementation Plan

> **For agentic workers:** execute this plan with the
> parallel-plan-executor Workflow (cys:run / the /cys:run-plan command).
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the monorepo root (structure, shared rules, scaffolding
CLI) that future project templates (`templates/nextjs-react`,
`templates/angular`) will plug into.

**Architecture:** A root `package.json` exposes a `create:project` script
that runs `tools/create-project/index.mjs`. That CLI prompts for a
template choice and project details, then delegates to three pure,
independently-testable modules (`copy.mjs`, `replace-placeholders.mjs`,
`setup.mjs`) orchestrated through a dependency-injected `runCreateProject()`
function so the orchestration itself is unit-testable without touching the
real filesystem/network/git.

**Tech Stack:** Node.js (ESM, `.mjs`), built-in `node:test` +
`node:assert/strict` for tests (no test framework dependency), `prompts`
for interactive CLI input.

## Global Constraints

- No `&&` chained shell commands; each command runs as its own step (per
  root `D:\github\CLAUDE.md`).
- Placeholder convention is simple find/replace tokens: `__PROJECT_NAME__`,
  `__THEME_PRIMARY__`, `__API_BASE_URL__` — no template engine.
- `templates/*` folders are never pnpm workspace members and must stay
  self-contained (no cross-imports, no shared `node_modules`/lockfile).
- Every new file uses Conventional Commit messages in English.
- Tests use Node's built-in test runner (`node --test`) — no vitest/jest
  added to the root `package.json`.

---

### Task 1: Root monorepo scaffolding

**Files:**
- Create: `package.json`
- Create: `CLAUDE.md`
- Create: `README.md`
- Create: `.gitignore`
- Create: `templates/.gitkeep`
- Test: `tests/root-config.test.mjs`

**Interfaces:**
- Consumes: None
- Produces: `package.json`

Steps:

1. Write the failing test:

```js
// tests/root-config.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('root package.json declares create:project script and prompts dependency', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  assert.equal(pkg.scripts['create:project'], 'node tools/create-project/index.mjs');
  assert.ok(pkg.devDependencies.prompts);
});
```

2. Run it, expect FAIL:

```
node --test tests/root-config.test.mjs
```
Expected error: `ENOENT: no such file or directory, open 'package.json'`

3. Write the minimal implementation.

`package.json`:
```json
{
  "name": "template-monorepo",
  "private": true,
  "type": "module",
  "scripts": {
    "create:project": "node tools/create-project/index.mjs",
    "test": "node --test tools/create-project tests"
  },
  "devDependencies": {
    "prompts": "^2.4.2"
  }
}
```

`.gitignore`:
```
node_modules/
.env
.DS_Store
```

`CLAUDE.md`:
```md
# Reglas del monorepo

Este repo aloja plantillas base de proyectos (`templates/`) y el CLI
que las scaffoldea (`tools/create-project/`). Las reglas de ejecución
de comandos de `D:\github\CLAUDE.md` (no `&&`, usar flags de directorio
propias de cada herramienta) ya aplican por herencia.

## Reglas por plantilla

- Cada carpeta en `templates/` es autocontenida: sin imports cruzados
  entre plantillas, sin `node_modules`/lockfile compartido.
- Toda plantilla nueva debe incluir: `README.md` con setup, `Dockerfile`
  + CI baseline, TypeScript en modo estricto.
- Toda plantilla nueva debe usar placeholders simples (`__NOMBRE__`)
  compatibles con `tools/create-project`.
- Componentes/primitivos compartidos deben ser genéricos, configurables
  por props/inputs, sin lógica de negocio ni de una feature particular.

## Regla de oro (aplica a toda plantilla)

- Nunca hardcodear valores de estilo (colores, spacing, tipografía) en
  componentes — todo pasa por variables/tokens de diseño centralizados.
- DRY: no duplicar lógica o markup — extraer a funciones/componentes
  compartidos cuando se repite.
- SOLID adaptado a frontend: responsabilidad única por componente,
  extensible vía props/composición, dependiente de abstracciones y no
  de implementaciones concretas al cruzar capas.
- Seguir las mejores prácticas idiomáticas de cada framework.
```

`README.md`:
```md
# template

Monorepo de plantillas base para proyectos futuros.

## Uso

    pnpm install
    pnpm create:project

El CLI pide la plantilla, nombre del proyecto, color primario del tema
y URL base de la API externa, y crea un proyecto nuevo listo para usar
(dependencias instaladas, git inicializado).

## Plantillas disponibles

- `templates/nextjs-react/` — Next.js/React (frontend que consume una
  API externa)
- `templates/angular/` — próximamente
```

`templates/.gitkeep`: empty file.

4. Run the test, expect PASS:

```
node --test tests/root-config.test.mjs
```

5. Commit:

```
git add package.json CLAUDE.md README.md .gitignore templates/.gitkeep tests/root-config.test.mjs
git commit -m "chore: scaffold monorepo root (package.json, CLAUDE.md, README.md)"
```

---

### Task 2: `copy.mjs` — template copier

**Files:**
- Create: `tools/create-project/copy.mjs`
- Test: `tools/create-project/copy.test.mjs`

**Interfaces:**
- Consumes: None
- Produces: `copyTemplate(srcDir, destDir, options)`

Steps:

1. Write the failing test:

```js
// tools/create-project/copy.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { copyTemplate } from './copy.mjs';

test('copyTemplate copies nested files and skips excluded entries', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'copy-test-'));
  const src = path.join(root, 'src');
  const dest = path.join(root, 'dest');
  await fs.mkdir(path.join(src, 'node_modules'), { recursive: true });
  await fs.writeFile(path.join(src, 'node_modules', 'ignored.js'), 'ignored');
  await fs.mkdir(path.join(src, 'nested'), { recursive: true });
  await fs.writeFile(path.join(src, 'nested', 'file.txt'), 'hello');
  await fs.writeFile(path.join(src, 'package.json'), '{}');

  await copyTemplate(src, dest);

  const nestedContent = await fs.readFile(path.join(dest, 'nested', 'file.txt'), 'utf8');
  assert.equal(nestedContent, 'hello');
  await assert.rejects(fs.access(path.join(dest, 'node_modules')));

  await fs.rm(root, { recursive: true, force: true });
});
```

2. Run it, expect FAIL:

```
node --test tools/create-project/copy.test.mjs
```
Expected error: `Cannot find module './copy.mjs'`

3. Write the minimal implementation:

```js
// tools/create-project/copy.mjs
import { promises as fs } from 'node:fs';
import path from 'node:path';

const DEFAULT_EXCLUDES = new Set([
  'node_modules',
  '.git',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
]);

export async function copyTemplate(srcDir, destDir, { exclude = DEFAULT_EXCLUDES } = {}) {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (exclude.has(entry.name)) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyTemplate(srcPath, destPath, { exclude });
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
```

4. Run the test, expect PASS:

```
node --test tools/create-project/copy.test.mjs
```

5. Commit:

```
git add tools/create-project/copy.mjs tools/create-project/copy.test.mjs
git commit -m "feat: add template copier with exclude support"
```

---

### Task 3: `replace-placeholders.mjs` — token replacement

**Files:**
- Create: `tools/create-project/replace-placeholders.mjs`
- Test: `tools/create-project/replace-placeholders.test.mjs`

**Interfaces:**
- Consumes: None
- Produces: `replacePlaceholders(destDir, replacements)`

Steps:

1. Write the failing test:

```js
// tools/create-project/replace-placeholders.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { replacePlaceholders } from './replace-placeholders.mjs';

test('replacePlaceholders rewrites tokens in nested text files', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'replace-test-'));
  await fs.mkdir(path.join(root, 'nested'), { recursive: true });
  await fs.writeFile(
    path.join(root, 'nested', 'config.txt'),
    'name=__PROJECT_NAME__\nurl=__API_BASE_URL__'
  );

  await replacePlaceholders(root, {
    __PROJECT_NAME__: 'acme-app',
    __API_BASE_URL__: 'https://api.acme.com',
  });

  const content = await fs.readFile(path.join(root, 'nested', 'config.txt'), 'utf8');
  assert.equal(content, 'name=acme-app\nurl=https://api.acme.com');

  await fs.rm(root, { recursive: true, force: true });
});
```

2. Run it, expect FAIL:

```
node --test tools/create-project/replace-placeholders.test.mjs
```
Expected error: `Cannot find module './replace-placeholders.mjs'`

3. Write the minimal implementation:

```js
// tools/create-project/replace-placeholders.mjs
import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function replacePlaceholders(destDir, replacements) {
  const entries = await fs.readdir(destDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await replacePlaceholders(entryPath, replacements);
      continue;
    }
    const content = await fs.readFile(entryPath, 'utf8');
    let updated = content;
    for (const [token, value] of Object.entries(replacements)) {
      updated = updated.split(token).join(value);
    }
    if (updated !== content) {
      await fs.writeFile(entryPath, updated, 'utf8');
    }
  }
}
```

4. Run the test, expect PASS:

```
node --test tools/create-project/replace-placeholders.test.mjs
```

5. Commit:

```
git add tools/create-project/replace-placeholders.mjs tools/create-project/replace-placeholders.test.mjs
git commit -m "feat: add placeholder token replacement"
```

---

### Task 4: `setup.mjs` — post-copy install & git init

**Files:**
- Create: `tools/create-project/setup.mjs`
- Test: `tools/create-project/setup.test.mjs`

**Interfaces:**
- Consumes: None
- Produces: `runSetup(destDir, options)`

Steps:

1. Write the failing test:

```js
// tools/create-project/setup.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runSetup } from './setup.mjs';

test('runSetup runs pnpm install then git init/add/commit in order', async () => {
  const calls = [];
  const exec = async (cmd, args, options) => {
    calls.push({ cmd, args, cwd: options.cwd });
  };

  await runSetup('/tmp/dest', { exec });

  assert.deepEqual(calls.map((c) => c.cmd), ['pnpm', 'git', 'git', 'git']);
  assert.deepEqual(calls[0], { cmd: 'pnpm', args: ['install'], cwd: '/tmp/dest' });
  assert.deepEqual(calls[1].args, ['init']);
  assert.deepEqual(calls[2].args, ['add', '.']);
  assert.equal(calls[3].args[0], 'commit');
});
```

2. Run it, expect FAIL:

```
node --test tools/create-project/setup.test.mjs
```
Expected error: `Cannot find module './setup.mjs'`

3. Write the minimal implementation:

```js
// tools/create-project/setup.mjs
export async function runSetup(destDir, { exec }) {
  await exec('pnpm', ['install'], { cwd: destDir });
  await exec('git', ['init'], { cwd: destDir });
  await exec('git', ['add', '.'], { cwd: destDir });
  await exec('git', ['commit', '-m', 'chore: scaffold project from template'], { cwd: destDir });
}
```

4. Run the test, expect PASS:

```
node --test tools/create-project/setup.test.mjs
```

5. Commit:

```
git add tools/create-project/setup.mjs tools/create-project/setup.test.mjs
git commit -m "feat: add post-copy install and git init step"
```

---

### Task 5: `build-placeholder-map.mjs` — answers to token map

**Files:**
- Create: `tools/create-project/build-placeholder-map.mjs`
- Test: `tools/create-project/build-placeholder-map.test.mjs`

**Interfaces:**
- Consumes: None
- Produces: `buildPlaceholderMap(answers)`

Steps:

1. Write the failing test:

```js
// tools/create-project/build-placeholder-map.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlaceholderMap } from './build-placeholder-map.mjs';

test('buildPlaceholderMap maps CLI answers to placeholder tokens', () => {
  const map = buildPlaceholderMap({
    projectName: 'acme-app',
    themePrimary: '#ff0000',
    apiBaseUrl: 'https://api.acme.com',
  });

  assert.deepEqual(map, {
    __PROJECT_NAME__: 'acme-app',
    __THEME_PRIMARY__: '#ff0000',
    __API_BASE_URL__: 'https://api.acme.com',
  });
});
```

2. Run it, expect FAIL:

```
node --test tools/create-project/build-placeholder-map.test.mjs
```
Expected error: `Cannot find module './build-placeholder-map.mjs'`

3. Write the minimal implementation:

```js
// tools/create-project/build-placeholder-map.mjs
export function buildPlaceholderMap(answers) {
  return {
    __PROJECT_NAME__: answers.projectName,
    __THEME_PRIMARY__: answers.themePrimary,
    __API_BASE_URL__: answers.apiBaseUrl,
  };
}
```

4. Run the test, expect PASS:

```
node --test tools/create-project/build-placeholder-map.test.mjs
```

5. Commit:

```
git add tools/create-project/build-placeholder-map.mjs tools/create-project/build-placeholder-map.test.mjs
git commit -m "feat: add CLI answers to placeholder map builder"
```

---

### Task 6: `index.mjs` — CLI orchestration

**Files:**
- Create: `tools/create-project/index.mjs`
- Test: `tools/create-project/index.test.mjs`

**Interfaces:**
- Consumes: `copyTemplate(srcDir, destDir, options)`
- Consumes: `replacePlaceholders(destDir, replacements)`
- Consumes: `runSetup(destDir, options)`
- Consumes: `buildPlaceholderMap(answers)`
- Produces: `runCreateProject(answers, deps)`

Steps:

1. Write the failing test:

```js
// tools/create-project/index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { runCreateProject } from './index.mjs';

test('runCreateProject copies, replaces placeholders, and runs setup in order', async () => {
  const calls = [];
  const deps = {
    copyTemplate: async (src, dest) => calls.push({ step: 'copy', src, dest }),
    replacePlaceholders: async (dest, map) => calls.push({ step: 'replace', dest, map }),
    runSetup: async (dest) => calls.push({ step: 'setup', dest }),
    exec: async () => {},
    templatesDir: path.join('repo', 'templates'),
  };
  const answers = {
    template: 'nextjs-react',
    projectName: 'acme-app',
    themePrimary: '#ff0000',
    apiBaseUrl: 'https://api.acme.com',
    destination: path.join('dest', 'acme-app'),
  };

  const destDir = await runCreateProject(answers, deps);

  assert.equal(destDir, path.resolve(answers.destination));
  assert.deepEqual(calls.map((c) => c.step), ['copy', 'replace', 'setup']);
  assert.equal(calls[0].src, path.join('repo', 'templates', 'nextjs-react'));
  assert.deepEqual(calls[1].map, {
    __PROJECT_NAME__: 'acme-app',
    __THEME_PRIMARY__: '#ff0000',
    __API_BASE_URL__: 'https://api.acme.com',
  });
});
```

2. Run it, expect FAIL:

```
node --test tools/create-project/index.test.mjs
```
Expected error: `Cannot find module './index.mjs'`

3. Write the minimal implementation:

```js
// tools/create-project/index.mjs
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import prompts from 'prompts';
import { copyTemplate } from './copy.mjs';
import { replacePlaceholders } from './replace-placeholders.mjs';
import { runSetup } from './setup.mjs';
import { buildPlaceholderMap } from './build-placeholder-map.mjs';

const execFileAsync = promisify(execFile);
const CREATE_PROJECT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.dirname(path.dirname(CREATE_PROJECT_DIR));
const TEMPLATES_DIR = path.join(REPO_ROOT, 'templates');

export async function runCreateProject(
  answers,
  { copyTemplate, replacePlaceholders, runSetup, exec, templatesDir }
) {
  const srcDir = path.join(templatesDir, answers.template);
  const destDir = path.resolve(answers.destination);

  await copyTemplate(srcDir, destDir);
  await replacePlaceholders(destDir, buildPlaceholderMap(answers));
  await runSetup(destDir, { exec });

  return destDir;
}

async function main() {
  const templateEntries = await fs.readdir(TEMPLATES_DIR, { withFileTypes: true });
  const templateChoices = templateEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ title: entry.name, value: entry.name }));

  const answers = await prompts([
    { type: 'select', name: 'template', message: 'Elegí una plantilla', choices: templateChoices },
    { type: 'text', name: 'projectName', message: 'Nombre del proyecto' },
    { type: 'text', name: 'themePrimary', message: 'Color primario del tema (hex)' },
    { type: 'text', name: 'apiBaseUrl', message: 'URL base de la API externa' },
    {
      type: 'text',
      name: 'destination',
      message: 'Ruta destino',
      initial: (prev, values) => path.join('..', values.projectName),
    },
  ]);

  const destDir = await runCreateProject(answers, {
    copyTemplate,
    replacePlaceholders,
    runSetup,
    exec: (cmd, args, options) => execFileAsync(cmd, args, options),
    templatesDir: TEMPLATES_DIR,
  });

  console.log(`\nProyecto creado en ${destDir}`);
  console.log(`\nPróximos pasos:\n  cd ${path.relative(process.cwd(), destDir)}\n  pnpm dev`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

4. Run the test, expect PASS:

```
node --test tools/create-project/index.test.mjs
```

5. Commit:

```
git add tools/create-project/index.mjs tools/create-project/index.test.mjs
git commit -m "feat: orchestrate template copy, placeholder replacement, and setup in CLI"
```

---

## Manual step after execution (not a task — no test applies)

Run `pnpm install` at the repo root once to actually install `prompts`
before using `pnpm create:project` for real (tests for Tasks 2-6 do not
require it, since they inject fakes instead of importing `prompts`).
