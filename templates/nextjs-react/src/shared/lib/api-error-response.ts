import { NextResponse } from 'next/server';
import { ApiError } from '@/shared/lib/http';

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
}
