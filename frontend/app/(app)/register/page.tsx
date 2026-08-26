'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Alert, Button, Card, Field } from '@/components/ui';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold">Sign up</h1>

      <Card>
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
      </Card>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-slate-900 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
