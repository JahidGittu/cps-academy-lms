'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Alert, Button, Field, LoadingState } from '@/components/ui';
import { AuthFrame } from '@/components/auth-frame';

const points = [
  'Every course you enrol in, in one place',
  'Lessons open in order and stay marked off',
  'Quiz scores kept with the answers you gave',
];

export default function RegisterPage() {
  const { user, loading, register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // If already authenticated, redirect to role-specific dashboard
  useEffect(() => {
    if (!loading && user) {
      const isAdmin = user?.role?.name === 'Admin';
      router.replace(isAdmin ? '/admin' : '/dashboard');
    }
  }, [user, loading, router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      await register(username, email, password);
      router.push('/dashboard');
    } catch (caught) {
      setError(errorMessage(caught, 'Could not sign up'));
      setBusy(false);
    }
  };

  if (loading || user) {
    return <LoadingState />;
  }

  return (
    <AuthFrame
      title="Create an account"
      lead="It takes a minute, and the first course is open as soon as you enrol."
      aside="An account is what makes a course something you can come back to."
      points={points}
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand-700 underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />

        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />

        <Alert>{error}</Alert>

        {/* There is no role picker on purpose. A visitor who could choose their own role could
            choose Admin, and every rule in the permission matrix would be theirs to change. */}
        <p className="text-xs text-slate-500">
          New accounts are Students. Instructor and staff accounts are created by an admin.
        </p>

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Creating account' : 'Create account'}
        </Button>
      </form>
    </AuthFrame>
  );
}
