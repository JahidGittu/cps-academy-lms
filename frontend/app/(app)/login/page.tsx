'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, Sparkles } from 'lucide-react';

import { errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Alert, Button, Field } from '@/components/ui';
import { AuthFrame } from '@/components/auth-frame';

const points = [
  'Dynamic lesson progression & resumption',
  'Verified sequential unlock order',
  'Instant server auto-graded quiz assessments',
];

const DEMO_USERS = [
  { label: 'Student', email: 'student@demo.test', pass: 'demo12345', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'Instructor', email: 'instructor@demo.test', pass: 'demo12345', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { label: 'Content Mgr', email: 'manager@demo.test', pass: 'demo12345', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Admin', email: 'admin@demo.test', pass: 'demo12345', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const fillDemo = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setError('');
  };

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
      title="Sign in to CPS Academy"
      lead="Access your personalized learning path and courses."
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
      <form onSubmit={submit} className="space-y-4">
        {/* Quick Demo Credentials Autofill Box */}
        <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-3.5 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-800 mb-2">
            <Sparkles className="size-3.5 text-brand-600" />
            <span>Quick Demo Role Sign-in:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.label}
                type="button"
                onClick={() => fillDemo(demo.email, demo.pass)}
                className={`rounded-lg border px-2 py-1 text-xs font-semibold text-center transition hover:opacity-80 active:scale-95 ${demo.badge}`}
              >
                {demo.label}
              </button>
            ))}
          </div>
        </div>

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
          <span>{busy ? 'Authenticating...' : 'Sign in'}</span>
        </Button>
      </form>
    </AuthFrame>
  );
}
