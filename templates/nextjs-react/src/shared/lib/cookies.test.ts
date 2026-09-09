import { describe, expect, it } from 'vitest';
import { AUTH_COOKIE, CSRF_COOKIE, CSRF_HEADER } from './cookies';

describe('cookie/header name constants', () => {
  it('are non-empty and distinct from each other', () => {
    const values = [AUTH_COOKIE, CSRF_COOKIE, CSRF_HEADER];
    expect(values.every((value) => value.length > 0)).toBe(true);
    expect(new Set(values).size).toBe(values.length);
  });
});
