import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('globals.css declares the expanded design-system token set', () => {
  const css = readFileSync(new URL('../src/styles/globals.css', import.meta.url), 'utf8');
  const tokens = [
    '--color-border',
    '--color-muted',
    '--color-muted-foreground',
    '--color-card',
    '--color-card-foreground',
    '--color-destructive',
    '--color-destructive-foreground',
    '--color-success',
    '--color-success-foreground',
    '--color-warning',
    '--color-warning-foreground',
  ];
  for (const token of tokens) {
    assert.match(css, new RegExp(`${token}:`), `missing token ${token}`);
  }
});
