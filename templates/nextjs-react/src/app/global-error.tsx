'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-lg font-medium">A critical error occurred.</p>
          <p className="text-sm text-foreground/70">
            {error.digest ? `Reference: ${error.digest}` : 'Please try again.'}
          </p>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
