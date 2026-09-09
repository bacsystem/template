import { apiFetch } from '@/shared/lib/http';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { csrfToken } = await apiFetch<{ csrfToken: string }>('/api/auth/csrf');

  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    headers: { 'x-csrf-token': csrfToken },
    body: JSON.stringify(payload),
    // A failed login legitimately returns 401 (wrong credentials) — that
    // must surface as a form error, not bounce the user back to /login.
    skipAuthRedirect: true,
  });
}
