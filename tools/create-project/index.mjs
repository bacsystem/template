import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
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

  const answers = await prompts(
    [
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
    ],
    {
      onCancel: () => {
        console.log('\nCancelado.');
        process.exit(1);
      },
    }
  );

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

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
