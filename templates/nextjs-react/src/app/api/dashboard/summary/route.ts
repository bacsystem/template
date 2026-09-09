import { NextRequest, NextResponse } from 'next/server';
import { apiFetch } from '@/shared/lib/http';
import { handleApiError } from '@/shared/lib/api-error-response';
import { AUTH_COOKIE } from '@/shared/lib/cookies';
import type { DashboardSummary } from '@/features/dashboard/api';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const summary = await apiFetch<DashboardSummary>(
      `${process.env.API_BASE_URL}/dashboard/summary`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return NextResponse.json(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
