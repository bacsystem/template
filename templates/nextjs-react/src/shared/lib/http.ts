export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export interface ApiFetchOptions extends RequestInit {
  // Auth attempts (login) legitimately return 401 for wrong credentials —
  // that isn't a stale session, so it must not trigger the redirect below.
  skipAuthRedirect?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { skipAuthRedirect, ...init } = options;

  // Normalize through the Headers constructor rather than object-spreading
  // options.headers directly: a caller-supplied Headers instance or
  // [string, string][] tuple list (both valid HeadersInit forms) has no own
  // enumerable properties, so spreading it silently drops every entry.
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, { ...init, headers });

  if (response.status === 401 && !skipAuthRedirect && typeof window !== 'undefined') {
    window.location.assign('/login');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      body?.message ?? response.statusText,
      body?.details
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
