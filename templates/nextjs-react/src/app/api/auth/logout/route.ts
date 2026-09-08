import { NextRequest, NextResponse } from 'next/server';
import { isValidCsrfToken } from '@/shared/lib/csrf';

const AUTH_COOKIE = 'session_token';

export async function POST(request: NextRequest) {
  if (!isValidCsrfToken(request)) {
    return NextResponse.json({ message: 'Invalid CSRF token' }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
