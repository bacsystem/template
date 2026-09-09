import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/shared/lib/cookies';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE);
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Single source of truth for which routes require auth: Next only invokes
// this middleware for requests matching this pattern, so protecting a new
// route means adding it here — there is no separate list that can drift out
// of sync with it.
export const config = {
  matcher: ['/dashboard/:path*'],
};
