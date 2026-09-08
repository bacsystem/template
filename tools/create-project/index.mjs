import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import prompts from 'prompts';
import { copyTemplate } from './copy.mjs';
import { replacePlaceholders } from './replace-placeholders.mjs';
import { runSetup } from './setup.mjs';
import { buildPlaceholderMap } from './build-placeholder-map.mjs';
import { createExec } from './exec.mjs';

const CREATE_PROJECT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.dirname(path.dirname(CREATE_PROJECT_DIR));
const TEMPLATES_DIR = path.join(REPO_ROOT, 'templates');

// `deps` is deliberately not destructured: destructuring would shadow the
// module-level imports of the same name, so dropping a dependency would
// silently fall back to the real implementation instead of failing a test.
export async function runCreateProject(answers, deps) {
  const srcDir = path.join(deps.templatesDir, answers.template);
  const destDir = path.resolve(answers.destination);

  await deps.copyTemplate(srcDir, destDir);
  await deps.replacePlaceholders(destDir, deps.buildPlaceholderMap(answers));
  const { committed } = await deps.runSetup(destDir, { exec: deps.exec });

  return { destDir, committed };
}

async function main() {
  const templateEntries = await fs.readdir(TEMPLATES_DIR, { withFileTypes: true });
  const templateChoices = templateEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ title: entry.name, value: entry.name }));

  if (templateChoices.length === 0) {
    console.error('No hay plantillas en templates/. Agregá una antes de correr este CLI.');
    process.exit(1);
  }

  const answers = await prompts(
    [
      { type: 'select', name: 'template', message: 'Elegí una plantilla', choices: templateChoices },
      {
        type: 'text',
        name: 'projectName',
        message: 'Nombre del proyecto',
        validate: (value) => (value.trim() ? true : 'El nombre del proyecto no puede estar vacío'),
      },
      { type: 'text', name: 'themePrimary', message: 'Color primario del tema (hex)' },
      { type: 'text', name: 'apiBaseUrl', message: 'URL base de la API externa' },
      {
        type: 'text',
        name: 'destination',
        message: 'Ruta destino',
        initial: (prev, values) => path.join('..', values.projectName),
      },
    ],
    {
      onCancel: () => {
        console.log('\nCancelado.');
        process.exit(1);
      },
    }
  );

  const { destDir } = await runCreateProject(answers, {
    copyTemplate,
    replacePlaceholders,
    runSetup,
    buildPlaceholderMap,
    exec: createExec(),
    templatesDir: TEMPLATES_DIR,
  });

  console.log(`\nProyecto creado en ${destDir}`);
  console.log(`\nPróximos pasos:\n  cd ${path.relative(process.cwd(), destDir)}\n  pnpm dev`);
}

// argv[1] is undefined when this module is imported from a context with no
// entry script (`node -e`, the REPL), and pathToFileURL throws on undefined.
const entryScript = process.argv[1];
if (entryScript && import.meta.url === pathToFileURL(entryScript).href) {
  main();
}
