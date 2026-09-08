import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiFetch } from '@/shared/lib/http';
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
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}
