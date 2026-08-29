'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

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

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirmation password do not match.');
      return;
    }

    setBusy(true);

    try {
      await register(fullName.trim(), email.trim().toLowerCase(), password);
      router.push('/dashboard');
    } catch (caught) {
      setError(errorMessage(caught, 'Could not create account. Please verify your details.'));
      setBusy(false);
    }
  };

  if (loading || user) {
    return <LoadingState />;
  }

  return (
    <AuthFrame
      title="Create Student Account"
      lead="Register with your name and email to start enrolling in engineering tracks."
      aside="An account is what makes a course something you can come back to."
      points={points}
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Full Name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
          placeholder="e.g. Jahid Hasan"
          required
        />

        <Field
          label="Email Address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="your@email.com"
          required
        />

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-secondary">
            Password (min 6 characters)
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-secondary">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              placeholder="••••••••"
              required
              className="w-full rounded-md border border-theme bg-canvas pl-3 pr-10 py-2 text-xs sm:text-sm text-primary placeholder:text-muted outline-none focus:border-active focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition p-0.5 cursor-pointer"
              title={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Alert>{error}</Alert>

        <p className="text-xs text-muted">
          New accounts are registered as <strong>Students</strong>. Instructor and staff accounts are assigned by an Admin.
        </p>

        <Button type="submit" disabled={busy} className="w-full gap-2 font-bold py-2.5">
          <UserPlus className="size-4" />
          <span>{busy ? 'Creating Student Account...' : 'Create Account'}</span>
        </Button>
      </form>
    </AuthFrame>
  );
}
