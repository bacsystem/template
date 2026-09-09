import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from './auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearUser();
  });

  it('starts unauthenticated', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setUser marks the store authenticated', () => {
    useAuthStore.getState().setUser({ id: '1', email: 'a@b.com', name: 'Ada' });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('a@b.com');
  });

  it('clearUser resets the store', () => {
    useAuthStore.getState().setUser({ id: '1', email: 'a@b.com', name: 'Ada' });
    useAuthStore.getState().clearUser();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
