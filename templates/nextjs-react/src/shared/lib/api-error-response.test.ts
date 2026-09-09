import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/http';
import { handleApiError } from './api-error-response';

describe('handleApiError', () => {
  it('maps an ApiError to its own status and message', async () => {
    const response = handleApiError(new ApiError(404, 'Not found'));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe('Not found');
  });

  it('maps any other error to a generic 500', async () => {
    const response = handleApiError(new Error('boom'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe('Unexpected error');
  });
});
