import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './page';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

function renderLoginPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginPage />
    </QueryClientProvider>
  );
}

describe('LoginPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    push.mockClear();
  });

  it('logs in and navigates to the dashboard on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.toString().includes('/api/auth/csrf')) {
          return new Response(JSON.stringify({ csrfToken: 'token' }), { status: 200 });
        }
        return new Response(
          JSON.stringify({ user: { id: '1', email: 'a@b.com', name: 'Ada' } }),
          { status: 200 }
        );
      })
    );

    renderLoginPage();

    await userEvent.type(screen.getByPlaceholderText('Email'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
  });

  it('shows the error message and does not navigate on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.toString().includes('/api/auth/csrf')) {
          return new Response(JSON.stringify({ csrfToken: 'token' }), { status: 200 });
        }
        return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
      })
    );

    renderLoginPage();

    await userEvent.type(screen.getByPlaceholderText('Email'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
