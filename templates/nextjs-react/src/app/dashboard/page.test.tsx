import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from './page';
import DashboardLayout from './layout';

function renderDashboardPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardPage />
    </QueryClientProvider>
  );
}

function renderComposedDashboardRoute() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    </QueryClientProvider>
  );
}

describe('DashboardPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the loading state, then the summary on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ totalItems: 3, lastUpdated: '2026-09-07' }), {
            status: 200,
          })
      )
    );

    renderDashboardPage();

    expect(screen.getByText('Loading…')).toBeInTheDocument();

    expect(await screen.findByText('Total items: 3')).toBeInTheDocument();
    expect(screen.getByText('Last updated: 2026-09-07')).toBeInTheDocument();
  });

  it('shows an error state with a retry button on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ message: 'boom' }), { status: 500 }))
    );

    renderDashboardPage();

    expect(await screen.findByText('Could not load the dashboard.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('does not render its own heading — the title now lives in the layout Header', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ totalItems: 3, lastUpdated: '2026-09-07' }), {
            status: 200,
          })
      )
    );

    renderDashboardPage();

    await screen.findByText('Total items: 3');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});

describe('DashboardPage composed with DashboardLayout', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders exactly one "Dashboard" heading, from the Header, alongside the page content', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ totalItems: 3, lastUpdated: '2026-09-07' }), {
            status: 200,
          })
      )
    );

    renderComposedDashboardRoute();

    expect(await screen.findByText('Total items: 3')).toBeInTheDocument();
    expect(screen.getAllByRole('heading')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });
});
