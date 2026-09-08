'use client';

import { useMutation } from '@tanstack/react-query';
import { login } from '@/features/auth/api';
import { useAuthStore } from '@/shared/stores/auth-store';

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setUser(data.user);
    },
  });
}
