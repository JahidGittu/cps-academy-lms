'use client';

import Link from 'next/link';
import { Users, BookOpen, FileText, ArrowRight } from 'lucide-react';

import { RequireAuth } from '@/components/require-auth';
import { PlatformStats } from './platform-stats';

const AdminOverview = () => {
  return (
    <div className="space-y-8">
      {/* 1. Real-time Platform Metric Stats */}
      <PlatformStats />

      {/* 2. Quick Management Studios Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-primary">
            Administrative Hubs
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Direct access to govern curriculum, engineering blogs, and platform users.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Courses Hub */}
          <Link
            href="/admin/course-management"
            className="group rounded-xl border border-theme bg-surface p-5 shadow-sm hover:border-active hover:bg-elevated transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-primary group-hover:text-brand transition-colors">
                Courses
              </h3>
              <p className="mt-1 text-xs text-secondary leading-relaxed">
                Author sequential lessons, create structured syllabus, and configure auto-graded quizzes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-subtle flex items-center justify-between text-xs font-bold text-violet-400">
              <span>Manage Courses</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Blogs Hub */}
          <Link
            href="/admin/blog-management"
            className="group rounded-xl border border-theme bg-surface p-5 shadow-sm hover:border-active hover:bg-elevated transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-105 transition-transform">
                <FileText className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-primary group-hover:text-brand transition-colors">
                Blogs
              </h3>
              <p className="mt-1 text-xs text-secondary leading-relaxed">
                Draft, edit, and publish technical engineering articles across the platform.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-subtle flex items-center justify-between text-xs font-bold text-rose-400">
              <span>Manage Articles</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Users Hub */}
          <Link
            href="/admin/user-management"
            className="group rounded-xl border border-theme bg-surface p-5 shadow-sm hover:border-active hover:bg-elevated transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                <Users className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-primary group-hover:text-brand transition-colors">
                Users
              </h3>
              <p className="mt-1 text-xs text-secondary leading-relaxed">
                Assign permission roles (Admin, Instructor, Manager, Student) and govern platform privileges.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-subtle flex items-center justify-between text-xs font-bold text-indigo-400">
              <span>Open Console</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default function AdminPage() {
  return (
    <RequireAuth roles={['Admin']}>
      <AdminOverview />
    </RequireAuth>
  );
}
