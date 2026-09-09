import { NextRequest, NextResponse } from 'next/server';
import { apiFetch } from '@/shared/lib/http';
import { handleApiError } from '@/shared/lib/api-error-response';
import { isValidCsrfToken } from '@/shared/lib/csrf';
import { AUTH_COOKIE } from '@/shared/lib/cookies';

export async function POST(request: NextRequest) {
  if (!isValidCsrfToken(request)) {
    return NextResponse.json({ message: 'Invalid CSRF token' }, { status: 403 });
  }

  let email: unknown;
  let password: unknown;
  try {
    ({ email, password } = await request.json());
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

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
    return handleApiError(error);
  }
}
