import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { CSRF_COOKIE } from '@/shared/lib/cookies';

export async function GET() {
  const token = randomUUID();
  const response = NextResponse.json({ csrfToken: token });
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
