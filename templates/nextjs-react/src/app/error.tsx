'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // error.message may contain internal details (stack context, thrown
    // values from third-party code) that shouldn't reach end users — log it
    // for developers/observability and show only a safe reference below.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-lg font-medium">Something went wrong.</p>
      <p className="text-sm text-foreground/70">
        {error.digest ? `Reference: ${error.digest}` : 'Please try again.'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
