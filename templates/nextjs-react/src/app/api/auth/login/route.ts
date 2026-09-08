import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiFetch } from '@/shared/lib/http';
import { isValidCsrfToken } from '@/shared/lib/csrf';
import { AUTH_COOKIE } from '@/shared/lib/cookies';

export async function POST(request: NextRequest) {
  if (!isValidCsrfToken(request)) {
    return NextResponse.json({ message: 'Invalid CSRF token' }, { status: 403 });
  }

  const { email, password } = await request.json();

  try {
    const { token, user } = await apiFetch<{ token: string; user: unknown }>(
      `${process.env.API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    const response = NextResponse.json({ user });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}
