import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('GET /api/auth/csrf', () => {
  it('issues a CSRF token cookie and returns it in the body', async () => {
    const response = await GET();
    const body = await response.json();
    const cookie = response.cookies.get('csrf_token');

    expect(cookie?.value).toBe(body.csrfToken);
    expect(cookie?.httpOnly).toBe(false);
  });
});
