'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

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
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // If already authenticated, automatically redirect user to their role-specific dashboard
  useEffect(() => {
    if (!loading && user) {
      if (
        redirectTarget &&
        redirectTarget.startsWith('/') &&
        !redirectTarget.startsWith('//')
      ) {
        router.replace(redirectTarget);
      } else {
        const isAdmin = user?.role?.name === 'Admin';
        router.replace(isAdmin ? '/admin' : '/dashboard');
      }
    }
  }, [user, loading, redirectTarget, router]);

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

  if (loading || user) {
    return <LoadingState />;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field
        label="Email Address"
        type="email"
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        autoComplete="email"
        placeholder="your@email.com"
        required
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-secondary">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            className="w-full rounded-md border border-theme bg-canvas pl-3 pr-10 py-2 text-xs sm:text-sm text-primary placeholder:text-muted outline-none focus:border-active focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition p-0.5 cursor-pointer"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

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
