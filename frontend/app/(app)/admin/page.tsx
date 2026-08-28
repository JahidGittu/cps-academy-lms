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
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Administrative Hubs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Direct access to govern curriculum, engineering blogs, and platform users.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Courses Hub */}
          <Link
            href="/admin/course-management"
            className="group rounded-lg border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-brand-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex size-10 items-center justify-center rounded-md bg-violet-50 text-violet-600 border border-violet-100 group-hover:scale-105 transition-transform">
                <BookOpen className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                Courses
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Author sequential lessons, create structured syllabus, and configure auto-graded quizzes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-violet-600">
              <span>Open Studio</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Blogs Hub */}
          <Link
            href="/admin/blog-management"
            className="group rounded-lg border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-brand-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex size-10 items-center justify-center rounded-md bg-rose-50 text-rose-600 border border-rose-100 group-hover:scale-105 transition-transform">
                <FileText className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                Blogs
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Draft, edit, and publish technical engineering articles across the platform.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
              <span>Open Studio</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Users Hub */}
          <Link
            href="/admin/user-management"
            className="group rounded-lg border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-brand-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex size-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:scale-105 transition-transform">
                <Users className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                Users
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Assign permission roles (Admin, Instructor, Manager, Student) and govern platform privileges.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
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

