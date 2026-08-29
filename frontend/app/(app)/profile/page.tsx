'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  User as UserIcon,
  Shield,
  KeyRound,
  Mail,
  Calendar,
  CheckCircle2,
  Lock,
  BookOpen,
  GraduationCap,
  Layers,
  FileText,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';

import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/use-api';
import type { Collection, Course, Enrollment, LessonProgress, QuizResult } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { Alert, Button, Field, Card } from '@/components/ui';
import { useSetBreadcrumbs } from '@/components/dashboard-shell';

const roleBadgeColor: Record<string, string> = {
  Admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Content Manager': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Instructor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  Student: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

const ProfileContent = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch student progress or instructor courses for personalized summary
  const roleName = user?.role?.name ?? 'Student';
  const isStudent = roleName === 'Student';
  const isInstructor = roleName === 'Instructor';

  const enrollments = useApi<Collection<Enrollment>>(
    isStudent ? '/enrollments?populate=course' : null
  );
  const progresses = useApi<Collection<LessonProgress>>(
    isStudent ? '/lesson-progresses' : null
  );
  const quizResults = useApi<Collection<QuizResult>>(
    isStudent ? '/quiz-results' : null
  );
  const instructorCourses = useApi<Collection<Course>>(
    isInstructor ? '/courses?populate=*' : null
  );

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from your old password.');
      return;
    }

    setBusy(true);

    try {
      await api.post('/auth/change-password', {
        currentPassword,
        password: newPassword,
        passwordConfirmation: confirmPassword,
      });

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (caught) {
      setError(errorMessage(caught, 'Could not change password. Please check your current password.'));
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-5xl">
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

      {/* 2. Role-Specific Activity & Statistics Summary */}
      <section className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
          <GraduationCap className="size-5 text-sky-400" />
          <span>Platform Activity & Role Summary</span>
        </h2>

        {isStudent && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-theme bg-surface p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted uppercase">Enrolled Courses</p>
                <BookOpen className="size-4 text-sky-400" />
              </div>
              <p className="mt-2 text-3xl font-black text-primary">
                {enrollments.data?.data?.length ?? 0}
              </p>
              <Link href="/dashboard" className="text-xs font-bold text-sky-400 hover:underline mt-1 inline-block">
                View My Courses &rarr;
              </Link>
            </div>

            <div className="rounded-xl border border-theme bg-surface p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted uppercase">Completed Lessons</p>
                <CheckCircle2 className="size-4 text-emerald-400" />
              </div>
              <p className="mt-2 text-3xl font-black text-emerald-400">
                {progresses.data?.data?.length ?? 0}
              </p>
              <p className="text-[11px] text-muted mt-1">Verified sequential progression</p>
            </div>

            <div className="rounded-xl border border-theme bg-surface p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted uppercase">Quizzes Attempted</p>
                <Layers className="size-4 text-purple-400" />
              </div>
              <p className="mt-2 text-3xl font-black text-purple-400">
                {quizResults.data?.data?.length ?? 0}
              </p>
              <p className="text-[11px] text-muted mt-1">Auto-graded assessment scores</p>
            </div>
          </div>
        )}

        {isInstructor && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-theme bg-surface p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted uppercase">Authored Courses</p>
                <BookOpen className="size-4 text-indigo-400" />
              </div>
              <p className="mt-2 text-3xl font-black text-primary">
                {instructorCourses.data?.data?.length ?? 0}
              </p>
              <Link href="/dashboard" className="text-xs font-bold text-indigo-400 hover:underline mt-1 inline-block">
                Manage Courses in Dashboard &rarr;
              </Link>
            </div>

            <div className="rounded-xl border border-theme bg-surface p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted uppercase">Instructor Privileges</p>
                <Shield className="size-4 text-indigo-400" />
              </div>
              <p className="text-xs text-secondary mt-2 leading-relaxed">
                Full authoring rights to create courses, structure syllabus, add lessons, build auto-graded MCQ quizzes, and monitor student completion rosters.
              </p>
            </div>
          </div>
        )}

        {roleName === 'Admin' && (
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
              <Shield className="size-4" />
              <span>Full Administrative Control</span>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              You hold the master platform role. You can govern all users, assign roles, inspect platform statistics, build courses, and write technical articles.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/admin"
                className="rounded-lg bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition"
              >
                Admin Overview
              </Link>
              <Link
                href="/admin/user-management"
                className="rounded-lg border border-purple-500/30 bg-surface text-purple-300 hover:bg-elevated px-3.5 py-1.5 text-xs font-bold transition"
              >
                Manage Users
              </Link>
            </div>
          </div>
        )}

        {roleName === 'Content Manager' && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <FileText className="size-4" />
              <span>Content Manager Control</span>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              You manage the course library and engineering blogs across the platform. You can author courses, lessons, and draft or publish technical articles.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/admin/course-management"
                className="rounded-lg bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition"
              >
                Course Management
              </Link>
              <Link
                href="/admin/blog-management"
                className="rounded-lg border border-amber-500/30 bg-surface text-amber-300 hover:bg-elevated px-3.5 py-1.5 text-xs font-bold transition"
              >
                Blog Management
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 3. Security & Password Reset Card */}
      <Card className="space-y-5">
        <div className="border-b border-subtle pb-4">
          <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
            <KeyRound className="size-5 text-sky-400" />
            <span>Account Security & Password Reset</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Update your account password by confirming your old password and entering a new secure password.
          </p>
        </div>

        {success && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            <span>Your password has been successfully updated!</span>
          </div>
        )}

        <Alert>{error}</Alert>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-primary">
              Current / Old Password
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password..."
                required
                className="w-full rounded-lg border border-theme bg-canvas pl-3 pr-10 py-2 text-xs sm:text-sm text-primary placeholder:text-muted outline-none focus:border-active focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition p-0.5"
                title={showPasswords ? 'Hide password' : 'Show password'}
              >
                {showPasswords ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-primary">
              New Password (minimum 6 characters)
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new secure password..."
              minLength={6}
              required
              className="w-full rounded-lg border border-theme bg-canvas px-3 py-2 text-xs sm:text-sm text-primary placeholder:text-muted outline-none focus:border-active focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-primary">
              Confirm New Password
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password..."
              minLength={6}
              required
              className="w-full rounded-lg border border-theme bg-canvas px-3 py-2 text-xs sm:text-sm text-primary placeholder:text-muted outline-none focus:border-active focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={busy || !currentPassword || !newPassword || !confirmPassword}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-2.5 shadow-md shadow-sky-600/20 transition cursor-pointer"
            >
              <Lock className="size-4 mr-2" />
              <span>{busy ? 'Updating Password...' : 'Reset & Update Password'}</span>
            </Button>
          </div>
        </form>
      </Card>
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
