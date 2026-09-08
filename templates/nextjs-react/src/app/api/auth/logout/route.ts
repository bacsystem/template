import { NextRequest, NextResponse } from 'next/server';
import { isValidCsrfToken } from '@/shared/lib/csrf';
import { AUTH_COOKIE } from '@/shared/lib/cookies';

export async function POST(request: NextRequest) {
  if (!isValidCsrfToken(request)) {
    return NextResponse.json({ message: 'Invalid CSRF token' }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
