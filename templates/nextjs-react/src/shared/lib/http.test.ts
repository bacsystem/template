import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, ApiError } from './http';

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () => new Response(JSON.stringify({ ok: true }), { status: 200 })
      )
    );

    const result = await apiFetch<{ ok: boolean }>('/api/example');

    expect(result).toEqual({ ok: true });
  });

  it('throws a normalized ApiError on failure responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ message: 'Not found' }), {
            status: 404,
          })
      )
    );

    await expect(apiFetch('/api/missing')).rejects.toBeInstanceOf(ApiError);
    await expect(apiFetch('/api/missing')).rejects.toMatchObject({
      status: 404,
      message: 'Not found',
    });
  });

  it('preserves caller headers passed as a Headers instance', async () => {
    let receivedHeaders: Headers | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url, init) => {
        receivedHeaders = new Headers(init?.headers);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      })
    );

    await apiFetch('/api/example', {
      headers: new Headers({ Authorization: 'Bearer jwt-token' }),
    });

    expect(receivedHeaders?.get('Authorization')).toBe('Bearer jwt-token');
    expect(receivedHeaders?.get('Content-Type')).toBe('application/json');
  });
});
