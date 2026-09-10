'use client';

import * as React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(createQueryClient);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'bg-card text-card-foreground border border-border shadow-md',
              success: 'bg-success text-success-foreground border-success',
              error: 'bg-destructive text-destructive-foreground border-destructive',
              warning: 'bg-warning text-warning-foreground border-warning',
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
