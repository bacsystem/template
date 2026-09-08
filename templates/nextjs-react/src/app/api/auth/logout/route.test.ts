import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

describe('POST /api/auth/logout', () => {
  it('rejects requests without a matching CSRF token', async () => {
    const request = new NextRequest('http://localhost/api/auth/logout', { method: 'POST' });

    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it('clears the session cookie when the CSRF token matches', async () => {
    const request = new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: { cookie: 'csrf_token=valid-token', 'x-csrf-token': 'valid-token' },
    });

    const response = await POST(request);
    const cookie = response.cookies.get('session_token');

    expect(response.status).toBe(200);
    expect(cookie?.value).toBe('');
  });
});
