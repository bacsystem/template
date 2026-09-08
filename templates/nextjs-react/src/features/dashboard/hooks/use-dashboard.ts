'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@/features/dashboard/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardSummary,
  });
}
