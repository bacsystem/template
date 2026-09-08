import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

const CSRF_COOKIE = 'csrf_token';

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
