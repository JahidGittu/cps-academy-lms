'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Alert, Button, Card, Field } from '@/components/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      await login(identifier, password);
      router.push('/dashboard');
    } catch (caught) {
      setError(errorMessage(caught, 'Could not sign in'));
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>

      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Field
            label="Username or email"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
            required
          />

          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <Alert>{error}</Alert>

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Signing in' : 'Sign in'}
          </Button>
        </form>
      </Card>

      <p className="mt-4 text-center text-sm text-slate-500">
        No account yet?{' '}
        <Link href="/register" className="text-slate-900 underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
