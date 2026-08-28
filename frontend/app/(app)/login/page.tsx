'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound } from 'lucide-react';

import { errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Alert, Button, Field, LoadingState } from '@/components/ui';
import { AuthFrame } from '@/components/auth-frame';

const points = [
  'Dynamic lesson progression and resumption',
  'Verified sequential unlock curriculum',
  'Instant server auto-graded assessments',
];

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const loggedInUser = await login(identifier, password);

      // Redirect user to the intended page or default role workspace
      if (
        redirectTarget &&
        redirectTarget.startsWith('/') &&
        !redirectTarget.startsWith('//')
      ) {
        router.push(redirectTarget);
      } else {
        const isAdmin = loggedInUser?.role?.name === 'Admin';
        router.push(isAdmin ? '/admin' : '/dashboard');
      }
    } catch (caught) {
      setError(errorMessage(caught, 'Could not sign in'));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field
        label="Username or Email"
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        autoComplete="username"
        placeholder="your@email.com"
        required
      />

      <Field
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        placeholder="••••••••"
        required
      />

      <Alert>{error}</Alert>

      <Button type="submit" disabled={busy} className="w-full gap-2">
        <KeyRound className="size-4" />
        <span>{busy ? 'Signing in...' : 'Sign in'}</span>
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthFrame
      title="Sign in to your account"
      lead="Enter your credentials to access your courses."
      aside="Strict role-based authorization with decoupled Next.js & Strapi architecture."
      points={points}
      footer={
        <>
          Need a new account?{' '}
          <Link href="/register" className="font-semibold text-brand-600 hover:underline">
            Register here
          </Link>
        </>
      }
    >
      <Suspense fallback={<LoadingState />}>
        <LoginForm />
      </Suspense>
    </AuthFrame>
  );
}

