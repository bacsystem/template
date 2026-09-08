import { apiFetch } from '@/shared/lib/http';

export interface DashboardSummary {
  totalItems: number;
  lastUpdated: string;
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>('/api/dashboard/summary');
}
