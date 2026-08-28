'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

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
  const [values, setValues] = useState({ username: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof typeof values) => (event: ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const who = existing
        ? await login(values.username, values.password)
        : await register(values.username, values.email, values.password);

      // Not released on the way out. The panel around this form is about to be replaced by the
      // progress one, and a button that comes back to life first invites a second signup.
      if (who) return onAuthenticated(who);

      setError('Signed in, but the account could not be read back');
    } catch (caught) {
      setError(errorMessage(caught, existing ? 'Could not sign in' : 'Could not make the account'));
    }

    setBusy(false);
  };

  const toggleMode = () => {
    setExisting(!existing);
    setError('');
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field
        label={existing ? 'Username or Email' : 'Username'}
        value={values.username}
        onChange={set('username')}
        autoComplete="username"
        required
      />

      {!existing && (
        <Field
          label="Email"
          type="email"
          value={values.email}
          onChange={set('email')}
          autoComplete="email"
          required
        />
      )}

      <Field
        label="Password"
        type="password"
        value={values.password}
        onChange={set('password')}
        autoComplete={existing ? 'current-password' : 'new-password'}
        required
      />

      <Alert>{error}</Alert>

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? 'Working...' : existing ? 'Sign in & Enrol' : 'Create account & Enrol'}
      </Button>

      <p className="text-center text-xs text-slate-500">
        {existing ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={toggleMode}
          className="font-semibold text-brand-700 hover:text-brand-800 underline underline-offset-2"
        >
          {existing ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </form>
  );
};
