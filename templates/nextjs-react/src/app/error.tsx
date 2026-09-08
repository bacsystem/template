'use client';

import { Button } from '@/shared/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-lg font-medium">Something went wrong.</p>
      <p className="text-sm text-foreground/70">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
