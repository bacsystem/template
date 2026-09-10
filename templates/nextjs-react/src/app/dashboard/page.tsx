'use client';

import { Button } from '@/shared/components/ui/button';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';

export default function DashboardPage() {
  const { data, isPending, isError, refetch } = useDashboard();

  if (isPending) {
    return <p className="p-8">Loading…</p>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <p>Could not load the dashboard.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-4 p-8">
      <p>Total items: {data.totalItems}</p>
      <p>Last updated: {data.lastUpdated}</p>
    </main>
  );
}
