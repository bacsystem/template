// Single source of truth for the cookie/header names shared across the auth
// route handlers and middleware — previously duplicated as identical string
// literals in three separate files, with no guard against them drifting.
export const AUTH_COOKIE = 'session_token';
export const CSRF_COOKIE = 'csrf_token';
export const CSRF_HEADER = 'x-csrf-token';
