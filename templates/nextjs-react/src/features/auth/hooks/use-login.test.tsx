import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useLogin } from './use-login';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useLogin', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.getState().clearUser();
  });

  it('stores the returned user on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              user: { id: '1', email: 'a@b.com', name: 'Ada' },
            }),
            {
              status: 200,
            }
          )
      )
    );

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ email: 'a@b.com', password: 'secret' });

    await waitFor(() =>
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    );
    expect(useAuthStore.getState().user?.email).toBe('a@b.com');
  });
});
