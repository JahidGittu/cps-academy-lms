'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff, KeyRound, UserPlus } from 'lucide-react';

import { errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';
import { Alert, Button, Field } from '@/components/ui';

// A visitor who has just read the syllabus and decided to take the course should not have to leave
// the page, find the signup screen, and then find their way back to remember which course it was.
// The account is made here, and the page enrols them as soon as it knows the account is a student.
export const JoinForm = ({ onAuthenticated }: { onAuthenticated: (who: User) => void }) => {
  const { login, register } = useAuth();

  const [existing, setExisting] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!existing) {
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
    }

    setBusy(true);

    try {
      const who = existing
        ? await login(email.trim().toLowerCase(), password)
        : await register(fullName.trim(), email.trim().toLowerCase(), password);

      if (who) return onAuthenticated(who);

      setError('Signed in, but the account could not be read back.');
    } catch (caught) {
      setError(
        errorMessage(
          caught,
          existing ? 'Could not sign in. Please verify your email and password.' : 'Could not create account.'
        )
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleMode = () => {
    setExisting(!existing);
    setError('');
  };

  return (
    <div className="rounded-xl border border-theme bg-surface p-4 sm:p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold text-primary">
          {existing ? 'Sign in to Enroll' : 'Create Account & Enroll'}
        </h3>
        <p className="text-xs text-muted mt-0.5">
          {existing
            ? 'Enter your email & password to enroll in this course track.'
            : 'Register your student account to unlock lessons and track progress.'}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3.5">
        {!existing && (
          <Field
            label="Full Name"
            value={fullName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
            autoComplete="name"
            placeholder="e.g. Jahid Hasan"
            required
          />
        )}

        <Field
          label="Email Address"
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="your@email.com"
          required
        />

        {/* Password */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-secondary">
            Password {existing ? '' : '(min 6 characters)'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={existing ? 'current-password' : 'new-password'}
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

        {/* Confirm Password (only on signup) */}
        {!existing && (
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-secondary">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
        )}

        <Alert>{error}</Alert>

        <Button
          type="submit"
          disabled={busy}
          className="w-full bg-sky-600 hover:bg-sky-500 font-bold py-2.5 shadow-md shadow-sky-600/20"
        >
          {busy ? (
            'Processing...'
          ) : existing ? (
            <span className="flex items-center justify-center gap-1.5">
              <KeyRound className="size-4" />
              <span>Sign in & Enroll</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <UserPlus className="size-4" />
              <span>Create Account & Enroll</span>
            </span>
          )}
        </Button>

        <p className="text-center text-xs text-muted">
          {existing ? "Don't have an account yet?" : 'Already registered?'}{' '}
          <button
            type="button"
            onClick={toggleMode}
            className="font-bold text-sky-400 hover:text-sky-300 underline underline-offset-2 cursor-pointer"
          >
            {existing ? 'Register & Enroll' : 'Sign in'}
          </button>
        </p>
      </form>
    </div>
  );
};
