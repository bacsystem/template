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
});
