import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { runCreateProject } from './index.mjs';

test('runCreateProject copies, replaces placeholders, and runs setup in order', async () => {
  const calls = [];
  const deps = {
    copyTemplate: async (src, dest) => calls.push({ step: 'copy', src, dest }),
    replacePlaceholders: async (dest, map) => calls.push({ step: 'replace', dest, map }),
    runSetup: async (dest) => {
      calls.push({ step: 'setup', dest });
      return { committed: true };
    },
    buildPlaceholderMap: (answers) => ({ __PROJECT_NAME__: answers.projectName }),
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

  const result = await runCreateProject(answers, deps);

  assert.equal(result.destDir, path.resolve(answers.destination));
  assert.equal(result.committed, true);
  assert.deepEqual(calls.map((c) => c.step), ['copy', 'replace', 'setup']);
  assert.equal(calls[0].src, path.join('repo', 'templates', 'nextjs-react'));
  assert.deepEqual(calls[1].map, { __PROJECT_NAME__: 'acme-app' });
});

test('runCreateProject uses the injected placeholder map builder, not the module import', async () => {
  let builderCalled = false;
  const deps = {
    copyTemplate: async () => {},
    replacePlaceholders: async () => {},
    runSetup: async () => ({ committed: true }),
    buildPlaceholderMap: () => {
      builderCalled = true;
      return {};
    },
    exec: async () => {},
    templatesDir: 'templates',
  };

  await runCreateProject({ template: 't', destination: 'dest' }, deps);

  assert.ok(builderCalled);
});
