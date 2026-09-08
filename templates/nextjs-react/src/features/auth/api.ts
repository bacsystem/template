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
  const csrfResponse = await fetch('/api/auth/csrf');
  const { csrfToken } = await csrfResponse.json();

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? 'Login failed');
  }

  return response.json();
}
