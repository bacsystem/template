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
