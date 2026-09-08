'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { useLogin } from '@/features/auth/hooks/use-login';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { mutate, isPending, error } = useLogin();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    mutate({ email, password }, { onSuccess: () => router.push('/dashboard') });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-3"
      >
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="rounded-md border border-input px-3 py-2"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="rounded-md border border-input px-3 py-2"
        />
        {error ? (
          <p className="text-sm font-medium text-foreground">{error.message}</p>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </main>
  );
}
