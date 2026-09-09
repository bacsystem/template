import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { isValidCsrfToken } from './csrf';

describe('isValidCsrfToken', () => {
  it('returns true when the header matches the cookie', () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { cookie: 'csrf_token=abc123', 'x-csrf-token': 'abc123' },
    });

    expect(isValidCsrfToken(request)).toBe(true);
  });

  it('returns false when the header is missing or does not match', () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { cookie: 'csrf_token=abc123' },
    });

    expect(isValidCsrfToken(request)).toBe(false);
  });
});
