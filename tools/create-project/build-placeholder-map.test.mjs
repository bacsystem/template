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
