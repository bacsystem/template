import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

describe('middleware', () => {
  it('redirects to /login when accessing a protected route without a session cookie', () => {
    const request = new NextRequest('http://localhost/dashboard');

    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/login');
  });

  it('allows the request through when a session cookie is present', () => {
    const request = new NextRequest('http://localhost/dashboard', {
      headers: { cookie: 'session_token=jwt-token' },
    });

    const response = middleware(request);

    expect(response.status).toBe(200);
  });
});
