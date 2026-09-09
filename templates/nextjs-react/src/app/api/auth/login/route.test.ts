import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { mswServer } from '../../../../../tests/mocks/server';
import { POST } from './route';

function requestWithCsrf(body: unknown) {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { cookie: 'csrf_token=valid-token', 'x-csrf-token': 'valid-token' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/login', () => {
  it('rejects requests without a matching CSRF token', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.com', password: 'secret' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it('sets an httpOnly session cookie on success', async () => {
    mswServer.use(
      http.post('https://api.test/auth/login', () =>
        HttpResponse.json({ token: 'jwt-token', user: { id: '1', email: 'a@b.com' } })
      )
    );

    const response = await POST(requestWithCsrf({ email: 'a@b.com', password: 'secret' }));
    const cookie = response.cookies.get('session_token');

    expect(response.status).toBe(200);
    expect(cookie?.value).toBe('jwt-token');
    expect(cookie?.httpOnly).toBe(true);
  });

  it('forwards the external API error status and message on failure', async () => {
    mswServer.use(
      http.post('https://api.test/auth/login', () =>
        HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
      )
    );

    const response = await POST(requestWithCsrf({ email: 'a@b.com', password: 'wrong' }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe('Invalid credentials');
  });

  it('returns a 400 instead of throwing when the body is not valid JSON', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { cookie: 'csrf_token=valid-token', 'x-csrf-token': 'valid-token' },
      body: 'not-json',
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe('Invalid request body');
  });

  it('returns a 400 when email or password are not strings', async () => {
    const response = await POST(requestWithCsrf({ email: { nested: true }, password: 123 }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe('Invalid request body');
  });
});
