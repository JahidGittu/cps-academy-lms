import { Skeleton } from '@/components/ui';

export const AdminOverviewSkeleton = () => (
  <div className="space-y-8 animate-in fade-in duration-200">
    {/* Overview Title */}
    <div className="space-y-2">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>

    {/* 6 KPI Metric Stat Tiles */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-theme bg-surface p-5 shadow-sm"
        >
          <Skeleton className="size-12 rounded-lg shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>

    {/* Administrative Hubs Grid */}
    <div className="space-y-4 pt-4">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3.5 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-xl border border-theme bg-surface p-5 shadow-sm min-h-48"
          >
            <div className="space-y-3">
              <Skeleton className="size-10 rounded-lg" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
            <div className="pt-3 border-t border-subtle flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-4 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ManagedCoursesSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-200">
    {/* Header & New Course Button */}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-9 w-32 rounded-lg" />
    </div>

    {/* 3 KPI Metric Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-theme bg-surface p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="size-9 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-14" />
          <Skeleton className="h-3 w-40" />
        </div>
      ))}
    </div>

    {/* Filter & Search Bar */}
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface p-3 rounded-xl border border-theme shadow-xs">
      <Skeleton className="h-8 flex-1 min-w-[240px] rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
    </div>

    {/* Table Skeleton */}
    <div className="overflow-hidden rounded-xl border border-theme bg-surface shadow-sm">
      <div className="p-4 border-b border-subtle bg-canvas flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="divide-y divide-subtle">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <Skeleton className="size-12 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-48 max-w-full" />
                <Skeleton className="h-3 w-72 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-6 w-28 rounded-md shrink-0" />
            <Skeleton className="h-4 w-24 shrink-0" />
            <div className="flex gap-2 shrink-0">
              <Skeleton className="size-7 rounded-lg" />
              <Skeleton className="size-7 rounded-lg" />
              <Skeleton className="size-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const BlogManagementSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-200">
    {/* Header & Write Post Button */}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-9 w-36 rounded-lg" />
    </div>

    {/* 4 Metric Summary Cards */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-theme bg-surface p-4 shadow-sm space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-7 w-12" />
        </div>
      ))}
    </div>

    {/* Search & Filter Bar */}
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface p-3 rounded-xl border border-theme shadow-xs">
      <Skeleton className="h-8 flex-1 min-w-[240px] rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
    </div>

    {/* Table Skeleton */}
    <div className="overflow-hidden rounded-xl border border-theme bg-surface shadow-sm">
      <div className="p-4 border-b border-subtle bg-canvas flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="divide-y divide-subtle">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <Skeleton className="size-12 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-52 max-w-full" />
                <Skeleton className="h-3 w-80 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-6 w-24 rounded-md shrink-0" />
            <Skeleton className="h-4 w-20 shrink-0" />
            <div className="flex gap-2 shrink-0">
              <Skeleton className="size-7 rounded-lg" />
              <Skeleton className="size-7 rounded-lg" />
              <Skeleton className="size-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const UserManagementSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-200">
    {/* Header */}
    <div className="space-y-1.5">
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>

    {/* 4 KPI Cards */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-theme bg-surface p-4 shadow-sm space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-7 w-12" />
        </div>
      ))}
    </div>

    {/* Search & Filter Bar */}
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3 rounded-xl border border-theme shadow-xs">
      <Skeleton className="h-8 flex-1 min-w-[240px] rounded-lg" />
      <Skeleton className="h-8 w-32 rounded-lg" />
    </div>

    {/* User Table Skeleton */}
    <div className="overflow-hidden rounded-xl border border-theme bg-surface shadow-sm">
      <div className="p-4 border-b border-subtle bg-canvas flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="divide-y divide-subtle">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Skeleton className="size-8 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-36 max-w-full" />
                <Skeleton className="h-3 w-48 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-md shrink-0" />
            <Skeleton className="h-8 w-32 rounded-lg shrink-0" />
            <Skeleton className="h-6 w-20 rounded-md shrink-0" />
            <Skeleton className="size-7 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const EnrolledCoursesSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3.5 w-72 max-w-full" />
      </div>
      <Skeleton className="h-7 w-20 rounded-lg" />
    </div>

    <div className="grid gap-5 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-between rounded-xl border border-theme bg-surface p-5 shadow-sm min-h-52 space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3.5 w-10" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          <div className="pt-3 border-t border-subtle flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
