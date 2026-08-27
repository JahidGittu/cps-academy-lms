'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Alert, Button, Field } from '@/components/ui';
import { AuthFrame } from '@/components/auth-frame';

const points = [
  'Your courses are where you left them',
  'The next lesson is the one that opens',
  'Old quiz results are still readable',
];

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
    <AuthFrame
      title="Sign in"
      lead="Pick up wherever you stopped last time."
      aside="Nothing to work out again. The course remembers where you got to."
      points={points}
      footer={
        <>
          No account yet?{' '}
          <Link href="/register" className="font-medium text-brand-700 underline">
            Create one
          </Link>
        </>
      }
    >
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
    </AuthFrame>
  );
}
