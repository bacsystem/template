import { NextRequest } from 'next/server';
import { CSRF_COOKIE, CSRF_HEADER } from '@/shared/lib/cookies';

export function isValidCsrfToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);
  return Boolean(cookieToken) && cookieToken === headerToken;
}
