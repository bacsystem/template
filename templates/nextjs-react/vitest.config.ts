import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    env: {
      API_BASE_URL: 'https://api.test',
    },
    // *.test.mjs files run on Node's built-in test runner (root-config,
    // deploy-config) — plain config/deploy assertions with no need for
    // jsdom or TS. Vitest's glob would otherwise pick them up and fail
    // with "No test suite found" since they use node:test, not vitest.
    exclude: [...configDefaults.exclude, '**/*.test.mjs'],
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
});
