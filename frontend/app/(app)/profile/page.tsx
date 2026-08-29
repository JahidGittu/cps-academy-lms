'use client';

import { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Shield,
  KeyRound,
  Mail,
  Calendar,
  CheckCircle2,
  Lock,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Card } from '@/components/ui';
import { useSetBreadcrumbs } from '@/components/dashboard-shell';

const roleBadgeColor: Record<string, string> = {
  Admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Content Manager': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Instructor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  Student: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

const ProfileContent = () => {
  const { user, reloadUser } = useAuth();

  // Profile Edit State
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Reset State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const roleName = user?.role?.name ?? 'Student';

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileError('');
    setProfileSuccess(false);

    if (!username.trim()) {
      setProfileError('Username cannot be empty.');
      return;
    }

    setProfileBusy(true);

    try {
      await api.put(`/users/${user.id}`, {
        username: username.trim(),
      });

      await reloadUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (caught) {
      setProfileError(errorMessage(caught, 'Could not update profile information.'));
    } finally {
      setProfileBusy(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from your old password.');
      return;
    }

    setPasswordBusy(true);

    try {
      await api.post('/auth/change-password', {
        currentPassword,
        password: newPassword,
        passwordConfirmation: confirmPassword,
      });

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (caught) {
      setPasswordError(errorMessage(caught, 'Could not change password. Please verify your current password.'));
    } finally {
      setPasswordBusy(false);
    }
  };

  if (!user) return null;

  const isProfileDirty = Boolean(username.trim()) && username.trim() !== user.username;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. User Identity Profile Banner */}
      <div className="rounded-xl border border-theme bg-surface p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
          <div className="flex items-center gap-4">
            <div className="size-16 sm:size-20 rounded-2xl bg-brand-subtle border border-brand-border flex items-center justify-center text-xl sm:text-2xl font-black text-brand uppercase shadow-sm">
              {user.username.slice(0, 2)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
                  {user.username}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold border ${
                    roleBadgeColor[roleName] ?? 'bg-muted/10 text-muted border-theme'
                  }`}
                >
                  <Shield className="size-3.5" />
                  <span>{roleName}</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted flex items-center gap-2">
                <Mail className="size-3.5" />
                <span>{user.email}</span>
              </p>

              {user.createdAt && (
                <p className="text-[11px] text-muted flex items-center gap-1.5 pt-0.5">
                  <Calendar className="size-3" />
                  <span>
                    Member since{' '}
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-theme bg-canvas px-4 py-2.5 text-xs font-semibold text-secondary flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Authenticated Session</span>
          </div>
        </div>
      </div>

      {/* 2. Two-Column Layout: Edit Personal Profile vs Security & Password Reset */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Edit Personal Information */}
        <Card className="space-y-5">
          <div className="border-b border-subtle pb-4">
            <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
              <UserIcon className="size-5 text-sky-400" />
              <span>Personal Information</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Update your account username and email address.
            </p>
          </div>

          {profileSuccess && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="size-4" />
              <span>Profile information updated successfully!</span>
            </div>
          )}

          <Alert>{profileError}</Alert>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-primary">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username..."
                required
                className="w-full rounded-lg border border-theme bg-canvas px-3 py-2 text-xs sm:text-sm text-primary placeholder:text-muted outline-none focus:border-active focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-primary">
                Email Address (Read-only)
              </label>
              <div className="w-full rounded-lg border border-theme bg-elevated px-3 py-2 text-xs sm:text-sm font-medium text-secondary flex items-center justify-between">
                <span>{user.email}</span>
                <span className="text-[10px] text-muted font-bold uppercase">Primary ID</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-primary">
                Assigned Role (Read-only)
              </label>
              <div className="w-full rounded-lg border border-theme bg-elevated px-3 py-2 text-xs sm:text-sm font-semibold text-secondary flex items-center justify-between">
                <span>{roleName}</span>
                <span className="text-[10px] text-muted font-bold uppercase">Managed by Admin</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={profileBusy || !isProfileDirty}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2 text-xs shadow-md shadow-sky-600/20 transition cursor-pointer"
              >
                <Save className="size-3.5 mr-1.5" />
                <span>{profileBusy ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </Button>
            </div>
          </form>
        </Card>

        {/* Right Column: Security & Password Reset */}
        <Card className="space-y-5">
          <div className="border-b border-subtle pb-4">
            <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
              <KeyRound className="size-5 text-sky-400" />
              <span>Change Password</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Reset your password by verifying your old password.
            </p>
          </div>

          {passwordSuccess && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="size-4" />
              <span>Password updated successfully!</span>
            </div>
          )}

          <Alert>{passwordError}</Alert>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-primary">
                Current / Old Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password..."
                  required
                  className="w-full rounded-lg border border-theme bg-canvas pl-3 pr-10 py-2 text-xs sm:text-sm text-primary placeholder:text-muted outline-none focus:border-active focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition p-0.5 cursor-pointer"
                  title={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-primary">
                New Password (min 6 chars)
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  minLength={6}
                  required
                  className="w-full rounded-lg border border-theme bg-canvas pl-3 pr-10 py-2 text-xs sm:text-sm text-primary placeholder:text-muted outline-none focus:border-active focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition p-0.5 cursor-pointer"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-primary">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password..."
                  minLength={6}
                  required
                  className="w-full rounded-lg border border-theme bg-canvas pl-3 pr-10 py-2 text-xs sm:text-sm text-primary placeholder:text-muted outline-none focus:border-active focus:ring-2 focus:ring-brand-500/20"
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

            <div className="pt-2">
              <Button
                type="submit"
                disabled={passwordBusy || !currentPassword || !newPassword || !confirmPassword}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2 text-xs shadow-md shadow-sky-600/20 transition cursor-pointer"
              >
                <Lock className="size-3.5 mr-1.5" />
                <span>{passwordBusy ? 'Updating Password...' : 'Update Password'}</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  useSetBreadcrumbs([{ label: 'Account Profile & Settings' }]);

  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
