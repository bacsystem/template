import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { mswServer } from '../../../../../tests/mocks/server';
import { GET } from './route';

describe('GET /api/dashboard/summary', () => {
  it('rejects requests without a session cookie', async () => {
    const request = new NextRequest('http://localhost/api/dashboard/summary');

    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('forwards the session token and returns the summary on success', async () => {
    mswServer.use(
      http.get('https://api.test/dashboard/summary', ({ request }) => {
        if (request.headers.get('Authorization') !== 'Bearer jwt-token') {
          return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        return HttpResponse.json({ totalItems: 3, lastUpdated: '2026-09-07' });
      })
    );

    const request = new NextRequest('http://localhost/api/dashboard/summary', {
      headers: { cookie: 'session_token=jwt-token' },
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ totalItems: 3, lastUpdated: '2026-09-07' });
  });

  it('forwards the external API error status and message on failure', async () => {
    mswServer.use(
      http.get('https://api.test/dashboard/summary', () =>
        HttpResponse.json({ message: 'Service unavailable' }, { status: 503 })
      )
    );

    const request = new NextRequest('http://localhost/api/dashboard/summary', {
      headers: { cookie: 'session_token=jwt-token' },
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.message).toBe('Service unavailable');
  });
});
